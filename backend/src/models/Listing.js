const db = require("../config/db");

const LISTING_SELECT = `
  p.*,
  ST_Y(p.location::geometry) AS latitude,
  ST_X(p.location::geometry) AS longitude,
  u.full_name AS landlord_name,
  u.phone AS landlord_phone,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', lp.id,
          'url', lp.url,
          'thumbnailUrl', lp.thumbnail_url,
          'position', lp.position,
          'isCover', lp.is_cover,
          'width', lp.width,
          'height', lp.height
        )
        ORDER BY lp.position ASC, lp.created_at ASC
      )
      FROM listing_photos lp
      WHERE lp.property_id = p.id
    ),
    '[]'::json
  ) AS photos
`;

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normaliseListing(row) {
  if (!row) return null;

  const photos = toArray(row.photos);
  const images = photos.map((photo) => photo.url).filter(Boolean);
  const monthlyRent = Number(row.monthly_rent || 0);
  const syntheticRoom = {
    id: row.id,
    _id: row.id,
    property: row.id,
    propertyId: row.id,
    roomNumber: "Main",
    type: row.property_type,
    roomType: row.property_type,
    capacity: row.bedrooms || 1,
    price: monthlyRent,
    monthlyRent,
    cautionDeposit: Number(row.caution_months || 0) * monthlyRent,
    description: row.description || "",
    amenities: toArray(row.amenities),
    isAvailable: row.status === "available",
    images,
  };

  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    name: row.title,
    description: row.description || "",
    propertyType: row.property_type,
    type: row.property_type,
    status: row.status,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.area_sqm ? Number(row.area_sqm) : null,
    floor: row.floor,
    totalFloors: row.total_floors,
    furnished: row.furnished,
    monthlyRent,
    price: monthlyRent,
    advanceMonths: row.advance_months,
    cautionMonths: row.caution_months,
    agencyFeeMonths: row.agency_fee_months,
    utilities: toArray(row.utilities),
    address: row.address_raw,
    addressRaw: row.address_raw,
    city: row.city,
    neighbourhood: row.neighbourhood || "",
    neighborhood: row.neighbourhood || "",
    region: row.neighbourhood || row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    amenities: toArray(row.amenities),
    rules: toArray(row.rules),
    availableFrom: row.available_from,
    virtualTourUrl: row.virtual_tour_url || "",
    metadata: row.metadata || {},
    isFeatured: Boolean(row.is_featured),
    featuredUntil: row.featured_until,
    viewCount: row.view_count,
    inquiryCount: row.inquiry_count,
    rejectionReason: row.rejection_reason || "",
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    expiresAt: row.expires_at,
    landlordId: row.landlord_id,
    landlord: row.landlord_id,
    landlordName: row.landlord_name || "",
    landlordPhone: row.landlord_phone || "",
    agentId: row.agent_id,
    photos,
    images,
    rooms: [syntheticRoom],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildLocation(latitude, longitude) {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return null;
  }
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return `SRID=4326;POINT(${lng} ${lat})`;
}

class Listing {
  static normalise(row) {
    return normaliseListing(row);
  }

  static async findAll(filters = {}) {
    const values = [];
    const where = ["p.deleted_at IS NULL"];

    if (!filters.includeUnavailable) {
      where.push("p.status IN ('available', 'reserved')");
    }

    if (filters.ownerId) {
      values.push(filters.ownerId);
      where.push(`(p.landlord_id = $${values.length} OR p.agent_id = $${values.length})`);
    }

    if (filters.status) {
      values.push(filters.status);
      where.push(`p.status = $${values.length}`);
    }

    if (filters.city) {
      values.push(filters.city);
      where.push(`LOWER(p.city) = LOWER($${values.length})`);
    }

    if (filters.neighbourhood || filters.neighborhood) {
      values.push(filters.neighbourhood || filters.neighborhood);
      where.push(`p.neighbourhood ILIKE $${values.length}`);
    }

    if (filters.propertyType || filters.type || filters.roomType) {
      values.push(filters.propertyType || filters.type || filters.roomType);
      where.push(`p.property_type = $${values.length}`);
    }

    if (filters.furnished) {
      values.push(filters.furnished);
      where.push(`p.furnished = $${values.length}`);
    }

    if (filters.bedrooms) {
      values.push(Number(filters.bedrooms));
      where.push(`p.bedrooms >= $${values.length}`);
    }

    if (filters.minRent || filters.minPrice) {
      values.push(Number(filters.minRent || filters.minPrice));
      where.push(`p.monthly_rent >= $${values.length}`);
    }

    if (filters.maxRent || filters.maxPrice) {
      values.push(Number(filters.maxRent || filters.maxPrice));
      where.push(`p.monthly_rent <= $${values.length}`);
    }

    if (filters.search) {
      values.push(String(filters.search));
      const index = values.length;
      where.push(`(
        p.search_vector @@ plainto_tsquery('simple', $${index})
        OR p.title ILIKE '%' || $${index} || '%'
        OR p.city ILIKE '%' || $${index} || '%'
        OR p.neighbourhood ILIKE '%' || $${index} || '%'
        OR p.description ILIKE '%' || $${index} || '%'
      )`);
    }

    let orderBy = "p.is_featured DESC, p.created_at DESC";
    if (filters.sort === "price_asc") orderBy = "p.monthly_rent ASC, p.created_at DESC";
    if (filters.sort === "price_desc") orderBy = "p.monthly_rent DESC, p.created_at DESC";

    const limit = Math.min(Number(filters.limit || 24), 100);
    values.push(limit);

    const { rows } = await db.query(
      `SELECT ${LISTING_SELECT}
       FROM properties p
       JOIN users u ON u.id = p.landlord_id
       WHERE ${where.join(" AND ")}
       ORDER BY ${orderBy}
       LIMIT $${values.length}`,
      values
    );

    return rows.map(normaliseListing);
  }

  static async findById(id, { includeUnavailable = false, incrementView = false } = {}) {
    const where = ["p.id = $1", "p.deleted_at IS NULL"];
    if (!includeUnavailable) where.push("p.status IN ('available', 'reserved')");

    const { rows } = await db.query(
      `SELECT ${LISTING_SELECT}
       FROM properties p
       JOIN users u ON u.id = p.landlord_id
       WHERE ${where.join(" AND ")}
       LIMIT 1`,
      [id]
    );

    if (!rows[0]) return null;
    if (incrementView) {
      await db.query("UPDATE properties SET view_count = view_count + 1 WHERE id = $1", [id]);
      rows[0].view_count += 1;
    }
    return normaliseListing(rows[0]);
  }

  static async create(owner, data) {
    const listingId = await db.transaction(async (client) => {
      const location = buildLocation(data.latitude, data.longitude);
      const { rows } = await client.query(
        `INSERT INTO properties (
          landlord_id, agent_id, title, description, property_type, status,
          bedrooms, bathrooms, area_sqm, floor, total_floors, furnished,
          monthly_rent, advance_months, caution_months, agency_fee_months,
          utilities, address_raw, city, neighbourhood, location,
          amenities, rules, available_from, virtual_tour_url, metadata
        )
        VALUES (
          $1, $2, $3, $4, $5, 'pending_review',
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18, $19,
          CASE WHEN $20::text IS NULL THEN NULL ELSE ST_GeogFromText($20) END,
          $21, $22, $23, $24, $25
        )
        RETURNING *`,
        [
          owner.role === "agent" ? data.landlordId || owner.id : owner.id,
          owner.role === "agent" ? owner.id : data.agentId || null,
          data.title,
          data.description || "",
          data.propertyType || data.type || "studio",
          data.bedrooms || null,
          data.bathrooms || null,
          data.areaSqm || null,
          data.floor || null,
          data.totalFloors || null,
          data.furnished || "unfurnished",
          Number(data.monthlyRent || data.price || 0),
          Number(data.advanceMonths || 3),
          Number(data.cautionMonths || 1),
          data.agencyFeeMonths === undefined ? 1 : Number(data.agencyFeeMonths),
          data.utilities || [],
          data.addressRaw || data.address || "",
          data.city,
          data.neighbourhood || data.neighborhood || "",
          location,
          data.amenities || [],
          data.rules || [],
          data.availableFrom || null,
          data.virtualTourUrl || null,
          data.metadata || {},
        ]
      );

      const listing = rows[0];
      const photos = data.photos || data.images || [];
      for (let index = 0; index < photos.length; index += 1) {
        const photo = typeof photos[index] === "string" ? { url: photos[index] } : photos[index];
        if (!photo?.url) continue;
        await client.query(
          `INSERT INTO listing_photos (property_id, url, thumbnail_url, position, is_cover)
           VALUES ($1, $2, $3, $4, $5)`,
          [listing.id, photo.url, photo.thumbnailUrl || photo.thumbnail_url || null, index, index === 0]
        );
      }

      return listing.id;
    });

    return this.findById(listingId, { includeUnavailable: true });
  }

  static async update(id, data) {
    const current = await this.findById(id, { includeUnavailable: true });
    if (!current) return null;

    const location = buildLocation(
      data.latitude === undefined ? current.latitude : data.latitude,
      data.longitude === undefined ? current.longitude : data.longitude
    );

    await db.query(
      `UPDATE properties SET
        title = $1,
        description = $2,
        property_type = $3,
        bedrooms = $4,
        bathrooms = $5,
        area_sqm = $6,
        floor = $7,
        total_floors = $8,
        furnished = $9,
        monthly_rent = $10,
        advance_months = $11,
        caution_months = $12,
        agency_fee_months = $13,
        utilities = $14,
        address_raw = $15,
        city = $16,
        neighbourhood = $17,
        location = CASE WHEN $18::text IS NULL THEN NULL ELSE ST_GeogFromText($18) END,
        amenities = $19,
        rules = $20,
        available_from = $21,
        virtual_tour_url = $22,
        metadata = $23,
        updated_at = NOW()
       WHERE id = $24 AND deleted_at IS NULL`,
      [
        data.title ?? current.title,
        data.description ?? current.description,
        data.propertyType ?? data.type ?? current.propertyType,
        data.bedrooms ?? current.bedrooms,
        data.bathrooms ?? current.bathrooms,
        data.areaSqm ?? current.areaSqm,
        data.floor ?? current.floor,
        data.totalFloors ?? current.totalFloors,
        data.furnished ?? current.furnished,
        Number(data.monthlyRent ?? data.price ?? current.monthlyRent),
        Number(data.advanceMonths ?? current.advanceMonths),
        Number(data.cautionMonths ?? current.cautionMonths),
        data.agencyFeeMonths === undefined ? current.agencyFeeMonths : Number(data.agencyFeeMonths),
        data.utilities ?? current.utilities,
        data.addressRaw ?? data.address ?? current.addressRaw,
        data.city ?? current.city,
        data.neighbourhood ?? data.neighborhood ?? current.neighbourhood,
        location,
        data.amenities ?? current.amenities,
        data.rules ?? current.rules,
        data.availableFrom ?? current.availableFrom,
        data.virtualTourUrl ?? current.virtualTourUrl,
        data.metadata ?? current.metadata,
        id,
      ]
    );

    if (data.photos || data.images) {
      await this.replacePhotos(id, data.photos || data.images);
    }

    return this.findById(id, { includeUnavailable: true });
  }

  static async replacePhotos(id, photos = []) {
    await db.transaction(async (client) => {
      await client.query("DELETE FROM listing_photos WHERE property_id = $1", [id]);
      for (let index = 0; index < photos.length; index += 1) {
        const photo = typeof photos[index] === "string" ? { url: photos[index] } : photos[index];
        if (!photo?.url) continue;
        await client.query(
          `INSERT INTO listing_photos (property_id, url, thumbnail_url, position, is_cover)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, photo.url, photo.thumbnailUrl || photo.thumbnail_url || null, index, index === 0]
        );
      }
    });

    return this.findById(id, { includeUnavailable: true });
  }

  static async softDelete(id) {
    const { rowCount } = await db.query(
      "UPDATE properties SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount;
  }

  static async verify(id, adminId, status, rejectionReason = null) {
    const { rows } = await db.query(
      `UPDATE properties
       SET status = $1,
           reviewed_by = $2,
           reviewed_at = NOW(),
           rejection_reason = $3,
           expires_at = CASE WHEN $1 = 'available' THEN NOW() + INTERVAL '90 days' ELSE expires_at END,
           updated_at = NOW()
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING id`,
      [status, adminId, rejectionReason, id]
    );
    return rows[0] ? this.findById(rows[0].id, { includeUnavailable: true }) : null;
  }
}

module.exports = Listing;
