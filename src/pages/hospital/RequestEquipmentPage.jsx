import React, { useState, useEffect } from 'react';

const RequestEquipmentPage = ({ onNavigate }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    quantity: 1,
    notes: ''
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
    
    // Mock Order Entity for Member 6 Backend
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      ...formData,
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      createdBy: 'Hospital Admin'
    };

    // Store in localStorage (simulating Order DB)
    const storedOrders = localStorage.getItem("medtrack_orders");
    const existingOrders = storedOrders ? JSON.parse(storedOrders) : [];
    const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem("medtrack_orders", JSON.stringify(updatedOrders));

    alert('Order placed successfully!');
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Request Equipment</h2>
            <p className="text-sm text-gray-500 mt-1">Place a new order for equipment supplies.</p>
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
                <option value="" disabled>-- Select Equipment --</option>
                {equipmentList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity} 
                onChange={onChange} 
                min="1"
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={onChange} 
                rows="3" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Urgency, specifications, etc."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => onNavigate('dashboard')} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEquipmentPage;