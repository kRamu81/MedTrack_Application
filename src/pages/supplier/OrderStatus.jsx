export default function OrderStatus() {
  const steps = [
    { label: "Order Placed", date: "Apr 6, 2024", done: true },
    { label: "Confirmed", date: "Apr 7, 2024", done: true },
    { label: "Dispatched", date: "Apr 9, 2024", done: true },
    { label: "In Transit", date: "Apr 10, 2024", done: false, active: true },
    { label: "Delivered", date: "Expected Apr 14", done: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Status</h1>
        <p className="text-gray-500 text-sm mb-6">Track real-time delivery status of orders</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xl font-bold text-gray-900">Order #5502</p>
              <p className="text-sm text-gray-500 mt-0.5">Placed on April 8, 2024</p>
            </div>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">In Transit</span>
          </div>

          {/* Progress Stepper */}
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start relative">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                    step.done ? "border-blue-600 bg-blue-600" : step.active ? "border-blue-600 bg-white" : "border-gray-300 bg-white"
                  }`}>
                    {step.done ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${step.active ? "bg-blue-600" : "bg-gray-300"}`} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className={`font-semibold text-sm ${step.done || step.active ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                    <p className={`text-xs mt-0.5 ${step.done ? "text-gray-500" : step.active ? "text-blue-600 font-medium" : "text-gray-400"}`}>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {[
              { item: "Ventilator Alarm Module", qty: 2, price: "₹18,000" },
              { item: "HEPA Filter Replacement", qty: 3, price: "₹12,000" },
              { item: "Power Supply Unit", qty: 1, price: "₹18,000" },
            ].map((line, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{line.item}</p>
                  <p className="text-xs text-gray-400">Qty: {line.qty}</p>
                </div>
                <p className="font-semibold text-gray-900">{line.price}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <p className="font-bold text-gray-900">Total</p>
              <p className="font-bold text-blue-700 text-lg">₹48,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
