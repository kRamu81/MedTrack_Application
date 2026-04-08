import React, { useState, useEffect } from 'react';
import { getAllEquipment } from '../../services/EquipmentService';
import { scheduleTask } from '../../services/MaintenanceService';

export default function ScheduleMaintenancePage({ onNavigate }) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipment: '', // name
    maintenanceType: 'Preventive',
    deadline: '', // mapped from scheduledDate
    assignedTechnician: '',
    description: '',
    priority: 'Normal'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await getAllEquipment();
      setEquipmentList(data);
      if (data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          equipmentId: data[0].deviceCode || data[0].id, 
          equipment: data[0].name 
        }));
      }
    } catch (err) {
      console.error("Error fetching equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "equipmentId") {
      const selected = equipmentList.find(eq => (eq.deviceCode || eq.id.toString()) === value);
      setFormData({
        ...formData,
        equipmentId: value,
        equipment: selected ? selected.name : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        ...formData,
        taskCode: `MNT-${Date.now().toString().slice(-4)}`,
        status: 'Scheduled',
        hospital: 'City General Hospital' // Default for now
      };

      await scheduleTask(newTask);
      alert('Maintenance scheduled successfully!');
      onNavigate('maintenance');
    } catch (err) {
      console.error("Error scheduling maintenance:", err);
      alert('Failed to schedule maintenance.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading equipment list...</div>;

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
                  <option key={item.id} value={item.deviceCode || item.id}>
                    {item.name} ({item.deviceCode || item.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  name="maintenanceType" 
                  value={formData.maintenanceType} 
                  onChange={onChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Calibration">Calibration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  name="priority" 
                  value={formData.priority} 
                  onChange={onChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                <input 
                  type="date" 
                  name="deadline" 
                  value={formData.deadline} 
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={onChange} 
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => onNavigate('maintenance')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}