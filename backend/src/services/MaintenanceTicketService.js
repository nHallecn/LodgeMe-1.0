const MaintenanceTicket = require("../models/MaintenanceTicket");

class MaintenanceTicketService {
  static async createTicket(roomId, reportedByUserId, title, description, priority) {
    return await MaintenanceTicket.create(roomId, reportedByUserId, title, description, priority);
  }

  static async getTicketById(id) {
    return await MaintenanceTicket.findById(id);
  }

  static async getTicketsByRoomId(roomId) {
    return await MaintenanceTicket.findByRoomId(roomId);
  }

  static async getTicketsByReportedByUserId(reportedByUserId) {
    return await MaintenanceTicket.findByReportedByUserId(reportedByUserId);
  }

  static async updateTicket(id, ticketData) {
    return await MaintenanceTicket.update(id, ticketData);
  }

  static async deleteTicket(id) {
    return await MaintenanceTicket.delete(id);
  }
}

module.exports = MaintenanceTicketService;