const Booking = require("../models/Booking");

class BookingService {
  static async createBooking(guestId, roomId, startDate, endDate) {
    return await Booking.create(guestId, roomId, startDate, endDate);
  }
  static async getBookingById(id) { return await Booking.findById(id); }
  static async getBookingsByGuestId(guestId) { return await Booking.findByGuestId(guestId); }
  static async getBookingsByLandlordId(landlordId) { return await Booking.findByLandlordId(landlordId); }
  static async getBookingsByRoomId(roomId) { return await Booking.findByRoomId(roomId); }
  static async updateBookingStatus(id, status) { return await Booking.updateStatus(id, status); }
  static async deleteBooking(id) { return await Booking.delete(id); }
}

module.exports = BookingService;
