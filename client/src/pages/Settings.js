import React, { useState, useEffect } from "react";
import { 
  User, 
  ShieldCheck, // Use ShieldCheck instead of ShieldLock
  Bell, 
  Save, 
  Palette, 
  Monitor 
} from "lucide-react";

const Settings = () => {
  // Load initial data
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Officer" };
  const [username, setUsername] = useState(user?.username || "");
  
  // Dark Mode State (Sync with LocalStorage)
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("bg-dark", "text-white");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("bg-dark", "text-white");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSaveProfile = () => {
    const updatedUser = { ...user, username };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully! ✅");
  };

  return (
    <div className="container-fluid p-4 animate-fade-in">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary p-2 rounded-3 me-3 text-white">
          <Monitor size={24} />
        </div>
        <h2 className="fw-bold m-0">System Settings</h2>
      </div>

      <div className="row g-4">
        {/* --- LEFT: PROFILE & APPEARANCE --- */}
        <div className="col-lg-7">
          {/* Profile Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <User size={20} className="me-2 text-primary" /> Profile Information
            </h5>
            <div className="mb-3">
              <label className="small fw-bold text-muted mb-1">Display Name</label>
              <input
                className="form-control bg-light border-0 py-2 shadow-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button className="btn btn-primary rounded-pill px-4" onClick={handleSaveProfile}>
              <Save size={16} className="me-2" /> Save Profile
            </button>
          </div>

          {/* Appearance Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <Palette size={20} className="me-2 text-primary" /> Appearance
            </h5>
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
              <div>
                <div className="fw-bold">Dark Mode</div>
                <div className="small text-muted">Reduces eye strain in low-light environments</div>
              </div>
              <div className="form-check form-switch fs-4">
                <input
                  className="form-check-input pointer"
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: SECURITY & NOTIFICATIONS --- */}
        <div className="col-lg-5">
          {/* Security Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <ShieldCheck size={20} className="me-2 text-danger" /> Security
            </h5>
            <button className="btn btn-outline-secondary w-100 rounded-pill mb-2 text-start px-3">
              Change Password
            </button>
            <button className="btn btn-outline-secondary w-100 rounded-pill text-start px-3">
              Two-Factor Authentication
            </button>
          </div>

          {/* Notifications Section */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <Bell size={20} className="me-2 text-warning" /> Notifications
            </h5>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
              <label className="form-check-label small" htmlFor="emailNotif">Email alerts for delays</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="queueNotif" defaultChecked />
              <label className="form-check-label small" htmlFor="queueNotif">Desktop alerts for new arrivals</label>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .pointer { cursor: pointer; }
        .bg-light { background-color: #f8fafc !important; }
      `}</style>
    </div>
  );
};

export default Settings;