const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    services: {
      surfaceCleaning: {
        type: Number,
        default: 200,
      },

      floorCare: {
        type: Number,
        default: 300,
      },

      deepCleaning: {
        type: Number,
        default: 800,
      },

      tidyingUp: {
        type: Number,
        default: 250,
      },

      mealPrep: {
        type: Number,
        default: 400,
      },

      dishCare: {
        type: Number,
        default: 250,
      },

      kitchenUpkeep: {
        type: Number,
        default: 350,
      },

      washing: {
        type: Number,
        default: 300,
      },

      drying: {
        type: Number,
        default: 200,
      },

      postWashCare: {
        type: Number,
        default: 250,
      },

      linens: {
        type: Number,
        default: 300,
      },
    },

    travel: {
      zeroToTwoKm: {
        type: Number,
        default: 20,
      },

      twoToFiveKm: {
        type: Number,
        default: 40,
      },

      fiveToEightKm: {
        type: Number,
        default: 60,
      },

      eightToTwelveKm: {
        type: Number,
        default: 90,
      },

      twelveToFifteenKm: {
        type: Number,
        default: 120,
      },

      aboveFifteenKm: {
        type: Number,
        default: 150,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Pricing = mongoose.model("Pricing", pricingSchema);

module.exports = Pricing;