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

// ── Static/specific paths MUST come before dynamic /:id routes ───────────────

// Public
router.get("/", getProperties);

// Landlord-specific — must be before /:id or Express matches "landlord" as the id
router.get("/landlord/:landlordId", protect, authorize("landlord", "admin"), getPropertiesByLandlord);

// Room sub-routes — must be before /:id
router.get("/rooms/:roomId", getRoomById);
router.put("/rooms/:roomId", protect, authorize("landlord", "admin"), updateRoom);
router.delete("/rooms/:roomId", protect, authorize("landlord", "admin"), deleteRoom);
router.patch("/rooms/:roomId/availability", protect, authorize("landlord", "admin"), updateRoomAvailability);

// Dynamic /:id routes — after all static paths
router.get("/:id", getPropertyById);
router.put("/:id", protect, authorize("landlord", "admin"), updateProperty);
router.delete("/:id", protect, authorize("landlord", "admin"), deleteProperty);
router.get("/:propertyId/rooms", getRoomsByProperty);
router.post("/:propertyId/rooms", protect, authorize("landlord", "admin"), addRoom);

// Create property
router.post("/", protect, authorize("landlord", "admin"), createProperty);

module.exports = router;
