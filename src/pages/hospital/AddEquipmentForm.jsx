import React, { useState } from 'react';
import { addEquipment } from '../../services/EquipmentService';

export default function AddEquipmentForm({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    department: '',
    status: 'Operational',
    purchaseDate: '',
    description: '',
    category: 'Imaging'
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const equipmentData = {
        ...formData,
        deviceCode: `EQ-${Date.now().toString().slice(-4)}`
      };
      
      await addEquipment(equipmentData);
      alert('Equipment registered successfully!');
      onNavigate('equipment');
    } catch (err) {
      console.error("Error adding equipment:", err);
      alert('Failed to register equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 p-6 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-white p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="mb-10 text-center relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Register Asset</h2>
          <p className="text-slate-400 font-medium mt-1">Add a new equipment unit to the facility inventory.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Name</label>
            <input 
              type="text" name="name" 
              value={formData.name} onChange={onChange} required 
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold placeholder:text-slate-300 transition-all" 
              placeholder="e.g., MRI Scanner" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Model / Brand</label>
              <input 
                type="text" name="model" 
                value={formData.model} onChange={onChange} 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold placeholder:text-slate-300 transition-all" 
                placeholder="e.g., Siemens X1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Serial Number</label>
              <input 
                type="text" name="serialNumber" 
                value={formData.serialNumber} onChange={onChange} required 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold placeholder:text-slate-300 transition-all" 
                placeholder="SN-8291-X"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
              <input 
                type="text" name="department" 
                value={formData.department} onChange={onChange} required 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold placeholder:text-slate-300 transition-all" 
                placeholder="e.g., Radiology" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <select 
                name="category" value={formData.category} onChange={onChange}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold transition-all cursor-pointer"
              >
                <option>Imaging</option>
                <option>Surgical</option>
                <option>Monitoring</option>
                <option>Laboratory</option>
                <option>Respiratory</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Condition</label>
              <select name="status" value={formData.status} onChange={onChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold transition-all cursor-pointer">
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purchase Date</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={onChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold transition-all" />
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4">
            <button 
              type="button" onClick={() => onNavigate('equipment')} 
              className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}