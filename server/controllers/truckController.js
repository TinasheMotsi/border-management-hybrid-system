const pool = require("../config/db");

// ➤ ADD TRUCK (No changes needed here, status defaults to 'pending' via schema)
exports.addTruck = async (req, res) => {
  try {
    const { plate_number, driver_name, phone, company, cargo_type } = req.body;

    const existingTruck = await pool.query(
      `SELECT * FROM trucks WHERE plate_number = $1`,
      [plate_number]
    );

    if (existingTruck.rows.length > 0) {
      return res.status(400).json({
        error: `Truck with plate number ${plate_number} already exists.`,
      });
    }

    const newTruck = await pool.query(
      `INSERT INTO trucks (plate_number, driver_name, phone, company, cargo_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [plate_number, driver_name, phone, company, cargo_type]
    );

    res.status(201).json(newTruck.rows[0]);

  } catch (err) {
    console.error("ADD TRUCK ERROR:", err.message);
    res.status(500).json({ error: "Failed to add truck" });
  }
};

// ➤ GET TRUCKS (FIXED: Added WHERE status = 'pending')
exports.getTrucks = async (req, res) => {
  try {
    // Only fetch trucks that haven't entered the live queue yet
    const trucks = await pool.query(
      "SELECT * FROM trucks WHERE status = 'pending' ORDER BY id DESC"
    );
    res.json(trucks.rows);
  } catch (err) {
    console.error("❌ GET TRUCKS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ➤ GET ONE (Standard fetch)
exports.getTruckById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the truck exists AND is still pending
    const truck = await pool.query(
      "SELECT * FROM trucks WHERE id = $1 AND status = 'pending'", 
      [id]
    );

    if (truck.rows.length === 0) {
      // This protects your logic: if it's in the queue, the management page can't "find" it to edit it.
      return res.status(404).json({ error: "Truck not found or already in processing" });
    }

    res.json(truck.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch truck" });
  }
};
// ➤ DELETE (Cleaning up relationships)
exports.deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from all related tables to prevent foreign key errors
    await pool.query("DELETE FROM queue WHERE truck_id = $1", [id]);
    await pool.query("DELETE FROM truck_progress WHERE truck_id = $1", [id]);
    await pool.query("DELETE FROM trucks WHERE id = $1", [id]);

    res.json({ message: "Truck removed from registry" });

  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: "Delete failed" });
  }
};