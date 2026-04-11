// Run from your backend folder: node check_images.js
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
    "SELECT id, name, images FROM properties ORDER BY id DESC LIMIT 5"
  );

  console.log("\n=== Properties in DB ===");
  rows.forEach((r) => {
    let imgs = [];
    try { imgs = JSON.parse(r.images || "[]"); } catch {}
    console.log(`id=${r.id} | name="${r.name}" | images count=${imgs.length} | first 50 chars: ${imgs[0] ? imgs[0].substring(0, 50) : "EMPTY"}`);
  });

  await pool.end();
})();
