const pool = require("../config/db");

class Property {
  static async create(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities) {
    const [result] = await pool.execute(
      "INSERT INTO properties (landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, JSON.stringify(amenities)]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM properties WHERE id = ?", [id]);
    return rows[0];
  }

  static async findAll({ city, neighborhood, minPrice, maxPrice, roomType, isAvailable, limit, offset }) {
    let query = `
      SELECT p.*, r.id as roomId, r.roomNumber, r.roomType, r.monthlyRent, r.isAvailable, r.images
      FROM properties p
      JOIN rooms r ON p.id = r.propertyId
      WHERE 1=1
    `;
    const params = [];

    if (city) {
      query += " AND p.city = ?";
      params.push(city);
    }
    if (neighborhood) {
      query += " AND p.neighborhood = ?";
      params.push(neighborhood);
    }
    if (minPrice) {
      query += " AND r.monthlyRent >= ?";
      params.push(minPrice);
    }
    if (maxPrice) {
      query += " AND r.monthlyRent <= ?";
      params.push(maxPrice);
    }
    if (roomType) {
      query += " AND r.roomType = ?";
      params.push(roomType);
    }
    if (isAvailable !== undefined) {
      query += " AND r.isAvailable = ?";
      params.push(isAvailable);
    }

    query += " ORDER BY p.createdAt DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit));
    }
    if (offset) {
      query += " OFFSET ?";
      params.push(parseInt(offset));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, { name, city, neighborhood, latitude, longitude, description, totalRooms, amenities }) {
    const [result] = await pool.execute(
      "UPDATE properties SET name = ?, city = ?, neighborhood = ?, latitude = ?, longitude = ?, description = ?, totalRooms = ?, amenities = ? WHERE id = ?",
      [name, city, neighborhood, latitude, longitude, description, totalRooms, JSON.stringify(amenities), id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM properties WHERE id = ?", [id]);
    return result.affectedRows;
  }

  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute("SELECT * FROM properties WHERE landlordId = ?", [landlordId]);
    return rows;
  }
}

module.exports = Property;