import React, { useState, useEffect } from 'react';

export default function MaintenanceSchedule({ onNavigate }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem("medtrack_maintenance");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusStyles = {
    "Scheduled": "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Completed": "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Maintenance Schedule</h1>
              <p className="text-sm text-slate-500 mt-1">Managing {tasks.length} tasks</p>
            </div>
            <button
              onClick={() => onNavigate('schedule-maintenance')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              + New Schedule
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    No maintenance tasks scheduled yet.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{task.equipmentName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.maintenanceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{formatDate(task.scheduledDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.assignedTechnician || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusStyles[task.status] || statusStyles.Scheduled}`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}