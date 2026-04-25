const express = require('express');
const router = express.Router();
const { downloadReport } = require('../controllers/reportController');

// Add this to routes/reportRoutes.js
const { sendAutomatedEmail } = require('../controllers/reportController');

router.get('/test-email', async (req, res) => {
  try {
    // Manually trigger the email for the 8 AM slot to your email
    await sendAutomatedEmail(8, process.env.EMAIL_USER); 
    res.send("Test email sent! Check your inbox (and spam folder).");
  } catch (err) {
    res.status(500).send("Email test failed: " + err.message);
  }
});

router.get('/download', downloadReport);

module.exports = router;