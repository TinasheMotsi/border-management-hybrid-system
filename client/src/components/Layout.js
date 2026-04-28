import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, Truck, ListOrdered, ShieldCheck, 
  LogOut, Settings, Menu, FileSpreadsheet, X 
} from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "runner";

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", position: "relative" }}>
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="position-fixed vh-100 vw-100 d-lg-none" 
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040, top: 0, left: 0 }}
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <div 
        className={`d-flex flex-column flex-shrink-0 p-3 text-white shadow-lg position-fixed position-lg-relative vh-100`} 
        style={{ 
          width: "260px", 
          background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
          transition: "transform 0.3s ease",
          zIndex: 1050,
          left: 0,
          transform: isSidebarOpen ? "translateX(0)" : (window.innerWidth < 992 ? "translateX(-100%)" : "translateX(0)")
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 px-2 py-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <div className="bg-primary p-2 rounded-3 me-2 shadow-sm">
              <Truck size={24} color="white" />
            </div>
            <span className="fs-5 fw-bold tracking-tight">BORDER<span className="text-primary">MGMT</span></span>
          </div>
          {/* Close button for mobile */}
          <button className="btn text-white d-lg-none" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
          {(userRole === 'admin' || userRole === 'runner') && (
            <>
              <NavItem to="/trucks" icon={<Truck size={20} />} label="Trucks" onClick={() => setIsSidebarOpen(false)} />
              <NavItem to="/queue" icon={<ListOrdered size={20} />} label="Live Queue" onClick={() => setIsSidebarOpen(false)} />
              <NavItem to="/clearance" icon={<ShieldCheck size={20} />} label="Clearance" onClick={() => setIsSidebarOpen(false)} />
            </>
          )}
          {(userRole === 'admin' || userRole === 'Manager1') && (
            <NavItem to="/reports" icon={<FileSpreadsheet size={20} />} label="Reports" onClick={() => setIsSidebarOpen(false)} />
          )}
        </ul>

        <hr className="border-secondary opacity-25" />
        <div className="dropdown px-2 py-2">
           <ul className="nav nav-pills flex-column gap-2">
              {userRole === 'admin' && <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" onClick={() => setIsSidebarOpen(false)} />}
              <li className="nav-item">
                 <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="nav-link text-white-50 border-0 bg-transparent d-flex align-items-center w-100">
                    <LogOut size={20} className="me-3" />
                    <span>Logout</span>
                 </button>
              </li>
           </ul>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow-1 d-flex flex-column bg-light overflow-auto" 
           style={{ marginLeft: (window.innerWidth >= 992) ? "260px" : "0" }}>
        
        <header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center shadow-sm sticky-top">
          <div className="d-flex align-items-center">
            <button className="btn d-lg-none p-0 me-3" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h5 className="mb-0 fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>Logistics Panel</h5>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold small">{user.username?.toUpperCase() || "USER"}</div>
              <div className="text-muted text-uppercase" style={{ fontSize: '9px' }}>{userRole}</div>
            </div>
            <img src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`} className="rounded-circle shadow-sm" width="35" alt="P" />
          </div>
        </header>

        <main className="p-3 p-md-4">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, onClick }) => (
  <li className="nav-item" onClick={onClick}>
    <NavLink to={to} className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active' : 'text-white-50'}`}>
      <span className="me-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  </li>
);

export default Layout;