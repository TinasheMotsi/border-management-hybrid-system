const ExcelJS = require('exceljs');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Helper to build the Excel logic (Shared by both Download and Email)
const buildExcelReport = async (hour) => {
  const result = await pool.query(
    `SELECT tp.*, t.plate_number, t.driver_name, t.company 
     FROM truck_progress tp
     JOIN trucks t ON tp.truck_id = t.id
     WHERE EXTRACT(HOUR FROM tp.start_time) = $1 
     AND tp.start_time::date = CURRENT_DATE`,
    [hour]
  );

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Report-${hour}Hrs`);

  worksheet.columns = [
    { header: 'Truck ID', key: 'truck_id', width: 10 },
    { header: 'Plate Number', key: 'plate_number', width: 15 },
    { header: 'Driver', key: 'driver_name', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Time Started', key: 'start_time', width: 25 }
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