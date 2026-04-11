/**
 * LodgeMe Backend Patcher
 * Run from your backend folder: node patch_backend.js
 * This overwrites all broken route/controller/service/model files in-place.
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ wrote:", filePath.replace(src, "src"));
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

write(path.join(src, "routes/bookingRoutes.js"), `
const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createBooking, getBookingById, getBookingsByGuest,
  updateBookingStatus, deleteBooking, getBookingsByLandlord,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/",            protect, authorize("tenant","admin"),              createBooking);
router.get("/guest",        protect, authorize("tenant","admin"),              getBookingsByGuest);
router.get("/landlord",     protect, authorize("landlord","admin"),            getBookingsByLandlord);
router.get("/:id",          protect, authorize("tenant","landlord","admin"),   getBookingById);
router.patch("/:id/status", protect, authorize("landlord","admin"),            updateBookingStatus);
router.delete("/:id",       protect, authorize("tenant","admin"),              deleteBooking);

module.exports = router;
`);

write(path.join(src, "routes/visitRequestRoutes.js"), `
const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createVisitRequest, getVisitRequestById,
  getGuestVisits, updateVisitStatus, getLandlordVisits,
} = require("../controllers/visitRequestController");

const router = express.Router();

router.post("/",            protect, authorize("tenant","admin"),   createVisitRequest);
router.get("/my-visits",    protect, authorize("tenant","admin"),   getGuestVisits);
router.get("/landlord",     protect, authorize("landlord","admin"), getLandlordVisits);
router.get("/:id",          protect,                                getVisitRequestById);
router.patch("/:id/status", protect, authorize("landlord","admin"), updateVisitStatus);

module.exports = router;
`);

write(path.join(src, "routes/paymentRoutes.js"), `
const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  recordPayment, getPaymentById, getPaymentsByLandlord,
  getPaymentsByGuest, updatePayment, deletePayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/",        protect, authorize("landlord","admin"),            recordPayment);
router.get("/landlord", protect, authorize("landlord","admin"),            getPaymentsByLandlord);
router.get("/guest",    protect, authorize("tenant","admin"),              getPaymentsByGuest);
router.get("/:id",      protect, authorize("landlord","tenant","admin"),   getPaymentById);
router.put("/:id",      protect, authorize("landlord","admin"),            updatePayment);
router.delete("/:id",   protect, authorize("landlord","admin"),            deletePayment);

module.exports = router;
`);

write(path.join(src, "routes/maintenanceTicketRoutes.js"), `
const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createTicket, getTicketById, getTicketsByUser,
  getTicketsByRoom, updateTicket, deleteTicket, getTicketsByLandlord,
} = require("../controllers/maintenanceTicketController");

const router = express.Router();

router.post("/",            protect, authorize("tenant","admin"),             createTicket);
router.get("/user",         protect, authorize("tenant","admin"),             getTicketsByUser);
router.get("/landlord",     protect, authorize("landlord","admin"),           getTicketsByLandlord);
router.get("/room/:roomId", protect, authorize("tenant","landlord","admin"),  getTicketsByRoom);
router.get("/:id",          protect, authorize("tenant","landlord","admin"),  getTicketById);
router.put("/:id",          protect, authorize("tenant","landlord","admin"),  updateTicket);
router.delete("/:id",       protect, authorize("tenant","admin"),             deleteTicket);

module.exports = router;
`);

// ── CONTROLLERS ───────────────────────────────────────────────────────────────

write(path.join(src, "controllers/visitRequestController.js"), `
const VisitRequestService = require("../services/VisitRequestService");

exports.createVisitRequest = async (req, res, next) => {
  try {
    const { propertyId, requestedDate, requestedTime, notes } = req.body;
    const visitId = await VisitRequestService.createVisitRequest(
      propertyId, req.user.id, requestedDate, requestedTime, notes
    );
    res.status(201).json({ message: "Visit request sent successfully", visitId });
  } catch (e) { next(e); }
};

exports.getVisitRequestById = async (req, res, next) => {
  try {
    const visit = await VisitRequestService.getVisitRequestById(req.params.id);
    if (!visit) return res.status(404).json({ message: "Not found" });
    res.status(200).json(visit);
  } catch (e) { next(e); }
};

exports.getGuestVisits = async (req, res, next) => {
  try {
    const visits = await VisitRequestService.getVisitRequestsByGuest(req.user.id);
    res.status(200).json(visits);
  } catch (e) { next(e); }
};

exports.getLandlordVisits = async (req, res, next) => {
  try {
    const visits = await VisitRequestService.getVisitRequestsByLandlord(req.user.id);
    res.status(200).json(visits);
  } catch (e) { next(e); }
};

exports.updateVisitStatus = async (req, res, next) => {
  try {
    const affected = await VisitRequestService.updateVisitStatus(req.params.id, req.body.status);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Visit status updated" });
  } catch (e) { next(e); }
};
`);

write(path.join(src, "controllers/paymentController.js"), `
const PaymentService = require("../services/PaymentService");

exports.recordPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentDate, paymentMethod, receiptNumber, notes } = req.body;
    const paymentId = await PaymentService.recordPayment(
      bookingId, req.user.id, amount, paymentDate, paymentMethod, receiptNumber, notes
    );
    res.status(201).json({ message: "Payment recorded successfully", paymentId });
  } catch (e) { next(e); }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const p = await PaymentService.getPaymentById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.status(200).json(p);
  } catch (e) { next(e); }
};

exports.getPaymentsByLandlord = async (req, res, next) => {
  try { res.status(200).json(await PaymentService.getPaymentsByLandlordId(req.user.id)); }
  catch (e) { next(e); }
};

exports.getPaymentsByGuest = async (req, res, next) => {
  try { res.status(200).json(await PaymentService.getPaymentsByGuestId(req.user.id)); }
  catch (e) { next(e); }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const affected = await PaymentService.updatePayment(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Payment updated" });
  } catch (e) { next(e); }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const affected = await PaymentService.deletePayment(req.params.id);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Payment deleted" });
  } catch (e) { next(e); }
};
`);

write(path.join(src, "controllers/maintenanceTicketController.js"), `
const MaintenanceTicketService = require("../services/MaintenanceTicketService");

exports.createTicket = async (req, res, next) => {
  try {
    const { roomId, title, description, priority } = req.body;
    const ticketId = await MaintenanceTicketService.createTicket(
      roomId, req.user.id, title, description, priority
    );
    res.status(201).json({ message: "Ticket created", ticketId });
  } catch (e) { next(e); }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const t = await MaintenanceTicketService.getTicketById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.status(200).json(t);
  } catch (e) { next(e); }
};

exports.getTicketsByRoom = async (req, res, next) => {
  try { res.status(200).json(await MaintenanceTicketService.getTicketsByRoomId(req.params.roomId)); }
  catch (e) { next(e); }
};

exports.getTicketsByUser = async (req, res, next) => {
  try { res.status(200).json(await MaintenanceTicketService.getTicketsByReportedByUserId(req.user.id)); }
  catch (e) { next(e); }
};

exports.getTicketsByLandlord = async (req, res, next) => {
  try { res.status(200).json(await MaintenanceTicketService.getTicketsByLandlordId(req.user.id)); }
  catch (e) { next(e); }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const affected = await MaintenanceTicketService.updateTicket(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Ticket updated" });
  } catch (e) { next(e); }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const affected = await MaintenanceTicketService.deleteTicket(req.params.id);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Ticket deleted" });
  } catch (e) { next(e); }
};
`);

// ── SERVICES ──────────────────────────────────────────────────────────────────

write(path.join(src, "services/VisitRequestService.js"), `
const VisitRequest = require("../models/VisitRequest");

class VisitRequestService {
  static async createVisitRequest(propertyId, guestId, requestedDate, requestedTime, notes) {
    return await VisitRequest.create(propertyId, guestId, requestedDate, requestedTime, notes);
  }
  static async getVisitRequestById(id)          { return await VisitRequest.findById(id); }
  static async getVisitRequestsByGuest(id)      { return await VisitRequest.findByGuestId(id); }
  static async getVisitRequestsByLandlord(id)   { return await VisitRequest.findByLandlordId(id); }
  static async getVisitRequestsByProperty(id)   { return await VisitRequest.findByPropertyId(id); }
  static async updateVisitStatus(id, status)    { return await VisitRequest.updateStatus(id, status); }
  static async deleteVisitRequest(id)           { return await VisitRequest.delete(id); }
}
module.exports = VisitRequestService;
`);

write(path.join(src, "services/PaymentService.js"), `
const Payment = require("../models/Payment");

class PaymentService {
  static async recordPayment(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) {
    return await Payment.create(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes);
  }
  static async getPaymentById(id)               { return await Payment.findById(id); }
  static async getPaymentsByBookingId(id)        { return await Payment.findByBookingId(id); }
  static async getPaymentsByLandlordId(id)       { return await Payment.findByLandlordId(id); }
  static async getPaymentsByGuestId(id)          { return await Payment.findByGuestId(id); }
  static async updatePayment(id, data)           { return await Payment.update(id, data); }
  static async deletePayment(id)                 { return await Payment.delete(id); }
}
module.exports = PaymentService;
`);

write(path.join(src, "services/MaintenanceTicketService.js"), `
const MaintenanceTicket = require("../models/MaintenanceTicket");

class MaintenanceTicketService {
  static async createTicket(roomId, userId, title, description, priority) {
    return await MaintenanceTicket.create(roomId, userId, title, description, priority);
  }
  static async getTicketById(id)                    { return await MaintenanceTicket.findById(id); }
  static async getTicketsByRoomId(id)               { return await MaintenanceTicket.findByRoomId(id); }
  static async getTicketsByReportedByUserId(id)     { return await MaintenanceTicket.findByReportedByUserId(id); }
  static async getTicketsByLandlordId(id)           { return await MaintenanceTicket.findByLandlordId(id); }
  static async updateTicket(id, data)               { return await MaintenanceTicket.update(id, data); }
  static async deleteTicket(id)                     { return await MaintenanceTicket.delete(id); }
}
module.exports = MaintenanceTicketService;
`);

// ── MODELS ────────────────────────────────────────────────────────────────────

write(path.join(src, "models/VisitRequest.js"), `
const pool = require("../config/db");

class VisitRequest {
  static async create(propertyId, guestId, requestedDate, requestedTime, notes) {
    const [result] = await pool.execute(
      "INSERT INTO visitRequests (propertyId, guestId, requestedDate, requestedTime, notes) VALUES (?, ?, ?, ?, ?)",
      [propertyId, guestId, requestedDate, requestedTime || null, notes || null]
    );
    return result.insertId;
  }
  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM visitRequests WHERE id = ?", [id]);
    return rows[0];
  }
  static async findByGuestId(guestId) {
    const [rows] = await pool.execute("SELECT * FROM visitRequests WHERE guestId = ? ORDER BY createdAt DESC", [guestId]);
    return rows;
  }
  static async findByPropertyId(propertyId) {
    const [rows] = await pool.execute("SELECT * FROM visitRequests WHERE propertyId = ?", [propertyId]);
    return rows;
  }
  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute(
      \`SELECT vr.* FROM visitRequests vr
       JOIN properties p ON vr.propertyId = p.id
       WHERE p.landlordId = ? ORDER BY vr.createdAt DESC\`,
      [landlordId]
    );
    return rows;
  }
  static async updateStatus(id, status) {
    const [result] = await pool.execute("UPDATE visitRequests SET status=? WHERE id=?", [status, id]);
    return result.affectedRows;
  }
  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM visitRequests WHERE id=?", [id]);
    return result.affectedRows;
  }
}
module.exports = VisitRequest;
`);

write(path.join(src, "models/Payment.js"), `
const pool = require("../config/db");

class Payment {
  static async create(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) {
    const [result] = await pool.execute(
      "INSERT INTO payments (bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber || null, notes || null]
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
    const [rows] = await pool.execute("SELECT * FROM payments WHERE landlordId = ? ORDER BY paymentDate DESC", [landlordId]);
    return rows;
  }
  static async findByGuestId(guestId) {
    const [rows] = await pool.execute(
      \`SELECT p.* FROM payments p
       JOIN bookings b ON p.bookingId = b.id
       WHERE b.guestId = ? ORDER BY p.paymentDate DESC\`,
      [guestId]
    );
    return rows;
  }
  static async update(id, { amount, paymentDate, paymentMethod, receiptNumber, notes }) {
    const [result] = await pool.execute(
      "UPDATE payments SET amount=?, paymentDate=?, paymentMethod=?, receiptNumber=?, notes=? WHERE id=?",
      [amount, paymentDate, paymentMethod, receiptNumber || null, notes || null, id]
    );
    return result.affectedRows;
  }
  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM payments WHERE id=?", [id]);
    return result.affectedRows;
  }
}
module.exports = Payment;
`);

write(path.join(src, "models/MaintenanceTicket.js"), `
const pool = require("../config/db");

class MaintenanceTicket {
  static async create(roomId, reportedByUserId, title, description, priority = "medium") {
    const [result] = await pool.execute(
      "INSERT INTO maintenanceTickets (roomId, reportedByUserId, title, description, priority) VALUES (?, ?, ?, ?, ?)",
      [roomId, reportedByUserId, title, description, priority]
    );
    return result.insertId;
  }
  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM maintenanceTickets WHERE id = ?", [id]);
    return rows[0];
  }
  static async findByRoomId(roomId) {
    const [rows] = await pool.execute("SELECT * FROM maintenanceTickets WHERE roomId = ? ORDER BY createdAt DESC", [roomId]);
    return rows;
  }
  static async findByReportedByUserId(userId) {
    const [rows] = await pool.execute("SELECT * FROM maintenanceTickets WHERE reportedByUserId = ? ORDER BY createdAt DESC", [userId]);
    return rows;
  }
  static async findByLandlordId(landlordId) {
    const [rows] = await pool.execute(
      \`SELECT mt.* FROM maintenanceTickets mt
       JOIN rooms r ON mt.roomId = r.id
       JOIN properties p ON r.propertyId = p.id
       WHERE p.landlordId = ? ORDER BY mt.createdAt DESC\`,
      [landlordId]
    );
    return rows;
  }
  static async update(id, { title, description, priority, status }) {
    const [result] = await pool.execute(
      "UPDATE maintenanceTickets SET title=?, description=?, priority=?, status=? WHERE id=?",
      [title, description, priority, status, id]
    );
    return result.affectedRows;
  }
  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM maintenanceTickets WHERE id=?", [id]);
    return result.affectedRows;
  }
}
module.exports = MaintenanceTicket;
`);

console.log("\n✅ All files patched successfully! Restart your backend with: nodemon src/server.js");
