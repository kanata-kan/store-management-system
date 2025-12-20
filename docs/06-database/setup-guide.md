# Database Setup Guide

## 📋 Recommended Database Name

**Suggested Database Name:** `store-management-system`

This name:

- Matches the project name
- Uses kebab-case (standard for MongoDB)
- Is descriptive and clear
- Follows naming conventions

---

## 🔧 Connection String Format

Your MongoDB Atlas connection string should look like this:

```
mongodb+srv://username:password@cluster-name.mongodb.net/store-management-system?retryWrites=true&w=majority
```

**Important:** Replace `store-management-system` with your desired database name (we recommend using `store-management-system`).

---

## 📝 Steps to Setup

### 1. Update .env File

Open `.env` file and replace the placeholder with your actual connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/store-management-system?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development
```

### 2. Test Connection

After updating `.env`, run the test script:

```bash
node test-db-connection.js
```

This will:

- ✅ Verify connection string format
- ✅ Test connection to MongoDB Atlas
- ✅ Show current database name
- ✅ Suggest database name if different
- ✅ List existing collections

---

## 🔍 Connection String Components

```
mongodb+srv://[username]:[password]@[cluster]/[database-name]?[options]
```

- **username**: Your MongoDB Atlas username
- **password**: Your MongoDB Atlas password
- **cluster**: Your cluster connection string (e.g., `cluster0.xxxxx.mongodb.net`)
- **database-name**: Database name (recommended: `store-management-system`)
- **options**: Connection options (retryWrites, w=majority, etc.)

---

## ⚠️ Security Notes

1. **Never commit .env file to Git** (already in .gitignore)
2. **Use strong passwords** for MongoDB Atlas
3. **Whitelist IP addresses** in MongoDB Atlas Network Access
4. **Use environment-specific connection strings** (dev, staging, production)

---

## 🧪 Testing Connection

### Option 1: Use Test Script

```bash
node test-db-connection.js
```

### Option 2: Manual Test

Create a simple test file:

```javascript
import connectDB from "./lib/db/connect.js";

async function test() {
  try {
    await connectDB();
    console.log("✅ Connected successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
}

test();
```

---

## 📊 Expected Output

When connection is successful, you should see:

```
✅ Connection successful!

📊 Connection Details:
   Host: cluster0.xxxxx.mongodb.net
   Database: "store-management-system"
   Status: Connected

📦 Collections: 0
   (No collections yet - this is normal for a new database)

✅ Test completed successfully!
✅ Database is ready for use!
```

---

## 🐛 Troubleshooting

### Error: "authentication failed"

- Check username and password
- Verify user has proper permissions

### Error: "timeout"

- Check IP whitelist in MongoDB Atlas
- Verify cluster is running (not paused)
- Check network connectivity

### Error: "Invalid connection string"

- Verify connection string format
- Check for special characters in password (may need URL encoding)
- Ensure database name doesn't contain invalid characters

---

## ✅ Next Steps

After successful connection:

1. ✅ Database is ready for models
2. ✅ Can start Phase 3: Service Layer
3. ✅ Models will create collections automatically on first use

---

_Last updated: 2025-01-11_
