import React, { useState, useEffect } from "react";
import { getOrderById } from "../../services/OrderService";

const Icons = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  chevronRight: "M9 5l7 7-7 7",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  check: "M5 13l4 4L19 7",
  location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  chevronDown: "M19 9l-7 7-7-7"
};

export default function OrderStatus({ onNavigate, order: initialOrder }) {
  const [order, setOrder] = useState(initialOrder || null);
  const [orderIdInput, setOrderIdInput] = useState(initialOrder?.id || "");
  const [searchId, setSearchId] = useState(initialOrder?.id || "");
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    if (searchId) {
      fetchOrderDetails(searchId);
    }
  }, [searchId]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      // Backend returns message on 400 Bad Request
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(`Order not found with id: ${id}`);
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      setSearchId(orderIdInput.trim());
    }
  };

  // Status mapping
  const getProgressInfo = (status) => {
    switch (status) {
      case "Pending":
        return { progress: 0, text: "Order placed. Awaiting supplier confirmation." };
      case "Processing":
        return { progress: 1, text: "Your order is currently being processed by the supplier." };
      case "Shipped":
        return { progress: 3, text: "Your package has been dispatched and is in transit." };
      case "Delivered":
        return { progress: 4, text: "Your package was delivered successfully." };
      case "Cancelled":
        return { progress: 0, text: "This order has been cancelled." };
      default:
        return { progress: 1, text: "Awaiting progress updates." };
    }
  };

  const status = order?.shippingStatus || order?.status || "Pending";
  const { progress, text: statusDetailsText } = getProgressInfo(status);

  // Formatting date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const orderDate = order ? new Date(order.orderedDate || order.orderDate || Date.now()) : new Date();

  const steps = [
    { label: "Order Placed", date: formatDate(order?.orderedDate || order?.orderDate) },
    { label: "Confirmed / Processing", date: status === "Pending" ? "Awaiting Confirmation" : formatDate(orderDate) },
    { label: "Dispatched", date: status === "Shipped" || status === "Delivered" ? "Dispatched" : "Awaiting dispatch" },
    { label: "In Transit", date: status === "Shipped" || status === "Delivered" ? "In Transit" : "Awaiting transit" },
    { label: "Delivered", date: order?.estimatedDelivery || "Pending Delivery" },
  ];

  // Since Backend has no price field, we estimate based on quantity
  const unitPrice = 25000;
  const estimatedPrice = order ? (order.quantity || 1) * unitPrice : 0;
  const percent = ((progress + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => onNavigate("orders")}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200/50 hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-primary">MedTrack</span>
          </button>
          
          <button 
            onClick={() => onNavigate("orders")}
            className="text-sm font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-all"
          >
            ← Back to Orders
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-secondary mb-8">
          <span onClick={() => onNavigate("dashboard")} className="hover:text-sky-600 cursor-pointer flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.home} /></svg>Dashboard
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.chevronRight} /></svg>
          <span onClick={() => onNavigate("orders")} className="hover:text-sky-600 cursor-pointer">Orders</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.chevronRight} /></svg>
          <span className="text-gray-700 font-semibold">Track Order</span>
        </nav>

        {/* Search Bar for manual lookup */}
        <form onSubmit={handleSearchSubmit} className="bg-card p-4 rounded-3xl border border-sky-100 shadow-lg mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Enter Order ID to track (e.g. 1)" 
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-surface border border-subtle rounded-2xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-sky-200"
          >
            Track Status
          </button>
        </form>

        {loading && (
          <div className="bg-card rounded-3xl border border-sky-100 p-16 text-center shadow-md">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600"></div>
            <p className="mt-4 text-secondary font-bold">Querying backend registry...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-card rounded-3xl border-2 border-dashed border-red-200 p-16 text-center shadow-lg animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">⚠️</div>
            <h2 className="text-2xl font-black text-primary mb-2">Fulfillment Record Not Found</h2>
            <p className="text-red-600 font-bold max-w-md mx-auto mb-6">{error}</p>
            <div className="text-sm text-secondary">Please verify the Order ID or select from the active orders list.</div>
          </div>
        )}

        {order && !loading && (
          <>
            {/* Status Banner */}
            <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {order.trackingNo ? `Tracking: ${order.trackingNo}` : "Standard Shipping"}
                  </span>
                  <h1 className="text-4xl font-extrabold tracking-tight mt-2 mb-2">Order #{order.id}</h1>
                  <p className="text-sky-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.calendar} /></svg>
                    Placed on {formatDate(order.orderedDate || order.orderDate)}
                  </p>
                </div>
                <div className="w-full md:w-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">🚚</div>
                    <div>
                      <p className="text-xs text-sky-200 uppercase tracking-wider font-medium">Current Status</p>
                      <p className="text-2xl font-bold">{status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-hover p-1.5 rounded-xl w-fit">
              {["timeline", "items"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tab ? "bg-card text-sky-700 shadow-md" : "text-secondary hover:text-gray-800 hover:bg-surface"}`}
                >
                  {tab === "timeline" ? "Tracking Timeline" : "Item Status"}
                </button>
              ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-card rounded-3xl border border-sky-100 shadow-xl overflow-hidden mb-8">
              {activeTab === "timeline" && (
                <div className="p-8">
                  {status === "Cancelled" ? (
                    <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl font-bold text-center">
                      🛑 This order has been cancelled. Please contact the supplier for support.
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-12 px-4">
                        <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-sky-400 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out relative" 
                            style={{ width: `${percent}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                          </div>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000" style={{ left: `calc(${percent}% - 16px)` }}>
                          <div className="w-8 h-8 bg-card rounded-full border-4 border-sky-600 shadow-lg flex items-center justify-center hover:scale-125 transition-transform">
                            <span className="text-sm">🚚</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute left-[15px] top-2 bottom-2 w-1 bg-gradient-to-b from-sky-600 via-sky-400 to-gray-200 rounded-full" />
                        <div className="space-y-8">
                          {steps.map((step, i) => {
                            const done = i < progress; 
                            const active = i === progress;
                            return (
                              <div key={i} className="flex gap-6 items-start relative group cursor-pointer">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10 transform ${done ? "bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-200" : active ? "bg-card border-2 border-sky-600 scale-110 ring-4 ring-sky-100" : "border-2 border-subtle bg-card group-hover:border-sky-300"}`}>
                                  {done ? (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={Icons.check} /></svg>
                                  ) : active ? (
                                    <div className="w-3 h-3 bg-sky-600 rounded-full animate-ping" />
                                  ) : (
                                    <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-sky-300" />
                                  )}
                                </div>
                                <div className={`flex-1 bg-surface p-4 rounded-xl border transition-all duration-300 ${done || active ? "opacity-100 border-sky-100 bg-sky-50/50" : "opacity-60 group-hover:opacity-100 group-hover:bg-surface"}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <p className={`font-bold text-lg ${done || active ? "text-primary" : "text-secondary"}`}>{step.label}</p>
                                      {active && <span className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">Active</span>}
                                    </div>
                                    <p className="text-sm text-secondary font-medium bg-card px-3 py-1 rounded-lg shadow-sm">{step.date}</p>
                                  </div>
                                  {active && (
                                    <div className="mt-3 flex items-center gap-2 text-sky-700 text-sm">
                                      <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.location} /></svg>
                                      {statusDetailsText}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "items" && (
                <div className="p-8">
                  <div className="group bg-card border border-subtle rounded-2xl p-5 hover:shadow-lg hover:border-sky-200 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-gray-800 text-lg mb-1">{order.equipmentName || order.equipment?.name || "Medical Asset"}</p>
                        <p className="text-sm text-secondary">Qty: {order.quantity || 1} <span className="mx-1">•</span> Hospital: {order.hospital}</p>
                      </div>
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 ${
                        status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                        status === "Shipped" ? "bg-blue-50 text-blue-600" :
                        status === "Cancelled" ? "bg-red-50 text-red-600" :
                        "bg-orange-50 text-orange-600"
                      }`}>
                        {status}
                      </div>
                    </div>
                    <div className="w-full bg-hover h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${status === "Delivered" || status === "Shipped" ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${percent}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-secondary">
                      <span>{Math.round(percent)}% Completed</span>
                      <span>Est. Delivery: {order.estimatedDelivery || "Pending"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Accordion */}
            <div className="bg-card rounded-3xl border border-sky-100 shadow-xl overflow-hidden transition-all hover:shadow-2xl mb-6">
              <div 
                className="flex justify-between items-center p-6 cursor-pointer hover:bg-sky-50/50 transition-colors group" 
                onClick={() => setExpanded(!expanded)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.clipboard} /></svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">Order Summary</h2>
                    <p className="text-sm text-secondary">Fulfillment Details</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-secondary uppercase tracking-wider">Estimated Cost</p>
                    <span className="font-extrabold text-2xl text-primary">₹{estimatedPrice.toLocaleString()}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center transition-all duration-300 ${expanded ? "rotate-180 bg-sky-100" : ""}`}>
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.chevronDown} /></svg>
                  </div>
                </div>
              </div>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 pt-2 border-t border-subtle bg-surface/50">
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center p-4 bg-card rounded-xl shadow-sm border border-subtle">
                      <div>
                        <p className="font-medium text-gray-800">{order.equipmentName || "Medical Equipment"}</p>
                        <p className="text-xs text-secondary">Qty: {order.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-primary">₹{estimatedPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-card p-6 rounded-xl border border-subtle">
                    <div className="flex justify-between items-center text-gray-600">
                      <p>Subtotal</p>
                      <p>₹{estimatedPrice.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-gray-600">
                      <p>Shipping & Handling</p>
                      <p className="text-green-600 font-semibold">Free</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-gray-600">
                      <p>Tax / Duties</p>
                      <p>Included</p>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-dashed border-subtle">
                      <p className="font-bold text-xl text-primary">Grand Total</p>
                      <p className="font-extrabold text-2xl text-sky-600">₹{estimatedPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes shimmer { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(100%); } 
        } 
        .animate-shimmer { 
          animation: shimmer 2s infinite; 
        } 
      `}</style>
    </div>
  );
}
