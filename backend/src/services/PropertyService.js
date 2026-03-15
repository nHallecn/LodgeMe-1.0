const Property = require("../models/Property");
const Room = require("../models/Room");

class PropertyService {
  static async createProperty(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities) {
    return await Property.create(landlordId, name, city, neighborhood, latitude, longitude, description, totalRooms, amenities);
  }

  static async getPropertyById(id) {
    return await Property.findById(id);
  }

  static async searchProperties(filters) {
    return await Property.findAll(filters);
  }

  static async updateProperty(id, propertyData) {
    return await Property.update(id, propertyData);
  }

  static async deleteProperty(id) {
    return await Property.delete(id);
  }

  static async getPropertiesByLandlord(landlordId) {
    return await Property.findByLandlordId(landlordId);
  }

  static async addRoomToProperty(propertyId, roomData) {
    const { roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images } = roomData;
    return await Room.create(propertyId, roomNumber, roomType, capacity, monthlyRent, cautionDeposit, isAvailable, description, images);
  }

  static async updateRoom(roomId, roomData) {
    return await Room.update(roomId, roomData);
  }

  static async deleteRoom(roomId) {
    return await Room.delete(roomId);
  }

  static async getRoomById(roomId) {
    return await Room.findById(roomId);
  }

  static async getRoomsByPropertyId(propertyId) {
    return await Room.findByPropertyId(propertyId);
  }

  static async updateRoomAvailability(roomId, isAvailable) {
    return await Room.updateAvailability(roomId, isAvailable);
  }
}

module.exports = PropertyService;