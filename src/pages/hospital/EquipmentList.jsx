import React, { useEffect, useState } from "react";
import {
  getAllEquipment,
  deleteEquipment,
  getEquipmentById,
  importEquipmentCsv,
  getEquipmentQrCode,
} from "../../services/EquipmentService";
import { useAuth } from "../../context/AuthContext";

/* ===========================
   DEFAULT PUBLIC EQUIPMENT
   Visible to ALL users
=========================== */
const PUBLIC_EQUIPMENT = [
  {
    id: "EQ-001",
    name: "MRI Scanner",
    model: "GE Signa HDxt",
    department: "Radiology",
    status: "Operational",
  },
  {
    id: "EQ-002",
    name: "Ventilator",
    model: "Philips Trilogy",
    department: "ICU",
    status: "Operational",
  },
  {
    id: "EQ-003",
    name: "X-Ray Machine",
    model: "Siemens AX",
    department: "Emergency",
    status: "Maintenance",
  },
  {
    id: "EQ-004",
    name: "Ultrasound",
    model: "Sonosite Edge",
    department: "Cardiology",
    status: "Operational",
  },
  {
    id: "EQ-005",
    name: "First Aid Kit",
    model: "FA-PRO-500",
    department: "Emergency",
    status: "Operational",
  },
  {
    id: "EQ-006",
    name: "Stethoscope",
    model: "ST-CLASSIC",
    department: "Cardiology",
    status: "Operational",
  },
  {
    id: "EQ-007",
    name: "Blood Pressure Monitor",
    model: "BP-AUTO",
    department: "General Ward",
    status: "Operational",
  },
  {
    id: "EQ-008",
    name: "Digital Thermometer",
    model: "TEMP-001",
    department: "Nursing Station",
    status: "Operational",
  },
];

/* ===========================
   EQUIPMENT IMAGES
=========================== */
const EQUIPMENT_IMAGES = {
  mri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl7fPv3AGiTlskFg0Ehetmi5OPa-grbbDihw&s",
  ventilator: "https://cpimg.tistatic.com/08907627/b/4/Ventilator-NICU-Eqp.jpg",
  "x-ray": "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c",
  ultrasound: "https://images.unsplash.com/photo-1516549655169-df83a0774514",
  stethoscope: "https://m.media-amazon.com/images/I/51i5-G3clqS.jpg",
  default: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
};

export default function EquipmentList({ onNavigate }) {
  const { user } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [detailsError, setDetailsError] = useState(null);

  // CSV Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [importError, setImportError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // QR Code States
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const downloadCsvTemplate = () => {
    const headers = "Name,Model,Serial Number,Department,Category,Status,Purchase Date\n";
    const sampleRow = "MRI Scanner,GE Signa HDxt,SN-9281,Radiology,Imaging,Operational,2025-06-12\n";
    const blob = new Blob([headers + sampleRow], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "medtrack_equipment_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        setImportFile(file);
        setImportError(null);
      } else {
        setImportError("Please upload a valid .csv file.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        setImportFile(file);
        setImportError(null);
      } else {
        setImportError("Please upload a valid .csv file.");
      }
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setImportError("Please select a CSV file first.");
      return;
    }
    setImporting(true);
    setImportSummary(null);
    setImportError(null);
    try {
      const summary = await importEquipmentCsv(importFile);
      setImportSummary(summary);
      if (summary.successCount > 0) {
        fetchEquipment();
      }
    } catch (err) {
      console.error("Import failed:", err);
      setImportError(err.response?.data?.message || "Failed to process import. Please check template columns.");
    } finally {
      setImporting(false);
    }
  };

  const mergeEquipment = (fetchedEquipment = []) => {
    const equipmentMap = new Map();

    PUBLIC_EQUIPMENT.forEach((item) => {
      equipmentMap.set(String(item.id), item);
    });

    fetchedEquipment.forEach((item) => {
      equipmentMap.set(String(item.id), item);
    });

    return Array.from(equipmentMap.values());
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await getAllEquipment();
      setEquipment(Array.isArray(data) ? mergeEquipment(data) : PUBLIC_EQUIPMENT);
    } catch (error) {
      console.error("Failed to fetch equipment", error);
      setEquipment(PUBLIC_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedEquipmentId(id);
    setDetailsLoading(true);
    setDetailsError(null);
    setEquipmentDetails(null);
    setQrCode(null);
    setQrError(null);

    const isFallbackItem = String(id).startsWith("EQ-00");

    try {
      const publicEquipmentDetails = PUBLIC_EQUIPMENT.find(
        (item) => String(item.id) === String(id)
      );

      if (publicEquipmentDetails) {
        setEquipmentDetails(publicEquipmentDetails);
      } else {
        const data = await getEquipmentById(id);
        setEquipmentDetails(data);
      }

      // Fetch QR Code if it's a database item
      if (!isFallbackItem) {
        setQrLoading(true);
        try {
          const qrData = await getEquipmentQrCode(id);
          setQrCode(qrData.qrCode);
        } catch (err) {
          console.error("Failed to load QR code", err);
          setQrError("QR Code generation failed");
        } finally {
          setQrLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching equipment details:", error);
      const errMsg =
        error.response?.data?.message || `Equipment not found with id: ${id}`;
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

  const getImage = (name = "") => {
    const lower = name.toLowerCase();

    for (const key in EQUIPMENT_IMAGES) {
      if (lower.includes(key)) {
        return EQUIPMENT_IMAGES[key];
      }
    }

    return EQUIPMENT_IMAGES.default;
  };

  const departmentOptions = [
    "All",
    ...new Set(equipment.map((item) => item.department).filter(Boolean)),
  ];

  const statusOptions = [
    "All",
    ...new Set(equipment.map((item) => item.status).filter(Boolean)),
  ];

  const filtered = equipment.filter((item) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      item.name?.toLowerCase().includes(searchValue) ||
      String(item.id).toLowerCase().includes(searchValue) ||
      item.model?.toLowerCase().includes(searchValue) ||
      item.department?.toLowerCase().includes(searchValue) ||
      item.status?.toLowerCase().includes(searchValue);

    const matchesDepartment =
      departmentFilter === "All" || item.department === departmentFilter;

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-surface p-10 font-sans text-primary">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-5">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 m-0">
          Medical Equipment Inventory
        </h1>

        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by name, ID, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-5 py-3 rounded-lg border border-subtle bg-surface text-primary w-72 text-base shadow-sm outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-5 py-3 rounded-lg border border-subtle bg-surface text-primary text-base shadow-sm outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department === "All" ? "All Departments" : department}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-5 py-3 rounded-lg border border-subtle bg-surface text-primary text-base shadow-sm outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>

          {user?.role === "hospital" && (
            <div className="flex gap-2">
              <button
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-subtle px-6 py-3 rounded-lg text-base font-semibold cursor-pointer shadow-sm transition-colors"
                onClick={() => {
                  setImportFile(null);
                  setImportSummary(null);
                  setImportError(null);
                  setShowImportModal(true);
                }}
              >
                📥 Bulk Import
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer shadow-md transition-colors"
                onClick={() => onNavigate("add-equipment")}
              >
                + Add Equipment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Summary */}
      <div className="mb-6 rounded-xl border border-subtle bg-card p-4 shadow-sm">
        <p className="text-primary font-semibold">
          Showing {filtered.length} of {equipment.length} equipment items
        </p>
        <p className="text-secondary text-sm mt-1">
          Department: {departmentFilter === "All" ? "All Departments" : departmentFilter}
          {" | "}
          Status: {statusFilter === "All" ? "All Statuses" : statusFilter}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10 text-secondary font-semibold">
          Loading equipment inventory...
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-10 text-secondary">
          No equipment items match your current search or filters.
        </div>
      )}

      {/* Grid Section */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-xl overflow-hidden shadow-sm transition-all border border-subtle flex flex-col ${
                hoveredCard === item.id ? "transform -translate-y-1 shadow-lg" : ""
              }`}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <img
                src={getImage(item.name)}
                alt={item.name}
                className="w-full h-48 object-cover border-b border-subtle"
              />

              <div className="p-5 flex-grow flex flex-col">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase inline-block mb-3 w-fit ${
                    item.status === "Operational"
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {item.status}
                </div>

                <h3 className="text-xl font-semibold mb-2 text-primary">
                  {item.name}
                </h3>

                <div className="text-sm text-secondary mb-1.5 flex items-center">
                  <span>
                    <strong>ID:</strong> {item.id}
                  </span>
                </div>

                <div className="text-sm text-secondary mb-1.5 flex items-center">
                  <span>
                    <strong>Department:</strong> {item.department || "N/A"}
                  </span>
                </div>

                <div className="text-sm text-secondary mb-1.5 flex items-center">
                  <span>
                    <strong>Model:</strong> {item.model || "N/A"}
                  </span>
                </div>

                <div className="mt-auto pt-4 border-t border-subtle flex justify-between items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(item.id)}
                    className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer font-semibold text-sm transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => onNavigate("schedule-maintenance")}
                    className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer font-semibold text-sm transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    Schedule Service
                  </button>

                  {/* Hide delete button for default public items */}
                  {user?.role === "hospital" &&
                    !String(item.id).startsWith("EQ-00") && (
                      <>
                        <button
                          onClick={() => onNavigate("edit-equipment", item.id)}
                          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg cursor-pointer font-semibold text-sm transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer font-semibold text-sm transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                          Delete
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment Details Modal */}
      {selectedEquipmentId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-card rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-subtle">
            <button
              onClick={() => setSelectedEquipmentId(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-hover text-secondary border-none flex items-center justify-center text-xl font-bold cursor-pointer transition-colors hover:bg-subtle"
            >
              &times;
            </button>

            {detailsLoading && (
              <div className="text-center py-10 px-5">
                <div className="inline-block w-10 h-10 border-4 border-subtle border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-secondary font-semibold">
                  Fetching equipment details...
                </p>
              </div>
            )}

            {detailsError && (
              <div className="text-center p-5">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-primary mb-2">Not Found</h3>
                <p className="text-red-500 text-sm mb-6 font-medium">
                  {detailsError}
                </p>
                <button
                  onClick={() => setSelectedEquipmentId(null)}
                  className="bg-red-500 hover:bg-red-600 text-white border-none py-3 px-6 rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            )}

            {equipmentDetails && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                    ⚙️
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-primary m-0">
                      {equipmentDetails.name}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block mt-1.5 ${
                        equipmentDetails.status === "Operational"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}
                    >
                      {equipmentDetails.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-hover p-5 rounded-2xl mb-6">
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                      Equipment ID
                    </span>
                    <p className="text-[15px] text-primary font-bold m-1 font-mono">
                      {equipmentDetails.id}
                    </p>
                  </div>
                  <div className="w-full h-px bg-subtle"></div>
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                      Model Details
                    </span>
                    <p className="text-[15px] text-primary font-semibold m-1">
                      {equipmentDetails.model || "N/A"}
                    </p>
                  </div>
                  <div className="w-full h-px bg-subtle"></div>
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                      Department / Location
                    </span>
                    <p className="text-[15px] text-primary font-semibold m-1">
                      {equipmentDetails.department || "N/A"}
                    </p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="mt-6 mb-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-subtle flex flex-col items-center justify-center gap-3">
                  <span className="text-[11px] text-secondary font-bold uppercase tracking-wider text-center">
                    Physical Asset QR Tag
                  </span>
                  {qrLoading && (
                    <div className="w-32 h-32 flex items-center justify-center border border-dashed border-subtle rounded-xl bg-surface">
                      <div className="w-6 h-6 border-2 border-subtle border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                  {qrError && (
                    <div className="w-32 h-32 flex flex-col items-center justify-center border border-dashed border-red-200 text-red-500 text-xs text-center p-2 rounded-xl bg-red-50/50">
                      <span>⚠️</span>
                      <span className="mt-1 font-semibold">{qrError}</span>
                    </div>
                  )}
                  {qrCode && (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <img
                        src={`data:image/png;base64,${qrCode}`}
                        alt="Equipment QR Code"
                        className="w-40 h-40 object-contain border border-subtle p-2 rounded-xl bg-white shadow-sm"
                      />
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `data:image/png;base64,${qrCode}`;
                          link.download = `QR-${equipmentDetails.name.replace(/\s+/g, "-")}-${equipmentDetails.id}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg cursor-pointer text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        📥 Download QR Tag
                      </button>
                    </div>
                  )}
                  {!qrCode && !qrLoading && !qrError && (
                    <span className="text-xs text-slate-400 font-medium">QR code not available for default public items</span>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedEquipmentId(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-7 rounded-xl cursor-pointer font-bold text-[15px] shadow-sm transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-card rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative border border-subtle">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-hover text-secondary border-none flex items-center justify-center text-xl font-bold cursor-pointer transition-colors hover:bg-subtle"
            >
              &times;
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                📥
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-primary m-0">
                  Bulk CSV Import
                </h2>
                <p className="text-secondary text-sm mt-1">
                  Onboard multiple medical assets in a single batch.
                </p>
              </div>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                  dragActive ? "border-blue-600 bg-blue-50/20" : "border-subtle hover:bg-hover"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("csv-file-input").click()}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="text-4xl">📊</span>
                {importFile ? (
                  <div className="text-center">
                    <p className="text-primary font-bold text-base">{importFile.name}</p>
                    <p className="text-secondary text-xs mt-1">{(importFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-primary font-bold text-sm">Drag and drop your CSV file here, or click to browse</p>
                    <p className="text-secondary text-xs mt-1">Only .csv files are supported</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-hover p-4 rounded-xl text-sm">
                <span className="text-secondary font-medium">Need the correct column structure?</span>
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="text-blue-600 dark:text-blue-400 font-bold border-none bg-transparent hover:underline cursor-pointer flex items-center gap-1"
                >
                  📥 Download CSV Template
                </button>
              </div>

              {importError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold">
                  ⚠️ {importError}
                </div>
              )}

              {importSummary && (
                <div className="border border-subtle rounded-2xl p-5 bg-hover space-y-4 max-h-60 overflow-y-auto">
                  <h4 className="text-base font-bold text-primary m-0 flex items-center gap-2">
                    📊 Import Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-3 rounded-xl text-center">
                      <span className="text-emerald-600 dark:text-emerald-400 text-2xl font-extrabold">{importSummary.successCount}</span>
                      <p className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mt-1 mb-0">Succeeded</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 p-3 rounded-xl text-center">
                      <span className="text-rose-600 dark:text-rose-400 text-2xl font-extrabold">{importSummary.failureCount}</span>
                      <p className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold mt-1 mb-0">Failed</p>
                    </div>
                  </div>

                  {importSummary.failures && importSummary.failures.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs text-secondary font-bold uppercase tracking-wider">Failed Row Log</span>
                      <div className="mt-2 space-y-2">
                        {importSummary.failures.map((f, i) => (
                          <div key={i} className="text-xs border-b border-subtle pb-2 last:border-none">
                            <div className="flex justify-between font-bold text-red-600">
                              <span>Row {f.rowNumber}</span>
                              <span>{f.reason}</span>
                            </div>
                            <code className="block mt-1 text-slate-500 bg-surface p-1 rounded font-mono overflow-x-auto truncate">
                              {f.rowData}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-3 text-secondary font-bold hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl border-none cursor-pointer shadow-md transition-colors disabled:opacity-50"
                >
                  {importing ? "Processing..." : "Start Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
