import React, { useState, useEffect } from 'react';

export default function ScheduleMaintenancePage({ onNavigate }) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    maintenanceType: 'Preventive',
    scheduledDate: '',
    assignedTechnician: '',
    description: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem("medtrack_equipment");
    if (stored) {
      const parsed = JSON.parse(stored);
      setEquipmentList(parsed);
      if (parsed.length > 0) {
        setFormData(prev => ({ ...prev, equipmentId: parsed[0].id, equipmentName: parsed[0].name }));
      }
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "equipmentId") {
      const selected = equipmentList.find(eq => eq.id === value);
      setFormData({
        ...formData,
        equipmentId: value,
        equipmentName: selected ? selected.name : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      id: `MNT-${Date.now().toString().slice(-4)}`,
      ...formData,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    const storedTasks = localStorage.getItem("medtrack_maintenance");
    const existingTasks = storedTasks ? JSON.parse(storedTasks) : [];
    existingTasks.push(newTask);
    localStorage.setItem("medtrack_maintenance", JSON.stringify(existingTasks));

    alert('Maintenance scheduled successfully!');
    onNavigate('maintenance');
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Schedule Maintenance</h2>
            <p className="text-sm text-gray-500 mt-1">Plan upcoming maintenance tasks.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Equipment *</label>
              <select 
                name="equipmentId" 
                value={formData.equipmentId} 
                onChange={onChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {equipmentList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select 
                  name="maintenanceType" 
                  value={formData.maintenanceType} 
                  onChange={onChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                <input 
                  type="date" 
                  name="scheduledDate" 
                  value={formData.scheduledDate} 
                  onChange={onChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Technician</label>
              <input 
                type="text" 
                name="assignedTechnician" 
                value={formData.assignedTechnician} 
                onChange={onChange} 
                placeholder="Name or ID" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => onNavigate('maintenance')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}