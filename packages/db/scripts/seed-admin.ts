import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, tenants, tenantMembers } from '../src/schema'; // Explicit relative import because this script lives in packages/db/scripts
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load the .env we explicitly created in packages/db
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/trusanity_db";

const runSeed = async () => {
    console.log("🌱 Starting Trusanity Platform Super Admin Seeder...");

    // Create the DB connection
    const client = postgres(connectionString);
    const db = drizzle(client);

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'super@trusanity.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Trusanity!Super2024';
    const ADMIN_NAME = 'Platform Owner';

    try {
        console.log(`Checking for existing Super Admin: ${ADMIN_EMAIL}`);
        const existingUsers = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));

        let targetUserId;

        if (existingUsers.length > 0) {
            console.log("Account already exists. Force updating role to SUPER_ADMIN.");
            targetUserId = existingUsers[0].id;

            await db.update(users)
                .set({
                    role: 'SUPER_ADMIN',
                    passwordHash: ADMIN_PASSWORD // In MVP, we are storing plain for ease of testing
                })
                .where(eq(users.email, ADMIN_EMAIL));

        } else {
            console.log("Creating new SUPER_ADMIN master user...");

            // 1. Create the user
            const [newUser] = await db.insert(users).values({
                email: ADMIN_EMAIL,
                name: ADMIN_NAME,
                passwordHash: ADMIN_PASSWORD,
                role: 'SUPER_ADMIN'
            }).returning();

            targetUserId = newUser.id;

            // 2. Create the internal meta-tenant for billing/organization grouping
            console.log("Creating internal Trusanity HQ meta-tenant...");
            const [newTenant] = await db.insert(tenants).values({
                name: "Trusanity HQ",
                slug: "trusanity-hq",
                plan: "enterprise"
            }).returning();

            // 3. Bind the Super Admin explicitly to this tenant
            await db.insert(tenantMembers).values({
                userId: targetUserId,
                tenantId: newTenant.id,
                role: 'owner'
            });
        }

        console.log("✅ Platform Configuration Complete.");
        console.log("-----------------------------------------");
        console.log(`Login URL: http://localhost:3000/login`);
        console.log(`Admin Dashboard: http://localhost:3000/admin`);
        console.log(`Identity: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log("-----------------------------------------");

    } catch (err) {
        console.error("❌ Failed to seed the Super Admin account:", err);
    } finally {
        await client.end();
        process.exit(0);
    }
};

runSeed();
