# Development Authentication Bypass

**⚠️ IMPORTANT: This feature is for DEVELOPMENT ONLY!**

This document explains how to temporarily bypass authentication during development to access the dashboard without logging in.

---

## ⚠️ Security Warning

**NEVER enable this in production!**

- This feature disables all authentication checks
- It should only be used during local development
- Never commit `.env.local` with `SKIP_AUTH=true` to Git
- Always verify that authentication is enabled before deploying

---

## How to Use

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the project root directory (same level as `package.json`).

**If the file doesn't exist:**
```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Or create it manually in your editor
```

### Step 2: Add SKIP_AUTH Variable

Open `.env.local` and add the following line:

```env
SKIP_AUTH=true
```

**Complete `.env.local` example:**
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
SESSION_KEY=your_session_key

# Development Mode (⚠️ DEVELOPMENT ONLY!)
SKIP_AUTH=true
```

### Step 3: Restart Development Server

After adding `SKIP_AUTH=true`, you must restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Access Dashboard

Now you can access the dashboard directly without logging in:

```
http://localhost:3000/dashboard
```

You will see a mock user:
- **Name:** Developer User
- **Email:** dev@example.com
- **Role:** manager

---

## How It Works

When `SKIP_AUTH=true` is set:

1. The dashboard layout checks the environment variable
2. If `SKIP_AUTH=true`, it creates a mock user object
3. Authentication checks are bypassed
4. You can access all dashboard pages directly

**Code Location:** `app/dashboard/layout.js`

---

## Disabling Authentication Bypass

To disable the bypass and return to normal authentication:

### Option 1: Set to false
```env
SKIP_AUTH=false
```

### Option 2: Remove the line
Simply remove or comment out the `SKIP_AUTH` line:
```env
# SKIP_AUTH=true
```

### Option 3: Delete the variable
Remove the entire line from `.env.local`

**Important:** Restart the development server after making changes.

---

## Verification

### Check if Bypass is Active

When the bypass is active, you will see a warning in the server console:

```
⚠️ [DEVELOPMENT MODE] Authentication is DISABLED! This should NEVER be enabled in production!
```

### Check if Bypass is Disabled

When the bypass is disabled:
- No warning message in console
- Accessing `/dashboard` without login redirects to `/login`
- Normal authentication flow works

---

## Troubleshooting

### Issue: Dashboard still redirects to login

**Solutions:**
1. Make sure `.env.local` exists in the project root
2. Verify `SKIP_AUTH=true` (not `SKIP_AUTH="true"` or `SKIP_AUTH = true`)
3. Restart the development server
4. Check for typos in the variable name

### Issue: Warning message appears but still can't access

**Solutions:**
1. Clear browser cache
2. Try incognito/private browsing mode
3. Check browser console for errors
4. Verify the server restarted after changing `.env.local`

### Issue: Want to test with real authentication

**Solution:**
1. Set `SKIP_AUTH=false` or remove it
2. Restart the server
3. Create a real user account through the API
4. Use the login page to authenticate

---

## Best Practices

1. **Always disable before committing:**
   - Set `SKIP_AUTH=false` before committing code
   - Or remove it entirely

2. **Use Git to track changes:**
   - `.env.local` is already in `.gitignore`
   - Never commit it with `SKIP_AUTH=true`

3. **Document your usage:**
   - If working in a team, let others know when you're using this
   - Don't leave it enabled when not needed

4. **Test real authentication regularly:**
   - Periodically disable the bypass
   - Test the full authentication flow
   - Ensure login page works correctly

---

## Production Checklist

Before deploying to production, verify:

- [ ] `SKIP_AUTH` is not set in production environment variables
- [ ] `.env.local` is not deployed (it's in `.gitignore`)
- [ ] Production environment variables don't include `SKIP_AUTH`
- [ ] Authentication works correctly in production
- [ ] No warning messages in production logs

---

## Alternative: Create Test User

Instead of bypassing authentication, you can create a real test user:

1. Use MongoDB Compass or similar tool
2. Create a user in the `users` collection:
   ```json
   {
     "name": "Test Manager",
     "email": "manager@test.com",
     "passwordHash": "$2b$10$...", // bcrypt hash of password
     "role": "manager",
     "createdAt": new Date(),
     "updatedAt": new Date()
   }
   ```
3. Use the login page with these credentials

**This is the recommended approach for long-term testing.**

---

**Last Updated:** 2025-01-12  
**Status:** Active

