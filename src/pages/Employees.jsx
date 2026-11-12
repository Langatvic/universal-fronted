import { useMemo, useState } from 'react';
import { Search, Plus, Edit, UserCheck, UserX } from 'lucide-react';
import { api, asList } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { ALL_ROLES, roleLabel } from '../utils/permissions';
import { Badge, EmptyState, ErrorBanner, Field, Modal, PageHeader, PrimaryButton, SecondaryButton, Spinner, inputClass } from '../components/ui';

const emptyForm = { username: '', password: '', first_name: '', last_name: '', email: '', role: 'cashier', branch_ids: [] };

const Employees = () => {
  const { businessId, branches, role: myRole } = useAuth();
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [modal, setModal] = useState(null); // { employee | null }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useFetch(
    () => api.get('/api/businesses/employees/', { business_id: businessId }).then(asList),
    [businessId],
    Boolean(businessId),
  );

  // Only the owner may hand out owner/admin roles (the API enforces this too).
  const assignableRoles = myRole === 'owner' ? ALL_ROLES : ALL_ROLES.filter((r) => r !== 'owner' && r !== 'admin');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data || []).filter((e) => !q || e.name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q));
  }, [data, search]);

  const canEdit = (emp) => myRole === 'owner' || !['owner', 'admin'].includes(emp.role);

  const openAdd = () => { setActionError(''); setForm(emptyForm); setModal({ employee: null }); };
  const openEdit = (emp) => {
    setActionError('');
    setForm({ ...emptyForm, username: emp.username, first_name: emp.first_name, last_name: emp.last_name, email: emp.email, role: emp.role, branch_ids: emp.branches.map((b) => b.id) });
    setModal({ employee: emp });
  };

  const toggleBranch = (id) =>
    setForm((f) => ({ ...f, branch_ids: f.branch_ids.includes(id) ? f.branch_ids.filter((b) => b !== id) : [...f.branch_ids, id] }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      if (modal.employee) {
        const { first_name, last_name, email, role, branch_ids } = form;
        await api.patch(`/api/businesses/employees/${modal.employee.membership_id}/`, { first_name, last_name, email, role, branch_ids });
        setNotice('Employee updated.');
      } else {
        await api.post('/api/businesses/employees/', { ...form, business_id: businessId });
        setNotice('Employee added. Share their username and password with them securely.');
      }
      setModal(null);
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (emp) => {
    setActionError('');
    try {
      await api.patch(`/api/businesses/employees/${emp.membership_id}/`, { is_active: !emp.is_active });
      setNotice(`${emp.name} ${emp.is_active ? 'deactivated' : 'activated'}.`);
      reload();
    } catch (err) {
      setNotice('');
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Employees" subtitle="Manage your team, roles and branch access">
        <PrimaryButton onClick={openAdd}><Plus className="mr-2 h-5 w-5" /> Add Employee</PrimaryButton>
      </PageHeader>

      {notice && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
      <ErrorBanner message={!modal ? actionError : ''} />
      <ErrorBanner message={error} onRetry={reload} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search by name, username or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {loading && !data ? <Spinner label="Loading employees..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="p-4 font-medium">Employee</th><th className="p-4 font-medium">Role</th><th className="p-4 font-medium">Branches</th>
                  <th className="p-4 font-medium">Status</th><th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((emp) => (
                  <tr key={emp.membership_id} className="hover:bg-slate-50">
                    <td className="p-4"><p className="font-semibold text-slate-800">{emp.name}</p><p className="text-xs text-slate-500">@{emp.username}{emp.email ? ` · ${emp.email}` : ''}</p></td>
                    <td className="p-4"><Badge tone="blue">{roleLabel(emp.role)}</Badge></td>
                    <td className="p-4 text-slate-600">{emp.branches.length ? emp.branches.map((b) => b.name).join(', ') : 'All branches'}</td>
                    <td className="p-4"><Badge tone={emp.is_active ? 'green' : 'red'}>{emp.is_active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4 text-right">
                      {canEdit(emp) && (
                        <div className="flex justify-end space-x-1">
                          <button onClick={() => openEdit(emp)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Edit size={18} /></button>
                          <button onClick={() => toggleActive(emp)} className={`rounded-lg p-2 text-slate-400 ${emp.is_active ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-green-50 hover:text-green-600'}`} title={emp.is_active ? 'Deactivate' : 'Activate'}>
                            {emp.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <EmptyState message="No employees found." />}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.employee ? 'Edit Employee' : 'Add Employee'} onClose={() => setModal(null)}>
          <form onSubmit={submit} className="space-y-4">
            <ErrorBanner message={actionError} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name"><input className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
              <Field label="Last name"><input className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username"><input className={inputClass} required disabled={Boolean(modal.employee)} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
              {!modal.employee && (
                <Field label="Password" hint="At least 8 characters"><input type="password" className={inputClass} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
              )}
            </div>
            <Field label="Email (optional)"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Role">
              <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {assignableRoles.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
            </Field>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-700">Branch access</p>
              <p className="mb-2 text-xs text-slate-400">Leave all unticked to give access to every branch.</p>
              <div className="grid grid-cols-2 gap-2">
                {branches.map((b) => (
                  <label key={b.id} className="flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <input type="checkbox" className="mr-2" checked={form.branch_ids.includes(b.id)} onChange={() => toggleBranch(b.id)} />{b.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
              <SecondaryButton type="button" onClick={() => setModal(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Employees;
