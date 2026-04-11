
const PaymentService = require("../services/PaymentService");

exports.recordPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentDate, paymentMethod, receiptNumber, notes } = req.body;
    const paymentId = await PaymentService.recordPayment(
      bookingId, req.user.id, amount, paymentDate, paymentMethod, receiptNumber, notes
    );
    res.status(201).json({ message: "Payment recorded successfully", paymentId });
  } catch (e) { next(e); }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const p = await PaymentService.getPaymentById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.status(200).json(p);
  } catch (e) { next(e); }
};

exports.getPaymentsByLandlord = async (req, res, next) => {
  try { res.status(200).json(await PaymentService.getPaymentsByLandlordId(req.user.id)); }
  catch (e) { next(e); }
};

exports.getPaymentsByGuest = async (req, res, next) => {
  try { res.status(200).json(await PaymentService.getPaymentsByGuestId(req.user.id)); }
  catch (e) { next(e); }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const affected = await PaymentService.updatePayment(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Payment updated" });
  } catch (e) { next(e); }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const affected = await PaymentService.deletePayment(req.params.id);
    if (affected === 0) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Payment deleted" });
  } catch (e) { next(e); }
};
