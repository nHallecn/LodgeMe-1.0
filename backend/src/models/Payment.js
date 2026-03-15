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
    const [rows] = await pool.execute("SELECT * FROM payments WHERE landlordId = ?", [landlordId]);
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