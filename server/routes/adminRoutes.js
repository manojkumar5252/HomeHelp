const express = require("express");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const Worker = require("../models/Worker");
const Booking = require("../models/Booking");

const router = express.Router();

// =====================================================
// SUPER ADMIN CHECK
// =====================================================
// Only the primary/super admin is allowed to perform
// destructive admin actions.
// =====================================================

const isPrimaryAdmin = async (adminId) => {
  try {
    const requestingAdmin = await Admin.findById(adminId);

    if (!requestingAdmin) {
      return false;
    }

    const primaryAdminEmail =
      process.env.PRIMARY_ADMIN_EMAIL?.toLowerCase();

    if (!primaryAdminEmail) {
      return false;
    }

    return (
      requestingAdmin.email.toLowerCase() === primaryAdminEmail
    );
  } catch (error) {
    console.error("Primary admin check error:", error);
    return false;
  }
};

// =====================================================
// ADMIN SIGNUP
// =====================================================
// Used for the initial/private admin account creation.
// Requires the private admin creation key.
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      creationKey,
    } = req.body;

    if (!fullName || !email || !password || !creationKey) {
      return res.status(400).json({
        message:
          "Full name, email, password and admin creation key are required.",
      });
    }

    // Check private admin creation key
    if (creationKey !== process.env.ADMIN_CREATION_KEY) {
      return res.status(403).json({
        message: "Invalid admin creation key.",
      });
    }

    // Check whether admin email already exists
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin account already exists with this email.",
      });
    }

    // Create admin account
    const admin = await Admin.create({
      fullName,
      email: email.toLowerCase(),
      password,
    });

    res.status(201).json({
      message: "Admin account created successfully.",
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin signup error:", error);

    res.status(500).json({
      message: "Failed to create admin account.",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE ANOTHER ADMIN
// =====================================================
// ONLY the primary admin can use this endpoint.
// Other admins are rejected by the backend.
// =====================================================

router.post("/create-admin", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      createdBy,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (
      !fullName ||
      !phone ||
      !email ||
      !password ||
      !createdBy
    ) {
      return res.status(400).json({
        message:
          "Full name, phone, email, password and creator admin are required.",
      });
    }

    // -------------------------------------------------
    // Find the admin making the request
    // -------------------------------------------------

    const requestingAdmin = await Admin.findById(createdBy);

    if (!requestingAdmin) {
      return res.status(403).json({
        message: "Admin authorization failed.",
      });
    }

    // -------------------------------------------------
    // ONLY PRIMARY ADMIN CAN CREATE OTHER ADMINS
    // -------------------------------------------------

    const primaryAdminEmail =
      process.env.PRIMARY_ADMIN_EMAIL?.toLowerCase();

    if (
      !primaryAdminEmail ||
      requestingAdmin.email.toLowerCase() !== primaryAdminEmail
    ) {
      return res.status(403).json({
        message:
          "Only the primary administrator can create another admin account.",
      });
    }

    // -------------------------------------------------
    // Check duplicate email
    // -------------------------------------------------

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "An admin account already exists with this email.",
      });
    }

    // -------------------------------------------------
    // Create new admin
    // -------------------------------------------------

    const admin = await Admin.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json({
      message: "New admin account created successfully.",
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        phone: admin.phone,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    res.status(500).json({
      message: "Failed to create admin account.",
      error: error.message,
    });
  }
});

// =====================================================
// ADMIN LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Temporary password check
    // Password hashing will be added later.
    if (admin.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Determine whether this is the primary admin
    const primaryAdminEmail =
      process.env.PRIMARY_ADMIN_EMAIL?.toLowerCase();

    const isPrimaryAdmin =
      primaryAdminEmail &&
      admin.email.toLowerCase() === primaryAdminEmail;

    res.status(200).json({
      message: "Admin login successful.",
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        phone: admin.phone || "",
        email: admin.email,
        isPrimaryAdmin: Boolean(isPrimaryAdmin),
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      message: "Admin login failed.",
      error: error.message,
    });
  }
});

// =====================================================
// ADMIN DASHBOARD STATS
// =====================================================
// IMPORTANT:
// This route MUST come before /:adminId.
// =====================================================

router.get("/dashboard-stats", async (req, res) => {
  try {
    const [
      totalCustomers,
      totalWorkers,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      Customer.countDocuments(),
      Worker.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Pending" }),
      Booking.countDocuments({ status: "Accepted" }),
      Booking.countDocuments({ status: "In Progress" }),
      Booking.countDocuments({ status: "Completed" }),
      Booking.countDocuments({ status: "Cancelled" }),
    ]);

    res.status(200).json({
      totalCustomers,
      totalWorkers,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    res.status(500).json({
      message: "Failed to load admin dashboard statistics.",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL CUSTOMERS
// =====================================================

router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(customers);
  } catch (error) {
    console.error("Admin customers error:", error);

    res.status(500).json({
      message: "Failed to load customers.",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL WORKERS
// =====================================================

router.get("/workers", async (req, res) => {
  try {
    const workers = await Worker.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(workers);
  } catch (error) {
    console.error("Admin workers error:", error);

    res.status(500).json({
      message: "Failed to load workers.",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL BOOKINGS
// =====================================================

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "fullName phone email")
      .populate("worker", "fullName phone email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Admin bookings error:", error);

    res.status(500).json({
      message: "Failed to load bookings.",
      error: error.message,
    });
  }
});

// =====================================================
// REMOVE CUSTOMER
// =====================================================
// ONLY SUPER ADMIN CAN REMOVE A CUSTOMER.
//
// Request body:
// {
//   "adminId": "SUPER_ADMIN_ID"
// }
// =====================================================

router.delete("/customers/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { adminId } = req.body;

    // -------------------------------------------------
    // Require requesting admin
    // -------------------------------------------------

    if (!adminId) {
      return res.status(403).json({
        message: "Admin authorization is required.",
      });
    }

    // -------------------------------------------------
    // SUPER ADMIN ONLY
    // -------------------------------------------------

    const authorized = await isPrimaryAdmin(adminId);

    if (!authorized) {
      return res.status(403).json({
        message:
          "Only the super administrator can remove customers.",
      });
    }

    // -------------------------------------------------
    // Check customer exists
    // -------------------------------------------------

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    // -------------------------------------------------
    // Remove customer
    // -------------------------------------------------

    await Customer.findByIdAndDelete(customerId);

    res.status(200).json({
      message: "Customer removed successfully.",
      customerId,
    });
  } catch (error) {
    console.error("Remove customer error:", error);

    res.status(500).json({
      message: "Failed to remove customer.",
      error: error.message,
    });
  }
});

// =====================================================
// REMOVE WORKER
// =====================================================
// ONLY SUPER ADMIN CAN REMOVE A WORKER.
//
// Request body:
// {
//   "adminId": "SUPER_ADMIN_ID"
// }
// =====================================================

router.delete("/workers/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;
    const { adminId } = req.body;

    // -------------------------------------------------
    // Require requesting admin
    // -------------------------------------------------

    if (!adminId) {
      return res.status(403).json({
        message: "Admin authorization is required.",
      });
    }

    // -------------------------------------------------
    // SUPER ADMIN ONLY
    // -------------------------------------------------

    const authorized = await isPrimaryAdmin(adminId);

    if (!authorized) {
      return res.status(403).json({
        message:
          "Only the super administrator can remove workers.",
      });
    }

    // -------------------------------------------------
    // Check worker exists
    // -------------------------------------------------

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found.",
      });
    }

    // -------------------------------------------------
    // Remove worker
    // -------------------------------------------------

    await Worker.findByIdAndDelete(workerId);

    res.status(200).json({
      message: "Worker removed successfully.",
      workerId,
    });
  } catch (error) {
    console.error("Remove worker error:", error);

    res.status(500).json({
      message: "Failed to remove worker.",
      error: error.message,
    });
  }
});

// =====================================================
// REMOVE ADMIN
// =====================================================
// ONLY SUPER ADMIN CAN REMOVE ANOTHER ADMIN.
//
// IMPORTANT:
// Super Admin cannot remove their own account.
//
// Request body:
// {
//   "adminId": "SUPER_ADMIN_ID"
// }
// =====================================================

router.delete("/admins/:targetAdminId", async (req, res) => {
  try {
    const { targetAdminId } = req.params;
    const { adminId } = req.body;

    // -------------------------------------------------
    // Require requesting admin
    // -------------------------------------------------

    if (!adminId) {
      return res.status(403).json({
        message: "Admin authorization is required.",
      });
    }

    // -------------------------------------------------
    // SUPER ADMIN ONLY
    // -------------------------------------------------

    const authorized = await isPrimaryAdmin(adminId);

    if (!authorized) {
      return res.status(403).json({
        message:
          "Only the super administrator can remove admins.",
      });
    }

    // -------------------------------------------------
    // Prevent self deletion
    // -------------------------------------------------

    if (adminId === targetAdminId) {
      return res.status(400).json({
        message:
          "The super administrator cannot remove their own account.",
      });
    }

    // -------------------------------------------------
    // Check target admin exists
    // -------------------------------------------------

    const targetAdmin = await Admin.findById(targetAdminId);

    if (!targetAdmin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    // -------------------------------------------------
    // Prevent deletion of PRIMARY ADMIN
    // -------------------------------------------------

    const primaryAdminEmail =
      process.env.PRIMARY_ADMIN_EMAIL?.toLowerCase();

    if (
      primaryAdminEmail &&
      targetAdmin.email.toLowerCase() === primaryAdminEmail
    ) {
      return res.status(400).json({
        message:
          "The primary administrator cannot be removed.",
      });
    }

    // -------------------------------------------------
    // Remove admin
    // -------------------------------------------------

    await Admin.findByIdAndDelete(targetAdminId);

    res.status(200).json({
      message: "Admin removed successfully.",
      adminId: targetAdminId,
    });
  } catch (error) {
    console.error("Remove admin error:", error);

    res.status(500).json({
      message: "Failed to remove admin.",
      error: error.message,
    });
  }
});

// =====================================================
// ADMIN PROFILE
// =====================================================
// IMPORTANT:
// This dynamic route MUST be AFTER all fixed GET routes.
//
// Normal Admin:
// - Gets own profile only.
//
// Super Admin:
// - Gets own profile.
// - Gets total number of admins.
// - Gets details of all admins.
// =====================================================

router.get("/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // -------------------------------------------------
    // Find requested admin
    // -------------------------------------------------

    const admin = await Admin.findById(adminId).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    // -------------------------------------------------
    // Determine primary admin
    // -------------------------------------------------

    const primaryAdminEmail =
      process.env.PRIMARY_ADMIN_EMAIL?.toLowerCase();

    const isPrimaryAdmin =
      primaryAdminEmail &&
      admin.email.toLowerCase() === primaryAdminEmail;

    // -------------------------------------------------
    // Base profile
    // -------------------------------------------------

    const profile = {
      _id: admin._id,
      fullName: admin.fullName,
      phone: admin.phone || "",
      email: admin.email,
      isPrimaryAdmin: Boolean(isPrimaryAdmin),
      createdAt: admin.createdAt,
    };

    // -------------------------------------------------
    // ONLY PRIMARY ADMIN GETS ADMIN LIST
    // -------------------------------------------------

    if (isPrimaryAdmin) {
      const admins = await Admin.find()
        .select("-password")
        .sort({ createdAt: -1 });

      profile.totalAdmins = admins.length;

      profile.admins = admins.map((item) => ({
        _id: item._id,
        fullName: item.fullName,
        phone: item.phone || "",
        email: item.email,
        isPrimaryAdmin:
          primaryAdminEmail &&
          item.email.toLowerCase() === primaryAdminEmail,
        createdAt: item.createdAt,
      }));
    }

    // -------------------------------------------------
    // Send profile
    // -------------------------------------------------

    res.status(200).json(profile);
  } catch (error) {
    console.error("Admin profile error:", error);

    res.status(500).json({
      message: "Failed to load admin profile.",
      error: error.message,
    });
  }
});

module.exports = router;