"use server"

import { db } from "@/lib/db"
import { users, tenants, tenantMembers, projects } from "@netra/db"
import { eq } from "drizzle-orm"

export async function registerWorkspace(formData: {
    name: string
    email: string
    passwordHash: string
    workspaceName: string
}) {
    // 1. Check if user already exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, formData.email),
    })

    if (existingUser) {
        return { error: "User with this email already exists" }
    }

    // 2. Wrap in a transaction to ensure everything succeeds together
    try {
        await db.transaction(async (tx) => {
            // A. Create User
            const [newUser] = await tx.insert(users).values({
                email: formData.email,
                name: formData.name,
                passwordHash: formData.passwordHash,
            }).returning()

            // B. Create Tenant (Workspace)
            const slug = formData.workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(Math.random() * 1000)
            const [newTenant] = await tx.insert(tenants).values({
                name: formData.workspaceName,
                slug,
            }).returning()

            if (!newUser || !newTenant) {
                throw new Error("Failed to create user or tenant")
            }

            // C. Link User as Owner of Tenant
            await tx.insert(tenantMembers).values({
                tenantId: newTenant.id,
                userId: newUser.id,
                role: "owner",
            })

            // D. Create a Default Project for the Tenant
            await tx.insert(projects).values({
                tenantId: newTenant.id,
                name: "Default Project",
            })
        })

        return { success: true }
    } catch (e: any) {
        console.error("Registration failed:", e)
        return { error: "Failed to create workspace. Please try again." }
    }
}
