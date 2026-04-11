
const MaintenanceTicket = require("../models/MaintenanceTicket");

class MaintenanceTicketService {
  static async createTicket(roomId, userId, title, description, priority) {
    return await MaintenanceTicket.create(roomId, userId, title, description, priority);
  }
  static async getTicketById(id)                    { return await MaintenanceTicket.findById(id); }
  static async getTicketsByRoomId(id)               { return await MaintenanceTicket.findByRoomId(id); }
  static async getTicketsByReportedByUserId(id)     { return await MaintenanceTicket.findByReportedByUserId(id); }
  static async getTicketsByLandlordId(id)           { return await MaintenanceTicket.findByLandlordId(id); }
  static async updateTicket(id, data)               { return await MaintenanceTicket.update(id, data); }
  static async deleteTicket(id)                     { return await MaintenanceTicket.delete(id); }
}
module.exports = MaintenanceTicketService;
