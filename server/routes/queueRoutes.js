const express = require("express");
const router = express.Router();

const {
  addToQueue,
  getQueue,
  startProcessing,
  removeFromQueue
} = require("../controllers/queueController");

router.get("/", getQueue);
router.post("/", addToQueue);
router.post("/start", startProcessing);
router.delete("/:id", removeFromQueue);

module.exports = router;