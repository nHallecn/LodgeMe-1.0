const pool = require("../config/db");

class Review {
  static async create(bookingId, reviewerId, revieweeId, rating, comment) {
    const [result] = await pool.execute(
      "INSERT INTO reviews (bookingId, reviewerId, revieweeId, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [bookingId, reviewerId, revieweeId, rating, comment]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM reviews WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByRevieweeId(revieweeId) {
    const [rows] = await pool.execute("SELECT * FROM reviews WHERE revieweeId = ?", [revieweeId]);
    return rows;
  }

  static async findByReviewerId(reviewerId) {
    const [rows] = await pool.execute("SELECT * FROM reviews WHERE reviewerId = ?", [reviewerId]);
    return rows;
  }

  static async update(id, { rating, comment }) {
    const [result] = await pool.execute(
      "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
      [rating, comment, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Review;