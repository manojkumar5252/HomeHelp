const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const pricingRoutes = require("./routes/pricingRoutes");
const workerRoutes = require("./routes/workerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const platformFeeRoutes = require("./routes/platformFeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookingRoutes = require("./routes/bookingRoutes"); 
const workerNotificationRoutes = require("./routes/workerNotificationRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use(express.json());

// Routes
app.use("/api/pricing", pricingRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/platform-fees", platformFeeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use(
  "/api/worker-notifications",
  workerNotificationRoutes
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "HomeHelp backend is running!",
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT,  "0.0.0.0",() => {
      console.log(`HomeHelp server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });