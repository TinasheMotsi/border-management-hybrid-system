import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Truck, 
  ListOrdered, 
  ShieldCheck, 
  LogOut,
  Settings,
  Menu,
  FileSpreadsheet // Added for Reports
} from "lucide-react";

const Layout = () => {
  // ✅ 1. Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "runner"; // fallback to runner

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      
      {/* --- SIDEBAR --- */}
      <div 
        className="d-flex flex-column flex-shrink-0 p-3 text-white shadow-lg" 
        style={{ 
          width: "260px", 
          background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
          transition: "all 0.3s ease"
        }}
      >
        {/* Branding */}
        <div className="d-flex align-items-center mb-4 px-2 py-3 border-bottom border-secondary">
          <div className="bg-primary p-2 rounded-3 me-2 shadow-sm">
            <Truck size={24} color="white" />
          </div>
          <span className="fs-5 fw-bold tracking-tight">BORDER<span className="text-primary">MANAGEMENT</span></span>
        </div>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          {/* Dashboard: Everyone sees this */}
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />

          {/* ✅ ROLE CHECK: Only Admin and Runner see Truck Management & Queue */}
          {(userRole === 'admin' || userRole === 'runner') && (
            <>
              <NavItem to="/trucks" icon={<Truck size={20} />} label="Truck Management" />
              <NavItem to="/queue" icon={<ListOrdered size={20} />} label="Queue Live" />
              <NavItem to="/clearance" icon={<ShieldCheck size={20} />} label="Clearance Hub" />
            </>
          )}

          {/* ✅ ROLE CHECK: Only Admin and Manager see Reports */}
          {(userRole === 'admin' || userRole === 'Manager1') && (
            <NavItem to="/reports" icon={<FileSpreadsheet size={20} />} label="Logistics Reports" />
          )}
        </ul>

        <hr className="border-secondary opacity-25" />

        {/* User / Settings Section */}
        <div className="dropdown px-2 py-2">
          <ul className="nav nav-pills flex-column gap-2">
             {/* Only Admin can see Settings */}
             {userRole === 'admin' && (
               <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
             )}
             
             <li className="nav-item">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="nav-link text-white-50 border-0 bg-transparent d-flex align-items-center w-100 hover-logout"
                >
                  <LogOut size={20} className="me-3" />
                  <span>Logout</span>
                </button>
             </li>
          </ul>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow-1 d-flex flex-column bg-light overflow-auto">
        
        {/* Top Navbar */}
        <header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center">
            <button className="btn d-lg-none p-0 me-3">
              <Menu size={24} />
            </button>
            <h5 className="mb-0 fw-semibold text-dark">Logistics Control Panel</h5>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              {/* ✅ Dynamic User Name and Role */}
              <div className="fw-bold small">{user.username?.toUpperCase() || "USER"}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
                {userRole}
              </div>
            </div>
            <img 
              src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`} 
              className="rounded-circle shadow-sm" 
              width="40" 
              alt="Profile"
            />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4">
          <div className="container-fluid animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        /* ... existing styles remain the same ... */
      `}</style>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <li className="nav-item">
    <NavLink 
      to={to} 
      className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}
    >
      <span className="me-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  </li>
);

export default Layout;