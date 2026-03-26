const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createMaintenanceTicket,
  getMaintenanceTicketById,
  getMaintenanceTicketsByRoom,
  getMaintenanceTicketsByUser,
  getMaintenanceTicketsByLandlord,
  updateMaintenanceTicket,
  deleteMaintenanceTicket,
} = require("../controllers/maintenanceTicketController");

const router = express.Router();

router.post("/", protect, authorize("tenant", "admin"), createMaintenanceTicket);
router.get("/user", protect, authorize("tenant", "admin"), getMaintenanceTicketsByUser);
router.get("/landlord", protect, authorize("landlord", "admin"), getMaintenanceTicketsByLandlord);
router.get("/room/:roomId", protect, authorize("landlord", "admin"), getMaintenanceTicketsByRoom);
router.get("/:id", protect, authorize("tenant", "landlord", "admin"), getMaintenanceTicketById);
router.put("/:id", protect, authorize("landlord", "admin"), updateMaintenanceTicket);
router.delete("/:id", protect, authorize("landlord", "admin"), deleteMaintenanceTicket);

module.exports = router;
