const mongoose = require("mongoose");

const platformFeeSchema = new mongoose.Schema(
  {
    minAmount: {
      type: Number,
      required: true,
    },

    maxAmount: {
      type: Number,
      default: null,
    },

    fee: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PlatformFee = mongoose.model("PlatformFee", platformFeeSchema);

module.exports = PlatformFee;