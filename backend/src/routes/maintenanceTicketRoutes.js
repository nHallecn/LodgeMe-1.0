
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
