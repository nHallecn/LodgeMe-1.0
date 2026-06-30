const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const config = require("../config/config");
const { normalizeCameroonPhone } = require("../utils/phone");

const otpStore = new Map();

function makeError(message, statusCode, code, field) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.field = field;
  return error;
}

function generateOtp() {
  if (process.env.RENTCAM_DEV_OTP && process.env.NODE_ENV !== "production") {
    return process.env.RENTCAM_DEV_OTP;
  }
  return String(crypto.randomInt(100000, 1000000));
}

class AuthService {
  static async requestOtp(phoneInput) {
    const phone = normalizeCameroonPhone(phoneInput);
    const code = generateOtp();

    otpStore.set(phone, {
      code,
      attempts: 0,
      expiresAt: Date.now() + 10 * 60 * 1000,
      blockedUntil: null,
    });

    // Production should send this through Africa's Talking. During defence/dev,
    // returning the code keeps the flow testable without paid SMS credentials.
    console.info(`RentCam OTP for ${phone}: ${code}`);

    return {
      phone,
      expiresInSeconds: 600,
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
    };
  }

  static async verifyOtp({ phone: phoneInput, code, fullName, role = "tenant", city, preferredLang }) {
    const phone = normalizeCameroonPhone(phoneInput);
    const record = otpStore.get(phone);
    const selfRegistrationRoles = ["tenant", "landlord", "agent"];

    if (!record) {
      throw makeError("Request a fresh OTP before verifying.", 400, "OTP_NOT_FOUND", "code");
    }

    if (record.blockedUntil && record.blockedUntil > Date.now()) {
      throw makeError("Too many OTP attempts. Try again in one hour.", 429, "OTP_BLOCKED", "code");
    }

    if (record.expiresAt < Date.now()) {
      otpStore.delete(phone);
      throw makeError("OTP expired. Request a new code.", 400, "OTP_EXPIRED", "code");
    }

    if (String(code) !== record.code) {
      record.attempts += 1;
      if (record.attempts >= 3) {
        record.blockedUntil = Date.now() + 60 * 60 * 1000;
      }
      throw makeError("Invalid OTP code.", 401, "OTP_INVALID", "code");
    }

    otpStore.delete(phone);

    if (!selfRegistrationRoles.includes(role)) {
      throw makeError("Role must be tenant, landlord, or agent.", 400, "INVALID_ROLE", "role");
    }

    const existing = await User.findByPhone(phone);
    const user = await User.upsertFromOtp({
      phone,
      fullName: fullName || existing?.fullName || "",
      role: existing?.role || role,
      city: city || existing?.city || "",
      preferredLang: preferredLang || existing?.preferredLang || "fr",
    });
    const token = this.generateToken(user);

    return {
      user: this.formatUserResponse(user),
      token,
      accessToken: token,
      refreshToken: null,
      isNew: !existing,
    };
  }

  static async registerUser() {
    throw makeError(
      "RentCam uses phone OTP. Call /api/v1/auth/request-otp then /api/v1/auth/verify-otp.",
      410,
      "PASSWORD_AUTH_DISABLED",
      "phone"
    );
  }

  static async loginUser() {
    throw makeError(
      "RentCam uses phone OTP. Call /api/v1/auth/request-otp then /api/v1/auth/verify-otp.",
      410,
      "PASSWORD_AUTH_DISABLED",
      "phone"
    );
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
      throw makeError("Invalid or expired token.", 401, "TOKEN_INVALID");
    }
  }

  static formatUserResponse(user) {
    return {
      id: user.id,
      name: user.name,
      fullName: user.fullName || user.name,
      email: user.email || "",
      role: user.role,
      phone: user.phone,
      city: user.city || "",
      avatarUrl: user.avatarUrl || "",
      isVerified: Boolean(user.isVerified),
      trustScore: user.trustScore,
      preferredLang: user.preferredLang || "fr",
    };
  }
}

module.exports = AuthService;
