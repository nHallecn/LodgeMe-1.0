const pool = require("../config/db");

class User {
  static async create(name, email, hashedPassword, role = "tenant") {
  // Generate a unique openId if not provided
  const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const [result] = await pool.execute(
    "INSERT INTO users (openId, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
    [openId, name, email, hashedPassword, role]
  );
  return result.insertId;
}


  static async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
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

  static async findByOpenId(openId) {
    const [rows] = await pool.execute("SELECT * FROM users WHERE openId = ?", [openId]);
    return rows[0];
  }
}

module.exports = User;