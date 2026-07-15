import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllEquipment } from '../../services/EquipmentService';
import { getAllTasks } from '../../services/MaintenanceService';
import { getAllOrders } from '../../services/OrderService';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data lists
  const [equipmentList, setEquipmentList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Computed metrics
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeMaintenance: 0,
    pendingOrders: 0,
    operationalRate: 100,
  });

  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data concurrently
      const [equipmentData, tasksData, ordersData] = await Promise.all([
        getAllEquipment().catch(err => {
          console.error("Error fetching equipment:", err);
          return [];
        }),
        getAllTasks().catch(err => {
          console.error("Error fetching tasks:", err);
          return [];
        }),
        getAllOrders().catch(err => {
          console.error("Error fetching orders:", err);
          return [];
        })
      ]);

      setEquipmentList(equipmentData);
      setTasksList(tasksData);
      setOrdersList(ordersData);

      computeMetrics(equipmentData, tasksData, ordersData);
    } catch (err) {
      console.error("Dashboard initialization error:", err);
      setError("Failed to load real-time dashboard statistics. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const computeMetrics = (equipment, tasks, orders) => {
    const totalEq = equipment.length;
    
    // Active maintenance = tasks where status is IN_PROGRESS or NEEDS_PART
    const activeMnt = tasks.filter(t => {
      const statusStr = String(t.status || '').toUpperCase();
      return statusStr === 'IN_PROGRESS' || statusStr === 'NEEDS_PART' || statusStr === 'IN PROGRESS' || statusStr === 'NEEDS PART';
    }).length;

    // Pending orders = orders where status is pending or confirmed
    const pendingOrd = orders.filter(o => {
      const statusStr = String(o.status || '').toUpperCase();
      return statusStr === 'PENDING' || statusStr === 'CONFIRMED';
    }).length;

    // Operational Rate = % of operational equipment
    const operationalEq = equipment.filter(e => {
      const statusStr = String(e.status || '').toLowerCase();
      return statusStr === 'operational';
    }).length;
    const opRate = totalEq > 0 ? ((operationalEq / totalEq) * 100).toFixed(1) : "100.0";

    setStats({
      totalEquipment: totalEq,
      activeMaintenance: activeMnt,
      pendingOrders: pendingOrd,
      operationalRate: opRate
    });

    // Compute Category Breakdown ratios
    const categories = ["Imaging", "Surgical", "Monitoring", "Laboratory", "Respiratory"];
    const breakdown = categories.map(cat => {
      const count = equipment.filter(e => String(e.category || '').toLowerCase() === cat.toLowerCase()).length;
      const percentage = totalEq > 0 ? Math.round((count / totalEq) * 100) : 0;
      return { category: cat, count, percentage };
    }).sort((a, b) => b.count - a.count);

    setCategoryBreakdown(breakdown);

    // Merge recent activity log dynamically
    const activityLogs = [];

    // Map recent maintenance task events
    tasks.slice(-5).forEach(t => {
      activityLogs.push({
        text: `Task ${t.taskCode || `MNT-${t.id}`} for ${t.equipment || 'Equipment'} status: "${t.status}"`,
        time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent task',
        timestamp: t.createdAt ? new Date(t.createdAt).getTime() : 0,
        type: 'maintenance'
      });
    });

    // Map recent order events
    orders.slice(-5).forEach(o => {
      activityLogs.push({
        text: `Order #${o.orderNumber || o.id} of ${o.equipmentName || 'Asset'} updated to: "${o.status}"`,
        time: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Recent order',
        timestamp: o.createdAt ? new Date(o.createdAt).getTime() : 0,
        type: 'order'
      });
    });

    // Fallback log if no live activity
    if (activityLogs.length === 0) {
      activityLogs.push(
        { text: "MRI Scanner scheduled for calibration", time: "System Demo", type: "maintenance" },
        { text: "Order for Ventilator parts created", time: "System Demo", type: "order" },
        { text: "Defibrillator battery check completed", time: "System Demo", type: "maintenance" }
      );
    } else {
      // Sort to show latest events first
      activityLogs.sort((a, b) => b.timestamp - a.timestamp);
    }

    setActivities(activityLogs.slice(0, 5));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-sans">
        <div className="text-center py-10 px-5 bg-card rounded-3xl border border-subtle shadow-xl max-w-sm w-full">
          <div className="inline-block w-10 h-10 border-4 border-subtle border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-semibold">Analyzing medical asset feeds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-primary relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-50 -z-10 transition-all"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-50 -z-10 transition-all"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              {getGreeting()}, {user?.name || "Hospital Admin"} 👋
            </h1>
            <p className="text-secondary mt-1">Here's your facility overview for today.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3 items-center">
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl border border-subtle transition-all cursor-pointer shadow-sm active:scale-95"
            >
              🔄 Refresh Feeds
            </button>
            <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl shadow-sm border border-subtle">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">System Operational</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/55 rounded-2xl font-semibold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Equipment", value: stats.totalEquipment, icon: "🏥", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/10" },
            { label: "Active Maintenance", value: stats.activeMaintenance, icon: "🔧", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10" },
            { label: "Pending Orders", value: stats.pendingOrders, icon: "📦", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/10" },
            { label: "Operational Health", value: `${stats.operationalRate}%`, icon: "📈", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
          ].map((stat) => (
            <div 
              key={stat.label} 
              className="bg-card/70 backdrop-blur-lg border border-subtle shadow-sm rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-black text-secondary uppercase tracking-widest">{stat.label}</p>
                <span className={`text-2xl p-2 rounded-xl ${stat.bg}`} aria-hidden="true">{stat.icon}</span>
              </div>
              <p className={`text-4xl font-black mt-4 tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Add Equipment", page: "add-equipment", icon: "➕", desc: "New Inventory Item", hospitalOnly: true },
              { label: "Schedule Service", page: "schedule-maintenance", icon: "📅", desc: "Plan Maintenance", hospitalOnly: true },
              { label: "Request Order", page: "request-equipment", icon: "📦", desc: "Place Equipment Order", hospitalOnly: true },
              { label: "View Analytics", page: "analytics", icon: "📊", desc: "BI & Intelligence Hub", hospitalOnly: true },
              { label: "View Inventory", page: "equipment", icon: "📋", desc: "Full Equipment List", hospitalOnly: false },
            ].filter(action => !action.hospitalOnly || user?.role === "hospital").map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.page)}
                className="bg-card border border-subtle hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg rounded-2xl p-5 text-left transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">{action.icon}</span>
                <p className="text-sm font-black text-primary mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-secondary mt-1">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution progress bars */}
          <div className="bg-card border border-subtle shadow-sm rounded-3xl p-6 lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-primary mb-1">Asset Distribution</h3>
              <p className="text-xs text-secondary mb-6">Inventory ratio per medical category.</p>
              
              <div className="space-y-4">
                {categoryBreakdown.map(breakdown => (
                  <div key={breakdown.category}>
                    <div className="flex justify-between items-center text-xs font-bold text-primary mb-1.5">
                      <span>{breakdown.category}</span>
                      <span className="text-secondary">{breakdown.count} units ({breakdown.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${breakdown.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-subtle flex justify-between items-center text-xs text-secondary">
              <span>Operational: {equipmentList.filter(e => String(e.status).toLowerCase() === 'operational').length} units</span>
              <span>Maintenance: {equipmentList.filter(e => String(e.status).toLowerCase() === 'maintenance').length} units</span>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-card border border-subtle shadow-sm rounded-3xl p-6 lg:col-span-2">
            <div className="mb-6">
              <h3 className="font-bold text-lg text-primary">Recent Activity Feed</h3>
              <p className="text-xs text-secondary">Live updates from inventory registers and maintenance tasks.</p>
            </div>

            <div className="space-y-4">
              {activities.map((act, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-subtle last:border-b-0"
                >
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                    act.type === 'maintenance' ? 'bg-amber-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary leading-snug">{act.text}</p>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}