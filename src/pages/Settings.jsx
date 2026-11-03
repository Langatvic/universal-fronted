import { useState } from 'react';
import { 
  Building2, Percent, CreditCard, Box, Plug, 
  Users, Shield, MonitorSmartphone, Store, Scissors, 
  Pill, School, Stethoscope, Factory, Briefcase 
} from 'lucide-react';

const Settings = () => {
  // 1. State for active menu tab (Defaulting to General)
  const [activeTab, setActiveTab] = useState('General');

  // 2. State for Industry Modules toggles
  const [modules, setModules] = useState({
    retail: true,
    restaurant: false,
    pharmacy: false,
    warehouse: true,
    school: false,
    clinic: false,
    salon: false,
    manufacturing: false,
    corporate: true,
  });

  const toggleModule = (key) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Menu Items based on Image 8
  const menuItems = [
    { id: 'General', icon: Building2, label: 'General' },
    { id: 'Branches', icon: Store, label: 'Branches' },
    { id: 'Tax', icon: Percent, label: 'Tax & Currency' },
    { id: 'Payments', icon: CreditCard, label: 'Payment Methods' },
    { id: 'Modules', icon: Box, label: 'Modules' },
    { id: 'Integrations', icon: Plug, label: 'Integrations' },
    { id: 'Users', icon: Users, label: 'Roles & Users' },
    { id: 'Backup', icon: Shield, label: 'Backup & Security' },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      
      {/* LEFT SIDE: Settings Menu */}
      <div className="w-64 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col py-4 h-full">
        <h2 className="px-6 text-lg font-bold text-slate-800 mb-4">Settings</h2>
        <div className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
        
        {/* --- GENERAL TAB (Image 8) --- */}
        {activeTab === 'General' && (
          <div className="p-8 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-slate-800">General Settings</h1>
              <p className="text-slate-500 text-sm mt-1">Configure your organization and system preferences</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                  <input 
                    type="text" 
                    defaultValue="Acme Retail Ltd" 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option>KES (Kenyan Shilling)</option>
                    <option>USD (US Dollar)</option>
                    <option>EUR (Euro)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    defaultValue="16" 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Zone</label>
                  <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option>Africa/Nairobi</option>
                    <option>Africa/Lagos</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-slate-700">Use Multi-Branch Mode</span>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODULES TAB (Image 9) --- */}
        {activeTab === 'Modules' && (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-slate-800">Industry Modules</h1>
              <p className="text-slate-500 text-sm mt-1">Enable the features you need for your business type</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Module Card 1: Retail */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-orange-100 rounded-lg">
                    <Store className="w-6 h-6 text-orange-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('retail')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.retail ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.retail ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Retail & Supermarkets</h3>
                <p className="text-xs text-slate-500 mt-1">Barcode scanning, promotions, stock control</p>
              </div>

              {/* Module Card 2: Restaurants */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-yellow-100 rounded-lg">
                    <MonitorSmartphone className="w-6 h-6 text-yellow-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('restaurant')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.restaurant ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.restaurant ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Restaurants & Hotels</h3>
                <p className="text-xs text-slate-500 mt-1">Tables, orders, kitchen tickets</p>
              </div>

              {/* Module Card 3: Pharmacy */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <Pill className="w-6 h-6 text-purple-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('pharmacy')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.pharmacy ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.pharmacy ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Pharmacies</h3>
                <p className="text-xs text-slate-500 mt-1">Batch numbers, expiry dates</p>
              </div>

              {/* Module Card 4: Warehouses */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Box className="w-6 h-6 text-blue-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('warehouse')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.warehouse ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.warehouse ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Warehouses & Distributors</h3>
                <p className="text-xs text-slate-500 mt-1">Bulk stock, transfers</p>
              </div>

              {/* Module Card 5: Schools */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <School className="w-6 h-6 text-green-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('school')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.school ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.school ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Schools & Training</h3>
                <p className="text-xs text-slate-500 mt-1">Fee collection, receipts</p>
              </div>

              {/* Module Card 6: Hospitals */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-red-100 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-red-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('clinic')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.clinic ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.clinic ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Hospitals & Clinics</h3>
                <p className="text-xs text-slate-500 mt-1">Service billing, integrations</p>
              </div>

              {/* Module Card 7: Salons */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-pink-100 rounded-lg">
                    <Scissors className="w-6 h-6 text-pink-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('salon')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.salon ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.salon ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Salons & Services</h3>
                <p className="text-xs text-slate-500 mt-1">Appointments, service charges</p>
              </div>

               {/* Module Card 8: Manufacturing */}
               <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-indigo-100 rounded-lg">
                    <Factory className="w-6 h-6 text-indigo-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('manufacturing')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.manufacturing ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.manufacturing ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Manufacturing</h3>
                <p className="text-xs text-slate-500 mt-1">Production, material tracking</p>
              </div>

              {/* Module Card 9: Corporate */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-slate-600" />
                  </div>
                  <button 
                    onClick={() => toggleModule('corporate')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modules.corporate ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${modules.corporate ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">Offices & Corporate</h3>
                <p className="text-xs text-slate-500 mt-1">Departmental sales, cost centres</p>
              </div>

            </div>
          </div>
        )}

        {/* Placeholder for other tabs so it's not blank */}
        {activeTab !== 'General' && activeTab !== 'Modules' && (
          <div className="flex h-full items-center justify-center text-slate-400 flex-col">
            <Box className="w-12 h-12 mb-4 text-slate-300" />
            <p>The <strong>{activeTab}</strong> settings will be built here.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;