import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { z } from 'zod'
import { Kafka } from 'kafkajs'
import Redis from 'ioredis'

// ── Environment Variables ────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001
const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092']
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// ── Clients ─────────────────────────────────────────────
const redis = new Redis(REDIS_URL)

const kafka = new Kafka({
    clientId: 'netra-api',
    brokers: KAFKA_BROKERS,
})
const producer = kafka.producer()

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
    projectId: z.string().uuid(),
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
    ).min(1).max(100), // Max 100 events per batch
})

// Main entrypoint
async function start() {
    await producer.connect()
    fastify.log.info('✅ Connected to Kafka')

    // Core middleware
    await fastify.register(helmet, { contentSecurityPolicy: false })
    await fastify.register(cors, {
        origin: '*',
        methods: ['POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
    await fastify.register(rateLimit, {
        max: 1000,
        timeWindow: '1 minute',
        redis,
    })

    // Health check
    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() }
    })

    // Ingestion Endpoint
    fastify.post('/v1/ingest', async (request, reply) => {
        try {
            // 1. Validate payload structure
            const payload = EventSchema.parse(request.body)

            // 2. Validate API Key / Project ID (Mocked for Phase 1)
            // In production, we check Redis for API key validity
            /*
            const token = request.headers.authorization?.replace('Bearer ', '')
            const cachedProject = await redis.get(`apikey:${token}`)
            if (!cachedProject || cachedProject !== payload.projectId) {
               return reply.status(401).send({ error: 'Unauthorized' })
            }
            */
            const tenantId = 1 // Mock tenant lookup for MVP

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
    await producer.disconnect()
    await redis.quit()
    await fastify.close()
    process.exit(0)
})

start()
