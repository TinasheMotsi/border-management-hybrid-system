require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const cron = require('node-cron');
const { sendAutomatedEmail } = require('./controllers/reportController');

// Route Imports
const truckRoutes = require("./routes/truckRoutes");
const queueRoutes = require("./routes/queueRoutes");
const clearanceRoutes = require("./routes/clearanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// ✅ 1. Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://border-management-hybrid-system.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());

// Debugging Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

// ✅ 2. API Routes
app.use("/api/trucks", truckRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/clearance", clearanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Border Management API is active" });
});

// ✅ 3. Health Checks & Error Handling
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "UP", database: "CONNECTED", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "DOWN", error: err.message });
  }
});

// ✅ 4. Automated Task Scheduler (Cron)
// Runs at 08:00, 12:00, and 16:00
cron.schedule('0 8,12,16 * * *', () => {
  const currentHour = new Date().getHours();
  const recipient = "motsitinashe816@gmail.com";
  
  console.log(`⏰ [Cron Job] Clock hit ${currentHour}:00. Sending report to ${recipient}...`);
  
  sendAutomatedEmail(currentHour, recipient)
    .then(() => console.log(`✅ Scheduled report for ${currentHour}:00 sent successfully.`))
    .catch(err => console.error(`❌ Scheduled report failed:`, err.message));
});

// 404 & Global Error Handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ 5. Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`--------------------------------------`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📧 Mailer Active: ${process.env.EMAIL_USER}`);
  console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`--------------------------------------`);
});