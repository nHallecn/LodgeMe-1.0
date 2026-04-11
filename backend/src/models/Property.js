const pool = require("../config/db");

function safeJson(val, fallback) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

function normaliseProperty(row) {
  return {
    id:            row.id,
    _id:           String(row.id),
    title:         row.name,
    name:          row.name,
    description:   row.description || "",
    address:       row.neighborhood,
    city:          row.city,
    region:        row.neighborhood,
    neighborhood:  row.neighborhood,
    type:          "Property",
    totalRooms:    row.totalRooms,
    occupiedRooms: row.occupiedRooms,
    amenities:     safeJson(row.amenities, []),
    images:        safeJson(row.images, []),
    landlord:      String(row.landlordId),
    createdAt:     row.createdAt,
    updatedAt:     row.updatedAt,
    rooms:         [],
  };
}

function normaliseRoom(row) {
  return {
    id:             row.id,
    _id:            String(row.id),
    propertyId:     row.propertyId,
    roomNumber:     row.roomNumber,
    type:           row.roomType,
    roomType:       row.roomType,
    capacity:       row.capacity,
    price:          parseFloat(row.monthlyRent) || 0,
    monthlyRent:    parseFloat(row.monthlyRent) || 0,
    cautionDeposit: row.cautionDeposit,
    isAvailable:    Boolean(row.isAvailable),
    description:    row.description || "",
    images:         safeJson(row.images, []),
  };
}

function attachRooms(properties, rooms) {
  const map = new Map(properties.map((p) => [p.id, p]));
  for (const room of rooms) {
    const prop = map.get(room.propertyId);
    if (!prop) continue;
    prop.rooms.push(normaliseRoom(room));
    if (prop.type === "Property" && room.roomType) prop.type = room.roomType;
  }
  // Sort in JS — no MySQL sort buffer needed
  for (const prop of map.values()) {
    prop.rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }
  return properties;
}

async function fetchRooms(propertyIds) {
  if (!propertyIds.length) return [];
  const placeholders = propertyIds.map(() => "?").join(",");
  // NO ORDER BY — sort happens in JS via attachRooms
  const [rows] = await pool.execute(
    `SELECT id, propertyId, roomNumber, roomType, capacity, monthlyRent,
            cautionDeposit, isAvailable, description, images
     FROM rooms WHERE propertyId IN (${placeholders})`,
    propertyIds
  );
  return rows;
}

class Property {
  static async create(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities, images = []) {
    const [result] = await pool.execute(
      `INSERT INTO properties
         (landlordId, name, city, neighborhood, latitude, longitude,
          description, totalRooms, amenities, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [landlordId, name, city, neighborhood,
       latitude ?? null, longitude ?? null,
       description, totalRooms,
       JSON.stringify(amenities || []),
       JSON.stringify(images || [])]
    );
    return result.insertId;
  }

  static async findById(id) {
    // Select only scalar columns — exclude images to keep row small
    const [rows] = await pool.execute(
      `SELECT id, landlordId, name, city, neighborhood, latitude, longitude,
              description, totalRooms, occupiedRooms, amenities, images,
              createdAt, updatedAt
       FROM properties WHERE id = ?`,
      [id]
    );
    if (!rows.length) return null;
    const prop = normaliseProperty(rows[0]);
    const rooms = await fetchRooms([prop.id]);
    attachRooms([prop], rooms);
    return prop;
  }

  static async findAll({
    city, neighborhood, search,
    minPrice, maxPrice, roomType, isAvailable,
    limit, offset,
  } = {}) {
    // No JOIN, no ORDER BY in SQL — both done in JS
    let query = `
      SELECT id, landlordId, name, city, neighborhood,
             description, totalRooms, occupiedRooms, amenities, images,
             createdAt, updatedAt
      FROM properties WHERE 1=1
    `;
    const params = [];

    if (city)         { query += " AND city = ?";        params.push(String(city)); }
    if (neighborhood) { query += " AND neighborhood = ?"; params.push(String(neighborhood)); }
    if (search) {
      query += " AND (name LIKE ? OR city LIKE ? OR neighborhood LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    // Limit/offset without ORDER BY — stable on InnoDB (insertion order)
    if (limit !== undefined && limit !== "") {
      const lim = parseInt(limit);
      if (!isNaN(lim)) { query += " LIMIT ?"; params.push(lim); }
    }
    if (offset !== undefined && offset !== "") {
      const off = parseInt(offset);
      if (!isNaN(off)) { query += " OFFSET ?"; params.push(off); }
    }

    const [propRows] = await pool.execute(query, params);
    if (!propRows.length) return [];

    const properties = propRows.map(normaliseProperty);
    let rooms = await fetchRooms(properties.map((p) => p.id));

    // Room-level filters in JS
    if (minPrice !== undefined && minPrice !== "") {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) rooms = rooms.filter((r) => parseFloat(r.monthlyRent) >= min);
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) rooms = rooms.filter((r) => parseFloat(r.monthlyRent) <= max);
    }
    if (roomType)     rooms = rooms.filter((r) => r.roomType === roomType);
    if (isAvailable !== undefined && isAvailable !== "") {
      const avail = isAvailable === true || isAvailable === "true" || isAvailable === "1";
      rooms = rooms.filter((r) => Boolean(r.isAvailable) === avail);
    }

    // Sort properties newest-first in JS
    attachRooms(properties, rooms);
    properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return properties;
  }

  static async update(id, { name, city, neighborhood, latitude, longitude, description, totalRooms, amenities, images }) {
    const [result] = await pool.execute(
      `UPDATE properties
       SET name=?, city=?, neighborhood=?, latitude=?, longitude=?,
           description=?, totalRooms=?, amenities=?, images=?
       WHERE id=?`,
      [name, city, neighborhood,
       latitude ?? null, longitude ?? null,
       description, totalRooms,
       JSON.stringify(amenities || []),
       JSON.stringify(images || []),
       id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM properties WHERE id = ?", [id]);
    return result.affectedRows;
  }

  static async findByLandlordId(landlordId) {
    // Simple query — no JOIN, no ORDER BY, no sort buffer pressure at all
    const [propRows] = await pool.execute(
      `SELECT id, landlordId, name, city, neighborhood,
              description, totalRooms, occupiedRooms, amenities, images,
              createdAt, updatedAt
       FROM properties WHERE landlordId = ?`,
      [landlordId]
    );
    if (!propRows.length) return [];

    const properties = propRows.map(normaliseProperty);
    const rooms = await fetchRooms(properties.map((p) => p.id));
    attachRooms(properties, rooms);

    // Sort newest-first in JS
    properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return properties;
  }
}

module.exports = Property;
