import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Play, Phone, Truck, Building2, User, Package, Search, Filter, Hash } from "lucide-react";

const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(null); // Track which truck is processing

  const fetchQueue = async () => {
    try {
      const res = await API.get("/queue");
      setQueue(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const startProcessing = async (truckId) => {
    const confirmMove = window.confirm(
      "Begin clearance for this vehicle? This will move it from the Queue to the Clearance Hub."
    );

    if (!confirmMove) return;

    setLoading(truckId);
    try {
      // Unified call to move and delete in one database transaction
      const res = await API.post("/queue/start", { truck_id: truckId });

      alert(res.data.message || "Truck successfully moved to Clearance Hub! 🛡️");

      // Refresh the UI list
      fetchQueue();
    } catch (err) {
      console.error("Transfer Error:", err);
      alert(err.response?.data?.error || "Failed to move truck. It might already be in Clearance.");
    } finally {
      setLoading(null);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const plate = (item.plate_number || "").toLowerCase();
    const driver = (item.driver_name || "").toLowerCase();
    const company = (item.company || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      plate.includes(search) ||
      driver.includes(search) ||
      company.includes(search);

    const matchesFilter = filterType === "All" || item.cargo_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const categories = ["All", ...new Set(queue.map((q) => q.cargo_type))];

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* --- HEADER SECTION --- */}
      <div className="row mb-4 align-items-end">
        <div className="col-lg-6">
          <div className="d-flex align-items-center mb-1">
            <div className="bg-primary text-white p-2 rounded-3 me-3 shadow-sm">
              <Hash size={24} />
            </div>
            <h2 className="fw-bold m-0">Live Queue</h2>
          </div>
          <p className="text-muted ms-5">Manage and prioritize active vehicle arrivals</p>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="col-lg-6 mt-3 mt-lg-0">
          <div className="d-flex gap-2">
            <div className="input-group shadow-sm rounded-4 overflow-hidden border-0 bg-white" style={{ flex: 2 }}>
              <span className="input-group-text bg-white border-0 ps-3">
                <Search size={18} className="text-primary" />
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none py-2"
                placeholder="Search plate, driver, or company..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center bg-white border-0 rounded-4 px-3 shadow-sm" style={{ flex: 1 }}>
              <Filter size={16} className="text-muted me-2" />
              <select
                className="form-select border-0 shadow-none bg-transparent py-2 pointer fw-medium"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE CARD --- */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <th className="ps-4 py-3 border-0 text-muted">Position</th>
                <th className="border-0 text-muted">Vehicle Info</th>
                <th className="border-0 text-muted">Driver Details</th>
                <th className="border-0 text-muted">Logistics</th>
                <th className="border-0 text-end pe-4 text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredQueue.map((q, index) => (
                <tr key={q.id} style={{ transition: "0.2s" }}>
                  <td className="ps-4">
                    <div
                      className={`badge ${index === 0 ? "bg-primary" : "bg-light text-dark"} rounded-circle d-flex align-items-center justify-content-center shadow-sm`}
                      style={{ width: "35px", height: "35px" }}
                    >
                      {index + 1}
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center">
                      <div className="p-2 rounded-3 me-3" style={{ backgroundColor: "#eef2ff" }}>
                        <Truck size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="fw-bold text-dark fs-6">{q.plate_number}</div>
                        <small className="text-muted fw-medium">ID: {q.truck_id}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold d-flex align-items-center text-dark">
                        <User size={14} className="me-2 text-muted" /> {q.driver_name}
                      </span>
                      <span className="text-muted small d-flex align-items-center mt-1">
                        <Phone size={12} className="me-2" /> {q.phone}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex flex-column">
                      <span className="badge bg-white text-primary border border-primary-subtle align-self-start mb-1 px-2 py-1 rounded-2">
                        <Package size={12} className="me-1" /> {q.cargo_type}
                      </span>
                      <span className="text-muted small fw-medium d-flex align-items-center">
                        <Building2 size={12} className="me-1" /> {q.company}
                      </span>
                    </div>
                  </td>

                  <td className="text-end pe-4">
                    <button
                      className="btn btn-primary rounded-pill px-4 shadow-sm btn-sm d-inline-flex align-items-center"
                      disabled={loading === q.truck_id}
                      onClick={() => startProcessing(q.truck_id)}
                      style={{ fontWeight: "600" }}
                    >
                      {loading === q.truck_id ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      ) : (
                        <>
                          <Play size={14} className="me-2" /> Start Process
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQueue.length === 0 && (
            <div className="text-center py-5">
              <Package size={48} className="text-light mb-3" />
              <h5 className="text-muted">No trucks match your search</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Queue;