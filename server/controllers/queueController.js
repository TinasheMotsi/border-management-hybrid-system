const pool = require("../config/db");

// ➤ ADD TO QUEUE (FIXED: Updates truck status)
exports.addToQueue = async (req, res) => {
  try {
    const { truck_id } = req.body;

    // 1. Prevent duplicates
    const exists = await pool.query(
      "SELECT * FROM queue WHERE truck_id = $1",
      [truck_id]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Truck already in queue" });
    }

    // 2. Get next queue number
    const last = await pool.query("SELECT MAX(queue_number) FROM queue");
    const next = (last.rows[0].max || 0) + 1;

    // 3. TRANSACTION: Add to queue AND update truck status
    await pool.query("BEGIN");
    
    await pool.query(
      "INSERT INTO queue (truck_id, queue_number, status) VALUES ($1, $2, 'waiting')",
      [truck_id, next]
    );

    // ✅ THIS IS THE FIX: Changes status so it disappears from Management
    await pool.query(
      "UPDATE trucks SET status = 'in-progress' WHERE id = $1",
      [truck_id]
    );

    await pool.query("COMMIT");

    res.json({ message: "Truck added to queue" });

  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("QUEUE ERROR:", err.message);
    res.status(500).json({ error: "Failed to add truck to queue" });
  }
};

// ➤ REMOVE FROM QUEUE (FIXED: Resets truck status)
exports.removeFromQueue = async (req, res) => {
  try {
    const { id } = req.params;

    // We need the truck_id first to update its status back to 'pending'
    const queueItem = await pool.query("SELECT truck_id FROM queue WHERE id = $1", [id]);
    
    if (queueItem.rows.length > 0) {
      const truckId = queueItem.rows[0].truck_id;

      await pool.query("BEGIN");
      
      // Delete from queue
      await pool.query("DELETE FROM queue WHERE id = $1", [id]);
      
      // ✅ RESET STATUS: Now it will reappear in Truck Management for re-assignment
      await pool.query("UPDATE trucks SET status = 'pending' WHERE id = $1", [truckId]);
      
      await pool.query("COMMIT");
    }

    res.json({ message: "Removed and status reset to pending" });

  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("REMOVE QUEUE ERROR:", err.message);
    res.status(500).json({ error: "Delete failed" });
  }
};

// ➤ START PROCESSING (Already good, but added status update for consistency)
exports.startProcessing = async (req, res) => {
  const { truck_id } = req.body;

  try {
    await pool.query("BEGIN");

    await pool.query("DELETE FROM truck_progress WHERE truck_id = $1 AND status = 'in_progress'", [truck_id]);

    await pool.query(
      `INSERT INTO truck_progress (truck_id, stage_id, start_time, status)
       VALUES ($1, 1, CURRENT_TIMESTAMP, 'in_progress')`,
      [truck_id]
    );

    await pool.query("DELETE FROM queue WHERE truck_id = $1", [truck_id]);

    // ✅ Keep status as 'in-progress' or change to 'clearing'
    await pool.query("UPDATE trucks SET status = 'clearing' WHERE id = $1", [truck_id]);

    await pool.query("COMMIT");
    res.json({ message: "Moved to clearance hub! 🚀" });

  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("PROCESS ERROR:", err.message);
    res.status(500).json({ error: "Database error during transfer" });
  }
};

// ➤ GET QUEUE (No changes needed)
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