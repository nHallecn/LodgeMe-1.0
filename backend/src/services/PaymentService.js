const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

class PaymentService {
  static async recordPayment(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes) {
    const paymentId = await Payment.create(bookingId, landlordId, amount, paymentDate, paymentMethod, receiptNumber, notes);
    // Optionally, update associated invoice status to 'paid'
    // const invoice = await Invoice.findByBookingId(bookingId);
    // if (invoice && invoice.status !== 'paid') {
    //   await Invoice.updateStatus(invoice.id, 'paid', paymentDate);
    // }
    return paymentId;
  }

  static async getPaymentById(id) {
    return await Payment.findById(id);
  }

  static async getPaymentsByBookingId(bookingId) {
    return await Payment.findByBookingId(bookingId);
  }

  static async getPaymentsByLandlordId(landlordId) {
    return await Payment.findByLandlordId(landlordId);
  }

  static async updatePayment(id, paymentData) {
    return await Payment.update(id, paymentData);
  }

  static async deletePayment(id) {
    return await Payment.delete(id);
  }
}

module.exports = PaymentService;