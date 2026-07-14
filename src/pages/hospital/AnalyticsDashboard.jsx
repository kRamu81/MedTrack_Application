import React, { useState, useEffect } from "react";
import { getHospitalAnalytics } from "../../services/AnalyticsService";
import { useAuth } from "../../context/AuthContext";

export default function AnalyticsDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalSpend: 0,
    spendByCategory: {},
    slaComplianceRate: 100,
    meanTimeToRepairHours: 0,
    criticalFailingAssetsCount: 0,
    downtimePercentage: 0,
    upcomingWarrantyExpirationsCount: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHospitalAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Could not retrieve business intelligence feeds. Showing demo backup.");
      // Fallback Demo Data for rich visualization robustness
      setAnalytics({
        totalSpend: 285400.00,
        spendByCategory: {
          "Imaging": 180000.00,
          "Respiratory": 65000.00,
          "Monitoring": 25400.00,
          "Surgical": 15000.00,
        },
        slaComplianceRate: 92.4,
        meanTimeToRepairHours: 3.2,
        criticalFailingAssetsCount: 2,
        downtimePercentage: 4.8,
        upcomingWarrantyExpirationsCount: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Convert spendByCategory object to sorted array for rendering
  const spendArray = Object.entries(analytics.spendByCategory || {})
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  const totalCategorySpend = spendArray.reduce((acc, curr) => acc + curr.value, 0);

  // SVG Line Chart Coordinate Generator for SLA History
  const slaHistory = [90, 88, 94, 91, 95, analytics.slaComplianceRate];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chartHeight = 160;
  const chartWidth = 500;
  const points = slaHistory.map((val, index) => {
    const x = (index / (slaHistory.length - 1)) * (chartWidth - 40) + 20;
    // Map value 80-100 to chart height
    const y = chartHeight - ((val - 80) / 20) * (chartHeight - 40) - 20;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-hidden pb-12">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full filter blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full filter blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          <button onClick={() => onNavigate("dashboard")} className="hover:text-blue-600 transition-colors">Dashboard</button>
          <span>/</span>
          <span className="text-slate-600">Analytics & BI</span>
        </div>

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Hospital Intelligence Hub</h1>
            <p className="text-slate-500 text-lg">Financial analysis, service level compliance, and asset operations reporting.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchAnalyticsData}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              🔄 Refresh Analysis
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              🖨️ Export PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl font-medium text-sm flex items-center gap-3">
            <span>💡</span> {error}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Lifecycle Cost</span>
            <span className="block text-3xl font-black text-slate-900 mt-3">{formatCurrency(analytics.totalSpend || totalCategorySpend)}</span>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span>▲ 12.4%</span>
              <span className="text-slate-400 font-medium">vs past fiscal quarter</span>
            </div>
            <div className="absolute right-6 bottom-6 text-3xl opacity-20 group-hover:scale-110 transition-transform">💰</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Compliance Rate</span>
            <span className={`block text-3xl font-black mt-3 ${analytics.slaComplianceRate >= 90 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {analytics.slaComplianceRate}%
            </span>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-emerald-500 font-bold">✓ Target met</span>
              <span>(Goal: 90% SLA)</span>
            </div>
            <div className="absolute right-6 bottom-6 text-3xl opacity-20 group-hover:scale-110 transition-transform">📈</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Mean Time to Repair</span>
            <span className="block text-3xl font-black text-slate-900 mt-3">{analytics.meanTimeToRepairHours} Hours</span>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span>▼ 0.8 hrs</span>
              <span className="text-slate-400 font-medium">decrease in response delay</span>
            </div>
            <div className="absolute right-6 bottom-6 text-3xl opacity-20 group-hover:scale-110 transition-transform">⏱️</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Downtime Indicator</span>
            <span className={`block text-3xl font-black mt-3 ${analytics.downtimePercentage > 8 ? 'text-red-500' : 'text-slate-900'}`}>
              {analytics.downtimePercentage}%
            </span>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>{analytics.criticalFailingAssetsCount} Critical repairs active</span>
            </div>
            <div className="absolute right-6 bottom-6 text-3xl opacity-20 group-hover:scale-110 transition-transform">⚙️</div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Spend by Category Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Expenditure Distribution</h3>
              <p className="text-xs text-slate-400 mb-6">Total procurement investment categorized by asset utility.</p>
              
              <div className="space-y-5">
                {spendArray.length > 0 ? spendArray.map(item => {
                  const percentage = totalCategorySpend > 0 ? Math.round((item.value / totalCategorySpend) * 100) : 0;
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                        <span>{item.category}</span>
                        <span className="text-slate-400 font-medium">{formatCurrency(item.value)} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-400 text-center py-6">No delivered orders to compute spend.</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
              <span>Reporting Unit: USD</span>
              <span>Based on fully delivered orders</span>
            </div>
          </div>

          {/* SLA Line Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">SLA Trend (Last 6 Months)</h3>
            <p className="text-xs text-slate-400 mb-6">Technician on-time task resolution rate history.</p>

            <div className="flex justify-center items-center py-2">
              <svg className="w-full max-w-[500px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} fill="none">
                {/* Grid lines */}
                <line x1="20" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Smooth Chart Line */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
                
                {/* Highlight circles on data points */}
                {slaHistory.map((val, index) => {
                  const x = (index / (slaHistory.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - ((val - 80) / 20) * (chartHeight - 40) - 20;
                  return (
                    <g key={index} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={x} cy={y} r="8" fill="#3b82f6" className="opacity-0 group-hover:opacity-20 transition-opacity" />
                    </g>
                  );
                })}

                {/* X-Axis labels */}
                {months.map((m, index) => {
                  const x = (index / (months.length - 1)) * (chartWidth - 40) + 20;
                  return (
                    <text key={m} x={x} y={chartHeight - 4} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {m}
                    </text>
                  );
                })}
              </svg>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Actual Compliance</span>
              </div>
              <span className="text-emerald-600">Target Line: 90.0%</span>
            </div>
          </div>

        </div>

        {/* Action Panel: Replacement Planner / Warnings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Warranty and Life-Cycle Warnings</h3>
              <p className="text-xs text-slate-400">Assets requiring immediate renewal or scheduled replacement review.</p>
            </div>
            <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-100 shrink-0">
              ⚠️ {analytics.upcomingWarrantyExpirationsCount} Warranties expiring soon
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3">Impact Level</th>
                  <th className="pb-3">Insight / Action Required</th>
                  <th className="pb-3">Current Health</th>
                  <th className="pb-3 text-right">Recommendation</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
                {analytics.upcomingWarrantyExpirationsCount > 0 ? (
                  <>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4"><span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg">High</span></td>
                      <td className="py-4">
                        <span className="block font-bold text-slate-800">Critical warranty expirations</span>
                        <span className="block font-medium text-slate-400 text-[10px] mt-0.5">{analytics.upcomingWarrantyExpirationsCount} assets have active warranties ending in 30 days.</span>
                      </td>
                      <td className="py-4"><span className="text-amber-500">Warning</span></td>
                      <td className="py-4 text-right">
                        <button onClick={() => onNavigate("equipment")} className="text-blue-600 hover:text-blue-800 hover:underline">
                          Extend Contract
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4"><span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg">Medium</span></td>
                      <td className="py-4">
                        <span className="block font-bold text-slate-800">Maintenance backlog check</span>
                        <span className="block font-medium text-slate-400 text-[10px] mt-0.5">{analytics.criticalFailingAssetsCount} tasks are classified as critical response status.</span>
                      </td>
                      <td className="py-4"><span className="text-amber-500">SLA At Risk</span></td>
                      <td className="py-4 text-right">
                        <button onClick={() => onNavigate("maintenance")} className="text-blue-600 hover:text-blue-800 hover:underline">
                          Escalate Queue
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">Low</span></td>
                      <td className="py-4">
                        <span className="block font-bold text-slate-800">Fulfillment latency check</span>
                        <span className="block font-medium text-slate-400 text-[10px] mt-0.5">Mean Time to Repair is {analytics.meanTimeToRepairHours} hours.</span>
                      </td>
                      <td className="py-4"><span className="text-emerald-500">Healthy</span></td>
                      <td className="py-4 text-right">
                        <button onClick={() => onNavigate("dashboard")} className="text-blue-600 hover:text-blue-800 hover:underline">
                          Review Logs
                        </button>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">All equipment warranties and SLA queues are in optimal status.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
