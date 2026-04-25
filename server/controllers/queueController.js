const pool = require("../config/db");

// ➤ ADD TO QUEUE
exports.addToQueue = async (req, res) => {
  try {
    const { truck_id } = req.body;

    // ❌ Prevent duplicates
    const exists = await pool.query(
      "SELECT * FROM queue WHERE truck_id = $1",
      [truck_id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Truck already in queue" });
    }

    // ✅ Queue number
    const last = await pool.query("SELECT MAX(queue_number) FROM queue");
    const next = (last.rows[0].max || 0) + 1;

    await pool.query(
      "INSERT INTO queue (truck_id, queue_number, status) VALUES ($1, $2, 'waiting')",
      [truck_id, next]
    );

    res.json({ message: "Truck added to queue" });

  } catch (err) {
    console.error("QUEUE ERROR:", err.message);
    res.status(500).json({ error: "Failed" });
  }
};

// ➤ GET QUEUE (🔥 FIXED)
exports.getQueue = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, t.plate_number, t.driver_name, t.phone, t.company, t.cargo_type
      FROM queue q
      JOIN trucks t ON q.truck_id = t.id
      ORDER BY q.queue_number ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("QUEUE FETCH ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch queue" });
  }
};

exports.startProcessing = async (req, res) => {
  const { truck_id } = req.body;

  try {
    // 1. Clean up any stuck progress records for this truck first (Optional but safer)
    await pool.query("DELETE FROM truck_progress WHERE truck_id = $1 AND status = 'in_progress'", [truck_id]);

    // 2. Insert into progress/clearance
    await pool.query(
      `INSERT INTO truck_progress (truck_id, stage_id, start_time, status)
       VALUES ($1, 1, CURRENT_TIMESTAMP, 'in_progress')`,
      [truck_id]
    );

    // 3. REMOVE from queue 
    await pool.query(
      "DELETE FROM queue WHERE truck_id = $1",
      [truck_id]
    );

    res.json({ message: "Moved to clearance hub! 🚀" });

  } catch (err) {
    console.error("PROCESS ERROR:", err.message);
    res.status(500).json({ error: "Database error during transfer" });
  }
};
// ➤ REMOVE FROM QUEUE
exports.removeFromQueue = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM queue WHERE id = $1", [id]);

    res.json({ message: "Removed" });

  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};