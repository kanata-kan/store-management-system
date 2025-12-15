/**
 * Disable SKIP_AUTH Script
 *
 * This script disables SKIP_AUTH in .env.local by setting it to false
 * or removing it entirely.
 *
 * Usage: node scripts/disable-skip-auth.js
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envLocalPath = resolve(__dirname, "..", ".env.local");

if (!existsSync(envLocalPath)) {
  console.log("ℹ️  .env.local file not found. Creating it...");
  writeFileSync(envLocalPath, "# SKIP_AUTH is disabled\nSKIP_AUTH=false\n", "utf8");
  console.log("✅ Created .env.local with SKIP_AUTH=false");
  process.exit(0);
}

// Read .env.local
let content = readFileSync(envLocalPath, "utf8");

// Check if SKIP_AUTH exists
if (content.includes("SKIP_AUTH=true")) {
  // Replace SKIP_AUTH=true with SKIP_AUTH=false
  content = content.replace(/SKIP_AUTH\s*=\s*true/gi, "SKIP_AUTH=false");
  writeFileSync(envLocalPath, content, "utf8");
  console.log("✅ Disabled SKIP_AUTH in .env.local (set to false)");
} else if (content.includes("SKIP_AUTH=false")) {
  console.log("ℹ️  SKIP_AUTH is already disabled in .env.local");
} else {
  // Add SKIP_AUTH=false if it doesn't exist
  content += "\n# SKIP_AUTH is disabled\nSKIP_AUTH=false\n";
  writeFileSync(envLocalPath, content, "utf8");
  console.log("✅ Added SKIP_AUTH=false to .env.local");
}

console.log("\n💡 Next steps:");
console.log("   1. Restart your development server (npm run dev)");
console.log("   2. Go to /login page");
console.log("   3. Log in with:");
console.log("      Email: manager@store.com");
console.log("      Password: password123");

