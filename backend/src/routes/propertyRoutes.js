const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertiesByLandlord,
  addRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRoomsByProperty,
  updateRoomAvailability,
} = require("../controllers/propertyController");

const router = express.Router();

// ── Static / prefixed routes MUST come before /:id ──────────────────────────
// Room routes (prefixed with /rooms/) — declare before /:id so Express does
// not swallow "rooms" as a property id
router.get("/rooms/:roomId", getRoomById);
router.put("/rooms/:roomId", protect, authorize("landlord", "admin"), updateRoom);
router.delete("/rooms/:roomId", protect, authorize("landlord", "admin"), deleteRoom);
router.patch("/rooms/:roomId/availability", protect, authorize("landlord", "admin"), updateRoomAvailability);

// Landlord-scoped listing — must also be before /:id
router.get("/landlord/:landlordId", protect, authorize("landlord", "admin"), getPropertiesByLandlord);

// ── Collection routes ────────────────────────────────────────────────────────
router.get("/", getProperties);
router.post("/", protect, authorize("landlord", "admin"), createProperty);

// ── Dynamic :id routes (kept last to avoid eating prefixed paths) ────────────
router.get("/:id", getPropertyById);
router.put("/:id", protect, authorize("landlord", "admin"), updateProperty);
router.delete("/:id", protect, authorize("landlord", "admin"), deleteProperty);

// Rooms nested under a property
router.get("/:propertyId/rooms", getRoomsByProperty);
router.post("/:propertyId/rooms", protect, authorize("landlord", "admin"), addRoom);

module.exports = router;
