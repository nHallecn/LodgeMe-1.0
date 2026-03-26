const pool = require("../config/db");

class Payment {
  static async create(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) {
    const [result] = await pool.execute(
      "INSERT INTO payments (bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM payments WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByBookingId(bookingId) {
    const [rows] = await pool.execute("SELECT * FROM payments WHERE bookingId = ?", [bookingId]);
    return rows;
  }

  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute(
      `SELECT p.*, b.guestId FROM payments p
       JOIN bookings b ON p.bookingId = b.id
       WHERE p.landlordId = ?
       ORDER BY p.paymentDate DESC`,
      [landlordId]
    );
    return rows;
  }

  // NEW: returns payments for bookings belonging to this guest
  static async findByGuestId(guestId) {
    const [rows] = await pool.execute(
      `SELECT p.*, b.guestId, b.roomId FROM payments p
       JOIN bookings b ON p.bookingId = b.id
       WHERE b.guestId = ?
       ORDER BY p.paymentDate DESC`,
      [guestId]
    );
    return rows;
  }

  static async update(id, { amount, paymentDate, paymentMethod, receiptNumber, notes }) {
    const [result] = await pool.execute(
      "UPDATE payments SET amount = ?, paymentDate = ?, paymentMethod = ?, receiptNumber = ?, notes = ? WHERE id = ?",
      [amount, paymentDate, paymentMethod, receiptNumber, notes, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM payments WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Payment;
