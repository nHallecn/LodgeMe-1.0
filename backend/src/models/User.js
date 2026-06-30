const db = require("../config/db");

const SAFE_USER_FIELDS = `
  id, phone, full_name, email, role, avatar_url, bio, city,
  id_document_url, is_verified, verified_at, is_banned, ban_reason,
  trust_score, preferred_lang, last_seen_at, created_at, updated_at
`;

function normaliseUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    phone: row.phone,
    name: row.full_name || row.phone,
    fullName: row.full_name || "",
    email: row.email || "",
    role: row.role,
    avatarUrl: row.avatar_url || "",
    bio: row.bio || "",
    city: row.city || "",
    idDocumentUrl: row.id_document_url || "",
    isVerified: Boolean(row.is_verified),
    verifiedAt: row.verified_at,
    isBanned: Boolean(row.is_banned),
    banReason: row.ban_reason || "",
    trustScore: row.trust_score,
    preferredLang: row.preferred_lang || "fr",
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class User {
  static normalise(row) {
    return normaliseUser(row);
  }

  static async findById(id) {
    const { rows } = await db.query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return normaliseUser(rows[0]);
  }

  static async findByPhone(phone) {
    const { rows } = await db.query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE phone = $1 AND deleted_at IS NULL`,
      [phone]
    );
    return normaliseUser(rows[0]);
  }

  static async findByEmail(email) {
    const { rows } = await db.query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return normaliseUser(rows[0]);
  }

  static async upsertFromOtp({ phone, fullName, role = "tenant", city, preferredLang = "fr" }) {
    const { rows } = await db.query(
      `INSERT INTO users (phone, full_name, role, city, preferred_lang, last_seen_at)
       VALUES ($1, NULLIF($2, ''), $3, NULLIF($4, ''), $5, NOW())
       ON CONFLICT (phone)
       DO UPDATE SET
         full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), users.full_name),
         city = COALESCE(NULLIF(EXCLUDED.city, ''), users.city),
         preferred_lang = COALESCE(EXCLUDED.preferred_lang, users.preferred_lang),
         last_seen_at = NOW(),
         updated_at = NOW()
       RETURNING ${SAFE_USER_FIELDS}`,
      [phone, fullName || "", role, city || "", preferredLang || "fr"]
    );
    return normaliseUser(rows[0]);
  }

  static async updateProfile(id, data) {
    if (data.role && !["tenant", "landlord", "agent"].includes(data.role)) {
      const error = new Error("Role must be tenant, landlord, or agent.");
      error.statusCode = 400;
      error.code = "INVALID_ROLE";
      error.field = "role";
      throw error;
    }

    const allowed = {
      fullName: "full_name",
      email: "email",
      avatarUrl: "avatar_url",
      bio: "bio",
      city: "city",
      idDocumentUrl: "id_document_url",
      preferredLang: "preferred_lang",
      role: "role",
    };

    const sets = [];
    const values = [];

    Object.entries(allowed).forEach(([key, column]) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        values.push(data[key] || null);
        sets.push(`${column} = $${values.length}`);
      }
    });

    if (!sets.length) return this.findById(id);

    values.push(id);
    const { rows } = await db.query(
      `UPDATE users
       SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length} AND deleted_at IS NULL
       RETURNING ${SAFE_USER_FIELDS}`,
      values
    );
    return normaliseUser(rows[0]);
  }

  static async setLastSeen(id) {
    await db.query("UPDATE users SET last_seen_at = NOW() WHERE id = $1", [id]);
  }

  static async updateRole(id, role) {
    const { rowCount } = await db.query(
      "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
      [role, id]
    );
    return rowCount;
  }

  // Legacy compatibility: the old app created email/password users.
  static async create(name, email, _hashedPassword, role = "tenant") {
    const fallbackPhone = `+237${String(Date.now()).slice(-9)}`;
    const { rows } = await db.query(
      `INSERT INTO users (phone, full_name, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [fallbackPhone, name, email, role]
    );
    return rows[0].id;
  }

  static async updateLastSignedIn(id) {
    return this.setLastSeen(id);
  }

  static async findByOpenId(openId) {
    return this.findByEmail(String(openId).replace(/^email:/, ""));
  }
}

module.exports = User;
