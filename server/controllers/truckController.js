const pool = require("../config/db");

// ➤ ADD TRUCK
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

// ➤ GET TRUCKS (🔥 FIXED)
exports.getTrucks = async (req, res) => {
  try {
    const trucks = await pool.query(`
      SELECT * FROM trucks
      WHERE id NOT IN (
        SELECT truck_id FROM queue
      )
      ORDER BY id DESC
    `);

    res.json(trucks.rows);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trucks" });
  }
};

// ➤ GET ONE
exports.getTruckById = async (req, res) => {
  try {
    const { id } = req.params;

    const truck = await pool.query(
      "SELECT * FROM trucks WHERE id = $1",
      [id]
    );

    if (truck.rows.length === 0) {
      return res.status(404).json({ error: "Truck not found" });
    }

    res.json(truck.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch truck" });
  }
};

// ➤ DELETE
exports.deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM truck_progress WHERE truck_id = $1", [id]);
    await pool.query("DELETE FROM trucks WHERE id = $1", [id]);

    res.json({ message: "Truck removed" });

  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: "Delete failed" });
  }
};