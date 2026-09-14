const mongoose = require("mongoose");

const customerNotificationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "Booking Accepted",
        "Booking Started",
        "Booking Completed",
        "Booking Cancelled",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Unread", "Read"],
      default: "Unread",
    },
  },
  {
    timestamps: true,
  }
);

const CustomerNotification = mongoose.model(
  "CustomerNotification",
  customerNotificationSchema
);

module.exports = CustomerNotification;