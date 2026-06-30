/**
 * Fixes all 3 Vercel build errors + Supabase DATABASE_URL issue.
 * Run from your FRONTEND folder: node patch_vercel_errors.cjs
 * Then commit and push to GitHub.
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src");
let fixed = 0;

function patchFile(relPath, searchStr, replaceStr) {
  const full = path.join(src, relPath);
  if (!fs.existsSync(full)) {
    console.log("❌ file not found:", relPath);
    return;
  }
  let content = fs.readFileSync(full, "utf8");
  if (!content.includes(searchStr)) {
    console.log("⚠️  pattern not found in:", relPath, "→ may already be fixed or different version");
    return;
  }
  fs.writeFileSync(full, content.replace(searchStr, replaceStr), "utf8");
  console.log("✅ fixed:", relPath);
  fixed++;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1: PropertyDetailPage.tsx line 26
// Error: Type 'unknown' is not assignable to type 'string | number'
// Cause: .map((img, i) => key={i} — i is inferred as unknown somewhere
// Fix: cast i explicitly
// ─────────────────────────────────────────────────────────────────────────────
patchFile(
  "pages/PropertyDetailPage.tsx",
  ".map((img, i) => (",
  ".map((img: string | null | undefined, i: number) => ("
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2: AddRoom.tsx line 43
// Error: Property 'createRoom' does not exist on propertiesAPI
// Fix: rename createRoom → addRoom (correct method name in api.ts)
// ─────────────────────────────────────────────────────────────────────────────
patchFile(
  "pages/landlord/AddRoom.tsx",
  "await propertiesAPI.createRoom(propertyId,",
  "await propertiesAPI.addRoom(propertyId,"
);

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3: LandlordInvoices.tsx line 52
// Error: Expected 2 arguments, but got 3
// Cause: invoicesAPI.updateStatus called with (id, status, paidDate) but api only takes 2
// Fix: remove the third argument
// ─────────────────────────────────────────────────────────────────────────────
const invoicesPath = path.join(src, "pages/landlord/LandlordInvoices.tsx");
if (fs.existsSync(invoicesPath)) {
  let content = fs.readFileSync(invoicesPath, "utf8");
  // Match updateStatus(anything, anything, anything) — remove 3rd arg
  const before = content;
  content = content.replace(
    /invoicesAPI\.updateStatus\(([^,)]+),\s*([^,)]+),\s*[^)]+\)/g,
    "invoicesAPI.updateStatus($1, $2)"
  );
  if (content !== before) {
    fs.writeFileSync(invoicesPath, content, "utf8");
    console.log("✅ fixed: pages/landlord/LandlordInvoices.tsx");
    fixed++;
  } else {
    console.log("⚠️  LandlordInvoices: 3-arg pattern not found — checking for alternate form...");
    // Try alternate: markPaid or handleMarkPaid with paidDate
    const alt = content.replace(
      /updateStatus\(([^,)]+),\s*["']paid["'],\s*[^)]+\)/g,
      "updateStatus($1, \"paid\")"
    );
    if (alt !== content) {
      fs.writeFileSync(invoicesPath, alt, "utf8");
      console.log("✅ fixed (alt pattern): pages/landlord/LandlordInvoices.tsx");
      fixed++;
    }
  }
}

console.log(`\n${fixed} file(s) fixed.`);
console.log("\nNext steps:");
console.log("  git add -A");
console.log("  git commit -m \"fix: Vercel TypeScript build errors\"");
console.log("  git push");
console.log("\nAlso: In Railway → Variables, make sure DATABASE_URL points to your");
console.log("MySQL DB, NOT Supabase. For local MySQL exposed to internet, use a");
console.log("service like PlanetScale or Railway's built-in MySQL plugin.");
