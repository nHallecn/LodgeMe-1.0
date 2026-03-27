// Crash loudly if JWT_SECRET is missing rather than silently using a
// publicly-known fallback that would compromise all tokens in production.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "supersecretjwtkey_dev_only",
  jwtExpiration: "7d",
};
