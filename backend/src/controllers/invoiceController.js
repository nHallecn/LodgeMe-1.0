const InvoiceService = require("../services/InvoiceService");

exports.createInvoice = async (req, res, next) => {
  try {
    const landlordId = req.user.id;
    const { bookingId, amount, dueDate } = req.body;
    const invoiceId = await InvoiceService.createInvoice(bookingId, landlordId, amount, dueDate);
    res.status(201).json({ message: "Invoice created successfully", invoiceId });
  } catch (error) { next(error); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(invoice);
  } catch (error) { next(error); }
};

exports.getInvoicesByLandlord = async (req, res, next) => {
  try {
    const invoices = await InvoiceService.getInvoicesByLandlordId(req.user.id);
    res.status(200).json(invoices);
  } catch (error) { next(error); }
};

// NEW: tenant sees their own invoices
exports.getInvoicesByGuest = async (req, res, next) => {
  try {
    const invoices = await InvoiceService.getInvoicesByGuestId(req.user.id);
    res.status(200).json(invoices);
  } catch (error) { next(error); }
};

exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status, paidDate } = req.body;
    const affectedRows = await InvoiceService.updateInvoiceStatus(req.params.id, status, paidDate);
    if (affectedRows === 0) return res.status(404).json({ message: "Invoice not found or no changes made" });
    res.status(200).json({ message: "Invoice status updated successfully" });
  } catch (error) { next(error); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const affectedRows = await InvoiceService.deleteInvoice(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) { next(error); }
};
