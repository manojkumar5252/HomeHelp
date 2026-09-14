const express = require("express");
const PlatformFee = require("../models/PlatformFee");

const router = express.Router();

// Get all platform fee rules
router.get("/", async (req, res) => {
  try {
    const platformFees = await PlatformFee.find().sort({
      minAmount: 1,
    });

    res.status(200).json({
      platformFees,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch platform fee rules.",
      error: error.message,
    });
  }
});

// Create a platform fee rule
router.post("/", async (req, res) => {
  try {
    const { minAmount, maxAmount, fee } = req.body;

    if (minAmount === undefined || fee === undefined) {
      return res.status(400).json({
        message: "Minimum amount and fee are required.",
      });
    }

    const platformFee = await PlatformFee.create({
      minAmount,
      maxAmount:
        maxAmount === "" || maxAmount === undefined
          ? null
          : maxAmount,
      fee,
    });

    res.status(201).json({
      message: "Platform fee rule created successfully.",
      platformFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create platform fee rule.",
      error: error.message,
    });
  }
});

// Update a platform fee rule
router.put("/:id", async (req, res) => {
  try {
    const { minAmount, maxAmount, fee } = req.body;

    const platformFee = await PlatformFee.findByIdAndUpdate(
      req.params.id,
      {
        minAmount,
        maxAmount:
          maxAmount === "" || maxAmount === undefined
            ? null
            : maxAmount,
        fee,
      },
      {
        returnDocument: "after",
      }
    );

    if (!platformFee) {
      return res.status(404).json({
        message: "Platform fee rule not found.",
      });
    }

    res.status(200).json({
      message: "Platform fee rule updated successfully.",
      platformFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update platform fee rule.",
      error: error.message,
    });
  }
});

// Delete a platform fee rule
router.delete("/:id", async (req, res) => {
  try {
    const platformFee = await PlatformFee.findByIdAndDelete(
      req.params.id
    );

    if (!platformFee) {
      return res.status(404).json({
        message: "Platform fee rule not found.",
      });
    }

    res.status(200).json({
      message: "Platform fee rule deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete platform fee rule.",
      error: error.message,
    });
  }
});

module.exports = router;