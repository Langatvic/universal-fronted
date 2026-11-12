import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, asList, TOKEN_KEY, UNAUTHORIZED_EVENT } from '../services/api';

const AuthContext = createContext(null);

const BUSINESS_KEY = 'pos_business_id';
const BRANCH_KEY = 'pos_branch_id';
const ADMIN_ROLES = ['owner', 'admin'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const [activeBusinessId, setActiveBusinessIdState] = useState(localStorage.getItem(BUSINESS_KEY) || '');
  const [business, setBusiness] = useState(null); // full business record (currency, tax_rate…)
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchIdState] = useState(localStorage.getItem(BRANCH_KEY) || '');

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setBusiness(null);
    setBranches([]);
  }, []);

  // ---- Load the signed-in user whenever the token changes ----------------
  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await api.get('/api/auth/me/');
        if (active) setUser(profile);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [token, clearSession]);

  // ---- Sign out automatically if the API says our token is invalid -------
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession);
  }, [clearSession]);

  // ---- Which business is active? -----------------------------------------
  const memberships = user?.businesses ?? [];
  const activeMembership = memberships.find((m) => m.business_id === activeBusinessId) ?? memberships[0] ?? null;
  const businessId = activeMembership?.business_id ?? '';
  const role = activeMembership?.role ?? null;
  const isAdmin = ADMIN_ROLES.includes(role);

  // ---- Load business details + branches for the active business ----------
  useEffect(() => {
    if (!businessId) {
      setBusiness(null);
      setBranches([]);
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        const [detail, branchData] = await Promise.all([
          api.get(`/api/businesses/${businessId}/`),
          api.get('/api/businesses/branches/', { business_id: businessId }),
        ]);
        if (!active) return;

        const list = asList(branchData);
        setBusiness(detail);
        setBranches(list);

        // Keep the saved branch if it is still valid. Staff who are not
        // owner/admin must always work inside one branch.
        setActiveBranchIdState((current) => {
          if (current && list.some((b) => b.id === current)) return current;
          return !ADMIN_ROLES.includes(role) && list.length ? list[0].id : '';
        });
      } catch {
        if (active) {
          setBusiness(null);
          setBranches([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [businessId, role]);

  const setActiveBusinessId = (id) => {
    localStorage.setItem(BUSINESS_KEY, id);
    localStorage.removeItem(BRANCH_KEY);
    setActiveBranchIdState('');
    setActiveBusinessIdState(id);
  };

  const setActiveBranchId = (id) => {
    if (id) localStorage.setItem(BRANCH_KEY, id);
    else localStorage.removeItem(BRANCH_KEY);
    setActiveBranchIdState(id);
  };

  const refreshBusiness = useCallback(async () => {
    if (!businessId) return;
    setBusiness(await api.get(`/api/businesses/${businessId}/`));
  }, [businessId]);

  // ---- Login / logout -----------------------------------------------------
  const login = async (username, password) => {
    const data = await api.post('/api/auth/login/', { username, password });

    if (!data?.token) throw new Error('Unexpected login response from the server.');

    localStorage.setItem(TOKEN_KEY, data.token);

    // Fetch the full profile (including business memberships) before routing.
    let profile;
    try {
      profile = await api.get('/api/auth/me/');
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      throw err;
    }

    if (!profile.businesses?.length) {
      localStorage.removeItem(TOKEN_KEY);
      throw new Error('Your account is not a member of any business yet. Ask an owner to add you.');
    }

    setToken(data.token);
    setUser(profile);

    const chosen = profile.businesses.find((m) => m.business_id === activeBusinessId) ?? profile.businesses[0];
    return { ...profile, role: chosen.role, business_id: chosen.business_id };
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      // business context
      memberships,
      businessId,
      business,
      currency: business?.currency || 'KES',
      taxRate: Number(business?.tax_rate) || 0,
      role,
      isAdmin,
      setActiveBusinessId,
      refreshBusiness,
      // branch context ('' means "all branches", owners/admins only)
      branches,
      branchId: activeBranchId,
      setActiveBranchId,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, loading, memberships, businessId, business, role, isAdmin, branches, activeBranchId, refreshBusiness],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
};
