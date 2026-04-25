const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ➤ REGISTER
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username & password required" });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default to 'runner' if no role is provided to keep the system secure
    const userRole = role || "runner"; 

    const newUser = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role`,
      [username, hashedPassword, userRole]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

// ➤ LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Creating the token with the role included
    const token = jwt.sign(
      {
        id: user.rows[0].id,
        role: user.rows[0].role, // This is key for backend middleware!
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Returning everything React needs to manage the UI roles
    res.json({
      token,
      role: user.rows[0].role, // Explicitly sending role for localStorage
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};