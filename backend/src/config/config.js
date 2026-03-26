module.exports = {
  jwtSecret: process.env.JWT_SECRET || "supersecretjwtkey",
  jwtExpiration: "7d",
};
