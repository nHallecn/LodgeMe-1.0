const pool = require("../config/db");

class MaintenanceTicket {
  static async create(roomId, reportedByUserId, title, description, priority = "medium") {
    const [result] = await pool.execute(
      "INSERT INTO maintenanceTickets (roomId, reportedByUserId, title, description, priority) VALUES (?, ?, ?, ?, ?)",
      [roomId, reportedByUserId, title, description, priority]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM maintenanceTickets WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByRoomId(roomId) {
    const [rows] = await pool.execute(
      "SELECT * FROM maintenanceTickets WHERE roomId = ? ORDER BY createdAt DESC",
      [roomId]
    );
    return rows;
  }

  static async findByReportedByUserId(reportedByUserId) {
    const [rows] = await pool.execute(
      "SELECT * FROM maintenanceTickets WHERE reportedByUserId = ? ORDER BY createdAt DESC",
      [reportedByUserId]
    );
    return rows;
  }

  // NEW: landlord sees tickets for rooms in their properties
  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute(
      `SELECT mt.* FROM maintenanceTickets mt
       JOIN rooms r ON mt.roomId = r.id
       JOIN properties p ON r.propertyId = p.id
       WHERE p.landlordId = ?
       ORDER BY mt.createdAt DESC`,
      [landlordId]
    );
    return rows;
  }

  static async update(id, { title, description, priority, status }) {
    const [result] = await pool.execute(
      "UPDATE maintenanceTickets SET title = ?, description = ?, priority = ?, status = ? WHERE id = ?",
      [title, description, priority, status, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM maintenanceTickets WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = MaintenanceTicket;
