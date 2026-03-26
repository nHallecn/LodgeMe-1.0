const pool = require("../config/db");

function normaliseProperty(row) {
  return {
    id: row.id,
    _id: String(row.id),
    title: row.name,
    name: row.name,
    description: row.description || "",
    address: row.neighborhood,
    city: row.city,
    region: row.neighborhood,
    neighborhood: row.neighborhood,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.roomType || "Property",
    totalRooms: row.totalRooms,
    occupiedRooms: row.occupiedRooms,
    amenities: (() => { try { return JSON.parse(row.amenities || "[]"); } catch { return []; } })(),
    images: (() => { try { return JSON.parse(row.images || "[]"); } catch { return []; } })(),
    landlord: String(row.landlordId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    rooms: [],
  };
}

function normaliseRoom(row) {
  return {
    id: row.roomId || row.id,
    _id: String(row.roomId || row.id),
    propertyId: row.propertyId,
    roomNumber: row.roomNumber,
    type: row.roomType,
    roomType: row.roomType,
    capacity: row.capacity,
    price: parseFloat(row.monthlyRent) || 0,
    monthlyRent: parseFloat(row.monthlyRent) || 0,
    cautionDeposit: row.cautionDeposit,
    isAvailable: Boolean(row.isAvailable),
    description: row.roomDescription || row.description || "",
    images: (() => { try { return JSON.parse(row.roomImages || "[]"); } catch { return []; } })(),
  };
}

function groupProperties(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.id)) {
      const prop = normaliseProperty(row);
      map.set(row.id, prop);
    }
    if (row.roomId) {
      const prop = map.get(row.id);
      prop.rooms.push(normaliseRoom(row));
      if (!prop._typeSet) { prop.type = row.roomType || "Property"; prop._typeSet = true; }
    }
  }
  for (const p of map.values()) delete p._typeSet;
  return Array.from(map.values());
}

class Property {
  static async create(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities, images = []) {
    const [result] = await pool.execute(
      "INSERT INTO properties (landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [landlordId, name, city, neighborhood, latitude ?? null, longitude ?? null, description, totalRooms, JSON.stringify(amenities || []), JSON.stringify(images || [])]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*,
        r.id AS roomId, r.roomNumber, r.roomType, r.capacity,
        r.monthlyRent, r.cautionDeposit, r.isAvailable,
        r.description AS roomDescription, r.images AS roomImages
       FROM properties p
       LEFT JOIN rooms r ON p.id = r.propertyId
       WHERE p.id = ?
       ORDER BY r.roomNumber ASC`,
      [id]
    );
    if (rows.length === 0) return null;
    return groupProperties(rows)[0] || null;
  }

  static async findAll({ city, neighborhood, search, minPrice, maxPrice, roomType, isAvailable, limit, offset } = {}) {
    let query = `
      SELECT p.*,
        r.id AS roomId, r.roomNumber, r.roomType, r.capacity,
        r.monthlyRent, r.cautionDeposit, r.isAvailable,
        r.description AS roomDescription, r.images AS roomImages
      FROM properties p
      LEFT JOIN rooms r ON p.id = r.propertyId
      WHERE 1=1
    `;
    const params = [];

    if (city)        { query += " AND p.city = ?";          params.push(String(city)); }
    if (neighborhood){ query += " AND p.neighborhood = ?";   params.push(String(neighborhood)); }
    if (search) {
      query += " AND (p.name LIKE ? OR p.city LIKE ? OR p.neighborhood LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (minPrice !== undefined && minPrice !== "") {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) { query += " AND r.monthlyRent >= ?"; params.push(min); }
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) { query += " AND r.monthlyRent <= ?"; params.push(max); }
    }
    if (roomType)    { query += " AND r.roomType = ?";       params.push(String(roomType)); }
    if (isAvailable !== undefined && isAvailable !== "") {
      const avail = isAvailable === true || isAvailable === "true" || isAvailable === "1" ? 1 : 0;
      query += " AND r.isAvailable = ?";
      params.push(avail);
    }

    query += " ORDER BY p.createdAt DESC";

    if (limit !== undefined && limit !== "") {
      const lim = parseInt(limit);
      if (!isNaN(lim)) { query += " LIMIT ?"; params.push(lim); }
    }
    if (offset !== undefined && offset !== "") {
      const off = parseInt(offset);
      if (!isNaN(off)) { query += " OFFSET ?"; params.push(off); }
    }

    const [rows] = await pool.execute(query, params);
    return groupProperties(rows);
  }

  static async update(id, { name, city, neighborhood, latitude, longitude, description, totalRooms, amenities, images }) {
    const [result] = await pool.execute(
      "UPDATE properties SET name = ?, city = ?, neighborhood = ?, latitude = ?, longitude = ?, description = ?, totalRooms = ?, amenities = ?, images = ? WHERE id = ?",
      [name, city, neighborhood, latitude ?? null, longitude ?? null, description, totalRooms, JSON.stringify(amenities || []), JSON.stringify(images || []), id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM properties WHERE id = ?", [id]);
    return result.affectedRows;
  }

  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute(
      `SELECT p.*,
        r.id AS roomId, r.roomNumber, r.roomType, r.capacity,
        r.monthlyRent, r.cautionDeposit, r.isAvailable,
        r.description AS roomDescription, r.images AS roomImages
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
