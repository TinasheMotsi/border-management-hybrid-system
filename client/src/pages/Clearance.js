import React, { useEffect, useState } from "react";
import API from "../services/api";
import { CheckCircle2, ArrowRight, Clock, ShieldCheck, CreditCard, SearchCheck, Truck } from "lucide-react";

const Clearance = () => {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    fetchClearance();
    // Optional: Refresh every minute to check for expired trucks
    const interval = setInterval(fetchClearance, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchClearance = async () => {
    try {
      const res = await API.get("/clearance");
      
      // --- THE 5-HOUR FILTER LOGIC ---
      const now = new Date();
      const fiveHoursInMs = 5 * 60 * 60 * 1000;

      const activeTrucks = res.data.filter((truck) => {
        if (truck.stage_name !== "Cleared") return true; // Keep all in-progress trucks
        
        // Assuming your API returns 'updated_at' or 'cleared_at'
        const clearedAt = new Date(truck.updated_at); 
        return (now - clearedAt) < fiveHoursInMs;
      });

      setTrucks(activeTrucks);
    } catch (err) {
      console.error(err);
    }
  };

  const moveToNextStage = async (truck) => {
    const nextStageMap = {
      "Arrival": 2,
      "Document Verification": 3,
      "Duty Payment": 4,
      "Physical Inspection": 5,
    };

    try {
      await API.put("/clearance", {
        truck_id: truck.id,
        stage_id: nextStageMap[truck.stage_name],
      });
      fetchClearance();
    } catch (err) {
      console.error(err);
    }
  };

  // Modern UI Helpers
  const getStageIcon = (stage) => {
    switch (stage) {
      case "Arrival": return <Truck size={18} />;
      case "Document Verification": return <ShieldCheck size={18} />;
      case "Duty Payment": return <CreditCard size={18} />;
      case "Physical Inspection": return <SearchCheck size={18} />;
      case "Cleared": return <CheckCircle2 size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getProgressInfo = (stage) => {
    const map = {
      "Arrival": { p: 20, c: "#64748b", label: "Registered" },
      "Document Verification": { p: 40, c: "#6366f1", label: "Verifying" },
      "Duty Payment": { p: 60, c: "#f59e0b", label: "Awaiting Funds" },
      "Physical Inspection": { p: 80, c: "#06b6d4", label: "Inspecting" },
      "Cleared": { p: 100, c: "#10b981", label: "Released" },
    };
    return map[stage] || { p: 0, c: "#000", label: "Unknown" };
  };

  const getActionLabel = (stage) => {
    const labels = {
      "Arrival": "Verify Documents",
      "Document Verification": "Process Payment",
      "Duty Payment": "Start Inspection",
      "Physical Inspection": "Final Release",
    };
    return labels[stage];
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mb-5">
        <h2 className="fw-bold m-0">Clearance Pipeline</h2>
        <p className="text-muted">Tracking trucks through customs stages</p>
      </div>

      <div className="row">
        {trucks.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-white d-inline-block p-4 rounded-circle shadow-sm mb-3">
              <CheckCircle2 size={48} className="text-success" />
            </div>
            <h4 className="text-muted">Pipeline is clear!</h4>
          </div>
        ) : (
          trucks.map((truck) => {
            const info = getProgressInfo(truck.stage_name);
            return (
              <div className="col-xl-4 col-md-6 mb-4" key={truck.id}>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div className="card-body p-4">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-0">{truck.plate_number}</h5>
                        <small className="text-muted">{truck.driver_name}</small>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-pill small fw-bold" 
                        style={{ backgroundColor: `${info.c}15`, color: info.c }}
                      >
                        {getStageIcon(truck.stage_name)} <span className="ms-1">{truck.stage_name}</span>
                      </div>
                    </div>

                    {/* Progress Visual */}
                    <div className="my-4">
                      <div className="d-flex justify-content-between mb-2 small fw-bold text-muted">
                        <span>Progress</span>
                        <span>{info.p}%</span>
                      </div>
                      <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated" 
                          style={{ width: `${info.p}%`, backgroundColor: info.c }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-3 border-top">
                      {truck.stage_name !== "Cleared" ? (
                        <button
                          className="btn w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center"
                          style={{ backgroundColor: info.c, color: "white" }}
                          onClick={() => moveToNextStage(truck)}
                        >
                          {getActionLabel(truck.stage_name)} <ArrowRight size={16} className="ms-2" />
                        </button>
                      ) : (
                        <div className="text-center text-success fw-bold py-2 d-flex align-items-center justify-content-center">
                          <CheckCircle2 size={20} className="me-2" /> Release Complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Clearance;