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

// Public routes for property search
router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.get("/:propertyId/rooms", getRoomsByProperty);
router.get("/rooms/:roomId", getRoomById);

// Protected routes for landlords
router.post("/", protect, authorize("landlord", "admin"), createProperty);
router.put("/:id", protect, authorize("landlord", "admin"), updateProperty);
router.delete("/:id", protect, authorize("landlord", "admin"), deleteProperty);
router.get("/landlord/:landlordId", protect, authorize("landlord", "admin"), getPropertiesByLandlord);

// Room management routes (nested under property)
router.post("/:propertyId/rooms", protect, authorize("landlord", "admin"), addRoom);
router.put("/rooms/:roomId", protect, authorize("landlord", "admin"), updateRoom);
router.delete("/rooms/:roomId", protect, authorize("landlord", "admin"), deleteRoom);
router.patch("/rooms/:roomId/availability", protect, authorize("landlord", "admin"), updateRoomAvailability);

module.exports = router;