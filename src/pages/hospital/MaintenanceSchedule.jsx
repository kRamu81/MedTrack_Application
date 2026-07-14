// src/pages/hospital/MaintenanceSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllTasks, exportTasksToICal } from '../../services/MaintenanceService';

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getAllTasks();
      if (Array.isArray(data) && data.length > 0) {
        // Map backend task structure to match the component keys (equipmentName, scheduledDate)
        const mapped = data.map(t => ({
          id: t.taskCode || `MNT-${t.id}`,
          equipmentName: t.equipment || "N/A",
          maintenanceType: t.maintenanceType || "N/A",
          scheduledDate: t.deadline || "",
          assignedTechnician: t.assignedTechnician || "Unassigned",
          status: t.status ? t.status.getDisplayName ? t.status.getDisplayName() : t.status : "Scheduled"
        }));
        setTasks(mapped);
      } else {
        loadLocalTasks();
      }
    } catch (err) {
      console.error("Failed to load tasks from backend, using local/demo:", err);
      loadLocalTasks();
    }
  };

  const loadLocalTasks = () => {
    const storedTasks = localStorage.getItem("medtrack_maintenance");
    const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
    if (parsedTasks.length > 0) {
      setTasks([...DEMO_TASKS, ...parsedTasks]);
    } else {
      setTasks(DEMO_TASKS);
    }
  };

  const handleExportICal = async () => {
    setExporting(true);
    try {
      const icalContent = await exportTasksToICal();
      const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "medtrack_maintenance.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("iCal export failed:", err);
      alert("Failed to export iCal feed. Please make sure you are logged in.");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Style configurations for Status Badges
  const statusStyles = {
    "Scheduled": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    "Completed": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Section */}
      <header className="bg-card border-b border-subtle sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-primary">Maintenance Schedule</h1>
              <p className="text-sm text-secondary mt-1">Managing {tasks.length} tasks</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportICal}
                disabled={exporting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg shadow-sm transition-colors border border-subtle flex items-center gap-1.5 cursor-pointer"
              >
                📅 {exporting ? "Exporting..." : "Export iCal Feed"}
              </button>
              {user?.role === "hospital" && (
                <button
                  onClick={() => onNavigate('schedule-maintenance')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  + New Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-sm border border-subtle overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle">
              <thead className="bg-surface border-b border-subtle">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle bg-card">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-secondary">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">🛠️</span>
                        <p className="font-medium">No maintenance tasks scheduled yet.</p>
                        <button 
                          onClick={() => onNavigate('schedule-maintenance')}
                          className="mt-4 text-teal-600 hover:text-teal-700 dark:hover:text-teal-500 text-sm font-semibold"
                        >
                          Schedule your first task
                        </button>
                        {user?.role === "hospital" && (
                          <button 
                            onClick={() => onNavigate('schedule-maintenance')}
                            className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-semibold"
                          >
                            Schedule your first task
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-hover transition-colors">
                      {/* Equipment Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">🩺</span>
                          <div>
                            <span className="font-medium text-primary block">{task.equipmentName}</span>
                            <span className="text-xs text-secondary">{task.id}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Maintenance Type */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {task.maintenanceType}
                      </td>
                      
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary font-medium">{formatDate(task.scheduledDate)}</div>
                      </td>
                      
                      {/* Technician */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-hover flex items-center justify-center text-xs font-bold text-secondary border border-subtle">
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