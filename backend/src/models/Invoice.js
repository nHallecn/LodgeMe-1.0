const pool = require("../config/db");

class Invoice {
  static async create(bookingId, landlordId, amount, dueDate) {
    const [result] = await pool.execute(
      "INSERT INTO invoices (bookingId, landlordId, amount, dueDate) VALUES (?, ?, ?, ?)",
      [bookingId, landlordId, amount, dueDate]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM invoices WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByBookingId(bookingId) {
    const [rows] = await pool.execute("SELECT * FROM invoices WHERE bookingId = ?", [bookingId]);
    return rows;
  }

  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute("SELECT * FROM invoices WHERE landlordId = ?", [landlordId]);
    return rows;
  }

  static async updateStatus(id, status, paidDate = null) {
    const [result] = await pool.execute("UPDATE invoices SET status = ?, paidDate = ? WHERE id = ?", [status, paidDate, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM invoices WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Invoice;