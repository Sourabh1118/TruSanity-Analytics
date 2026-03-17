import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../db'
import { projects, apiKeys, tenants } from '@netra/db'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

const CreateProjectSchema = z.object({
    name: z.string().min(2).max(100),
    timezone: z.string().optional().default('UTC'),
    tenantEmail: z.string().email(),
})

export async function projectRoutes(fastify: FastifyInstance) {
    // Auto-create project endpoint for WordPress plugin
    fastify.post('/v1/projects/auto-create', async (request, reply) => {
        try {
            const payload = CreateProjectSchema.parse(request.body)

            // Find or create tenant by email
            let tenant = await db.query.tenants.findFirst({
                where: eq(tenants.email, payload.tenantEmail)
            })

            if (!tenant) {
                // Auto-create tenant for WordPress users
                const [newTenant] = await db.insert(tenants)
                    .values({
                        name: payload.tenantEmail.split('@')[0],
                        email: payload.tenantEmail,
                        plan: 'free',
                        status: 'active',
                    })
                    .returning()

                tenant = newTenant
            }

            if (!tenant) {
                return reply.status(500).send({ error: 'Failed to create tenant' })
            }

            // Create project
            const [newProject] = await db.insert(projects)
                .values({
                    tenantId: tenant.id,
                    name: payload.name,
                    timezone: payload.timezone,
                })
                .returning()

            if (!newProject) {
                return reply.status(500).send({ error: 'Failed to create project' })
            }

            // Generate API key
            const keyId = `trus_pk_${crypto.randomBytes(24).toString('hex')}`
            await db.insert(apiKeys).values({
                id: keyId,
                projectId: newProject.id,
                name: 'WordPress Plugin Key',
                type: 'public',
                isActive: true,
            })

            return reply.send({
                success: true,
                project: {
                    id: newProject.id,
                    name: newProject.name,
                },
                apiKey: keyId,
                message: 'Project created successfully! Copy the API key to your WordPress plugin.',
            })
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Invalid payload', details: err.errors })
            }
            fastify.log.error(err)
            return reply.status(500).send({ error: 'Internal Server Error' })
        }
    })
}
