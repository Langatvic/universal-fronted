import { Bell, Search, ChevronDown, Store } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 ml-64 fixed top-0 right-0 left-0 z-10 shadow-sm">
      {/* Left: Branch Selector */}
      <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
        <Store className="w-4 h-4 mr-2 text-blue-600" />
        {/* Main Branch */}
        <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center space-x-6">
        {/* Search (Visual only for now) */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6 cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            J
          </div>
          <div className="text-sm hidden md:block">
            <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{/* User Name */}</p>
            <p className="text-xs text-slate-500">{/** User Role */}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;