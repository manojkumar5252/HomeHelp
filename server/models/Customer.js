const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
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

      // Coordinates will be added automatically later
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
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

    selectedServices: {
      type: [String],
      default: [],
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
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;