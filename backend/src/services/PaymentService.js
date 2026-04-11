
const Payment = require("../models/Payment");

class PaymentService {
  static async recordPayment(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) {
    return await Payment.create(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes);
  }
  static async getPaymentById(id)               { return await Payment.findById(id); }
  static async getPaymentsByBookingId(id)        { return await Payment.findByBookingId(id); }
  static async getPaymentsByLandlordId(id)       { return await Payment.findByLandlordId(id); }
  static async getPaymentsByGuestId(id)          { return await Payment.findByGuestId(id); }
  static async updatePayment(id, data)           { return await Payment.update(id, data); }
  static async deletePayment(id)                 { return await Payment.delete(id); }
}
module.exports = PaymentService;
