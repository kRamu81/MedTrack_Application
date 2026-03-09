import { useState } from "react";

const orders = [
  { id: "#5502", hospital: "City General Hospital", items: "Ventilator Parts (x3)", value: "₹48,000", date: "2024-04-08", status: "Shipped", delivery: "2024-04-14" },
  { id: "#5501", hospital: "Apollo Medical Center", items: "MRI Coil Assembly", value: "₹1,20,000", date: "2024-04-06", status: "Processing", delivery: "2024-04-18" },
  { id: "#5500", hospital: "Sunrise Hospital", items: "Infusion Pump Kits (x10)", value: "₹32,500", date: "2024-04-04", status: "Delivered", delivery: "2024-04-10" },
  { id: "#5499", hospital: "City General Hospital", items: "Defibrillator Battery Pack", value: "₹8,200", date: "2024-04-02", status: "Delivered", delivery: "2024-04-07" },
  { id: "#5498", hospital: "NIMS Hospital", items: "X-Ray Tubes (x2)", value: "₹64,000", date: "2024-03-30", status: "Cancelled", delivery: "—" },
];

const statusStyle = {
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function OrdersList() {
  const [filter, setFilter] = useState("All");
  const filtered = orders.filter(o => filter === "All" || o.status === filter);

  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + parseInt(o.value.replace(/[₹,]/g, "")), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage hospital equipment orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Orders", value: orders.length, color: "text-gray-900" },
            { label: "Active", value: orders.filter(o => ["Shipped","Processing"].includes(o.status)).length, color: "text-blue-600" },
            { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, color: "text-emerald-600" },
            { label: "Revenue", value: `₹${(totalRevenue/1000).toFixed(0)}K`, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filter === f ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Order ID", "Hospital", "Items", "Value", "Order Date", "Status", "Est. Delivery"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-gray-800">{order.id}</td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{order.hospital}</td>
                    <td className="px-5 py-4 text-gray-600">{order.items}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{order.value}</td>
                    <td className="px-5 py-4 text-gray-500">{order.date}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{order.delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Showing {filtered.length} of {orders.length} orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
