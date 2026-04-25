import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Trucks from "./pages/Trucks";
import Queue from "./pages/Queue";
import Clearance from "./pages/Clearance";
import Login from "./pages/Login";
import Settings from "./pages/Settings"; 
import Reports from "./pages/Reports";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login setToken={setToken} />} />

      {/* Main App Shell (Authenticated) */}
      <Route
        path="/"
        element={token ? <Layout /> : <Navigate to="/login" replace />}
      >
        {/* Dashboard: Accessible to all authenticated users */}
        <Route index element={<Dashboard />} />

        {/* Operational Routes: Only for Admin and Runner */}
        <Route 
          path="trucks" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'runner']}>
              <Trucks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="queue" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'runner']}>
              <Queue />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="clearance" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'runner']}>
              <Clearance />
            </ProtectedRoute>
          } 
        />

        {/* Managerial/Admin Routes: Only for Admin and Boss */}
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'boss']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Only Route */}
        <Route 
          path="settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Fallback: Catch all and redirect home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;