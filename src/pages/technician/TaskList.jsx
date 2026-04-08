import { useState, useEffect } from "react";
import { getAllTasks } from "../../services/MaintenanceService";

export default function TaskList({ onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={fetchTasks}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
          <p className="text-gray-500">Manage and update your maintenance tasks</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-500 block">Total Tasks</span>
            <span className="text-xl font-bold text-primary">{tasks.length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-500 block">Pending</span>
            <span className="text-xl font-bold text-orange-500">
              {tasks.filter(t => t.status === 'Pending').length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={task.image || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"} 
                alt={task.equipment}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md ${
                  task.priority === 'Critical' ? 'bg-red-500/90 text-white' :
                  task.priority === 'High' ? 'bg-orange-500/90 text-white' :
                  'bg-blue-500/90 text-white'
                }`}>
                  {task.priority}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{task.id}</span>
                <h3 className="text-white font-bold text-lg leading-tight">{task.equipment}</h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-medium">{task.hospital}</span>
              </div>

              <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">
                {task.description}
              </p>

              <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Deadline</span>
                  <span className={`text-sm font-semibold ${
                    new Date(task.deadline) < new Date() ? 'text-red-500' : 'text-gray-900'
                  }`}>
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => onNavigate('update-task', task)}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                    task.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
                  }`}
                >
                  {task.status === 'Completed' ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  ) : task.status === 'In Progress' ? 'Update Task' : 'Start Task'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center mt-8">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">No tasks assigned</h3>
          <p className="text-gray-500">You're all caught up! New assignments will appear here.</p>
        </div>
      )}
    </div>
  );
}
