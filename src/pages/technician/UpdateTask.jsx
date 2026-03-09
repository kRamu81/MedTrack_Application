import { useState } from "react";

export default function UpdateTask({ onNavigate }) {
  const [form, setForm] = useState({ taskId: "T-002", status: "In Progress", notes: "", partsUsed: "", hoursSpent: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onNavigate("tasks");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => onNavigate("tasks")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Update Task</h1>
          <p className="text-gray-500 text-sm mb-6">Submit progress report for assigned maintenance task</p>

          {/* Task Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="font-semibold text-blue-900">Ventilator #B05 — Alarm Malfunction</p>
                <p className="text-sm text-blue-700 mt-0.5">Apollo Medical Center · Task ID: T-002</p>
                <p className="text-xs text-blue-600 mt-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full inline-block font-semibold">Critical Priority</p>
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 text-lg">Update Submitted!</p>
              <p className="text-gray-500 text-sm mt-1">Redirecting to task list...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Needs Part</option>
                  <option>On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Describe what was done, findings, issues encountered..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Parts Used</label>
                  <input
                    value={form.partsUsed}
                    onChange={e => setForm({ ...form, partsUsed: e.target.value })}
                    placeholder="e.g., Alarm Module, Fuse"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours Spent</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hoursSpent}
                    onChange={e => setForm({ ...form, hoursSpent: e.target.value })}
                    placeholder="e.g., 2.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                Submit Update
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
