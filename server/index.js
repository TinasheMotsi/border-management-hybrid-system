require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const cron = require("node-cron");
const { sendAutomatedEmail } = require("./controllers/reportController");

// Route Imports
const truckRoutes = require("./routes/truckRoutes");
const queueRoutes = require("./routes/queueRoutes");
const clearanceRoutes = require("./routes/clearanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

/* =======================================================
   ✅ 1. CORS CONFIG (FIXED FOR VERCEL + LOCAL)
======================================================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://border-management-hybrid-system.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

/* =======================================================
   ✅ 2. JSON MIDDLEWARE (CRITICAL FIX)
======================================================= */
app.use(express.json());

/* =======================================================
   🔍 DEBUG (ONLY DEV)
======================================================= */
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

/* =======================================================
   ✅ 3. API ROUTES
======================================================= */
app.use("/api/trucks", truckRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/clearance", clearanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

/* =======================================================
   🌐 ROOT TEST ROUTE
======================================================= */
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Border Management API is active" });
});

/* =======================================================
   🧪 HEALTH CHECK
======================================================= */
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "UP",
      database: "CONNECTED",
      time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: "DOWN", error: err.message });
  }
});

/* =======================================================
   ⏰ CRON JOB (AUTO EMAIL REPORT)
======================================================= */
cron.schedule("0 8,12,16 * * *", () => {
  const currentHour = new Date().getHours();
  const recipient = process.env.EMAIL_USER;

  console.log(`⏰ Sending report for ${currentHour}:00 → ${recipient}`);

  sendAutomatedEmail(currentHour, recipient)
    .then(() => console.log("✅ Report sent"))
    .catch((err) => console.error("❌ Report failed:", err.message));
});

/* =======================================================
   ❌ 404 HANDLER
======================================================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =======================================================
   ⚠️ GLOBAL ERROR HANDLER
======================================================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

/* =======================================================
   🚀 SERVER START
======================================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("--------------------------------------");
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`📧 Mailer: ${process.env.EMAIL_USER}`);
  console.log(`🛠️ Mode: ${process.env.NODE_ENV || "development"}`);
  console.log("--------------------------------------");
});