import { useState } from "react";

const equipment = [
  { id: "EQ-001", name: "MRI Scanner", model: "Siemens Magnetom", dept: "Radiology", status: "Operational", lastService: "2024-01-10", nextService: "2024-07-10" },
  { id: "EQ-002", name: "Ventilator", model: "Philips Respironics", dept: "ICU", status: "Operational", lastService: "2024-02-05", nextService: "2024-05-05" },
  { id: "EQ-003", name: "Defibrillator", model: "Zoll AED Plus", dept: "Emergency", status: "Maintenance", lastService: "2024-01-20", nextService: "2024-04-20" },
  { id: "EQ-004", name: "Ultrasound", model: "GE Logiq E9", dept: "Cardiology", status: "Operational", lastService: "2024-03-01", nextService: "2024-09-01" },
  { id: "EQ-005", name: "X-Ray Machine", model: "Canon Safire III", dept: "Radiology", status: "Operational", lastService: "2024-02-15", nextService: "2024-08-15" },
  { id: "EQ-006", name: "ECG Machine", model: "Philips PageWriter", dept: "Cardiology", status: "Retired", lastService: "2023-11-01", nextService: "N/A" },
  { id: "EQ-007", name: "Infusion Pump", model: "BD Alaris", dept: "ICU", status: "Operational", lastService: "2024-03-10", nextService: "2024-06-10" },
  { id: "EQ-008", name: "Patient Monitor", model: "Mindray BeneView", dept: "Surgery", status: "Maintenance", lastService: "2024-01-25", nextService: "2024-04-25" },
];

const statusStyle = {
  Operational: "bg-emerald-100 text-emerald-700",
  Maintenance: "bg-yellow-100 text-yellow-700",
  Retired: "bg-gray-100 text-gray-500",
};

export default function EquipmentList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = equipment.filter((e) =>
    (filter === "All" || e.status === filter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipment List</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage all registered medical equipment</p>
          </div>
          <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Equipment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment, department, ID..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {["All", "Operational", "Maintenance", "Retired"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  filter === s ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["ID", "Equipment Name", "Model", "Department", "Status", "Last Service", "Next Service", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((eq) => (
                  <tr key={eq.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{eq.id}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{eq.name}</td>
                    <td className="px-5 py-4 text-gray-600">{eq.model}</td>
                    <td className="px-5 py-4 text-gray-600">{eq.dept}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[eq.status]}`}>{eq.status}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{eq.lastService}</td>
                    <td className="px-5 py-4 text-gray-500">{eq.nextService}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                        <button className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🔍</p>
                <p className="font-medium">No equipment found</p>
              </div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <p className="text-xs text-gray-500">Showing {filtered.length} of {equipment.length} records</p>
          </div>
        </div>
      </div>
    </div>
  );
}
