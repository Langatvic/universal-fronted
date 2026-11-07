
import { Bell, Search, ChevronDown, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user } = useAuth();

  const activeBusiness = user?.businesses?.find(
    (business) => business.is_active !== false
  ) ?? user?.businesses?.[0];

  const role = activeBusiness?.role ?? user?.role ?? 'User';

  const displayName =
    user?.first_name ||
    user?.username ||
    'User';

  return (
    <header className="fixed top-0 left-64 right-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">

      {/* Branch Selector */}
      <div className="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
        <Store className="mr-2 h-4 w-4 text-blue-600" />
        <span>Main Branch</span>
        <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
      </div>

      {/* Actions and Profile */}
      <div className="flex items-center space-x-6">

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-blue-600">
          <Bell className="h-5 w-5" />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        {/* User Profile */}
        <div className="group flex cursor-pointer items-center space-x-3 border-l border-slate-200 pl-6">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden text-sm md:block">
            <p className="font-semibold text-slate-800">
              {displayName}
            </p>

            <p className="text-xs capitalize text-slate-500">
              {role.replace('_', ' ')}
            </p>
          </div>

          <ChevronDown className="h-4 w-4 text-slate-400" />

        </div>
      </div>
    </header>
  );
};

export default Topbar;
