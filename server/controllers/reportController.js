const ExcelJS = require('exceljs');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Helper to build the Excel logic (Shared by both Download and Email)
const buildExcelReport = async (hour) => {
  const result = await pool.query(
    `SELECT 
        t.id as truck_id, 
        t.plate_number, 
        t.driver_name, 
        t.company, 
        t.status as current_status,
        tp.start_time,
        tp.status as progress_status
     FROM trucks t
     LEFT JOIN truck_progress tp ON t.id = tp.truck_id
     ORDER BY tp.start_time DESC NULLS LAST`
  );

  const workbook = new ExcelJS.Workbook();
  // Label the sheet by the time the report was generated
  const worksheet = workbook.addWorksheet(`Full-Audit-Log`);

worksheet.columns = [
  { header: 'Truck ID', key: 'truck_id', width: 10 },
  { header: 'Plate Number', key: 'plate_number', width: 15 },
  { header: 'Driver', key: 'driver_name', width: 20 },
  { header: 'Company', key: 'company', width: 20 },
  { header: 'Overall Status', key: 'current_status', width: 15 }, 
  { header: 'Stage Status', key: 'progress_status', width: 15 }, 
  { header: 'Time Registered/Started', key: 'start_time', width: 25 }
];

  
  worksheet.addRows(result.rows);
  return workbook;
};
// 1. Function for Manual Download (Browser)
exports.downloadReport = async (req, res) => {
  const { hour } = req.query;
  try {
    const workbook = await buildExcelReport(hour);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Report_${hour}Hrs.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to generate download" });
  }
};

// 2. Function for Automated Email (Called by Scheduler)
exports.emailReport = async (req, res) => {
  const { hour, recipientEmail } = req.body;

  try {
    await exports.sendAutomatedEmail(hour, recipientEmail);
    res.json({ message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
};

exports.sendAutomatedEmail = async (hour, recipientEmail) => {
  try {
    const workbook = await buildExcelReport(hour);
    const buffer = await workbook.xlsx.writeBuffer();

    // Use a more explicit transporter configuration
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-character app password
      },
    });

    const info = await transporter.sendMail({
      from: `"Border System Admin" <${process.env.EMAIL_USER}>`, 
      to: recipientEmail,
      subject: `Logistics Summary Report: ${hour}:00`,
      text: `Attached is the vehicle clearance report for the ${hour}:00 interval.`,
      attachments: [{ filename: `Report_${hour}Hrs.xlsx`, content: buffer }]
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return true; 
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    throw err; // Throw so the test route can catch it
  }
};