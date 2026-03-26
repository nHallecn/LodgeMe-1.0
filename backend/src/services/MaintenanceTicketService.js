const MaintenanceTicket = require("../models/MaintenanceTicket");

class MaintenanceTicketService {
  static async createTicket(roomId, reportedByUserId, title, description, priority) {
    return await MaintenanceTicket.create(roomId, reportedByUserId, title, description, priority);
  }
  static async getTicketById(id) { return await MaintenanceTicket.findById(id); }
  static async getTicketsByRoomId(roomId) { return await MaintenanceTicket.findByRoomId(roomId); }
  static async getTicketsByReportedByUserId(userId) { return await MaintenanceTicket.findByReportedByUserId(userId); }
  static async getTicketsByLandlordId(landlordId) { return await MaintenanceTicket.findByLandlordId(landlordId); }
  static async updateTicket(id, data) { return await MaintenanceTicket.update(id, data); }
  static async deleteTicket(id) { return await MaintenanceTicket.delete(id); }
}
module.exports = MaintenanceTicketService;
