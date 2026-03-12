import React from 'react';
import { useAuth } from '../../context/AuthContext';

// --- Mock Data for Stats ---
const stats = [
  { label: "Total Equipment", value: "248", icon: "🏥", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Maintenance", value: "17", icon: "🔧", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Pending Orders", value: "9", icon: "📦", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Operational Rate", value: "94.2%", icon: "📈", color: "text-emerald-600", bg: "bg-emerald-50" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-50 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name || "Hospital Admin"} 👋
            </h1>
            <p className="text-slate-500 mt-1">Here's your facility overview for today.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">System Operational</span>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-white/70 backdrop-blur-lg border border-white shadow-sm rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
              </div>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions - Specific to Member 9 Requirements */}
        <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: "Add Equipment", page: "add-equipment", icon: "➕", desc: "New Inventory Item" },
                { label: "Schedule Service", page: "schedule-maintenance", icon: "📅", desc: "Plan Maintenance" },
                { label: "Request Order", page: "request-equipment", icon: "📦", desc: "Place Equipment Order" },
                { label: "View Inventory", page: "equipment", icon: "📋", desc: "Full Equipment List" },
            ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.page)}
                  className="bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg rounded-xl p-5 text-left transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">{action.icon}</span>
                  <p className="text-sm font-semibold text-slate-700 mt-3 group-hover:text-blue-600 transition-colors">
                      {action.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                </button>
            ))}
            </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Recent Activity</h3>
              <p className="text-sm text-slate-300 opacity-75">Live system log</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { text: "MRI Scanner #A12 scheduled for calibration", time: "2 hrs ago" },
              { text: "Order #5502 for Ventilator parts shipped", time: "5 hrs ago" },
              { text: "Defibrillator #C07 battery replaced", time: "1 day ago" },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 bg-blue-400"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-100 leading-snug">{act.text}</p>
                  <span className="text-xs text-slate-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}