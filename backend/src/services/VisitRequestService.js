const VisitRequest = require("../models/VisitRequest");

class VisitRequestService {
  static async createVisitRequest(propertyId, guestId, requestedDate, requestedTime, notes) {
    return await VisitRequest.create(propertyId, guestId, requestedDate, requestedTime, notes);
  }
  static async getVisitRequestById(id) { return await VisitRequest.findById(id); }
  static async getVisitRequestsByGuest(guestId) { return await VisitRequest.findByGuestId(guestId); }
  static async getVisitRequestsByLandlord(landlordId) { return await VisitRequest.findByLandlordId(landlordId); }
  static async updateVisitStatus(id, status) { return await VisitRequest.updateStatus(id, status); }
}
module.exports = VisitRequestService;
