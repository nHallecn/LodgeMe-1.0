const pool = require("../config/db");

class Room {
  static async create(propertyId, roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images) {
    // Coerce optional fields: undefined is not accepted by mysql2 — use null / safe defaults
    const safeDeposit     = cautionDeposit ?? null;
    const safeAvailable   = isAvailable    ?? true;
    const safeDescription = description    ?? null;
    const safeImages      = JSON.stringify(
      Array.isArray(images) ? images : []
    );

    const [result] = await pool.execute(
      "INSERT INTO rooms (propertyId, roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [propertyId, roomNumber, roomType, capacity, monthlyRent, safeDeposit, safeAvailable, safeDescription, safeImages]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM rooms WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByPropertyId(propertyId) {
    const [rows] = await pool.execute(
      "SELECT * FROM rooms WHERE propertyId = ? ORDER BY roomNumber ASC",
      [propertyId]
    );
    return rows.map((r) => ({
      id: r.id,
      _id: String(r.id),
      propertyId: r.propertyId,
      roomNumber: r.roomNumber,
      type: r.roomType,
      roomType: r.roomType,
      capacity: r.capacity,
      price: parseFloat(r.monthlyRent) || 0,
      monthlyRent: parseFloat(r.monthlyRent) || 0,
      cautionDeposit: r.cautionDeposit,
      isAvailable: Boolean(r.isAvailable),
      description: r.description || "",
      images: (() => { try { return JSON.parse(r.images || "[]"); } catch { return []; } })(),
    }));
  }

  static async update(id, { roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images }) {
    const [result] = await pool.execute(
      "UPDATE rooms SET roomNumber = ?, roomType = ?, capacity = ?, monthlyRent = ?, cautionDeposit = ?, isAvailable = ?, description = ?, images = ? WHERE id = ?",
      [
        roomNumber,
        roomType,
        capacity,
        monthlyRent,
        cautionDeposit ?? null,
        isAvailable    ?? true,
        description    ?? null,
        JSON.stringify(Array.isArray(images) ? images : []),
        id,
      ]
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
