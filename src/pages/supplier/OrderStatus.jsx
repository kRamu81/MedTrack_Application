import { useState } from "react";

export default function OrderStatus() {

  const [expanded, setExpanded] = useState(false);

  const orderDate = new Date("2024-04-08"); 
  const progress = 3;

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const steps = [
    { label: "Order Placed", date: addDays(orderDate, 0) },
    { label: "Confirmed", date: addDays(orderDate, 1) },
    { label: "Dispatched", date: addDays(orderDate, 2) },
    { label: "In Transit", date: addDays(orderDate, 3) },
    { label: "Delivered", date: `Expected ${addDays(orderDate, 5)}` },
  ];

  const items = [
    { item: "Ventilator Alarm Module", qty: 2, price: 18000 },
    { item: "HEPA Filter Replacement", qty: 3, price: 12000 },
    { item: "Power Supply Unit", qty: 1, price: 18000 },
  ];

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const percent = ((progress + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-sky-50">

      <div className="max-w-3xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Order Status
        </h1>

        {/* ORDER CARD */}

        <div className="bg-white rounded-xl border border-sky-200 shadow-md p-6 mb-6">

          <div className="flex justify-between mb-4">

            <div>
              <p className="font-bold text-lg">Order #5502</p>
              <p className="text-sm text-gray-500">
                Placed on {addDays(orderDate,0)}
              </p>
            </div>

            <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">
              {steps[progress].label}
            </span>

          </div>

          {/* Progress bar */}

          <div className="w-full bg-sky-100 h-2 rounded-full mb-6">
            <div
              className="bg-sky-600 h-2 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Steps */}

          <div className="space-y-5">

            {steps.map((step, i) => {

              const done = i < progress;
              const active = i === progress;

              return (

                <div key={i} className="flex gap-4">

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center
                    ${
                      done
                        ? "bg-sky-600 border-sky-600"
                        : active
                        ? "border-sky-600"
                        : "border-gray-300"
                    }`}
                  >

                    {done && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}

                  </div>

                  <div>
                    <p
                      className={`font-medium ${
                        done || active ? "" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500">{step.date}</p>
                  </div>

                </div>

              );
            })}

          </div>

        </div>

        {/* ORDER SUMMARY */}

        <div className="bg-white border border-sky-200 shadow-md rounded-xl p-6">

          <div
            className="flex justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <h2 className="font-bold">Order Summary</h2>

            <span className="text-sky-600 text-sm font-medium">
              {expanded ? "Hide Items" : "View Items"}
            </span>
          </div>

          {expanded && (

            <div className="mt-4 space-y-3">

              {items.map((line, i) => (

                <div
                  key={i}
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <p>{line.item}</p>
                    <p className="text-xs text-gray-400">
                      Qty: {line.qty}
                    </p>
                  </div>

                  <p>₹{line.price.toLocaleString()}</p>
                </div>

              ))}

              <div className="flex justify-between font-bold pt-2">
                <p>Total</p>
                <p>₹{total.toLocaleString()}</p>
              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
