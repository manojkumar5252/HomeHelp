const express = require("express");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Worker = require("../models/Worker");
const CustomerNotification = require("../models/CustomerNotification");
const Pricing = require("../models/Pricing");
const PlatformFee = require("../models/PlatformFee");

const {
  notifyNearbyWorkers,
} = require("../services/bookingNotificationService");

const router = express.Router();

/*
  CALCULATE DISTANCE BETWEEN TWO LOCATIONS
  Returns distance in kilometers.
*/
function calculateDistanceInKm(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadiusKm = 6371;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const deltaLat =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const deltaLon =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) *
      Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/*
  GET TRAVEL CHARGE FROM ADMIN TRAVEL PRICING
*/
function getTravelCharge(distanceKm, pricing) {
  if (!pricing || !pricing.travel) {
    return 0;
  }

  if (distanceKm <= 2) {
    return pricing.travel.zeroToTwoKm || 0;
  }

  if (distanceKm <= 5) {
    return pricing.travel.twoToFiveKm || 0;
  }

  if (distanceKm <= 8) {
    return pricing.travel.fiveToEightKm || 0;
  }

  if (distanceKm <= 12) {
    return pricing.travel.eightToTwelveKm || 0;
  }

  if (distanceKm <= 15) {
    return pricing.travel.twelveToFifteenKm || 0;
  }

  return pricing.travel.aboveFifteenKm || 0;
}

/*
  GET PLATFORM FEE FROM ADMIN PLATFORM FEE RULES
*/
async function getPlatformFee(serviceTotal) {
  const platformFee = await PlatformFee.findOne({
    minAmount: {
      $lte: serviceTotal,
    },
    $or: [
      {
        maxAmount: null,
      },
      {
        maxAmount: {
          $gte: serviceTotal,
        },
      },
    ],
  }).sort({
    minAmount: -1,
  });

  return platformFee ? platformFee.fee : 0;
};

// CREATE BOOKING
router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      selectedServices,
      serviceTotal,
      bookingDate,
      bookingTime,
      address,
      houseDetails,
      serviceLocation,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required.",
      });
    }

    if (
      !Array.isArray(selectedServices) ||
      selectedServices.length < 3 ||
      selectedServices.length > 6
    ) {
      return res.status(400).json({
        message: "Please select between 3 and 6 services.",
      });
    }

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({
        message: "Booking date and time are required.",
      });
    }

    if (serviceTotal === undefined || serviceTotal === null) {
      return res.status(400).json({
        message: "Service total is required.",
      });
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    const booking = await Booking.create({
      customer: customerId,
      selectedServices,
      serviceTotal,

      // These are calculated when a worker accepts the booking.
      travelCharge: 0,
      platformFee: 0,
      finalTotal: serviceTotal,

      bookingDate,
      bookingTime,
      address: address || customer.address,
      houseDetails: houseDetails || customer.houseDetails,
      serviceLocation:
        serviceLocation || customer.serviceLocation,
      status: "Pending",
    });

    const notificationResult =
      await notifyNearbyWorkers(booking);

    console.log(
      "Worker notification result:",
      notificationResult
    );

    res.status(201).json({
      message: "Booking created successfully.",
      booking,
      notificationResult,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to create booking.",
      error: error.message,
    });
  }
});

// GET ALL BOOKINGS FOR A CUSTOMER
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    const bookings = await Booking.find({
      customer: customerId,
    })
      .populate("worker", "fullName phone email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error(
      "Get customer bookings error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch customer bookings.",
      error: error.message,
    });
  }
});

// GET ALL BOOKINGS FOR A WORKER
router.get("/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found.",
      });
    }

    const bookings = await Booking.find({
      worker: workerId,
    })
      .populate("customer", "fullName phone email")
      .populate("worker", "fullName phone email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error(
      "Get worker bookings error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch worker bookings.",
      error: error.message,
    });
  }
});

// GET AVAILABLE PENDING BOOKINGS FOR WORKERS
router.get("/available", async (req, res) => {
  try {
    const { workerId } = req.query;

    if (!workerId) {
      return res.status(400).json({
        message: "Worker ID is required.",
      });
    }

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found.",
      });
    }

    if (!worker.isAvailable) {
      return res.status(200).json({
        bookings: [],
      });
    }

    const bookings = await Booking.find({
      status: "Pending",
      worker: null,
    })
      .populate("customer", "fullName phone email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error(
      "Get available bookings error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch available bookings.",
      error: error.message,
    });
  }
});

// ACCEPT BOOKING
router.put("/:bookingId/accept", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        message: "Worker ID is required.",
      });
    }

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found.",
      });
    }

    if (!worker.isAvailable) {
      return res.status(403).json({
        message:
          "You must be available to accept a new job.",
      });
    }

    /*
      FIRST GET THE BOOKING.

      We need the booking's service location before
      calculating the distance to the worker.
    */
    const existingBooking = await Booking.findOne({
      _id: bookingId,
      status: "Pending",
      worker: null,
    });

    if (!existingBooking) {
      return res.status(400).json({
        message:
          "This booking is no longer available. It may already have been accepted or cancelled.",
      });
    }

    /*
      CHECK CUSTOMER/SERVICE LOCATION
    */
    const customerLatitude =
      existingBooking.serviceLocation?.latitude;

    const customerLongitude =
      existingBooking.serviceLocation?.longitude;

    const workerLatitude =
      worker.currentLocation?.latitude;

    const workerLongitude =
      worker.currentLocation?.longitude;

    let travelCharge = 0;
    let distanceKm = 0;

    /*
      CALCULATE TRAVEL CHARGE
    */
    if (
      typeof customerLatitude === "number" &&
      typeof customerLongitude === "number" &&
      typeof workerLatitude === "number" &&
      typeof workerLongitude === "number"
    ) {
      distanceKm = calculateDistanceInKm(
        customerLatitude,
        customerLongitude,
        workerLatitude,
        workerLongitude
      );

      const pricing = await Pricing.findOne();

      travelCharge = getTravelCharge(
        distanceKm,
        pricing
      );
    }

    /*
      CALCULATE PLATFORM FEE
    */
    const platformFee = await getPlatformFee(
      existingBooking.serviceTotal
    );

    /*
      CALCULATE FINAL TOTAL
    */
    const finalTotal =
      existingBooking.serviceTotal +
      travelCharge +
      platformFee;

    console.log("========== BOOKING PRICING ==========");
    console.log(
      "Service Total:",
      existingBooking.serviceTotal
    );
    console.log(
      "Distance:",
      distanceKm.toFixed(2),
      "km"
    );
    console.log(
      "Travel Charge:",
      travelCharge
    );
    console.log(
      "Platform Fee:",
      platformFee
    );
    console.log(
      "Final Total:",
      finalTotal
    );
    console.log("=====================================");

    /*
      ASSIGN WORKER AND SAVE PRICING
    */
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: "Pending",
        worker: null,
      },
      {
        $set: {
          worker: workerId,
          status: "Accepted",
          travelCharge,
          platformFee,
          finalTotal,
        },
      },
      {
        new: true,
      }
    )
      .populate("customer", "fullName phone email")
      .populate("worker", "fullName phone email");

    if (!booking) {
      return res.status(400).json({
        message:
          "This booking is no longer available. It may already have been accepted or cancelled.",
      });
    }

    // CUSTOMER NOTIFICATION
    await CustomerNotification.create({
      customer: booking.customer._id,
      booking: booking._id,
      type: "Booking Accepted",
      message:
        "Your booking has been accepted by a worker.",
      status: "Unread",
    });

    res.status(200).json({
      message: "Booking accepted successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "Accept booking error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to accept booking.",
      error: error.message,
    });
  }
});

// START JOB
router.put("/:bookingId/start", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        message: "Worker ID is required.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      worker: workerId,
    });

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking not found or this job is not assigned to you.",
      });
    }

    if (booking.status !== "Accepted") {
      return res.status(400).json({
        message:
          "Only accepted jobs can be started.",
      });
    }

    booking.status = "In Progress";

    await booking.save();

    // CUSTOMER NOTIFICATION
    await CustomerNotification.create({
      customer: booking.customer,
      booking: booking._id,
      type: "Booking Started",
      message:
        "Your service is now in progress.",
      status: "Unread",
    });

    await booking.populate(
      "customer",
      "fullName phone email"
    );

    await booking.populate(
      "worker",
      "fullName phone email"
    );

    res.status(200).json({
      message: "Job started successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "Start job error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to start job.",
      error: error.message,
    });
  }
});

// COMPLETE JOB
router.put("/:bookingId/complete", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        message: "Worker ID is required.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      worker: workerId,
    });

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking not found or this job is not assigned to you.",
      });
    }

    if (booking.status !== "In Progress") {
      return res.status(400).json({
        message:
          "Only jobs in progress can be completed.",
      });
    }

    booking.status = "Completed";

    await booking.save();

    // CUSTOMER NOTIFICATION
    await CustomerNotification.create({
      customer: booking.customer,
      booking: booking._id,
      type: "Booking Completed",
      message:
        "Your service has been completed successfully.",
      status: "Unread",
    });

    await booking.populate(
      "customer",
      "fullName phone email"
    );

    await booking.populate(
      "worker",
      "fullName phone email"
    );

    res.status(200).json({
      message: "Job completed successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "Complete job error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to complete job.",
      error: error.message,
    });
  }
});

// GET ONE BOOKING
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.bookingId
    )
      .populate("customer", "fullName phone email")
      .populate("worker", "fullName phone email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      booking,
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch booking.",
      error: error.message,
    });
  }
});

// CANCEL BOOKING
router.put("/:bookingId/cancel", async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        message:
          "Completed bookings cannot be cancelled.",
      });
    }

    booking.status = "Cancelled";

    await booking.save();

    // CUSTOMER NOTIFICATION
    await CustomerNotification.create({
      customer: booking.customer,
      booking: booking._id,
      type: "Booking Cancelled",
      message:
        "Your booking has been cancelled.",
      status: "Unread",
    });

    res.status(200).json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to cancel booking.",
      error: error.message,
    });
  }
});

module.exports = router;