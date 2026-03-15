const pool = require("../config/db");

class Room {
  static async create(propertyId, roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images) {
    const [result] = await pool.execute(
      "INSERT INTO rooms (propertyId, roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [propertyId, roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, JSON.stringify(images)]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM rooms WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByPropertyId(propertyId) {
    const [rows] = await pool.execute("SELECT * FROM rooms WHERE propertyId = ?", [propertyId]);
    return rows;
  }

  static async update(id, { roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images }) {
    const [result] = await pool.execute(
      "UPDATE rooms SET roomNumber = ?, roomType = ?, capacity = ?, monthlyRent = ?, cautionDeposit = ?, isAvailable = ?, description = ?, images = ? WHERE id = ?",
      [roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, JSON.stringify(images), id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM rooms WHERE id = ?", [id]);
    return result.affectedRows;
  }

  static async updateAvailability(id, isAvailable) {
    const [result] = await pool.execute("UPDATE rooms SET isAvailable = ? WHERE id = ?", [isAvailable, id]);
    return result.affectedRows;
  }
}

module.exports = Room;