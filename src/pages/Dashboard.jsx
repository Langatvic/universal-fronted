import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: "Today's Sales", value: "KES 124,560", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Transactions", value: "48", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Stock Items", value: "1,248", icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Total Customers", value: "32", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, James. Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400">
        <BarChart3 className="w-16 h-16 mb-4 text-slate-300" />
        <p className="text-lg font-medium">Sales Chart will go here</p>
        <p className="text-sm">We will install Recharts in the next step to build this.</p>
      </div>
    </div>
  );
};

// Need to import BarChart3 for the placeholder
import { BarChart3 } from 'lucide-react';

export default Dashboard;