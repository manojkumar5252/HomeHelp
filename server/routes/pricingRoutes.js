const express = require("express");
const Pricing = require("../models/Pricing");

const router = express.Router();

// Get current pricing
router.get("/", async (req, res) => {
  try {
    let pricing = await Pricing.findOne();

    // Create default pricing if none exists
    if (!pricing) {
      pricing = await Pricing.create({});
    }

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get pricing",
      error: error.message,
    });
  }
});

// Update pricing
router.put("/", async (req, res) => {
  try {
    let pricing = await Pricing.findOne();

    if (!pricing) {
      pricing = await Pricing.create(req.body);
    } else {
      pricing.services = req.body.services;
      pricing.travel = req.body.travel;

      await pricing.save();
    }

    res.status(200).json({
      message: "Pricing updated successfully",
      pricing,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update pricing",
      error: error.message,
    });
  }
});

module.exports = router;