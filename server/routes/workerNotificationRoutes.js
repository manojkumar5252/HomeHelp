const express = require("express");
const WorkerNotification = require("../models/WorkerNotification");

const router = express.Router();

/*
  GET ALL NOTIFICATIONS FOR A WORKER
*/
router.get("/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    const notifications = await WorkerNotification.find({
      worker: workerId,
      status: {
        $in: ["Unread", "Read"],
      },
    })
      .populate({
        path: "booking",
        populate: {
          path: "customer",
          select: "fullName phone email",
        },
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error(
      "Get worker notifications error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch worker notifications.",
      error: error.message,
    });
  }
});

/*
  GET UNREAD NOTIFICATION COUNT
*/
router.get("/worker/:workerId/unread-count", async (req, res) => {
  try {
    const { workerId } = req.params;

    const count = await WorkerNotification.countDocuments({
      worker: workerId,
      status: "Unread",
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch notification count.",
      error: error.message,
    });
  }
});

/*
  MARK ONE NOTIFICATION AS READ
*/
router.put("/:notificationId/read", async (req, res) => {
  try {
    const notification =
      await WorkerNotification.findByIdAndUpdate(
        req.params.notificationId,
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
    console.error(
      "Mark notification read error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to update notification.",
      error: error.message,
    });
  }
});

module.exports = router;