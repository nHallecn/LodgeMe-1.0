const db = require("../config/db");

function normaliseInquiry(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    propertyId: row.property_id,
    listingId: row.property_id,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name || "",
    tenantPhone: row.tenant_phone || "",
    listingTitle: row.listing_title || "",
    message: row.message || "",
    desiredMoveIn: row.desired_move_in,
    durationMonths: row.duration_months,
    status: row.status,
    viewingDate: row.viewing_date,
    landlordReply: row.landlord_reply || "",
    repliedAt: row.replied_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class Inquiry {
  static async create(propertyId, tenantId, data) {
    const { rows } = await db.query(
      `INSERT INTO inquiries (
        property_id, tenant_id, message, desired_move_in, duration_months, viewing_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        propertyId,
        tenantId,
        data.message || "",
        data.desiredMoveIn || data.requestedDate || null,
        data.durationMonths || null,
        data.viewingDate || (data.requestedDate && data.requestedTime ? `${data.requestedDate}T${data.requestedTime}` : null),
      ]
    );
    await db.query("UPDATE properties SET inquiry_count = inquiry_count + 1 WHERE id = $1", [propertyId]);
    return normaliseInquiry(rows[0]);
  }

  static async findByTenant(tenantId) {
    const { rows } = await db.query(
      `SELECT i.*, p.title AS listing_title, u.full_name AS tenant_name, u.phone AS tenant_phone
       FROM inquiries i
       JOIN properties p ON p.id = i.property_id
       JOIN users u ON u.id = i.tenant_id
       WHERE i.tenant_id = $1
       ORDER BY i.created_at DESC`,
      [tenantId]
    );
    return rows.map(normaliseInquiry);
  }

  static async findByOwner(ownerId) {
    const { rows } = await db.query(
      `SELECT i.*, p.title AS listing_title, u.full_name AS tenant_name, u.phone AS tenant_phone
       FROM inquiries i
       JOIN properties p ON p.id = i.property_id
       JOIN users u ON u.id = i.tenant_id
       WHERE p.landlord_id = $1 OR p.agent_id = $1
       ORDER BY i.created_at DESC`,
      [ownerId]
    );
    return rows.map(normaliseInquiry);
  }

  static async findByProperty(propertyId, ownerId) {
    const { rows } = await db.query(
      `SELECT i.*, p.title AS listing_title, u.full_name AS tenant_name, u.phone AS tenant_phone
       FROM inquiries i
       JOIN properties p ON p.id = i.property_id
       JOIN users u ON u.id = i.tenant_id
       WHERE i.property_id = $1 AND (p.landlord_id = $2 OR p.agent_id = $2)
       ORDER BY i.created_at DESC`,
      [propertyId, ownerId]
    );
    return rows.map(normaliseInquiry);
  }

  static async update(id, ownerId, data) {
    const { rows } = await db.query(
      `UPDATE inquiries i
       SET status = COALESCE($1, i.status),
           viewing_date = COALESCE($2, i.viewing_date),
           landlord_reply = COALESCE($3, i.landlord_reply),
           replied_at = CASE WHEN $3::text IS NULL THEN i.replied_at ELSE NOW() END,
           updated_at = NOW()
       FROM properties p
       WHERE i.id = $4
         AND p.id = i.property_id
         AND (p.landlord_id = $5 OR p.agent_id = $5)
       RETURNING i.*`,
      [data.status || null, data.viewingDate || null, data.landlordReply || data.reply || null, id, ownerId]
    );
    return normaliseInquiry(rows[0]);
  }
}

module.exports = Inquiry;
