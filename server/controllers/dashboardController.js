const pool = require("../config/db");

// ➤ GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {

    // Total trucks
    const totalTrucks = await pool.query(
      "SELECT COUNT(*) FROM trucks"
    );

    // Trucks in queue
    const inQueue = await pool.query(
      "SELECT COUNT(*) FROM queue WHERE status = 'waiting'"
    );

    // Cleared trucks
    const cleared = await pool.query(`
      SELECT COUNT(DISTINCT truck_id)
      FROM truck_progress tp
      JOIN clearance_stages cs ON tp.stage_id = cs.id
      WHERE cs.name = 'Cleared'
    `);

    // Trucks per stage
    const stageStats = await pool.query(`
    SELECT cs.id, cs.name, COUNT(tp.truck_id) AS total
    FROM clearance_stages cs
    LEFT JOIN truck_progress tp 
    ON cs.id = tp.stage_id AND tp.status = 'in_progress'
    GROUP BY cs.id, cs.name
    ORDER BY cs.id
 `);
    res.json({
      total_trucks: parseInt(totalTrucks.rows[0].count),
      trucks_in_queue: parseInt(inQueue.rows[0].count),
      trucks_cleared: parseInt(cleared.rows[0].count),
      stage_distribution: stageStats.rows
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err.message);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};