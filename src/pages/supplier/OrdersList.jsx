import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/OrderService";

const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus, "Status updated by supplier");
      // Update local state instead of refetching to be smoother
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, shippingStatus: newStatus } : o));
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-50 min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium tracking-wide">Retrieving supply chain data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Inventory Orders</h1>
          <p className="text-slate-500 text-lg">Manage and track equipment fulfillment requests</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-2">
            <span className="block text-2xl font-bold text-primary">{orders.length}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Orders</span>
          </div>
          <div className="w-[1px] bg-slate-100 my-2"></div>
          <div className="px-6 py-2">
            <span className="block text-2xl font-bold text-orange-500">
              {orders.filter(o => o.shippingStatus === 'Processing').length}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button onClick={fetchOrders} className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-72 h-48 lg:h-auto relative overflow-hidden">
                  <img 
                    src={order.equipmentImg || order.equipment?.img || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"} 
                    alt={order.equipmentName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 shadow-sm border border-slate-100">
                      {order.id}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{order.equipmentName || order.equipment?.name}</h3>
                        <p className="text-slate-400 font-medium">{order.hospital}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status</span>
                      <select 
                        value={order.shippingStatus}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer ${
                          order.shippingStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                          order.shippingStatus === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                          order.shippingStatus === 'Cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-orange-50 text-orange-600'
                        } ${updatingId === order.id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-slate-100 mb-6">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price</span>
                      <span className="text-slate-900 font-bold">{order.price}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ordered Date</span>
                      <span className="text-slate-900 font-bold">{new Date(order.orderedDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Estimate</span>
                      <span className="text-slate-900 font-bold">{order.estimatedDelivery || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tracking #</span>
                      <span className="text-primary font-mono font-bold">{order.trackingNo || "Pending"}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">
                      Invoice
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                      Message Hospital
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No active orders</h2>
          <p className="text-slate-500">When hospitals place equipment orders, they'll appear here for fulfillment.</p>
        </div>
      )}
    </div>
  );
}
