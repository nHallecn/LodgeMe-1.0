const pool = require("../config/db");

class User {
  static async create(openId, name, email, loginMethod, role = "user") {
    const [result] = await pool.execute(
      "INSERT INTO users (openId, name, email, loginMethod, role) VALUES (?, ?, ?, ?, ?)",
      [openId, name, email, loginMethod, role]
    );
    return result.insertId;
  }

  static async findByOpenId(openId) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE openId = ?", [openId]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async updateRole(id, role) {
    const [result] = await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    return result.affectedRows;
  }

  static async updateLastSignedIn(id) {
    const [result] = await pool.execute("UPDATE users SET lastSignedIn = CURRENT_TIMESTAMP WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = User;