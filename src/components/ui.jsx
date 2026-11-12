import { X, Loader2, AlertCircle, Inbox } from 'lucide-react';

export const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center py-16 text-slate-500">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const ErrorBanner = ({ message, onRetry }) =>
  message ? (
    <div className="flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <div className="flex items-start">
        <AlertCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="ml-4 shrink-0 font-semibold underline">
          Retry
        </button>
      )}
    </div>
  ) : null;

export const EmptyState = ({ message = 'Nothing to show yet.' }) => (
  <div className="flex flex-col items-center justify-center py-14 text-slate-400">
    <Inbox className="mb-2 h-8 w-8" />
    <p className="text-sm">{message}</p>
  </div>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex items-center space-x-3">{children}</div>
  </div>
);

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`flex items-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

export const StatCard = ({ title, value, icon: Icon, color = 'text-blue-600', bg = 'bg-blue-100', hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="mb-1 text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      {Icon && (
        <div className={`rounded-xl p-3 ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      )}
    </div>
  </div>
);

export const Modal = ({ title, subtitle, onClose, children, maxWidth = 'max-w-lg' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 transition-colors hover:text-red-500" aria-label="Close">
          <X size={22} />
        </button>
      </div>
      <div className="overflow-y-auto p-6">{children}</div>
    </div>
  </div>
);

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
  </label>
);

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100';

export const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
};
