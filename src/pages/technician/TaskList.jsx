import { useState } from "react";

const tasks = [
  { id: "T-001", equipment: "MRI Scanner #A12", hospital: "City General Hospital", priority: "High", deadline: "2024-04-15", status: "Pending", description: "Annual calibration and safety check" },
  { id: "T-002", equipment: "Ventilator #B05", hospital: "Apollo Medical Center", priority: "Critical", deadline: "2024-04-12", status: "In Progress", description: "Alarm system malfunction — urgent fix needed" },
  { id: "T-003", equipment: "Defibrillator #C07", hospital: "City General Hospital", priority: "High", deadline: "2024-04-10", status: "In Progress", description: "Replace battery pack and test output" },
  { id: "T-004", equipment: "Infusion Pump #G01", hospital: "Sunrise Hospital", priority: "Medium", deadline: "2024-04-20", status: "Pending", description: "Flow rate calibration" },
  { id: "T-005", equipment: "X-Ray #E01", hospital: "Apollo Medical Center", priority: "Low", deadline: "2024-04-08", status: "Completed", description: "Software firmware update" },
];

const priorityStyle = {
  Critical: "text-red-600 bg-red-50 border-red-200",
  High: "text-orange-600 bg-orange-50 border-orange-200",
  Medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Low: "text-green-600 bg-green-50 border-green-200",
};

const statusStyle = {
  Pending: "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export default function TaskList({ onNavigate }) {
  const [filter, setFilter] = useState("All");

  const filtered = tasks.filter(t => filter === "All" || t.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-500 text-sm mt-0.5">Assigned maintenance & repair tasks</p>
          </div>
          <div className="flex gap-2">
            {["All", "Pending", "In Progress", "Completed"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  filter === f ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Open Tasks", value: tasks.filter(t => t.status !== "Completed").length, color: "text-blue-600" },
            { label: "Critical", value: tasks.filter(t => t.priority === "Critical").length, color: "text-red-600" },
            { label: "Completed", value: tasks.filter(t => t.status === "Completed").length, color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {filtered.map((task) => (
            <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{task.equipment}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${priorityStyle[task.priority]}`}>{task.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusStyle[task.status]}`}>{task.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{task.hospital}</p>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Deadline: {task.deadline}
                  </p>
                </div>
                {task.status !== "Completed" && (
                  <button
                    onClick={() => onNavigate("updatetask")}
                    className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
