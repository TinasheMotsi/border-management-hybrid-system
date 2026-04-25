import React, { useState, useEffect } from "react";
import API from "../services/api";
import { 
  Plus, Truck, User, Phone, Building2, Package, Search, PlusCircle, ArrowRightCircle 
} from "lucide-react";

const Trucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    plate_number: "",
    driver_name: "",
    phone: "",
    company: "",
    cargo_type: "",
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const res = await API.get("/trucks");
      setTrucks(res.data);
    } catch (err) {
      console.error("Error fetching trucks", err);
    }
  };
const addTruck = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    await API.post("/trucks", form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setForm({
      plate_number: "",
      driver_name: "",
      phone: "",
      company: "",
      cargo_type: ""
    });

    fetchTrucks();

  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.error || "Error adding truck");
  }
};
  // ✅ FIXED LOGIC (NO UI CHANGE)
  const addToQueue = async (truckId) => {
    const confirmMove = window.confirm(
      "Move this truck to the active queue? It will be removed from registry."
    );

    if (!confirmMove) return;

    try {
      // 1. Add to queue
      await API.post("/queue", { truck_id: truckId });

      // 2. Remove from UI immediately (NO refresh needed)
      setTrucks((prev) => prev.filter((t) => t.id !== truckId));

      alert("Truck moved to Queue 🚀");

    } catch (err) {
      console.error(err);

      // ✅ Prevent duplicate insert crash
      if (err.response?.data?.error?.includes("already")) {
        alert("Truck already in queue ⚠️");
      } else {
        alert("Failed to move truck ❌");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredTrucks = trucks.filter(t => {
    const plate = (t.plate_number || "").toLowerCase();
    const company = (t.company || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return plate.includes(search) || company.includes(search);
  });

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center text-dark">
            <Truck className="me-3 text-primary" size={32} /> Fleet Registry
          </h2>
          <p className="text-muted">Register trucks before assigning them to the border queue.</p>
        </div>
        
        <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-white border-0 ps-3">
            <Search size={18} className="text-muted" />
          </span>
          <input 
            type="text" 
            className="form-control border-0 shadow-none py-2" 
            placeholder="Search by plate or company..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {/* FORM */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "20px" }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center text-primary">
              <PlusCircle size={20} className="me-2" /> New Entry
            </h5>
            <form onSubmit={addTruck}>
              <InputField label="Plate Number" name="plate_number" value={form.plate_number} onChange={handleChange} icon={<span className="small fw-bold">#</span>} />
              <InputField label="Driver Name" name="driver_name" value={form.driver_name} onChange={handleChange} icon={<User size={16}/>} />
              <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} icon={<Phone size={16}/>} />
              <InputField label="Company Name" name="company" value={form.company} onChange={handleChange} icon={<Building2 size={16}/>} />
              <InputField label="Cargo Type" name="cargo_type" value={form.cargo_type} onChange={handleChange} icon={<Package size={16}/>} />
              
              <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold mt-3 shadow-sm d-flex align-items-center justify-content-center">
                <Plus size={18} className="me-2" /> Save to Directory
              </button>
            </form>
          </div>
        </div>

        {/* CARDS */}
        <div className="col-lg-8">
          {filteredTrucks.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
              <p className="text-muted">No trucks found in registry.</p>
            </div>
          ) : (
            <div className="row g-3">
              {filteredTrucks.map((t) => (
                <div key={t.id} className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100 rounded-4 p-3 bg-white border-hover transition-all">
                    <div className="d-flex justify-content-between mb-3">
                      <div className="bg-light p-2 rounded-3 text-primary">
                        <Truck size={20} />
                      </div>
                      <span className="small text-muted fw-bold">ID: {t.id}</span>
                    </div>
                    
                    <h5 className="fw-bold mb-0">{t.plate_number}</h5>
                    <p className="text-primary small fw-bold mb-3">{t.company}</p>

                    <div className="pt-2">
                      <DetailRow icon={<User size={14}/>} text={t.driver_name} />
                      <DetailRow icon={<Package size={14}/>} text={t.cargo_type} />
                      <DetailRow icon={<Phone size={14}/>} text={t.phone} />
                    </div>

                    <button 
                      onClick={() => addToQueue(t.id)}
                      className="btn btn-dark w-100 rounded-pill btn-sm fw-bold mt-3 d-flex align-items-center justify-content-center"
                    >
                      Dispatch to Queue <ArrowRightCircle size={14} className="ms-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .border-hover:hover { border: 1px solid #6366f1 !important; transform: translateY(-3px); }
        .transition-all { transition: all 0.3s ease; }
      `}</style>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon }) => (
  <div className="mb-3">
    <label className="small text-muted fw-bold mb-1 d-block">{label}</label>
    <div className="input-group bg-light rounded-3 overflow-hidden border">
      <span className="input-group-text bg-transparent border-0 text-muted">{icon}</span>
      <input
        className="form-control border-0 bg-transparent shadow-none py-2"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        required
      />
    </div>
  </div>
);

const DetailRow = ({ icon, text }) => (
  <div className="d-flex align-items-center text-muted small mb-2">
    <span className="me-2 text-secondary">{icon}</span> {text}
  </div>
);

export default Trucks;