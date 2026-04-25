const express = require("express");
const router = express.Router();

const {
  moveToNextStage,
  getAllClearance,   // 👈 THIS MUST EXIST
  getTruckProgress
} = require("../controllers/clearanceController");

// ✅ GET all trucks in clearance
router.get("/", getAllClearance);

// ✅ MOVE to next stage
router.put("/", moveToNextStage);

// ✅ GET single truck progress
router.get("/:truck_id", getTruckProgress);

module.exports = router;