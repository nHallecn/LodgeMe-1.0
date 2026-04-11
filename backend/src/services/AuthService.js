const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const config = require("../config/config");

class AuthService {
  static async registerUser(name, email, password, role) {
    // Validate input
    if (!name || !email || !password || !role) {
      const error = new Error("All fields are required: name, email, password, role");
      error.statusCode = 400;
      throw error;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error("Please provide a valid email address.");
      error.statusCode = 400;
      throw error;
    }

    // Validate role — "tenant" and "landlord" are self-registration roles.
    // "admin" can only be assigned directly in the DB.
    const validRoles = ["tenant", "landlord"];
    if (!validRoles.includes(role)) {
      const error = new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create(name, email, hashedPassword, role);
    const user = await User.findById(userId);

    const userResponse = this.formatUserResponse(user);
    const token = this.generateToken(user);

    return { user: userResponse, token };
  }

  static async loginUser(email, password) {
    // Validate input
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Use a generic message to avoid leaking whether the email exists
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    await User.updateLastSignedIn(user.id);

    const userResponse = this.formatUserResponse(user);
    const token = this.generateToken(user);

    return { user: userResponse, token };
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch {
      const error = new Error("Invalid or expired token.");
      error.statusCode = 401;
      throw error;
    }
  }

  static formatUserResponse(user) {
    // Return only safe fields to the frontend
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
    };
  }
}

module.exports = AuthService;
