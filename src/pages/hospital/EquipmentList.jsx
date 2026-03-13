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
};

export default function EquipmentList({ onNavigate }) {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  // State for hover effect (optional, kept simple with CSS via JS events)
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("medtrack_equipment")) || [];
    const merged = [...PUBLIC_EQUIPMENT, ...stored];
    setEquipment(merged);
  }, []);

  const handleDelete = (id) => {
    if (id.startsWith("EQ-00")) {
      alert("Default equipment cannot be deleted");
      return;
    }

    if (window.confirm("Are you sure you want to delete this item?")) {
      const stored = JSON.parse(localStorage.getItem("medtrack_equipment")) || [];
      const updated = stored.filter((item) => item.id !== id);
      localStorage.setItem("medtrack_equipment", JSON.stringify(updated));
      setEquipment([...PUBLIC_EQUIPMENT, ...updated]);
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
      item.id.toLowerCase().includes(search.toLowerCase())
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
          <button
            style={styles.addButton}
            onClick={() => onNavigate("add-equipment")}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#004494"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
          >
            + Add Equipment
          </button>
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
                <span style={styles.iconSpan}>🏷️</span>
                <span><strong>ID:</strong> {item.id}</span>
              </div>
              
              <div style={styles.cardInfo}>
                <span style={styles.iconSpan}>🏥</span>
                <span>{item.department}</span>
              </div>
              
              <div style={styles.cardInfo}>
                <span style={styles.iconSpan}>🔧</span>
                <span>{item.model}</span>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => onNavigate("schedule-maintenance")}
                  style={styles.primaryBtn}
                >
                  Schedule Service
                </button>

                {/* Hide delete button for default items */}
                {!item.id.startsWith("EQ-00") && (
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
    </div>
  );
}