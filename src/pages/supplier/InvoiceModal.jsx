import { useState } from "react";
import { downloadInvoicePdf, emailInvoice } from "../../services/OrderService";

export default function InvoiceModal({ order, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);

  if (!order) return null;

  // Math helper (same as backend calculation to ensure exact consistency)
  const qty = order.quantity || 1;
  const rawPriceStr = order.price ? order.price.replace(/[^\d.]/g, "") : "0";
  const unitPrice = parseFloat(rawPriceStr) || 0;
  const subtotal = unitPrice * qty;
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  const formatCurrency = (val) => {
    return "₹" + val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blobData = await downloadInvoicePdf(order.id);
      
      // Create download link
      const blob = new Blob([blobData], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${order.orderCode || order.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    try {
      setEmailing(true);
      setEmailSuccess(null);
      setEmailError(null);
      await emailInvoice(order.id);
      setEmailSuccess(`Invoice successfully sent to hospital admin!`);
      // Auto-clear success message after 4s
      setTimeout(() => setEmailSuccess(null), 4000);
    } catch (err) {
      console.error("Error emailing invoice:", err);
      setEmailError("Could not dispatch invoice email. Please verify SMTP setup.");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoice Preview
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Order Code: {order.orderCode}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Email Notification Toasts */}
          {emailSuccess && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl animate-fade-in">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {emailSuccess}
            </div>
          )}
          {emailError && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl animate-fade-in">
              <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {emailError}
            </div>
          )}

          {/* Invoice Structure */}
          <div className="border border-slate-100 rounded-3xl p-6 md:p-8 space-y-8 bg-slate-50/30">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-3">
                  TAX INVOICE
                </span>
                <h4 className="text-xl font-bold text-slate-800">MedTrack Global Supplier Division</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  102 Logistics Boulevard, Cargo Park<br />
                  New Delhi, Delhi, 110037<br />
                  GSTIN: 07AAAAM8362L1Z4
                </p>
              </div>
              <div className="md:text-right">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Code</h5>
                <p className="text-lg font-mono font-bold text-slate-800 mt-1">INV-{order.orderCode}</p>
                
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Status</h5>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1.5 ${
                  order.shippingStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {order.shippingStatus === 'Delivered' ? 'Paid' : 'Unpaid (Pending Delivery)'}
                </span>
              </div>
            </div>

            {/* Billing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billed To</h5>
                <p className="font-bold text-slate-800 text-sm">{order.hospital}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Procurement Manager: {order.createdBy}<br />
                  Billing Reference: REF-{order.id}
                </p>
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Timeline Details</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400">Order Date</span>
                    <span className="font-bold text-slate-700">{new Date(order.orderedDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Delivery Est.</span>
                    <span className="font-bold text-slate-700">{order.estimatedDelivery || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Description</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Tax (GST 18%)</th>
                    <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 text-sm">
                    <td className="py-4 font-bold text-slate-800">{order.equipmentName}</td>
                    <td className="py-4 px-4 text-center text-slate-600">{qty}</td>
                    <td className="py-4 px-4 text-right text-slate-600 font-mono">{formatCurrency(unitPrice)}</td>
                    <td className="py-4 px-4 text-right text-slate-600 font-mono">{formatCurrency(gstAmount)}</td>
                    <td className="py-4 text-right font-bold text-slate-800 font-mono">{formatCurrency(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom summary block */}
            <div className="flex flex-col md:flex-row justify-between gap-6 pt-4">
              <div className="max-w-md">
                <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Supplier terms</h6>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  GST calculates at 18% standard rate. Final payment is due within 30 calendar days of delivery. For invoice disputes, kindly contact accounts@medtrack.com.
                </p>
              </div>
              <div className="w-full md:w-80 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%)</span>
                  <span className="font-mono">{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 font-bold text-slate-800">
                  <span>Grand Total</span>
                  <span className="text-lg text-primary font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-8 py-5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
          >
            Close
          </button>
          
          <button
            onClick={handleEmail}
            disabled={emailing || downloading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50"
          >
            {emailing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Emailing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email to Admin
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloading || emailing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
