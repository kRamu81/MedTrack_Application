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

export default function EquipmentList({ onNavigate }) {

  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");

  /* ===========================
     LOAD EQUIPMENT
     PUBLIC + USER ADDED
  =========================== */

  useEffect(() => {

    const stored = JSON.parse(localStorage.getItem("medtrack_equipment")) || [];

    // Merge default public equipment with stored custom equipment
    const merged = [...PUBLIC_EQUIPMENT, ...stored];

    setEquipment(merged);

  }, []);

  /* ===========================
     DELETE (ONLY CUSTOM ITEMS)
  =========================== */

  const handleDelete = (id) => {

    // Prevent deleting default equipment
    if (id.startsWith("EQ-00")) {
      alert("Default equipment cannot be deleted");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("medtrack_equipment")) || [];

    const updated = stored.filter((item) => item.id !== id);

    localStorage.setItem("medtrack_equipment", JSON.stringify(updated));

    setEquipment([...PUBLIC_EQUIPMENT, ...updated]);
  };

  /* ===========================
     IMAGE SELECTOR
  =========================== */

  const getImage = (name) => {
    const lower = name.toLowerCase();

    for (const key in EQUIPMENT_IMAGES) {
      if (lower.includes(key)) {
        return EQUIPMENT_IMAGES[key];
      }
    }

    return EQUIPMENT_IMAGES.default;
  };

  /* ===========================
     SEARCH FILTER
  =========================== */

  const filtered = equipment.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div style={{ padding: "30px" }}>

      <h1>Equipment Inventory</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />

        <button
          style={{ marginLeft: "15px", padding: "8px 15px" }}
          onClick={() => onNavigate("add-equipment")}
        >
          Add Equipment
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px" }}>

        {filtered.map((item) => (

          <div key={item.id} style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "15px"
          }}>

            <img
              src={getImage(item.name)}
              alt={item.name}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />

            <h3>{item.name}</h3>

            <p>ID: {item.id}</p>

            <p>Department: {item.department}</p>

            <p>Status: {item.status}</p>

            <button
              onClick={() => onNavigate("schedule-maintenance")}
              style={{ marginTop: "10px" }}
            >
              Schedule Service
            </button>

            {!item.id.startsWith("EQ-00") && (
              <button
                onClick={() => handleDelete(item.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}