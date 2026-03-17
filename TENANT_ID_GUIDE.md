# 🆔 Where to Find Your Tenant ID

## For WordPress Plugin Users

Your **Tenant ID** is required when using the WordPress plugin's auto-create feature. Here's how to find it:

---

## Step-by-Step Guide

### 1. Log in to Trusanity Dashboard
Visit your Trusanity dashboard at:
```
https://your-domain.com/dashboard
```
(Replace `your-domain.com` with your actual domain)

### 2. Navigate to Developer Settings
From the dashboard sidebar, click:
```
Dashboard → Settings → Developer
```

### 3. Copy Your Tenant ID
At the top of the Developer Settings page, you'll see a highlighted card titled **"Your Tenant ID"**.

The Tenant ID is displayed as a number (e.g., `1`, `2`, `3`, etc.) with a copy button next to it.

---

## Visual Location

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard → Settings → Developer                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🖥️  Your Tenant ID                            │    │
│  │                                                 │    │
│  │  Use this ID when setting up the WordPress     │    │
│  │  plugin or other integrations.                 │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  1                              📋   │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## What is a Tenant ID?

- A **Tenant ID** is a unique identifier for your organization/account in Trusanity
- It's a simple number (integer) like `1`, `2`, `3`, etc.
- Each tenant can have multiple projects, but only one Tenant ID
- This ID is used to associate new projects with your account

---

## Using Tenant ID in WordPress Plugin

Once you have your Tenant ID:

1. Go to your WordPress admin panel
2. Navigate to **Settings → Trusanity Analytics**
3. In the "Quick Setup - Auto-Create Project" section:
   - Enter your **Tenant ID** in the input field
   - Click **"Create Project Automatically"**
4. The plugin will:
   - Create a new project in your Trusanity account
   - Generate an API key automatically
   - Save the API key to your WordPress settings
   - Start tracking immediately

---

## Troubleshooting

### "Invalid Tenant ID" Error
- Make sure you're entering just the number (e.g., `1`, not `tenant-1`)
- Verify you copied the correct ID from the Developer Settings page
- Ensure you're logged in to the correct Trusanity account

### "Tenant ID not found" Error
- Your account might not be properly set up
- Try logging out and back in to the Trusanity dashboard
- Contact support if the issue persists

### Can't find Developer Settings page
- Make sure you're logged in to the Trusanity dashboard
- Check that you have the correct permissions (admin/owner role)
- The path is: Dashboard (sidebar) → Settings → Developer

---

## Alternative: Manual API Key Setup

If you prefer not to use the auto-create feature:

1. In the Trusanity dashboard, go to **Dashboard → Settings → Developer**
2. Click **"Generate New Key"**
3. Copy the generated API key
4. In WordPress, paste the API key in the "Project API Key" field
5. Click **"Test Connection"** to verify

---

## Need Help?

- Check the deployment documentation: `DEPLOY_NOW.md`
- Review fixes applied: `FIXES_APPLIED.md`
- Contact support: support@trusanity.com
