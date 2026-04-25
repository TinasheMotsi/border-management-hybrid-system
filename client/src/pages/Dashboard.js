import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";
import { Truck, Clock, CheckCircle, BarChart3, FileSpreadsheet, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Fetch data and user role from localStorage
    API.get("/dashboard").then((res) => setData(res.data));
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "runner");
  }, []);

  if (!data) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  const chartData = [
    { name: "In Queue", value: data.trucks_in_queue || 0, color: "#f59e0b" },
    { name: "Cleared", value: data.trucks_cleared || 0, color: "#10b981" },
    { name: "Total", value: data.total_trucks || 0, color: "#6366f1" },
  ];

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-primary p-2 rounded-3 me-3 shadow-sm">
            <BarChart3 className="text-white" size={24} />
          </div>
          <h2 className="fw-bold m-0 tracking-tight">Operations Overview</h2>
        </div>
        
        {/* Only Managers/Admins see the quick link to reports */}
        {(userRole === 'admin' || userRole === 'Manager') && (
          <Link to="/reports" className="btn btn-primary rounded-pill px-4 d-flex align-items-center shadow-sm">
            <FileSpreadsheet size={18} className="me-2" />
            Export Data
          </Link>
        )}
      </div>

      {/* --- Stat Cards --- */}
      <div className="row g-4 mb-4">
        <StatCard title="Total Trucks" value={data.total_trucks} icon={<Truck color="#6366f1"/>} />
        <StatCard title="In Queue" value={data.trucks_in_queue} icon={<Clock color="#f59e0b"/>} />
        <StatCard title="Cleared Today" value={data.trucks_cleared} icon={<CheckCircle color="#10b981"/>} />
      </div>

      {/* --- Quick Actions (Only for Management) --- */}
      {(userRole === 'admin' || userRole === 'Manager') && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-primary border-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="fw-bold mb-1">Managerial Report Hub</h5>
                  <p className="text-muted mb-0">Daily summaries are auto-sent at 08:00, 12:00, and 16:00. Download manual exports below.</p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <Link to="/reports" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                    Go to Reports <ArrowRight size={18} className="ms-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Charts Section --- */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <h5 className="mb-4 fw-bold">Traffic Distribution</h5>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100 text-center bg-white">
            <h5 className="mb-4 fw-bold">Efficiency Ratio</h5>
            <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData.filter(i => i.name !== "Total")}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {chartData.filter(i => i.name !== "Total").map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-muted small mt-2">Comparison: Queue vs Cleared</p>
            
            <div className="mt-auto pt-3 border-top text-start">
                <div className="d-flex justify-content-between mb-1">
                    <span className="small text-muted">Process Success Rate</span>
                    <span className="small fw-bold text-success">
                        {data.total_trucks > 0 ? Math.round((data.trucks_cleared / data.total_trucks) * 100) : 0}%
                    </span>
                </div>
                <div className="progress rounded-pill" style={{ height: "8px" }}>
                    <div 
                        className="progress-bar bg-success rounded-pill" 
                        style={{ width: `${data.total_trucks > 0 ? (data.trucks_cleared / data.total_trucks) * 100 : 0}%` }}
                    ></div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal CSS for simple hover effect */}
      <style>{`
        .transition-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .transition-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white transition-hover h-100">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted mb-1 fw-medium small text-uppercase tracking-wider">{title}</p>
          <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>{value}</h2>
        </div>
        <div className="bg-light p-3 rounded-4 shadow-sm">{icon}</div>
      </div>
    </div>
  </div>
);

export default Dashboard;