const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createMaintenanceTicket,
  getMaintenanceTicketById,
  getMaintenanceTicketsByRoom,
  getMaintenanceTicketsByUser,
  updateMaintenanceTicket,
  deleteMaintenanceTicket,
} = require("../controllers/maintenanceTicketController");

const router = express.Router();

router.post("/", protect, authorize("user", "landlord", "admin"), createMaintenanceTicket);
router.get("/user", protect, authorize("user", "landlord", "admin"), getMaintenanceTicketsByUser);
router.get("/room/:roomId", protect, authorize("landlord", "admin"), getMaintenanceTicketsByRoom);
router.get("/:id", protect, authorize("user", "landlord", "admin"), getMaintenanceTicketById);
router.put("/:id", protect, authorize("landlord", "admin"), updateMaintenanceTicket);
router.delete("/:id", protect, authorize("landlord", "admin"), deleteMaintenanceTicket);

module.exports = router;