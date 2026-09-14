const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    selectedServices: {
      type: [String],
      required: true,
      validate: {
        validator: function (services) {
          return services.length >= 3 && services.length <= 6;
        },
        message: "Booking must contain between 3 and 6 services.",
      },
    },

    serviceTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Internal pricing fields.
    // These are stored in the database but will be hidden
    // from the customer UI.

    travelCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    bookingDate: {
      type: String,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
    },

    address: {
      houseNumber: {
        type: String,
        default: "",
      },

      street: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pinCode: {
        type: String,
        default: "",
      },
    },

    houseDetails: {
      houseType: {
        type: String,
        default: "",
      },

      bathrooms: {
        type: Number,
        default: 0,
      },

      floors: {
        type: Number,
        default: 1,
      },
    },

    serviceLocation: {
      type: {
        type: String,
        enum: ["saved", "map"],
        default: "saved",
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;