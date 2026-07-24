import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllEquipment } from '../../services/EquipmentService';
import { placeOrder } from '../../services/OrderService';

const RequestEquipmentPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await getAllEquipment();
        setEquipmentList(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, equipmentId: data[0].equipmentCode, equipmentName: data[0].name }));
        }
      } catch (err) {
        console.error("Error fetching equipment:", err);
      }
    };
    fetchEquipment();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "equipmentId") {
      const selected = equipmentList.find(eq => eq.equipmentCode === value);
      setFormData({
        ...formData,
        equipmentId: value,
        equipmentName: selected ? selected.name : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await placeOrder({
        ...formData,
        hospital: user?.organization,
        createdBy: user?.name
      });
      alert('Order placed successfully!');
      onNavigate('dashboard');
    } catch (err) {
      console.error("Error placing order:", err);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-sm border border-subtle p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Request Equipment</h2>
            <p className="text-sm text-secondary mt-1">Place a new order for equipment supplies.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Equipment *</label>
              <select 
                name="equipmentId" 
                value={formData.equipmentId} 
                onChange={onChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>-- Select Equipment --</option>
                {equipmentList.map((item) => (
                  <option key={item.id} value={item.equipmentCode}>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
              <button 
                type="button" 
                onClick={() => onNavigate('dashboard')} 
                className="px-4 py-2 bg-hover hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
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