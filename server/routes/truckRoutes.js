const express = require("express");
const router = express.Router();
const truckController = require("../controllers/truckController");
const authMiddleware = require("../middleware/authMiddleware");

// --- GET ALL TRUCKS ---
router.get("/", truckController.getTrucks);

// --- GET SPECIFIC TRUCK ---
router.get("/:id", truckController.getTruckById);

// --- ADD NEW TRUCK ---
// Combined your duplicates into one protected route
router.post("/", authMiddleware, truckController.addTruck);

// --- DELETE TRUCK ---
// ✅ ADD THIS: Required for the "Delete after Queue" logic
router.delete("/:id", authMiddleware, truckController.deleteTruck);

module.exports = router;