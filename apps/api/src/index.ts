import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import fastifyWebsocket from '@fastify/websocket'
import { z } from 'zod'
import Redis from 'ioredis'
import { db } from './db'
import { apiKeys, featureFlags } from '@netra/db'
import { eq, and } from 'drizzle-orm'
import { aiRoutes } from './ai'
import { getTenantQuota } from './services/billing'
import { Queue, Worker, Job } from 'bullmq'
import { Kafka } from 'kafkajs'
import fs from 'fs'
import path from 'path'

// ── Environment Variables ────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001
const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9094']
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// ── Clients ─────────────────────────────────────────────
const redis = new Redis(REDIS_URL)

// Dedicated Redis Subscriber client for WebSockets
const redisSubscriber = new Redis(REDIS_URL)
const activeSockets = new Map<string, Set<any>>()

const kafka = new Kafka({
    clientId: 'netra-api',
    brokers: KAFKA_BROKERS,
})
const producer = kafka.producer()

// ── Reporting & BullMQ ──────────────────────────────────
export const reportingQueue = new Queue('reports', { connection: redis })

const reportWorker = new Worker('reports', async (job: Job) => {
    console.log(`[ReportWorker] Processing report job ${job.id} for project ${job.data?.projectId}`)
    // Simulate report generation and email dispatch
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log(`[ReportWorker] Successfully dispatched report to ${job.data?.emails}`)
}, { connection: redis })

reportWorker.on('failed', (job, err) => {
    console.error(`[ReportWorker] Job ${job?.id} failed: ${err.message}`)
})

// ── Application Setup ────────────────────────────────────
const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        },
    },
    trustProxy: true,
})

// Validation Schema for incoming events
const EventSchema = z.object({
    // projectId can be the API key string (trus_pk_xxx) or a UUID — both are accepted
    projectId: z.string().min(4),
    events: z.array(
        z.object({
            name: z.string(),
            timestamp: z.string().datetime().optional(),
            session_id: z.string(),
            anonymous_id: z.string(),
            user_id: z.string().optional(),
            url: z.string().optional(),
            path: z.string().optional(),
            referrer: z.string().optional(),
            properties: z.record(z.any()).optional(),
        })
    ).min(1).max(100),
})

// Read built SDK once at startup
const TRACK_JS_PATH = path.join(__dirname, '..', 'public', 'track.js')
let TRACK_JS_CONTENT: string = '// Trusanity SDK not found'
try { TRACK_JS_CONTENT = fs.readFileSync(TRACK_JS_PATH, 'utf8') } catch (e) {
    console.warn('[API] track.js not found at', TRACK_JS_PATH)
}

// Main entrypoint
async function start() {
    await producer.connect()
    fastify.log.info('✅ Connected to Kafka')

    // Core middleware
    await fastify.register(helmet, { contentSecurityPolicy: false })
    await fastify.register(cors, {
        origin: '*', // Allow all origins for the ingestion API
        methods: ['POST', 'OPTIONS', 'GET', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection', 'x-requested-with'],
        credentials: true,
        maxAge: 86400, // Cache preflight requests for 24 hours
    })
    await fastify.register(rateLimit, {
        max: 1000,
        timeWindow: '1 minute',
        redis,
    })
    await fastify.register(fastifyWebsocket)

    // WebSocket Subscriber Loop
    redisSubscriber.on('message', (channel, message) => {
        if (channel.startsWith('rt:')) {
            const projectId = channel.split(':')[1]
            const clients = activeSockets.get(projectId as string)
            if (clients) {
                for (const client of clients) {
                    if (client.readyState === 1) { // OPEN
                        client.send(message)
                    }
                }
            }
        }
    })

    // ── Browser Tracking SDK ──────────────────────────────────────────────
    fastify.get('/track.js', async (request, reply) => {
        reply.header('Content-Type', 'application/javascript; charset=utf-8')
        reply.header('Cache-Control', 'public, max-age=3600')
        reply.header('Access-Control-Allow-Origin', '*')
        return reply.send(TRACK_JS_CONTENT)
    })

    // Health check (both /health and /v1/health for plugin compatibility)
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))
    fastify.get('/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

    // AI Summarization Routes
    await fastify.register(aiRoutes)

    // WebSocket Stream Endpoint
    fastify.get('/v1/stream', { websocket: true }, (connection /* SocketStream */, req) => {
        const projectId = (req.query as any)?.projectId

        if (!projectId) {
            connection.socket.close(1008, 'Missing projectId')
            return
        }

        // Ideally, authorize the connection here using NextAuth session token bridging or an API key

        // Add to active socket pool
        if (!activeSockets.has(projectId)) {
            activeSockets.set(projectId, new Set())
            // Subscribe to Redis channel for this project
            redisSubscriber.subscribe(`rt:${projectId}`)
        }
        activeSockets.get(projectId)!.add(connection.socket)

        connection.socket.on('close', () => {
            const set = activeSockets.get(projectId)
            if (set) {
                set.delete(connection.socket)
                if (set.size === 0) {
                    activeSockets.delete(projectId)
                    redisSubscriber.unsubscribe(`rt:${projectId}`)
                }
            }
        })
    })

    // Feature Flags Endpoint
    fastify.get('/v1/flags', async (request, reply) => {
        try {
            const projectId = (request.query as any)?.projectId
            if (!projectId) {
                return reply.status(400).send({ error: 'Missing projectId' })
            }

            // In production, validate origin domain or require a public API key
            const flags = await db.query.featureFlags.findMany({
                where: and(
                    eq(featureFlags.projectId, projectId),
                    eq(featureFlags.isActive, true)
                )
            });

            // Map flags based on rollout percentages
            const resolvedFlags: Record<string, boolean> = {};

            for (const flag of flags) {
                if (flag.rolloutPercentage === 100) {
                    resolvedFlags[flag.key] = true;
                } else if (flag.rolloutPercentage > 0) {
                    // Probabilistic eval based on Math.random for MVP
                    // Standard implementations use deterministic hashing based on anonymous_id
                    resolvedFlags[flag.key] = Math.random() * 100 <= flag.rolloutPercentage;
                } else {
                    resolvedFlags[flag.key] = false;
                }
            }

            return reply.send({ flags: resolvedFlags })
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch flags' })
        }
    })

    // Ingestion Endpoint
    fastify.post('/v1/ingest', async (request, reply) => {
        try {
            // 1. Validate payload structure
            const payload = EventSchema.parse(request.body)

            // 2. Validate API Key / Project ID with Redis caching + Postgres fallback
            const token = request.headers.authorization?.replace('Bearer ', '')
            if (!token) {
                return reply.status(401).send({ error: 'Missing Authorization header' })
            }

            let tenantId: number | null = null;
            const cachedData = await redis.get(`apikey:${token}`)

            if (cachedData) {
                // Cache hit — API key alone identifies the project
                const parts = cachedData.split(':')
                tenantId = parseInt(parts[0] || '0', 10)
            } else {
                // Cache miss, lookup in Postgres
                const apiKeyRecord = await db.query.apiKeys.findFirst({
                    where: eq(apiKeys.id, token),
                    with: { project: true }
                })

                if (!apiKeyRecord || !apiKeyRecord.isActive) {
                    return reply.status(401).send({ error: 'Unauthorized: Invalid or inactive API key' })
                }

                tenantId = apiKeyRecord.project.tenantId
                // Cache for 1 hour
                await redis.setex(`apikey:${token}`, 3600, `${tenantId}:${apiKeyRecord.projectId}`)
            }

            if (!tenantId) {
                return reply.status(401).send({ error: 'Unauthorized' })
            }

            // 2.5. Check Tenant Quota via Internal Storefront API
            const quota = await getTenantQuota(tenantId)

            if (!quota) {
                fastify.log.warn(`Could not fetch quota for tenant ${tenantId}. Allowing ingestion.`)
            } else if (quota.plan === 'free' && payload.events.length > quota.limit) {
                // Simplified logic: in reality, you'd check Redis counting usage against the limit
                // return reply.status(402).send({ error: 'Payment Required: Monthly event limit exceeded' })
            }

            // 3. Extract request metadata
            // const ip = request.ip
            // const userAgent = request.headers['user-agent']
            const serverTimestamp = new Date().toISOString()

            // 4. Enrich & Format events for ClickHouse schema
            const messages = payload.events.map((evt) => {
                // Basic PII sanitization - hash emails if found in properties
                const cleanProps = { ...evt.properties }
                if (cleanProps.email) {
                    cleanProps.email = '[REDACTED]'
                }

                const enrichedEvent = {
                    tenant_id: tenantId,
                    project_id: payload.projectId,
                    event_name: evt.name,
                    timestamp: evt.timestamp || serverTimestamp,
                    session_id: evt.session_id,
                    anonymous_id: evt.anonymous_id,
                    user_id: evt.user_id || '',
                    url: evt.url || '',
                    path: evt.path || '',
                    referrer: evt.referrer || '',
                    properties: JSON.stringify(cleanProps),
                    // Fallbacks for MVP (would normally use a geoip library + UAParser)
                    platform: 'web',
                    device_type: 'desktop',
                    country: 'US',
                }

                return {
                    key: payload.projectId, // Partition by project
                    value: JSON.stringify(enrichedEvent),
                }
            })

            // 5. Send to Kafka
            await producer.send({
                topic: 'netra.events',
                messages,
            })

            // 6. Broadcast to Real-Time WebSockets
            if (activeSockets.has(payload.projectId)) {
                const rtPayload = JSON.stringify({
                    type: 'INGESTION',
                    data: messages.map(m => JSON.parse(m.value as string))
                });
                await redis.publish(`rt:${payload.projectId}`, rtPayload);
            }

            return reply.code(202).send({ success: true, ingested: messages.length })
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Invalid payload', details: err.errors })
            }
            fastify.log.error(err)
            return reply.status(500).send({ error: 'Internal Server Error' })
        }
    })

    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    fastify.log.info('Shutting down API...')
    await reportWorker.close()
    await reportingQueue.close()
    await producer.disconnect()
    await redis.quit()
    await fastify.close()
    process.exit(0)
})

start()
