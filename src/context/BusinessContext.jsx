
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

const BusinessContext = createContext(null);

export const BusinessProvider = ({ children }) => {
  const { token, user, loading: authLoading } = useAuth();

  const [businesses, setBusinesses] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load businesses whenever authentication becomes available.
  useEffect(() => {
    let active = true;

    const loadBusinesses = async () => {
      if (authLoading) return;

      if (!token || !user) {
        setBusinesses([]);
        setBranches([]);
        setSelectedBusiness(null);
        setSelectedBranch(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await apiRequest('/api/businesses/');
        const availableBusinesses = data.results || [];

        if (!active) return;

        setBusinesses(availableBusinesses);

        const savedBusinessId = localStorage.getItem(
          'selectedBusinessId'
        );

        const business =
          availableBusinesses.find(
            item => item.id === savedBusinessId
          ) || availableBusinesses[0] || null;

        setSelectedBusiness(business);

        if (business) {
          localStorage.setItem('selectedBusinessId', business.id);
        } else {
          localStorage.removeItem('selectedBusinessId');
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setBusinesses([]);
          setSelectedBusiness(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBusinesses();

    return () => {
      active = false;
    };
  }, [token, user, authLoading]);

  // Load only branches accessible to the selected business membership.
  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      if (!selectedBusiness || !token) {
        setBranches([]);
        setSelectedBranch(null);
        return;
      }

      try {
        const data = await apiRequest(
          `/api/businesses/branches/?business_id=${encodeURIComponent(
            selectedBusiness.id
          )}`
        );

        if (!active) return;

        const availableBranches = data.results || [];
        setBranches(availableBranches);

        const savedBranchId = localStorage.getItem(
          'selectedBranchId'
        );

        const branch =
          availableBranches.find(
            item => item.id === savedBranchId
          ) || null;

        setSelectedBranch(branch);

        if (branch) {
          localStorage.setItem('selectedBranchId', branch.id);
        } else {
          localStorage.removeItem('selectedBranchId');
        }
      } catch (err) {
        if (active) {
          setBranches([]);
          setSelectedBranch(null);
          setError(err.message);
        }
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, [selectedBusiness, token]);

  const changeBusiness = businessId => {
    const business = businesses.find(
      item => item.id === businessId
    );

    if (!business) return;

    setSelectedBusiness(business);
    setSelectedBranch(null);

    localStorage.setItem('selectedBusinessId', business.id);
    localStorage.removeItem('selectedBranchId');
  };

  const changeBranch = branchId => {
    if (!branchId) {
      setSelectedBranch(null);
      localStorage.removeItem('selectedBranchId');
      return;
    }

    const branch = branches.find(
      item => item.id === branchId
    );

    if (!branch) return;

    setSelectedBranch(branch);
    localStorage.setItem('selectedBranchId', branch.id);
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        branches,
        selectedBusiness,
        selectedBranch,
        changeBusiness,
        changeBranch,
        loading,
        error,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      'useBusiness must be used inside BusinessProvider'
    );
  }

  return context;
};
