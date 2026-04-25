const pool = require("../config/db");
exports.getTruckProgress = async (req, res) => {
  try {
    const { truck_id } = req.params;

    if (!truck_id) {
      return res.status(400).json({ error: "truck_id is required" });
    }

    // Fetch truck progress from the database
    const progress = await pool.query(
      `SELECT * FROM truck_progress WHERE truck_id = $1 ORDER BY start_time ASC`,
      [truck_id]
    );

    if (progress.rows.length === 0) {
      return res.status(404).json({
        error: "No progress found for the specified truck",
      });
    }

    res.json({
      message: "Truck progress retrieved successfully",
      data: progress.rows,
    });
  } catch (err) {
    console.error("GET TRUCK PROGRESS ERROR:", err.message);
    res.status(500).json({ error: "Failed to retrieve truck progress" });
  }
};

exports.moveToNextStage = async (req, res) => {
  try {
    const { truck_id, stage_id } = req.body;

    if (!truck_id || !stage_id) {
      return res.status(400).json({ error: "truck_id and stage_id required" });
    }

    // 🔍 Get last stage FIRST
    const lastStage = await pool.query(
      `SELECT stage_id FROM truck_progress
       WHERE truck_id = $1
       ORDER BY start_time DESC LIMIT 1`,
      [truck_id]
    );

    if (lastStage.rows.length > 0) {
      const expected = lastStage.rows[0].stage_id + 1;

      if (stage_id !== expected) {
        return res.status(400).json({
          error: `Next stage should be ${expected}`,
        });
      }
    }

    // 🔒 Close previous stage
    await pool.query(
      `UPDATE truck_progress
       SET end_time = CURRENT_TIMESTAMP, status = 'completed'
       WHERE truck_id = $1 AND status = 'in_progress'`,
      [truck_id]
    );

    // ➕ Insert new stage
    const newStage = await pool.query(
      `INSERT INTO truck_progress (truck_id, stage_id, start_time, status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'in_progress')
       RETURNING *`,
      [truck_id, stage_id]
    );

    res.json({
      message: "Truck moved to next stage",
      data: newStage.rows[0],
    });

  } catch (err) {
    console.error("STAGE ERROR:", err.message);
    res.status(500).json({ error: "Failed to move stage" });
  }
};

exports.getAllClearance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.plate_number,
        t.driver_name,
        cs.name AS stage_name
      FROM truck_progress tp
      JOIN trucks t ON tp.truck_id = t.id
      JOIN clearance_stages cs ON tp.stage_id = cs.id
      WHERE tp.status = 'in_progress'
      ORDER BY tp.start_time DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("CLEARANCE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch clearance data" });
  }
};