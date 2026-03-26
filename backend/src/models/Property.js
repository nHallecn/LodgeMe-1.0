const pool = require("../config/db");

// Helper: normalise a flat DB row into the shape the frontend expects
function normaliseProperty(row) {
  return {
    id: row.id,
    _id: String(row.id),          // frontend uses _id in some places
    title: row.name,              // DB: name  →  frontend: title
    name: row.name,
    description: row.description || "",
    address: row.neighborhood,    // DB: neighborhood  →  frontend: address
    city: row.city,
    region: row.neighborhood,     // also exposed as region for breadcrumbs
    neighborhood: row.neighborhood,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.roomType || "Property",   // filled in after grouping
    totalRooms: row.totalRooms,
    occupiedRooms: row.occupiedRooms,
    amenities: (() => {
      try { return JSON.parse(row.amenities || "[]"); } catch { return []; }
    })(),
    images: [],                   // properties table has no images column; rooms do
    landlord: String(row.landlordId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    rooms: [],                    // populated by grouping helpers
  };
}

// Helper: normalise a room row
function normaliseRoom(row) {
  return {
    id: row.roomId || row.id,
    _id: String(row.roomId || row.id),
    propertyId: row.propertyId,
    roomNumber: row.roomNumber,
    type: row.roomType,
    roomType: row.roomType,
    capacity: row.capacity,
    price: parseFloat(row.monthlyRent) || 0,   // DB: monthlyRent  →  frontend: price
    monthlyRent: parseFloat(row.monthlyRent) || 0,
    cautionDeposit: row.cautionDeposit,
    isAvailable: Boolean(row.isAvailable),
    description: row.description || "",
    images: (() => {
      try { return JSON.parse(row.images || "[]"); } catch { return []; }
    })(),
  };
}

// Group flat JOIN rows into { property, rooms[] } objects
function groupProperties(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, normaliseProperty(row));
    }
    // Only add room if this row actually has room data
    if (row.roomId) {
      const room = normaliseRoom(row);
      map.get(row.id).rooms.push(room);

      // Use the first room's image array as property images
      if (map.get(row.id).images.length === 0 && room.images.length > 0) {
        map.get(row.id).images = room.images;
      }
      // Use the most common room type as the property type
      if (!map.get(row.id)._typeSet) {
        map.get(row.id).type = room.roomType || "Property";
        map.get(row.id)._typeSet = true;
      }
    }
  }

  // Clean up the internal flag
  for (const p of map.values()) delete p._typeSet;

  return Array.from(map.values());
}

class Property {
  static async create(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities) {
    const [result] = await pool.execute(
      "INSERT INTO properties (landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, JSON.stringify(amenities)]
    );
    return result.insertId;
  }

  static async findById(id) {
    // Fetch property + all its rooms in one query
    const [rows] = await pool.execute(
      `SELECT
         p.*,
         r.id        AS roomId,
         r.roomNumber,
         r.roomType,
         r.capacity,
         r.monthlyRent,
         r.cautionDeposit,
         r.isAvailable,
         r.description AS roomDescription,
         r.images
       FROM properties p
       LEFT JOIN rooms r ON p.id = r.propertyId
       WHERE p.id = ?
       ORDER BY r.roomNumber ASC`,
      [id]
    );

    if (rows.length === 0) return null;

    const grouped = groupProperties(rows);
    return grouped[0] || null;
  }

  static async findAll({ city, neighborhood, search, minPrice, maxPrice, roomType, isAvailable, limit, offset } = {}) {
    // LEFT JOIN so properties without rooms are still returned
    let query = `
      SELECT
        p.*,
        r.id           AS roomId,
        r.roomNumber,
        r.roomType,
        r.capacity,
        r.monthlyRent,
        r.cautionDeposit,
        r.isAvailable,
        r.description  AS roomDescription,
        r.images
      FROM properties p
      LEFT JOIN rooms r ON p.id = r.propertyId
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
    if (search) {
      query += " AND (p.name LIKE ? OR p.city LIKE ? OR p.neighborhood LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
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
    return groupProperties(rows);
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
    const [rows] = await pool.execute(
      `SELECT
         p.*,
         r.id           AS roomId,
         r.roomNumber,
         r.roomType,
         r.capacity,
         r.monthlyRent,
         r.cautionDeposit,
         r.isAvailable,
         r.description  AS roomDescription,
         r.images
       FROM properties p
       LEFT JOIN rooms r ON p.id = r.propertyId
       WHERE p.landlordId = ?
       ORDER BY p.createdAt DESC, r.roomNumber ASC`,
      [landlordId]
    );
    return groupProperties(rows);
  }
}

module.exports = Property;
