const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/config");

class AuthService {
  static async registerUser(openId, name, email, loginMethod, role) {
    const existingUser = await User.findByOpenId(openId);
    if (existingUser) {
      throw new Error("User with this OpenID already exists.");
    }
    const userId = await User.create(openId, name, email, loginMethod, role);
    const user = await User.findById(userId);
    const token = this.generateToken(user);
    return { user, token };
  }

  static async loginUser(openId) {
    const user = await User.findByOpenId(openId);
    if (!user) {
      throw new Error("User not found.");
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
    } catch (error) {
      throw new Error("Invalid or expired token.");
    }
  }
}

module.exports = AuthService;