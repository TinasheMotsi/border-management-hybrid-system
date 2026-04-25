import React, { useState } from "react";
import { Truck, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = ({ setToken }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Sending login:", formData); // 🔍 Debug

      const res = await API.post("/auth/login", formData);

      // Save auth data
      localStorage.setItem("token", res.data.token);

      // Storing role separately for easy access in UI components
      localStorage.setItem("userRole", res.data.user.role);
     // Storing user info for role-based UI management 
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Call the setToken function passed from App.js
      setToken(res.data.token);

      // Navigate (NO reload)
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      <div
        className="row shadow-lg overflow-hidden bg-white"
        style={{
          maxWidth: "900px",
          borderRadius: "24px",
          minHeight: "550px"
        }}
      >
        {/* LEFT SIDE */}
        <div
          className="col-md-5 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
          }}
        >
          <div className="bg-white p-3 rounded-4 mb-4 shadow-sm">
            <Truck size={48} className="text-primary" />
          </div>
          <h2 className="fw-bold text-center">Border Management</h2>
          <p className="text-center text-white-50 small px-3">
            The integrated gateway for seamless vehicle clearance and logistics
            management.
          </p>
          <div className="mt-4 small text-white-50">
            Secured by Omichael Technologies
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-7 p-5 d-flex flex-column justify-content-center">
          <div className="mb-4">
            <h3 className="fw-bold text-dark">
              FORWARD WE GO BACKWARD NEVER
            </h3>
            <p className="text-muted small">
              Please enter your credentials to access the terminal.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 small py-2 rounded-3">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                Official Username
              </label>
              <div className="input-group bg-light rounded-3 border overflow-hidden">
                <span className="input-group-text bg-transparent border-0 pe-0 text-muted">
                  <Mail size={18} />
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent py-2 shadow-none"
                  placeholder="Runner"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value
                    })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label small fw-bold text-muted">
                  Password
                </label>
                <button
                  type="button"
                  className="small btn btn-link text-decoration-none fw-bold"
                  onClick={() => alert("Forgot password clicked!")}
                >
                  Forgot?
                </button>
              </div>

              <div className="input-group bg-light rounded-3 border overflow-hidden">
                <span className="input-group-text bg-transparent border-0 pe-0 text-muted">
                  <Lock size={18} />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control border-0 bg-transparent py-2 shadow-none"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  className="input-group-text bg-transparent border-0 text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center"
              disabled={loading}
            >
              {loading ? (
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></div>
              ) : (
                "Authenticate Access"
              )}
            </button>
          </form>

          <p
            className="text-center text-muted mt-5 mb-0"
            style={{ fontSize: "12px" }}
          >
            Authorized Personnel Only. Logins are monitored for security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
