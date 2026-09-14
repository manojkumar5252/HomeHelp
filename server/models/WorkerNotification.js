const mongoose = require("mongoose");

const workerNotificationSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    distance: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Unread", "Read", "Accepted", "Expired"],
      default: "Unread",
    },

    notificationStage: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same booking from creating
// duplicate notifications for the same worker.
workerNotificationSchema.index(
  {
    worker: 1,
    booking: 1,
  },
  {
    unique: true,
  }
);

const WorkerNotification = mongoose.model(
  "WorkerNotification",
  workerNotificationSchema
);

module.exports = WorkerNotification;