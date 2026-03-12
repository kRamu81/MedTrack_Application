import React, { useState, useEffect } from 'react';

// ==========================================
// 🖼️ IMAGE CONFIGURATION (Updated)
// ==========================================
const EQUIPMENT_IMAGES = {
  // Major Equipment
  "mri scanner": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl7fPv3AGiTlskFg0Ehetmi5OPa-grbbDihw&s",
  "ventilator": "https://cpimg.tistatic.com/08907627/b/4/Ventilator-NICU-Eqp.jpg",
  "ultrasound": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",

  // Small Equipment & Supplies
  "first aid kit": "https://insights.ibx.com/wp-content/uploads/2019/06/first-aid-kit-screenshot.png",
  "plasters": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz2dB1ZFi7qqCsrMy0AWBoZIKkTgS2HSRmDg&s",
  "bandages": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  "cotton wool": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
  "surgical mask": "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80",
  "stethoscope": "https://m.media-amazon.com/images/I/51i5-G3clqS.jpg",
  "oxygen mask": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRfa55i8m2yE5pGRFQpJQWqXJCuOKquOGzorjWcEY9xJsui_xzZqUr_gKFfbcU9YrjliBYtoA6BhMTaGj0EI53GdMW3Ps_vzPKntKmxZU6BII5riEr1yG9SaU0",
  "eyeglasses": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80",
  "scales": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  "blood pressure": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  "tongue depressor": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
  
  // Extras
  "thermometer": "https://images.unsplash.com/photo-1584567911485-5a6a7c2c3b1a?auto=format&fit=crop&w=800&q=80",
  "gloves": "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=800&q=80",
  "syringe": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjNiX8SW5VmoAc4hdFVf_fxaBztCph2-NnWQ&s",
  
  // Default Fallback
  "default": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
};

export default function EquipmentList({ onNavigate }) {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("medtrack_equipment");
    if (stored) setEquipment(JSON.parse(stored));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      const updatedList = equipment.filter((item) => item.id !== id);
      localStorage.setItem("medtrack_equipment", JSON.stringify(updatedList));
      setEquipment(updatedList);
    }
  };

  const getEquipmentImage = (name) => {
    const lowerName = name.toLowerCase();
    
    // 1. Check our Custom Configuration Map first
    for (const key in EQUIPMENT_IMAGES) {
      if (key !== 'default' && lowerName.includes(key)) {
        return EQUIPMENT_IMAGES[key];
      }
    }
    
    // 2. Fallback to default
    return EQUIPMENT_IMAGES.default;
  };

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equipment Inventory</h1>
              <p className="text-sm text-gray-500 mt-1">Total {equipment.length} items</p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-full md:w-64">
                 <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-4 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
              </div>
              <button
                onClick={() => onNavigate('add-equipment')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img 
                  src={getEquipmentImage(item.name)} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                  item.status === 'Operational' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }`}>
                   {item.status}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border mt-1">{item.id}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{item.model || 'Standard Model'}</p>
                <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {item.department}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                  <button 
                    onClick={() => onNavigate('schedule-maintenance')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Schedule
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





