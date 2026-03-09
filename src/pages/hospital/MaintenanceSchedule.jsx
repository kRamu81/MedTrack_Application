import { useState } from "react";

const schedules = [
  { id: "MS-001", equipment: "MRI Scanner #A12", technician: "Rajesh Kumar", date: "2024-04-15", priority: "High", status: "Scheduled", notes: "Annual calibration due" },
  { id: "MS-002", equipment: "Ventilator #B05", technician: "Priya Singh", date: "2024-04-12", priority: "Critical", status: "In Progress", notes: "Alarm malfunction reported" },
  { id: "MS-003", equipment: "Defibrillator #C07", technician: "Arjun Mehta", date: "2024-04-10", priority: "High", status: "In Progress", notes: "Battery replacement needed" },
  { id: "MS-004", equipment: "Ultrasound #D02", technician: "Neha Patel", date: "2024-04-20", priority: "Medium", status: "Scheduled", notes: "Routine quarterly check" },
  { id: "MS-005", equipment: "X-Ray #E01", technician: "Suresh Rao", date: "2024-04-08", priority: "Low", status: "Completed", notes: "Software update applied" },
  { id: "MS-006", equipment: "ECG Machine #F03", technician: "Anita Sharma", date: "2024-04-18", priority: "Medium", status: "Scheduled", notes: "Lead replacement" },
];

const priorityStyle = {
  Critical: "bg-red-100 text-red-700 border border-red-200",
  High: "bg-orange-100 text-orange-700 border border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  Low: "bg-green-100 text-green-700 border border-green-200",
};

const statusStyle = {
  Scheduled: "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export default function MaintenanceSchedule() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Scheduled", "In Progress", "Completed"];

  const filtered = schedules.filter(s => activeTab === "All" || s.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track all planned and ongoing maintenance</p>
          </div>
          <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Schedule
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", count: schedules.length, color: "bg-blue-50 text-blue-700 border-blue-100" },
            { label: "Scheduled", count: schedules.filter(s => s.status === "Scheduled").length, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
            { label: "In Progress", count: schedules.filter(s => s.status === "In Progress").length, color: "bg-purple-50 text-purple-700 border-purple-100" },
            { label: "Completed", count: schedules.filter(s => s.status === "Completed").length, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          ].map((c) => (
            <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{c.label}</p>
              <p className="text-3xl font-bold mt-1">{c.count}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{s.equipment}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{s.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${priorityStyle[s.priority]}`}>{s.priority}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle[s.status]}`}>{s.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {s.technician}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {s.date}
                </span>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 italic">"{s.notes}"</p>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">View Details</button>
                {s.status !== "Completed" && (
                  <button className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Mark Done</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
