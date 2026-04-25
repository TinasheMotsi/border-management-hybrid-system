import React, { useState } from "react";
import API from "../services/api";
import { FileSpreadsheet, Download, Mail, Clock, ShieldCheck } from "lucide-react";

const Reports = () => {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (hour) => {
    setDownloading(hour);
    try {
      // We use 'blob' response type because we are downloading a binary file (Excel)
      const response = await API.get(`/reports/download?hour=${hour}`, {
        responseType: 'blob', 
      });

      // Create a hidden link to trigger the browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Border_Report_${hour}Hrs.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to generate report. Ensure there is data for this time period.");
    } finally {
      setDownloading(null);
    }
  };

  const reportTimes = [
    { label: "Morning Summary", hour: 8, time: "08:00 AM" },
    { label: "Mid-Day Summary", hour: 12, time: "12:00 PM" },
    { label: "Afternoon Summary", hour: 16, time: "04:00 PM" },
  ];

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center">
          <FileSpreadsheet className="me-2 text-primary" size={32} /> 
          Logistics Reports
        </h2>
        <p className="text-muted">Generate and download Excel summaries for specific operational intervals.</p>
      </div>

      <div className="row g-4">
        {reportTimes.map((item) => (
          <div className="col-md-4" key={item.hour}>
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center hover-shadow transition">
              <div className="bg-soft-primary rounded-circle d-inline-flex p-3 mb-3" style={{ backgroundColor: '#eef2ff' }}>
                <Clock size={30} className="text-primary" />
              </div>
              <h5 className="fw-bold">{item.label}</h5>
              <p className="text-muted small">Covers all vehicles processed during the {item.time} hour.</p>
              
              <button 
                className="btn btn-outline-primary rounded-pill w-100 d-flex align-items-center justify-content-center mb-2"
                onClick={() => handleDownload(item.hour)}
                disabled={downloading === item.hour}
              >
                {downloading === item.hour ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <Download size={16} className="me-2" />
                )}
                Download .XLSX
              </button>

              <div className="d-flex align-items-center justify-content-center text-success small mt-2">
                <ShieldCheck size={14} className="me-1" />
                <span style={{ fontSize: '0.75rem' }}>Auto-email scheduled</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="mt-5 card border-0 bg-primary text-white rounded-4 p-4 shadow">
        <div className="d-flex align-items-center">
          <Mail className="me-3" size={40} />
          <div>
            <h5 className="fw-bold mb-1">Automated Email System</h5>
            <p className="mb-0 opacity-75">
              The system is configured to automatically email these reports to the management team at 08:00, 12:00, and 16:00 daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;