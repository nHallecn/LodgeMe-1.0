const VisitRequest = require("../models/VisitRequest");

class VisitRequestService {
  static async createVisitRequest(propertyId, guestId, requestedDate, requestedTime, notes) {
    return await VisitRequest.create(propertyId, guestId, requestedDate, requestedTime, notes);
  }

  static async getVisitRequestById(id) {
    return await VisitRequest.findById(id);
  }

  static async getVisitRequestsByGuest(guestId) {
    return await VisitRequest.findByGuestId(guestId);
  }

  static async getVisitRequestsByProperty(propertyId) {
    return await VisitRequest.findByPropertyId(propertyId);
  }

  static async updateVisitStatus(id, status) {
    return await VisitRequest.updateStatus(id, status);
  }

  static async deleteVisitRequest(id) {
    return await VisitRequest.delete(id);
  }
}

module.exports = VisitRequestService;
