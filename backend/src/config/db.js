const { Pool } = require("pg");

const ssl =
  process.env.DB_SSL === "true" || process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl,
        max: Number(process.env.DB_POOL_SIZE || 10),
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "lodgme_db",
        ssl,
        max: Number(process.env.DB_POOL_SIZE || 10),
      }
);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function mysqlPlaceholdersToPg(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// Transitional compatibility for legacy model files that still call pool.execute().
async function execute(sql, params = []) {
  const result = await query(mysqlPlaceholdersToPg(sql), params);
  return [
    result.rows,
    {
      rowCount: result.rowCount,
      affectedRows: result.rowCount,
      insertId: result.rows[0]?.id,
    },
  ];
}

module.exports = { pool, query, transaction, execute };
