const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

let helmet = null;
try {
  helmet = require("helmet");
} catch {
  helmet = null;
}

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./utils/errorHandler");

const app = express();
const apiPrefix = "/api/v1";

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:8080,http://localhost:8081")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (helmet) app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "LodgMe API",
      status: "ok",
      version: "1.0.0",
    },
  });
});

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/listings`, listingRoutes);
app.use(`${apiPrefix}/inquiries`, inquiryRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// Backward-compatible LodgeMe paths while the frontend is being migrated.
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `No route for ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LodgMe API running on port ${PORT}`));
