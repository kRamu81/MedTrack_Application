// src/pages/hospital/MaintenanceSchedule.jsx
import React, { useState, useEffect } from 'react';

/* ===========================
   BIG TEMPORARY DEMO DATA
   30 Entries for Testing
=========================== */

const DEMO_TASKS = [
  // --- Completed Past Tasks ---
  { id: "MNT-001", equipmentName: "MRI Scanner", maintenanceType: "Preventive", scheduledDate: "2023-10-15", assignedTechnician: "John Doe", status: "Completed" },
  { id: "MNT-002", equipmentName: "CT Scanner", maintenanceType: "Calibration", scheduledDate: "2023-10-20", assignedTechnician: "Sarah Smith", status: "Completed" },
  { id: "MNT-003", equipmentName: "Ventilator A", maintenanceType: "Corrective", scheduledDate: "2023-11-01", assignedTechnician: "Mike Johnson", status: "Completed" },
  { id: "MNT-004", equipmentName: "X-Ray Machine", maintenanceType: "Inspection", scheduledDate: "2023-11-05", assignedTechnician: "Emily Davis", status: "Completed" },
  { id: "MNT-005", equipmentName: "Ultrasound Unit", maintenanceType: "Preventive", scheduledDate: "2023-11-10", assignedTechnician: "Chris Wilson", status: "Completed" },
  { id: "MNT-006", equipmentName: "Defibrillator", maintenanceType: "Battery Check", scheduledDate: "2023-11-12", assignedTechnician: "Jessica Brown", status: "Completed" },
  { id: "MNT-007", equipmentName: "ECG Machine", maintenanceType: "Calibration", scheduledDate: "2023-11-15", assignedTechnician: "Daniel Miller", status: "Completed" },
  { id: "MNT-008", equipmentName: "Infusion Pump", maintenanceType: "Software Update", scheduledDate: "2023-11-18", assignedTechnician: "Sarah Smith", status: "Completed" },
  
  // --- In Progress Tasks ---
  { id: "MNT-009", equipmentName: "MRI Scanner", maintenanceType: "Cooling System Check", scheduledDate: "2023-12-05", assignedTechnician: "John Doe", status: "In Progress" },
  { id: "MNT-010", equipmentName: "Ventilator B", maintenanceType: "Corrective", scheduledDate: "2023-12-06", assignedTechnician: "Mike Johnson", status: "In Progress" },
  { id: "MNT-011", equipmentName: "Anesthesia Machine", maintenanceType: "Preventive", scheduledDate: "2023-12-07", assignedTechnician: "Emily Davis", status: "In Progress" },
  { id: "MNT-012", equipmentName: "Patient Monitor", maintenanceType: "Sensor Replacement", scheduledDate: "2023-12-08", assignedTechnician: "Chris Wilson", status: "In Progress" },
  { id: "MNT-013", equipmentName: "Surgical Table", maintenanceType: "Hydraulic Check", scheduledDate: "2023-12-09", assignedTechnician: "Unassigned", status: "In Progress" },

  // --- Scheduled Future Tasks ---
  { id: "MNT-014", equipmentName: "CT Scanner", maintenanceType: "Preventive", scheduledDate: "2023-12-12", assignedTechnician: "Sarah Smith", status: "Scheduled" },
  { id: "MNT-015", equipmentName: "X-Ray Machine", maintenanceType: "Radiation Check", scheduledDate: "2023-12-13", assignedTechnician: "John Doe", status: "Scheduled" },
  { id: "MNT-016", equipmentName: "Ultrasound Unit", maintenanceType: "Probe Inspection", scheduledDate: "2023-12-14", assignedTechnician: "Jessica Brown", status: "Scheduled" },
  { id: "MNT-017", equipmentName: "Defibrillator", maintenanceType: "Preventive", scheduledDate: "2023-12-15", assignedTechnician: "Daniel Miller", status: "Scheduled" },
  { id: "MNT-018", equipmentName: "ECG Machine", maintenanceType: "Calibration", scheduledDate: "2023-12-16", assignedTechnician: "Emily Davis", status: "Scheduled" },
  { id: "MNT-019", equipmentName: "Infusion Pump 2", maintenanceType: "Preventive", scheduledDate: "2023-12-17", assignedTechnician: "Mike Johnson", status: "Scheduled" },
  { id: "MNT-020", equipmentName: "Autoclave", maintenanceType: "Deep Clean", scheduledDate: "2023-12-18", assignedTechnician: "Unassigned", status: "Scheduled" },
  { id: "MNT-021", equipmentName: "Centrifuge", maintenanceType: "Inspection", scheduledDate: "2023-12-19", assignedTechnician: "Chris Wilson", status: "Scheduled" },
  { id: "MNT-022", equipmentName: "Blood Gas Analyzer", maintenanceType: "Reagent Replace", scheduledDate: "2023-12-20", assignedTechnician: "Sarah Smith", status: "Scheduled" },
  { id: "MNT-023", equipmentName: "Ventilator C", maintenanceType: "Filter Change", scheduledDate: "2023-12-21", assignedTechnician: "John Doe", status: "Scheduled" },
  { id: "MNT-024", equipmentName: "Oxygen Concentrator", maintenanceType: "Inspection", scheduledDate: "2023-12-22", assignedTechnician: "Jessica Brown", status: "Scheduled" },
  { id: "MNT-025", equipmentName: "Surgical Light", maintenanceType: "Bulb Check", scheduledDate: "2023-12-23", assignedTechnician: "Daniel Miller", status: "Scheduled" },
  { id: "MNT-026", equipmentName: "Nebulizer", maintenanceType: "Cleaning", scheduledDate: "2023-12-24", assignedTechnician: "Emily Davis", status: "Scheduled" },
  { id: "MNT-027", equipmentName: "Endoscope", maintenanceType: "Leak Test", scheduledDate: "2023-12-25", assignedTechnician: "Unassigned", status: "Scheduled" },
  { id: "MNT-028", equipmentName: "Dialysis Machine", maintenanceType: "Preventive", scheduledDate: "2023-12-26", assignedTechnician: "Mike Johnson", status: "Scheduled" },
  { id: "MNT-029", equipmentName: "Thermometer (Digital)", maintenanceType: "Calibration", scheduledDate: "2023-12-27", assignedTechnician: "Chris Wilson", status: "Scheduled" },
  { id: "MNT-030", equipmentName: "Wheelchair Scale", maintenanceType: "Calibration", scheduledDate: "2023-12-28", assignedTechnician: "Sarah Smith", status: "Scheduled" },
];

export default function MaintenanceSchedule({ onNavigate }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // 1. Try to load from localStorage
    const storedTasks = localStorage.getItem("medtrack_maintenance");
    const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];

    // 2. Logic: If user has created tasks, MERGE them with Demo data
    // If you want to ONLY show user data when it exists, use: 
    // if (parsedTasks.length > 0) setTasks(parsedTasks); else setTasks(DEMO_TASKS);
    
    if (parsedTasks.length > 0) {
       // Combining demo data with user-created data for a full view
       setTasks([...DEMO_TASKS, ...parsedTasks]);
    } else {
       setTasks(DEMO_TASKS);
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Style configurations for Status Badges
  const statusStyles = {
    "Scheduled": "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Completed": "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Maintenance Schedule</h1>
              <p className="text-sm text-slate-500 mt-1">Managing {tasks.length} tasks</p>
            </div>
            <button
              onClick={() => onNavigate('schedule-maintenance')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              + New Schedule
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">🛠️</span>
                        <p className="font-medium">No maintenance tasks scheduled yet.</p>
                        <button 
                          onClick={() => onNavigate('schedule-maintenance')}
                          className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-semibold"
                        >
                          Schedule your first task
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      {/* Equipment Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">🩺</span>
                          <div>
                            <span className="font-medium text-slate-800 block">{task.equipmentName}</span>
                            <span className="text-xs text-slate-400">{task.id}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Maintenance Type */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {task.maintenanceType}
                      </td>
                      
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 font-medium">{formatDate(task.scheduledDate)}</div>
                      </td>
                      
                      {/* Technician */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {task.assignedTechnician ? task.assignedTechnician.charAt(0) : "?"}
                          </div>
                          {task.assignedTechnician || 'Unassigned'}
                        </div>
                      </td>
                      
                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[task.status] || statusStyles.Scheduled}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}