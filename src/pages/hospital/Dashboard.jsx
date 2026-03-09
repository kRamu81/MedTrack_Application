import { useAuth } from "../../context/AuthContext";

const stats = [
  { label: "Total Equipment", value: "248", change: "+12", positive: true, icon: "🏥" },
  { label: "Active Maintenance", value: "17", change: "+3", positive: false, icon: "🔧" },
  { label: "Pending Orders", value: "9", change: "-2", positive: true, icon: "📦" },
  { label: "Operational Rate", value: "94.2%", change: "+1.4%", positive: true, icon: "📈" },
];

const recentActivities = [
  { id: 1, type: "maintenance", text: "MRI Scanner #A12 scheduled for calibration", time: "2 hrs ago", status: "scheduled" },
  { id: 2, type: "order", text: "Order #5502 for Ventilator parts shipped", time: "5 hrs ago", status: "shipped" },
  { id: 3, type: "alert", text: "Defibrillator #C07 battery below threshold", time: "1 day ago", status: "alert" },
  { id: 4, type: "completed", text: "Ultrasound Machine #B03 maintenance complete", time: "2 days ago", status: "completed" },
  { id: 5, type: "order", text: "Order #5489 for ICU monitors delivered", time: "3 days ago", status: "delivered" },
];

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700",
  shipped: "bg-yellow-100 text-yellow-700",
  alert: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

const equipmentStatus = [
  { name: "MRI Scanner", count: 4, operational: 3, dept: "Radiology" },
  { name: "Ventilator", count: 28, operational: 26, dept: "ICU" },
  { name: "Defibrillator", count: 15, operational: 14, dept: "Emergency" },
  { name: "Ultrasound", count: 12, operational: 12, dept: "Cardiology" },
  { name: "X-Ray Machine", count: 8, operational: 7, dept: "Radiology" },
];

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your equipment overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-xs font-semibold mt-2 ${stat.positive ? "text-emerald-600" : "text-red-500"}`}>
                {stat.change} from last month
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Status */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-gray-900">Equipment by Department</h2>
              <button onClick={() => onNavigate("equipment")} className="text-sm text-blue-600 hover:underline font-medium">View all →</button>
            </div>
            <div className="space-y-3">
              {equipmentStatus.map((eq) => {
                const pct = Math.round((eq.operational / eq.count) * 100);
                return (
                  <div key={eq.name} className="flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-medium text-gray-800">{eq.name}</p>
                      <p className="text-xs text-gray-400">{eq.dept}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 90 ? "bg-blue-500" : "bg-yellow-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <span className="text-sm font-semibold text-gray-700">{eq.operational}/{eq.count}</span>
                      <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{act.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{act.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[act.status]}`}>{act.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Add Equipment", page: "equipment", icon: "➕", color: "blue" },
            { label: "Schedule Maintenance", page: "maintenance", icon: "📅", color: "purple" },
            { label: "View Orders", page: "orders", icon: "📋", color: "orange" },
            { label: "Generate Report", page: "dashboard", icon: "📊", color: "green" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl p-4 text-left transition-all group"
            >
              <span className="text-2xl">{action.icon}</span>
              <p className="text-sm font-semibold text-gray-700 mt-2 group-hover:text-blue-600 transition-colors">{action.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
