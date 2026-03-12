import { useState, useEffect } from "react";

export default function UpdateTask({ onNavigate }) {

  const [form, setForm] = useState({
    taskId: "T-002",
    status: "In Progress",
    notes: "",
    partsUsed: [],
    hoursSpent: "",
    image: null
  });

  const [newPart, setNewPart] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = ["Inspection", "Repair", "Testing", "Completed"];

  const getStep = () => {
    if (form.status === "Completed") return 4;
    if (form.status === "In Progress") return 2;
    if (form.status === "Needs Part") return 1;
    return 1;
  };

  const step = getStep();

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("taskDraft", JSON.stringify(form));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 1500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [form]);

  const addPart = () => {
    if (newPart.trim() === "") return;

    setForm({
      ...form,
      partsUsed: [...form.partsUsed, newPart]
    });

    setNewPart("");
  };

  const removePart = (index) => {
    setForm({
      ...form,
      partsUsed: form.partsUsed.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    setTimeout(() => {
      onNavigate("tasks");
    }, 2000);
  };

  return (

    /* 🌈 NEW GRADIENT BACKGROUND */
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* BACK BUTTON */}

        <button
          onClick={() => onNavigate("tasks")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Tasks
        </button>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT FORM */}

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

            <h1 className="text-2xl font-bold text-gray-900">
              Update Maintenance Task
            </h1>

            <p className="text-sm text-gray-500 mb-6">
              Submit repair progress and technician report
            </p>

            {/* STEP PROGRESS */}

            <div className="flex justify-between mb-8">

              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center w-full">

                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                    ${i + 1 <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                  >
                    {i + 1}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">{s}</p>

                </div>
              ))}

            </div>

            {submitted ? (

              <div className="text-center py-16">

                <div className="text-5xl mb-4">✅</div>

                <p className="text-xl font-bold">Update Submitted</p>

                <p className="text-gray-500 text-sm">
                  Returning to task list...
                </p>

              </div>

            ) : (

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* STATUS */}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Task Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 border rounded-lg"
                  >
                    <option>In Progress</option>
                    <option>Needs Part</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                  </select>
                </div>

                {/* NOTES */}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Work Notes
                  </label>

                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 border rounded-lg"
                    placeholder="Describe repair work performed..."
                  />
                </div>

                {/* PARTS */}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Parts Used
                  </label>

                  <div className="flex gap-2 mt-1">

                    <input
                      value={newPart}
                      onChange={(e) => setNewPart(e.target.value)}
                      className="flex-1 px-4 py-3 border rounded-lg"
                      placeholder="Add part name"
                    />

                    <button
                      type="button"
                      onClick={addPart}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg"
                    >
                      Add
                    </button>

                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">

                    {form.partsUsed.map((p, i) => (
                      <div
                        key={i}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                      >
                        {p}

                        <button
                          onClick={() => removePart(i)}
                          type="button"
                          className="text-red-500"
                        >
                          ✕
                        </button>

                      </div>
                    ))}

                  </div>

                </div>

                {/* HOURS */}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Hours Spent
                  </label>

                  <input
                    type="number"
                    step="0.5"
                    value={form.hoursSpent}
                    onChange={(e) =>
                      setForm({ ...form, hoursSpent: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 border rounded-lg"
                    placeholder="2.5"
                  />
                </div>

                {/* IMAGE */}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Upload Repair Image
                  </label>

                  <input
                    type="file"
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.files[0] })
                    }
                    className="w-full mt-1"
                  />
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Submit Update
                </button>

                {draftSaved && (
                  <p className="text-xs text-green-600">
                    Draft auto-saved
                  </p>
                )}

              </form>

            )}

          </div>

          {/* RIGHT PANEL */}

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">

            <h2 className="font-bold text-gray-900 mb-4">
              Equipment Preview
            </h2>

            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4dHObC-h6vXeiZ8wmxl0eJAqAlDcSbD_8Jg&s"
              alt="equipment"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />

            <p className="text-sm text-gray-500 mb-1">Equipment</p>
            <p className="font-semibold">Ventilator #B05</p>

            <p className="text-sm text-gray-500 mt-3">Hospital</p>
            <p className="font-semibold">Apollo Medical Center</p>

            <p className="text-sm text-gray-500 mt-3">Priority</p>

            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
              Critical
            </span>

            <div className="mt-6">
              <p className="text-sm text-gray-500">Current Status</p>
              <p className="font-semibold mt-1">{form.status}</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
