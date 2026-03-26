const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const authRoutes               = require("./routes/authRoutes");
const propertyRoutes           = require("./routes/propertyRoutes");
const bookingRoutes            = require("./routes/bookingRoutes");
const paymentRoutes            = require("./routes/paymentRoutes");
const invoiceRoutes            = require("./routes/invoiceRoutes");
const maintenanceTicketRoutes  = require("./routes/maintenanceTicketRoutes");
const visitRequestRoutes       = require("./routes/visitRequestRoutes");
const errorHandler             = require("./utils/errorHandler");

const app = express();

app.use(cors());
// Increased limit to handle up to 3 base64-encoded images per request (~2MB each → ~8MB encoded)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth",                authRoutes);
app.use("/api/properties",          propertyRoutes);
app.use("/api/bookings",            bookingRoutes);
app.use("/api/payments",            paymentRoutes);
app.use("/api/invoices",            invoiceRoutes);
app.use("/api/maintenance-tickets", maintenanceTicketRoutes);
app.use("/api/visits",              visitRequestRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
