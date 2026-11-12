import { Store, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../utils/permissions';

const Topbar = () => {
  const {
    user, role, isAdmin,
    memberships, businessId, setActiveBusinessId,
    branches, branchId, setActiveBranchId,
  } = useAuth();

  const displayName = user?.first_name || user?.username || 'User';
  const selectClass =
    'bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer max-w-[190px] truncate';

  return (
    <header className="fixed top-0 left-64 right-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      {/* Business + Branch selectors (real data from the backend) */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Building2 className="mr-2 h-4 w-4 text-blue-600" />
          <select
            className={selectClass}
            value={businessId}
            onChange={(e) => setActiveBusinessId(e.target.value)}
            disabled={memberships.length <= 1}
            aria-label="Business"
          >
            {memberships.map((m) => (
              <option key={m.business_id} value={m.business_id}>
                {m.business_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Store className="mr-2 h-4 w-4 text-blue-600" />
          <select
            className={selectClass}
            value={branchId}
            onChange={(e) => setActiveBranchId(e.target.value)}
            disabled={!isAdmin && branches.length <= 1}
            aria-label="Branch"
          >
            {isAdmin && <option value="">All branches</option>}
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden text-sm md:block">
          <p className="font-semibold text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-500">{roleLabel(role)}</p>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
