
import { useState } from "react";

const Icons = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  chevronRight: "M9 5l7 7-7 7",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  check: "M5 13l4 4L19 7",
  location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  spinner: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  chevronDown: "M19 9l-7 7-7-7"
};

export default function OrderStatus() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline");
  const orderDate = new Date("2024-04-08");
  const progress = 3;

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const steps = [
    { label: "Order Placed", date: addDays(orderDate, 0) }, { label: "Confirmed", date: addDays(orderDate, 1) },
    { label: "Dispatched", date: addDays(orderDate, 2) }, { label: "In Transit", date: addDays(orderDate, 3) },
    { label: "Delivered", date: `Expected ${addDays(orderDate, 5)}` },
  ];

  const items = [
    { item: "Ventilator Parts", qty: 3, price: 45000, status: "Shipped", progress: 80, deliveryDate: addDays(orderDate, 5) },
    { item: "MRI Coil Assembly", qty: 1, price: 120000, status: "Processing", progress: 40, deliveryDate: addDays(orderDate, 7) },
    { item: "Infusion Pump Kits", qty: 10, price: 85000, status: "Shipped", progress: 90, deliveryDate: addDays(orderDate, 5) },
    { item: "Defibrillator Battery Pack", qty: 1, price: 18000, status: "Shipped", progress: 60, deliveryDate: addDays(orderDate, 6) },
    { item: "X-Ray Tubes", qty: 2, price: 65000, status: "Processing", progress: 20, deliveryDate: addDays(orderDate, 8) },
  ];

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const percent = ((progress + 1) / steps.length) * 100;
  const statusStyles = { Shipped: { bg: "bg-green-100", text: "text-green-700", icon: Icons.check }, Processing: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Icons.spinner } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200/50 hover:rotate-6 transition-transform"><span className="text-white font-bold text-xl">M</span></div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">MedTrack</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={Icons.bell} /></svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <span className="hover:text-sky-600 cursor-pointer flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.home} /></svg>Home</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.chevronRight} /></svg>
          <span className="hover:text-sky-600 cursor-pointer">Orders</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.chevronRight} /></svg>
          <span className="text-gray-700 font-semibold">Order #5502</span>
        </nav>

        {/* Status Banner */}
        <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Express Shipping</span>
              <h1 className="text-4xl font-extrabold tracking-tight mt-2 mb-2">Order #5502</h1>
              <p className="text-sky-200 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.calendar} /></svg>Placed on {addDays(orderDate, 0)}</p>
            </div>
            <div className="w-full md:w-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">🚚</div>
                <div><p className="text-xs text-sky-200 uppercase tracking-wider font-medium">Current Status</p><p className="text-2xl font-bold">{steps[progress].label}</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl w-fit">
          {["timeline", "items"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tab ? "bg-white text-sky-700 shadow-md" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
              {tab === "timeline" ? "Tracking Timeline" : "Item Status"}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden mb-8">
          {activeTab === "timeline" && (
            <div className="p-8 animate-fade-in">
              <div className="relative mb-12 px-4">
                <div className="w-full bg-sky-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${percent}%` }}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" /></div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000" style={{ left: `calc(${percent}% - 16px)` }}><div className="w-8 h-8 bg-white rounded-full border-4 border-sky-600 shadow-lg flex items-center justify-center hover:scale-125 transition-transform"><span className="text-sm">🚚</span></div></div>
              </div>
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-1 bg-gradient-to-b from-sky-600 via-sky-400 to-gray-200 rounded-full" />
                <div className="space-y-8">
                  {steps.map((step, i) => {
                    const done = i < progress; const active = i === progress;
                    return (
                      <div key={i} className="flex gap-6 items-start relative group cursor-pointer">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10 transform ${done ? "bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-200" : active ? "bg-white border-2 border-sky-600 scale-110 ring-4 ring-sky-100" : "border-2 border-gray-200 bg-white group-hover:border-sky-300"}`}>
                          {done ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={Icons.check} /></svg> : active ? <div className="w-3 h-3 bg-sky-600 rounded-full animate-ping" /> : <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-sky-300" />}
                        </div>
                        <div className={`flex-1 bg-gray-50 p-4 rounded-xl border transition-all duration-300 ${done || active ? "opacity-100 border-sky-100 bg-sky-50/50" : "opacity-60 group-hover:opacity-100 group-hover:bg-gray-50"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><p className={`font-bold text-lg ${done || active ? "text-gray-900" : "text-gray-500"}`}>{step.label}</p>{active && <span className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">Active</span>}</div>
                            <p className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-lg shadow-sm">{step.date}</p>
                          </div>
                          {active && <div className="mt-3 flex items-center gap-2 text-sky-700 text-sm"><svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.location} /></svg>Your package is currently at the distribution center</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div className="p-8 animate-fade-in">
              <div className="space-y-6">
                {items.map((line, i) => (
                  <div key={i} className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-sky-200 transition-all duration-300 cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div><p className="font-bold text-gray-800 text-lg mb-1">{line.item}</p><p className="text-sm text-gray-500">Qty: {line.qty} <span className="mx-1">•</span> ₹{line.price.toLocaleString()}</p></div>
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 ${statusStyles[line.status].bg} ${statusStyles[line.status].text}`}>
                        <svg className={`w-4 h-4 ${line.status === 'Processing' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusStyles[line.status].icon} /></svg>
                        {line.status}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2"><div className={`h-2 rounded-full transition-all duration-1000 ${line.status === 'Shipped' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${line.progress}%` }} /></div>
                    <div className="flex justify-between items-center text-xs text-gray-500"><span>{line.progress}% Completed</span><span>Est. Delivery: {line.deliveryDate}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Accordion */}
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden transition-all hover:shadow-2xl mb-6">
          <div className="flex justify-between items-center p-6 cursor-pointer hover:bg-sky-50/50 transition-colors group" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"><svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.clipboard} /></svg></div>
              <div><h2 className="font-bold text-gray-800 text-lg">Order Summary</h2><p className="text-sm text-gray-500">{items.length} Medical Equipment Items</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right"><p className="text-xs text-gray-400 uppercase tracking-wider">Total Amount</p><span className="font-extrabold text-2xl text-gray-900">₹{total.toLocaleString()}</span></div>
              <div className={`w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center transition-all duration-300 ${expanded ? "rotate-180 bg-sky-100" : ""}`}><svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={Icons.chevronDown} /></svg></div>
            </div>
          </div>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50">
              <div className="space-y-3 mt-4">
                {items.map((line, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-sky-200 transition-colors">
                    <div><p className="font-medium text-gray-800">{line.item}</p><p className="text-xs text-gray-500">Qty: {line.qty}</p></div>
                    <p className="font-bold text-gray-900">₹{line.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center text-gray-600"><p>Subtotal</p><p>₹{total.toLocaleString()}</p></div>
                <div className="flex justify-between items-center mt-3 text-gray-600"><p>Shipping & Handling</p><p className="text-green-600 font-semibold">Free</p></div>
                <div className="flex justify-between items-center mt-3 text-gray-600"><p>Tax (GST)</p><p>Included</p></div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-dashed border-gray-200"><p className="font-bold text-xl text-gray-900">Grand Total</p><p className="font-extrabold text-2xl text-sky-600">₹{total.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 2s infinite; } .animate-fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
