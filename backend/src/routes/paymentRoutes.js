const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  recordPayment,
  getPaymentById,
  getPaymentsByLandlord,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/", protect, authorize("landlord", "admin"), recordPayment);
router.get("/landlord", protect, authorize("landlord", "admin"), getPaymentsByLandlord);
router.get("/:id", protect, authorize("landlord", "admin", "user"), getPaymentById);
router.put("/:id", protect, authorize("landlord", "admin"), updatePayment);
router.delete("/:id", protect, authorize("landlord", "admin"), deletePayment);

module.exports = router;