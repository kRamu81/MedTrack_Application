import React, { useState, useEffect } from "react";

/* ===========================
   DEFAULT PUBLIC EQUIPMENT
   Visible to ALL users
=========================== */

const PUBLIC_EQUIPMENT = [
  { id: "EQ-001", name: "MRI Scanner", model: "GE Signa HDxt", department: "Radiology", status: "Operational" },
  { id: "EQ-002", name: "Ventilator", model: "Philips Trilogy", department: "ICU", status: "Operational" },
  { id: "EQ-003", name: "X-Ray Machine", model: "Siemens AX", department: "Emergency", status: "Maintenance" },
  { id: "EQ-004", name: "Ultrasound", model: "Sonosite Edge", department: "Cardiology", status: "Operational" },
  { id: "EQ-005", name: "First Aid Kit", model: "FA-PRO-500", department: "Emergency", status: "Operational" },
  { id: "EQ-006", name: "Stethoscope", model: "ST-CLASSIC", department: "Cardiology", status: "Operational" },
  { id: "EQ-007", name: "Blood Pressure Monitor", model: "BP-AUTO", department: "General Ward", status: "Operational" },
  { id: "EQ-008", name: "Digital Thermometer", model: "TEMP-001", department: "Nursing Station", status: "Operational" },
];

/* ===========================
   EQUIPMENT IMAGES
=========================== */

const EQUIPMENT_IMAGES = {
  "mri": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl7fPv3AGiTlskFg0Ehetmi5OPa-grbbDihw&s",
  "ventilator": "https://cpimg.tistatic.com/08907627/b/4/Ventilator-NICU-Eqp.jpg",
  "x-ray": "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c",
  "ultrasound": "https://images.unsplash.com/photo-1516549655169-df83a0774514",
  "stethoscope": "https://m.media-amazon.com/images/I/51i5-G3clqS.jpg",
  "default": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"
};

/* ===========================
   STYLES OBJECT
   Centralized styling for clean code
=========================== */

const styles = {
  page: {
    backgroundColor: "#f4f7f6", // Light medical grey background
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0056b3", // Medical Blue
    margin: 0,
  },
  controls: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  searchInput: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    width: "300px",
    fontSize: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    outline: "none",
    transition: "border 0.3s",
  },
  addButton: {
    backgroundColor: "#0056b3",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,86,179,0.2)",
    transition: "background 0.3s",
  },
  grid: {
    display: "grid",
    // Responsive grid: fits as many as possible, min 300px width
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "25px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #eee",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderBottom: "1px solid #eee",
  },
  cardContent: {
    padding: "20px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#2c3e50",
  },
  cardInfo: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
  },
  iconSpan: {
    marginRight: "8px",
    width: "16px",
    textAlign: "center",
  },
  cardFooter: {
    marginTop: "auto",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  primaryBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#f0f7ff",
    color: "#0056b3",
    border: "1px solid #cce4ff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  deleteBtn: {
    padding: "10px 15px",
    backgroundColor: "#fff0f0",
    color: "#d9534f",
    border: "1px solid #ffcccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  // Status Badge Styles
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    display: "inline-block",
    marginBottom: "10px",
    width: "fit-content",
  },
  operational: {
    backgroundColor: "#e6fffa",
    color: "#00b894",
  },
  maintenance: {
    backgroundColor: "#fff5e6",
    color: "#e67e22",
  },
  detailsBtn: {
    padding: "10px 15px",
    backgroundColor: "#f5f6f8",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "30px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: "1px solid #e2e8f0",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a202c",
    margin: 0,
  },
  modalCloseBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#a0aec0",
    padding: 0,
  },
};

import { getAllEquipment, deleteEquipment, getEquipmentById } from "../../services/EquipmentService";
import { useAuth } from "../../context/AuthContext";

export default function EquipmentList({ onNavigate }) {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await getAllEquipment();
      setEquipment(data);
    } catch (error) {
      console.error("Failed to fetch equipment", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedEquipmentId(id);
    setDetailsLoading(true);
    setDetailsError(null);
    setEquipmentDetails(null);
    try {
      const data = await getEquipmentById(id);
      setEquipmentDetails(data);
    } catch (error) {
      console.error("Error fetching equipment details:", error);
      const errMsg = error.response?.data?.message || `Equipment not found with id: ${id}`;
      setDetailsError(errMsg);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteEquipment(id);
        fetchEquipment();
      } catch (error) {
        alert("Failed to delete equipment. It might be linked to maintenance tasks.");
      }
    }
  };

  const getImage = (name) => {
    const lower = name.toLowerCase();
    for (const key in EQUIPMENT_IMAGES) {
      if (lower.includes(key)) {
        return EQUIPMENT_IMAGES[key];
      }
    }
    return EQUIPMENT_IMAGES.default;
  };

  const getStatusStyle = (status) => {
    if (status === "Operational") return { ...styles.statusBadge, ...styles.operational };
    if (status === "Maintenance") return { ...styles.statusBadge, ...styles.maintenance };
    return styles.statusBadge;
  };

  const filtered = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>Medical Equipment Inventory</h1>
        
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.border = "1px solid #0056b3"}
            onBlur={(e) => e.target.style.border = "1px solid #e0e0e0"}
          />
          {user?.role === "hospital" && (
            <button
              style={styles.addButton}
              onClick={() => onNavigate("add-equipment")}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#004494"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
            >
              + Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Grid Section */}
      <div style={styles.grid}>
        {filtered.map((item) => (
          <div 
            key={item.id} 
            style={{
              ...styles.card,
              transform: hoveredCard === item.id ? "translateY(-5px)" : "none",
              boxShadow: hoveredCard === item.id ? "0 10px 20px rgba(0,0,0,0.1)" : "0 4px 6px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <img
              src={getImage(item.name)}
              alt={item.name}
              style={styles.image}
            />
            
            <div style={styles.cardContent}>
              <div style={getStatusStyle(item.status)}>
                {item.status}
              </div>
              
              <h3 style={styles.cardTitle}>{item.name}</h3>
              
              <div style={styles.cardInfo}>
                <span style={styles.iconSpan}></span>
                <span><strong>ID:</strong> {item.id}</span>
              </div>
              
              <div style={styles.cardInfo}>
                <span style={styles.iconSpan}></span>
                <span>{item.department}</span>
              </div>
              
              <div style={styles.cardInfo}>
                <span style={styles.iconSpan}></span>
                <span>{item.model}</span>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => handleViewDetails(item.id)}
                  style={{ ...styles.primaryBtn, backgroundColor: "#e0f2fe", borderColor: "#bae6fd", color: "#0369a1" }}
                >
                  Details
                </button>

                {user?.role === "hospital" && (
                  <button
                    onClick={() => onNavigate("schedule-maintenance")}
                    style={styles.primaryBtn}
                  >
                    Schedule Service
                  </button>
                )}

                {/* Hide delete button for default items */}
                {user?.role === "hospital" && !(String(item.id).startsWith("EQ-00")) && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Equipment Details Modal */}
      {selectedEquipmentId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(8px)"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "32px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative",
            border: "1px solid #f1f5f9",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}>
            <button 
              onClick={() => setSelectedEquipmentId(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "#f1f5f9",
                border: "none",
                fontSize: "20px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
            >
              &times;
            </button>

            {detailsLoading && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{
                  display: "inline-block",
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #0056b3",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ marginTop: "16px", color: "#64748b", fontWeight: "600" }}>Fetching equipment details...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {detailsError && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ color: "#ef4444", fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>Not Found</h3>
                <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "24px", fontWeight: "500" }}>{detailsError}</p>
                <button 
                  onClick={() => setSelectedEquipmentId(null)}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(239, 68, 68, 0.2)"
                  }}
                >
                  Close
                </button>
              </div>
            )}

            {equipmentDetails && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>⚙️</div>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                      {equipmentDetails.name}
                    </h2>
                    <span style={{
                      backgroundColor: equipmentDetails.status === "Operational" ? "#e2fbf0" : "#fff3e6",
                      color: equipmentDetails.status === "Operational" ? "#10b981" : "#d97706",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "inline-block",
                      marginTop: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>{equipmentDetails.status}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Equipment ID</span>
                    <p style={{ fontSize: "15px", color: "#0f172a", fontWeight: "700", margin: "4px 0 0 0", fontFamily: "monospace" }}>{equipmentDetails.id}</p>
                  </div>
                  <div style={{ width: "100%", height: "1px", backgroundColor: "#e2e8f0" }}></div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Model Details</span>
                    <p style={{ fontSize: "15px", color: "#334155", fontWeight: "600", margin: "4px 0 0 0" }}>{equipmentDetails.model || "N/A"}</p>
                  </div>
                  <div style={{ width: "100%", height: "1px", backgroundColor: "#e2e8f0" }}></div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department / Location</span>
                    <p style={{ fontSize: "15px", color: "#334155", fontWeight: "600", margin: "4px 0 0 0" }}>{equipmentDetails.department || "N/A"}</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setSelectedEquipmentId(null)}
                    style={{
                      backgroundColor: "#0056b3",
                      color: "white",
                      border: "none",
                      padding: "12px 28px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "15px",
                      boxShadow: "0 4px 6px rgba(0, 86, 179, 0.2)",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#004494"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}