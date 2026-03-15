const pool = require("../config/db");

class Booking {
  static async create(guestId, roomId, startDate, endDate) {
    const [result] = await pool.execute(
      "INSERT INTO bookings (guestId, roomId, startDate, endDate) VALUES (?, ?, ?, ?)",
      [guestId, roomId, startDate, endDate]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByGuestId(guestId) {
    const [rows] = await pool.execute("SELECT * FROM bookings WHERE guestId = ?", [guestId]);
    return rows;
  }

  static async findByRoomId(roomId) {
    const [rows] = await pool.execute("SELECT * FROM bookings WHERE roomId = ?", [roomId]);
    return rows;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.execute("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM bookings WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Booking;


