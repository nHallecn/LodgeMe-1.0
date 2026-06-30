require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await pool.execute(
    "SELECT id, name, images FROM properties ORDER BY id DESC LIMIT 3"
  );

  console.log("\n=== Latest Properties ===");
  rows.forEach((r) => {
    let imgs = [];
    try { imgs = JSON.parse(r.images || "[]"); } catch {}
    console.log(`id=${r.id} | "${r.name}" | images=${imgs.length} | ${imgs.length > 0 ? "✅ SAVED ("+imgs[0].substring(0,40)+"...)" : "❌ EMPTY"}`);
  });

  await pool.end();
})();
