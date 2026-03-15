const PaymentService = require("../services/PaymentService");

exports.recordPayment = async (req, res, next) => {
  try {
    const landlordId = req.user.id; // Assuming landlordId comes from authenticated user
    const { bookingId, amount, paymentDate, paymentMethod, receiptNumber, notes } = req.body;
    const paymentId = await PaymentService.recordPayment(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes);
    res.status(201).json({ message: "Payment recorded successfully", paymentId });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await PaymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentsByLandlord = async (req, res, next) => {
  try {
    const landlordId = req.user.id; // Assuming landlordId comes from authenticated user
    const payments = await PaymentService.getPaymentsByLandlordId(landlordId);
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const affectedRows = await PaymentService.updatePayment(id, paymentData);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found or no changes made" });
    }
    res.status(200).json({ message: "Payment updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const affectedRows = await PaymentService.deletePayment(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    next(error);
  }
};