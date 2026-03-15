const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createInvoice,
  getInvoiceById,
  getInvoicesByLandlord,
  updateInvoiceStatus,
  deleteInvoice,
} = require("../controllers/invoiceController");

const router = express.Router();

router.post("/", protect, authorize("landlord", "admin"), createInvoice);
router.get("/landlord", protect, authorize("landlord", "admin"), getInvoicesByLandlord);
router.get("/:id", protect, authorize("landlord", "admin", "user"), getInvoiceById);
router.patch("/:id/status", protect, authorize("landlord", "admin"), updateInvoiceStatus);
router.delete("/:id", protect, authorize("landlord", "admin"), deleteInvoice);

module.exports = router;