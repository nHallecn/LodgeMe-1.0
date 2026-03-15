const Invoice = require("../models/Invoice");

class InvoiceService {
  static async createInvoice(bookingId, landlordId, amount, dueDate) {
    return await Invoice.create(bookingId, landlordId, amount, dueDate);
  }

  static async getInvoiceById(id) {
    return await Invoice.findById(id);
  }

  static async getInvoicesByLandlordId(landlordId) {
    return await Invoice.findByLandlordId(landlordId);
  }

  static async updateInvoiceStatus(id, status, paidDate) {
    return await Invoice.updateStatus(id, status, paidDate);
  }

  static async deleteInvoice(id) {
    return await Invoice.delete(id);
  }
}

module.exports = InvoiceService;