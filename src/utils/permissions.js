/*
 * Roles come from the Django Membership model:
 *   owner, admin, manager, cashier, stock_manager, accountant
 * These sets mirror the checks the backend enforces, so the UI only offers
 * what the API will actually allow.
 */
export const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  stock_manager: 'Stock Manager',
  accountant: 'Accountant',
};

export const ALL_ROLES = Object.keys(ROLE_LABELS);

export const FEATURES = {
  dashboard: ALL_ROLES,
  sales: ['owner', 'admin', 'manager', 'cashier'],
  inventory: ['owner', 'admin', 'manager', 'stock_manager'],
  purchasing: ['owner', 'admin', 'manager', 'stock_manager'],
  reports: ['owner', 'admin', 'manager', 'accountant'],
  employees: ['owner', 'admin'],
  settings: ['owner', 'admin'],
};

export const canAccess = (role, feature) => Boolean(role) && (FEATURES[feature] || []).includes(role);

/** First page a given role should land on after login. */
export const homePathFor = (role) => {
  if (role === 'cashier') return '/dashboard/sales';
  if (role === 'stock_manager') return '/dashboard/inventory';
  return '/dashboard';
};

export const roleLabel = (role) => ROLE_LABELS[role] || (role ? role.replace(/_/g, ' ') : 'No role');
