const express = require("express");
const Customer = require("../models/Customer");
const CustomerNotification = require("../models/CustomerNotification");

const router = express.Router();

// ======================================================
// CREATE CUSTOMER
// ======================================================
router.post("/signup", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    // Check if phone already exists
    const existingPhone = await Customer.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number is already registered.",
      });
    }

    // Check if email already exists
    const existingEmail = await Customer.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email address is already registered.",
      });
    }

    // Create customer
    const customer = await Customer.create({
      fullName,
      phone,
      email,
      password,
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error.message);

    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
});

// ======================================================
// CUSTOMER LOGIN
// ======================================================
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        message: "Email/Phone and password are required.",
      });
    }

    const customer = await Customer.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid email/phone or password.",
      });
    }

    // Temporary password check
    // Password hashing will be added later.
    if (customer.password !== password) {
      return res.status(401).json({
        message: "Invalid email/phone or password.",
      });
    }

    res.status(200).json({
      message: "Login successful",

      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        houseDetails: customer.houseDetails,
        selectedServices: customer.selectedServices,
        serviceLocation: customer.serviceLocation,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error.message);

    res.status(500).json({
      message: "Customer login failed",
      error: error.message,
    });
  }
});

// ======================================================
// GET CUSTOMER HOUSE DETAILS
// ======================================================
router.get("/:customerId/house-details", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        houseDetails: customer.houseDetails,
        selectedServices: customer.selectedServices,
        serviceLocation: customer.serviceLocation,
      },
    });
  } catch (error) {
    console.error(
      "Get customer house details error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch customer house details",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE CUSTOMER HOUSE DETAILS
// ======================================================
// IMPORTANT:
// This route ONLY saves the customer's house/address details.
// It does NOT use maps or geocoding.
//
// Location selection will happen later during booking.
// ======================================================
router.put("/:customerId/house-details", async (req, res) => {
  try {
    const {
      houseNumber,
      streetArea,
      city,
      state,
      pinCode,
      houseType,
      bathrooms,
      floors,
    } = req.body;

    // Basic validation
    if (
      !houseNumber ||
      !streetArea ||
      !city ||
      !state ||
      !pinCode ||
      !houseType ||
      bathrooms === undefined ||
      floors === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all house details.",
      });
    }

    // Validate PIN code
    if (!/^\d{6}$/.test(String(pinCode))) {
      return res.status(400).json({
        message: "PIN code must be exactly 6 digits.",
      });
    }

    // Save address and house details only.
    // No latitude/longitude is required here.
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      {
        address: {
          houseNumber,
          street: streetArea,
          city,
          state,
          pinCode,
        },

        houseDetails: {
          houseType,
          bathrooms,
          floors,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer house details saved successfully",
      customer,
    });
  } catch (error) {
    console.error(
      "Customer house details error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to save customer house details",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE CUSTOMER SELECTED SERVICES
// ======================================================
router.put("/:customerId/services", async (req, res) => {
  try {
    const { services } = req.body;

    if (!Array.isArray(services)) {
      return res.status(400).json({
        message: "Services must be an array.",
      });
    }

    if (services.length < 3 || services.length > 6) {
      return res.status(400).json({
        message: "Customer must select between 3 and 6 services.",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      {
        selectedServices: services,
      },
      {
        returnDocument: "after",
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer services updated successfully",
      customer,
    });
  } catch (error) {
    console.error(
      "Customer services error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to update customer services",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE CUSTOMER SERVICE LOCATION
// ======================================================
// This is where map/location coordinates are handled.
// ======================================================
router.put("/:customerId/service-location", async (req, res) => {
  try {
    const {
      type,
      latitude,
      longitude,
    } = req.body;

    // Validate location type
    if (!["saved", "map"].includes(type)) {
      return res.status(400).json({
        message: "Invalid service location type.",
      });
    }

    // Map location requires coordinates
    if (
      type === "map" &&
      (latitude === undefined || longitude === undefined)
    ) {
      return res.status(400).json({
        message:
          "Latitude and longitude are required for map location.",
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      {
        serviceLocation: {
          type,
          latitude: type === "map" ? latitude : null,
          longitude: type === "map" ? longitude : null,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer service location updated successfully",
      customer,
    });
  } catch (error) {
    console.error(
      "Customer service location error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to update customer service location",
      error: error.message,
    });
  }
});

// ======================================================
// GET CUSTOMER NOTIFICATIONS
// ======================================================
// This returns the customer's existing notifications.
// No new notification functionality is added here.
// ======================================================
router.get("/:customerId/notifications", async (req, res) => {
  try {
    const notifications = await CustomerNotification.find({
      customer: req.params.customerId,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error(
      "Customer notification fetch error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch customer notifications",
      error: error.message,
    });
  }
});

// ======================================================
// MARK CUSTOMER NOTIFICATION AS READ
// ======================================================
// This changes only the selected notification:
// Unread -> Read
// ======================================================
router.put(
  "/:customerId/notifications/:notificationId/read",
  async (req, res) => {
    try {
      const notification =
        await CustomerNotification.findOneAndUpdate(
          {
            _id: req.params.notificationId,
            customer: req.params.customerId,
          },
          {
            status: "Read",
          },
          {
            returnDocument: "after",
          }
        );

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      res.status(200).json({
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "Customer notification read error:",
        error.message
      );

      res.status(500).json({
        message: "Failed to mark notification as read",
        error: error.message,
      });
    }
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================
module.exports = router;