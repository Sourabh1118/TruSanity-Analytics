import { registerWorkspace } from "./src/actions/auth"

async function testRegistration() {
    console.log("Starting registration test...")
    const res = await registerWorkspace({
        name: "Test User",
        email: "test@netraanalytics.com",
        passwordHash: "securepassword",
        workspaceName: "Test Workspace",
    })

    if (res.error) {
        console.error("Registration failed:", res.error)
    } else {
        console.log("Registration successful!", res)
    }
    process.exit(0)
}

testRegistration()
