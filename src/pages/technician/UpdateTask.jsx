import { useState, useEffect } from "react";
import { updateTask, getTaskById } from "../../services/MaintenanceService";
import { useAuth } from "../../context/AuthContext";

export default function UpdateTask({ onNavigate, task: initialTask }) {
  const { user } = useAuth();

  const [task, setTask] = useState(initialTask || null);
  const [taskIdInput, setTaskIdInput] = useState(initialTask?.id || "");
  const [searchId, setSearchId] = useState(initialTask?.id || "");
  const [loading, setLoading] = useState(Boolean(initialTask?.id));
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    status: initialTask?.status || "In Progress",
    notes: initialTask?.notes || "",
    parts: initialTask?.partsUsed ? initialTask.partsUsed.split(", ") : [],
    hours: initialTask?.hoursWorked || "",
    image: null,
  });

  const [part, setPart] = useState("");
  const [preview, setPreview] = useState(null);

  const isTechnician = user?.role?.toLowerCase() === "technician";

  useEffect(() => {
    if (initialTask?.id) {
      fetchTaskDetails(initialTask.id);
    }
  }, [initialTask]);

  useEffect(() => {
    if (task) {
      setForm({
        status: task.status || "In Progress",
        notes: task.notes || "",
        parts: task.partsUsed ? task.partsUsed.split(", ") : [],
        hours: task.hoursWorked || "",
        image: null,
      });
      setTaskIdInput(task.id || "");
    }
  }, [task]);

  const fetchTaskDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setDone(false);

      const data = await getTaskById(id);
      setTask(data);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError(
        err.response?.data?.message || `Maintenance task not found with id: ${id}`
      );
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (taskIdInput.trim()) {
      const id = taskIdInput.trim();
      setSearchId(id);
      fetchTaskDetails(id);
    }
  };

  const addPart = () => {
    if (!part.trim()) return;

    setForm((prev) => ({
      ...prev,
      parts: [...prev.parts, part.trim()],
    }));

    setPart("");
  };

  const removePart = (index) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const upload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isTechnician || !task?.id) return;

    try {
      setSyncing(true);
      setError(null);

      const payload = {
        status: form.status,
        notes: form.notes,
        partsUsed: form.parts.join(", "),
        hoursWorked: form.hours,
      };

      await updateTask(task.id, payload);

      setDone(true);

      setTimeout(() => {
        onNavigate("tasks");
      }, 2000);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to submit update. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => onNavigate("tasks")}
          className="mb-6 text-slate-400 hover:text-white font-bold transition-colors"
        >
          ← Back to Assignments
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6">
          <h1 className="text-3xl font-black mb-2">Maintenance Report</h1>
          <p className="text-slate-400 mb-6">
            Search and update assigned maintenance task records.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={taskIdInput}
              onChange={(e) => setTaskIdInput(e.target.value)}
              placeholder="Enter task ID"
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
            />

            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
            <p className="text-slate-300 font-bold">Querying task registry...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-950/40 border border-red-800 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-black mb-2">Task Record Not Found</h2>
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {task && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-white text-slate-900 rounded-3xl p-8 space-y-6"
            >
              {done ? (
                <div className="p-6 bg-emerald-50 text-emerald-700 rounded-2xl font-bold">
                  Update complete. Your report has been synced to the database.
                </div>
              ) : (
                <>
                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl font-bold">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Current Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      disabled={!isTechnician}
                      className="w-full p-4 bg-slate-50 border rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Needs Part">Needs Part</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Time Invested Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.hours}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          hours: e.target.value,
                        }))
                      }
                      disabled={!isTechnician}
                      className="w-full p-4 bg-slate-50 border rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Maintenance Notes
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      disabled={!isTechnician}
                      rows="5"
                      placeholder="Add repair notes..."
                      className="w-full p-4 bg-slate-50 border rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Replacement Parts
                    </label>

                    <div className="flex gap-2">
                      <input
                        value={part}
                        onChange={(e) => setPart(e.target.value)}
                        placeholder="Enter part name / serial"
                        disabled={!isTechnician}
                        className="flex-1 p-4 bg-slate-50 border rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addPart();
                          }
                        }}
                      />

                      {isTechnician && (
                        <button
                          type="button"
                          onClick={addPart}
                          className="px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800"
                        >
                          Add
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.parts.map((partName, index) => (
                        <span
                          key={`${partName}-${index}`}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"
                        >
                          {partName}

                          {isTechnician && (
                            <button
                              type="button"
                              onClick={() => removePart(index)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isTechnician ? (
                    <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                      <button
                        type="submit"
                        disabled={syncing}
                        className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-lg disabled:opacity-50"
                      >
                        {syncing ? "Syncing..." : "Publish Report"}
                      </button>

                      <label className="flex items-center gap-3 text-slate-500 hover:text-slate-800 cursor-pointer font-bold">
                        Attach Photo
                        <input
                          type="file"
                          className="hidden"
                          onChange={upload}
                          accept="image/*"
                        />
                      </label>

                      {preview && (
                        <img
                          src={preview}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-200"
                          alt="Preview"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl text-sm font-bold border border-amber-200">
                      ⚠️ You are in read-only mode. Only technicians are
                      authorized to publish reports.
                    </div>
                  )}
                </>
              )}
            </form>

            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8">
              <h2 className="text-xl font-black mb-6">System Context</h2>

              <div className="space-y-5">
                <div>
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Task ID
                  </span>
                  <p className="font-bold">{task.id}</p>
                </div>

                <div>
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Target Asset
                  </span>
                  <p className="font-bold">
                    {task.equipment || task.equipmentName || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Facility
                  </span>
                  <p className="font-bold text-slate-300">
                    {task.hospital || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Priority
                  </span>
                  <p className="font-bold text-slate-300">
                    {task.priority || "Normal"}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Original Issue
                  </span>
                  <p className="text-sm text-slate-400 italic font-medium leading-relaxed">
                    {task.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!task && !loading && !error && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
            <p className="text-slate-400 font-bold">
              Search for a maintenance task ID to update its report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}