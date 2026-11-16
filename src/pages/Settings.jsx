import { useEffect, useState } from 'react';
import { Building2, Percent, Store, UserCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../utils/permissions';
import { Badge, ErrorBanner, Field, PrimaryButton, inputClass } from '../components/ui';

const INDUSTRIES = [
  ['retail', 'Retail'],
  ['restaurant', 'Restaurant'],
  ['wholesale', 'Wholesale'],
  ['pharmacy', 'Pharmacy'],
  ['other', 'Other'],
];

const MENU = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'tax', label: 'Tax & Currency', icon: Percent },
  { id: 'branches', label: 'Branches', icon: Store },
  { id: 'account', label: 'My Account', icon: UserCircle },
];

const Settings = () => {
  const { business, businessId, refreshBusiness, branches, user, role } = useAuth();

  const [tab, setTab] = useState('general');
  const [form, setForm] = useState({
    name: '',
    industry: 'retail',
    currency: 'KES',
    tax_rate: '0',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? '',
        industry: business.industry ?? 'retail',
        currency: business.currency ?? 'KES',
        tax_rate: String(business.tax_rate ?? 0),
      });
    }
  }, [business]);

  const save = async (event, fields) => {
    event.preventDefault();

    if (!businessId) {
      setError('No active business was found. Please log in again.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    const payload = Object.fromEntries(
      fields.map((field) => [field, form[field]])
    );

    console.log('Settings: submitting PATCH request', {
      businessId,
      payload,
    });

    try {
      const response = await api.patch(
        `/api/businesses/${businessId}/`,
        payload
      );

      console.log('Settings: PATCH successful', response);

      await refreshBusiness();

      setNotice('Settings saved successfully.');
    } catch (err) {
      console.error('Settings: save failed', err);
      setError(err.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="h-fit w-full rounded-xl border border-slate-200 bg-white py-4 shadow-sm md:w-64">
        <h2 className="mb-4 px-6 text-lg font-bold text-slate-800">
          Settings
        </h2>

        {MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setError('');
              setNotice('');
            }}
            className={`flex w-full items-center px-6 py-3 text-sm font-medium transition-colors ${
              tab === item.id
                ? 'border-r-4 border-blue-600 bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl flex-1 space-y-4">
        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <ErrorBanner message={error} />

        {tab === 'general' && (
          <form
            onSubmit={(event) => save(event, ['name', 'industry'])}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-800">Business details</h3>

            <Field label="Business name">
              <input
                className={inputClass}
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </Field>

            <Field label="Industry">
              <select
                className={inputClass}
                value={form.industry}
                onChange={(event) =>
                  setForm({ ...form, industry: event.target.value })
                }
              >
                {INDUSTRIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </PrimaryButton>
          </form>
        )}

        {tab === 'tax' && (
          <form
            onSubmit={(event) => save(event, ['currency', 'tax_rate'])}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-800">Tax & currency</h3>

            <Field label="Currency code" hint="3-letter code, e.g. KES, USD">
              <input
                className={inputClass}
                required
                maxLength={3}
                value={form.currency}
                onChange={(event) =>
                  setForm({
                    ...form,
                    currency: event.target.value.toUpperCase(),
                  })
                }
              />
            </Field>

            <Field
              label="Tax rate (%)"
              hint="Applied automatically to new sales"
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={inputClass}
                required
                value={form.tax_rate}
                onChange={(event) =>
                  setForm({ ...form, tax_rate: event.target.value })
                }
              />
            </Field>

            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </PrimaryButton>
          </form>
        )}

        {tab === 'branches' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Branches</h3>

            <div className="divide-y divide-slate-100">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between py-3"
                >
                  <span className="font-medium text-slate-800">
                    {branch.name}
                  </span>
                  <Badge>{branch.code}</Badge>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-400">
              New branches are added from the Django admin site.
            </p>
          </div>
        )}

        {tab === 'account' && (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
            <h3 className="mb-2 font-bold text-slate-800">My account</h3>
            <p>
              <span className="text-slate-500">Username:</span>{' '}
              {user?.username}
            </p>
            <p>
              <span className="text-slate-500">Email:</span>{' '}
              {user?.email || '—'}
            </p>
            <p>
              <span className="text-slate-500">Role:</span> {roleLabel(role)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
