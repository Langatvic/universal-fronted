import { useState } from 'react';
import { Plus, CreditCard, Banknote, Smartphone, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const PaymentMethods = () => {
  const [methods, setMethods] = useState([
    { id: 1, name: 'Cash', type: 'cash', icon: Banknote, active: true, description: 'Physical cash payments' },
    { id: 2, name: 'Credit/Debit Card', type: 'card', icon: CreditCard, active: true, description: 'Visa, Mastercard via POS terminal' },
    { id: 3, name: 'Mobile Money', type: 'mobile', icon: Smartphone, active: true, description: 'M-Pesa, Airtel Money, etc.' },
    { id: 4, name: 'Bank Transfer', type: 'bank', icon: CreditCard, active: false, description: 'Direct bank deposits' },
  ]);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({ name: '', type: 'card', description: '' });

  const toggleMethod = (id) => {
    setMethods(currentMethods => currentMethods.map(method =>
      method.id === id ? { ...method, active: !method.active } : method
    ));
  };

  const addMethod = (event) => {
    event.preventDefault();
    const name = newMethod.name.trim();

    if (!name) return;

    setMethods(currentMethods => [
      ...currentMethods,
      {
        id: Math.max(0, ...currentMethods.map(method => method.id)) + 1,
        name,
        type: newMethod.type,
        icon: newMethod.type === 'cash' ? Banknote : newMethod.type === 'mobile' ? Smartphone : CreditCard,
        active: true,
        description: newMethod.description.trim() || 'Additional payment option',
      },
    ]);
    setNewMethod({ name: '', type: 'card', description: '' });
    setIsAddingMethod(false);
  };

  const removeMethod = (id) => {
    setMethods(currentMethods => currentMethods.filter(method => method.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'cash': return <Banknote className="w-6 h-6 text-green-600" />;
      case 'card': return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'mobile': return <Smartphone className="w-6 h-6 text-purple-600" />;
      default: return <CreditCard className="w-6 h-6 text-slate-600" />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'cash': return 'bg-green-100';
      case 'card': return 'bg-blue-100';
      case 'mobile': return 'bg-purple-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment Methods</h1>
          <p className="text-slate-500 text-sm mt-1">Configure which payment options cashiers can use at checkout</p>
        </div>
        <button
          onClick={() => setIsAddingMethod(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Method
        </button>
      </div>

      {isAddingMethod && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={addMethod} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add Payment Method</h2>
              <p className="mt-1 text-sm text-slate-500">Add an option for checkout.</p>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                autoFocus
                required
                value={newMethod.name}
                onChange={event => setNewMethod({ ...newMethod, name: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type
              <select
                value={newMethod.type}
                onChange={event => setNewMethod({ ...newMethod, type: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile money</option>
                <option value="bank">Bank transfer</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <input
                value={newMethod.description}
                onChange={event => setNewMethod({ ...newMethod, description: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingMethod(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Add method
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white p-6 rounded-xl border shadow-sm flex items-start justify-between transition-all ${method.active ? 'border-slate-200' : 'border-slate-100 opacity-60 bg-slate-50'}`}>
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl ${getBgColor(method.type)}`}>
                {getIcon(method.type)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{method.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{method.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-4">
              <button 
                type="button"
                onClick={() => toggleMethod(method.id)}
                aria-label={`${method.active ? 'Disable' : 'Enable'} ${method.name}`}
                className={`transition-colors ${method.active ? 'text-green-600 hover:text-green-700' : 'text-slate-400 hover:text-slate-500'}`}
              >
                {method.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
              
              <button
                type="button"
                onClick={() => removeMethod(method.id)}
                aria-label={`Remove ${method.name}`}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;