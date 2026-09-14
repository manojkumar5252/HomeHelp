const express = require("express");
const Worker = require("../models/Worker");
const WorkerNotification = require("../models/WorkerNotification");

const router = express.Router();

// Create a worker
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const existingPhone = await Worker.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number is already registered.",
      });
    }

    const existingEmail = await Worker.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email address is already registered.",
      });
    }

    const worker = await Worker.create({
      fullName,
      phone,
      email: email.toLowerCase(),
      password,
    });

    res.status(201).json({
      message: "Worker created successfully",
      worker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create worker",
      error: error.message,
    });
  }
});

// Worker login
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        message: "Email/Phone and password are required.",
      });
    }

    const worker = await Worker.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!worker) {
      return res.status(401).json({
        message: "Invalid email/phone or password.",
      });
    }

    // Temporary password check
    // Password hashing will be added later.
    if (worker.password !== password) {
      return res.status(401).json({
        message: "Invalid email/phone or password.",
      });
    }

    res.status(200).json({
      message: "Login successful",
      worker: {
        _id: worker._id,
        fullName: worker.fullName,
        phone: worker.phone,
        email: worker.email,
        address: worker.address,
        services: worker.services,
        currentLocation: worker.currentLocation,
        isAvailable: worker.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Worker login failed",
      error: error.message,
    });
  }
});

// Get worker notifications
router.get("/:workerId/notifications", async (req, res) => {
  try {
    const { workerId } = req.params;

    const notifications = await WorkerNotification.find({
      worker: workerId,
      status: "Unread",
    })
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch worker notifications",
      error: error.message,
    });
  }
});

// Mark worker notification as read
router.put(
  "/:workerId/notifications/:notificationId/read",
  async (req, res) => {
    try {
      const { workerId, notificationId } = req.params;

      const notification =
        await WorkerNotification.findOneAndUpdate(
          {
            _id: notificationId,
            worker: workerId,
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
          message: "Notification not found.",
        });
      }

      res.status(200).json({
        message: "Notification marked as read.",
        notification,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update notification",
        error: error.message,
      });
    }
  }
);

// Get worker details
router.get("/:workerId", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId).select(
      "-password"
    );

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    res.status(200).json({
      worker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch worker details",
      error: error.message,
    });
  }
});

// Update worker address
router.put("/:workerId/address", async (req, res) => {
  try {
    const {
      houseNumber,
      streetArea,
      city,
      state,
      pinCode,
    } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.params.workerId,
      {
        address: {
          houseNumber,
          street: streetArea,
          city,
          state,
          pinCode,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    res.status(200).json({
      message: "Worker address updated successfully",
      worker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update worker address",
      error: error.message,
    });
  }
});

// Update worker availability and current location
router.put("/:workerId/location", async (req, res) => {
  try {
    const { latitude, longitude, isAvailable } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.params.workerId,
      {
        currentLocation: {
          latitude,
          longitude,
        },
        isAvailable,
      },
      {
        returnDocument: "after",
      }
    );

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    res.status(200).json({
      message: "Worker location updated successfully",
      worker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update worker location",
      error: error.message,
    });
  }
});

// Update worker services
router.put("/:workerId/services", async (req, res) => {
  try {
    const { services } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.params.workerId,
      {
        services,
      },
      {
        returnDocument: "after",
      }
    );

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    res.status(200).json({
      message: "Worker services updated successfully",
      worker,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update worker services",
      error: error.message,
    });
  }
});

module.exports = router;