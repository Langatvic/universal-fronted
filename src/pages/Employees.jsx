import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Shield, User } from 'lucide-react';

const Employees = () => {
  // 1. Mock Data for Employees
  const [employees, setEmployees] = useState([
    { id: 1, name: 'James Omondi', email: 'james@company.com', role: 'Administrator', branch: 'Main Branch', status: 'Active' },
    { id: 2, name: 'Mary Wanjiku', email: 'mary@company.com', role: 'Manager', branch: 'Main Branch', status: 'Active' },
    { id: 3, name: 'Peter Kibe', email: 'peter@company.com', role: 'Cashier', branch: 'Branch 2', status: 'Active' },
    { id: 4, name: 'Lucy Achieng', email: 'lucy@company.com', role: 'Stock Controller', branch: 'Branch 1', status: 'Active' },
    { id: 5, name: 'David Kimani', email: 'david@company.com', role: 'Cashier', branch: 'Branch 3', status: 'Inactive' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // 2. Filter Logic
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Toggle Status Logic
  const toggleStatus = (id) => {
    setEmployees(employees.map(emp => 
      emp.id === id 
        ? { ...emp, status: emp.status === 'Active' ? 'Inactive' : 'Active' } 
        : emp
    ));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User & Employee Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage staff access, roles, and permissions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-blue-700 transition shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition text-sm">
              All Roles
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition text-sm">
              All Branches
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Branch</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{emp.email}</td>
                  <td className="p-4">
                    <div className="flex items-center text-sm text-slate-700">
                      {emp.role === 'Administrator' || emp.role === 'Manager' ? (
                        <Shield className="w-4 h-4 mr-1.5 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 mr-1.5 text-slate-400" />
                      )}
                      {emp.role}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{emp.branch}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(emp.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        emp.status === 'Active' 
                          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                      }`}
                    >
                      {emp.status}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No employees found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;