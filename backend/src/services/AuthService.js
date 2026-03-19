const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const config = require("../config/config");

class AuthService {
  static async registerUser(name, email, password, role) {
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create(name, email, hashedPassword, role);

    const user = await User.findById(userId);

    const token = this.generateToken(user);

    return { user, token };
  }

  static async loginUser(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    await User.updateLastSignedIn(user.id);

    const token = this.generateToken(user);

    return { user, token };
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
      throw new Error("Invalid or expired token.");
    }
  }
}

module.exports = AuthService;