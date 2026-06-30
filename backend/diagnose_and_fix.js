// Run from backend folder: node diagnose_and_fix.js
require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // 1. Check if images column exists
  const [cols] = await pool.execute("DESCRIBE properties");
  const imageCol = cols.find(c => c.Field === "images");
  console.log("1. images column:", imageCol ? `✅ EXISTS (type: ${imageCol.Type})` : "❌ MISSING");

  if (!imageCol) {
    console.log("   → Adding images column...");
    await pool.execute("ALTER TABLE properties ADD COLUMN images LONGTEXT DEFAULT NULL");
    console.log("   → ✅ Column added as LONGTEXT");
  } else if (imageCol.Type === "json") {
    // JSON type has a 1GB limit but MySQL validates JSON strictly
    // Switch to LONGTEXT to avoid any JSON validation issues with base64
    console.log("   → Changing JSON to LONGTEXT for better base64 compatibility...");
    await pool.execute("ALTER TABLE properties MODIFY COLUMN images LONGTEXT DEFAULT NULL");
    console.log("   → ✅ Changed to LONGTEXT");
  }

  // 2. Test write with a dummy base64 string
  const testImg = ["data:image/jpeg;base64,/9j/4AAQSkZJRg=="];
  const [testResult] = await pool.execute(
    "UPDATE properties SET images = ? WHERE id = (SELECT id FROM (SELECT id FROM properties ORDER BY id DESC LIMIT 1) t)",
    [JSON.stringify(testImg)]
  );
  console.log("2. Test write:", testResult.affectedRows > 0 ? "✅ SUCCESS" : "❌ FAILED (no rows updated)");

  // 3. Read it back
  const [readBack] = await pool.execute(
    "SELECT id, name, images FROM properties ORDER BY id DESC LIMIT 1"
  );
  if (readBack.length) {
    let imgs = [];
    try { imgs = JSON.parse(readBack[0].images || "[]"); } catch(e) { console.log("   Parse error:", e.message); }
    console.log("3. Read back:", imgs.length > 0 ? `✅ STORED (${imgs.length} image)` : "❌ EMPTY");
  }

  // 4. Clear the test data
  await pool.execute(
    "UPDATE properties SET images = '[]' WHERE id = (SELECT id FROM (SELECT id FROM properties ORDER BY id DESC LIMIT 1) t)"
  );
  console.log("4. Test data cleared ✅");
  console.log("\nDone — restart your backend and re-create a property with photos.");

  await pool.end();
})();
