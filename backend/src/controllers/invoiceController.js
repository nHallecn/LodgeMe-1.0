const InvoiceService = require("../services/InvoiceService");

exports.createInvoice = async (req, res, next) => {
  try {
    const landlordId = req.user.id; // Assuming landlordId comes from authenticated user
    const { bookingId, amount, dueDate } = req.body;
    const invoiceId = await InvoiceService.createInvoice(bookingId, landlordId, amount, dueDate);
    res.status(201).json({ message: "Invoice created successfully", invoiceId });
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.getInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};

exports.getInvoicesByLandlord = async (req, res, next) => {
  try {
    const landlordId = req.user.id; // Assuming landlordId comes from authenticated user
    const invoices = await InvoiceService.getInvoicesByLandlordId(landlordId);
    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paidDate } = req.body;
    const affectedRows = await InvoiceService.updateInvoiceStatus(id, status, paidDate);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found or no changes made" });
    }
    res.status(200).json({ message: "Invoice status updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await InvoiceService.deleteInvoice(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    next(error);
  }
};