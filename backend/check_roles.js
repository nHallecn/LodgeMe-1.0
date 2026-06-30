// Run from your backend folder: node check_roles.js
require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Check all users and their roles
  const [users] = await pool.execute("SELECT id, name, email, role FROM users");
  console.log("\n=== USERS IN DB ===");
  users.forEach(u => console.log(`id=${u.id} | name="${u.name}" | email="${u.email}" | role="${u.role}"`));

  // Check what the ENUM allows
  const [cols] = await pool.execute("SHOW COLUMNS FROM users LIKE 'role'");
  console.log("\n=== ROLE COLUMN DEFINITION ===");
  console.log(cols[0]);

  await pool.end();
})();
