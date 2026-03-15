const pool = require("../config/db");

class VisitRequest {
  static async create(propertyId, guestId, requestedDate, requestedTime, notes) {
    const [result] = await pool.execute(
      "INSERT INTO visitRequests (propertyId, guestId, requestedDate, requestedTime, notes) VALUES (?, ?, ?, ?, ?)",
      [propertyId, guestId, requestedDate, requestedTime, notes]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM visitRequests WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByGuestId(guestId) {
    const [rows] = await pool.execute("SELECT * FROM visitRequests WHERE guestId = ?", [guestId]);
    return rows;
  }

  static async findByPropertyId(propertyId) {
    const [rows] = await pool.execute("SELECT * FROM visitRequests WHERE propertyId = ?", [propertyId]);
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.execute("UPDATE visitRequests SET status = ? WHERE id = ?", [status, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM visitRequests WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = VisitRequest;