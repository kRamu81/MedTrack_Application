import React, { useState } from 'react';

export default function AddEquipmentForm({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    department: '',
    status: 'Operational',
    purchaseDate: ''
  });

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    const newEquipment = {
      id: `EQ-${Date.now().toString().slice(-4)}`,
      ...formData
    };

    const stored = localStorage.getItem("medtrack_equipment");
    const existing = stored ? JSON.parse(stored) : [];
    existing.push(newEquipment);
    localStorage.setItem("medtrack_equipment", JSON.stringify(existing));
    
    alert('Equipment added successfully!');
    onNavigate('equipment');
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Add New Equipment</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in details to register new inventory.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
            <input type="text" name="name" value={formData.name} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., MRI Scanner" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input type="text" name="model" value={formData.model} onChange={onChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input type="text" name="serialNumber" value={formData.serialNumber} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input type="text" name="department" value={formData.department} onChange={onChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Radiology" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={onChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={onChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => onNavigate('equipment')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
              Save Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}