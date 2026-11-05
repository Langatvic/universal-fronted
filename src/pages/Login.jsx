import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, EyeOff, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
     
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Left Side - Branding */}
      <div className="w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-blue-600 p-5 rounded-2xl mb-8 shadow-2xl shadow-blue-500/40">
            <Package className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Universal POS</h1>
          <p className="text-xl text-slate-400 font-medium mb-12">Smarter Business. Better Control.</p>
          
          <div className="grid grid-cols-1 gap-6 text-sm text-slate-300 w-full max-w-md">
            <div className="flex items-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-6 h-6 text-blue-400 mr-4" />
              <span>Secure & Reliable Transactions</span>
            </div>
            <div className="flex items-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <Zap className="w-6 h-6 text-yellow-400 mr-4" />
              <span>Lightning Fast Checkout</span>
            </div>
            <div className="flex items-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <BarChart3 className="w-6 h-6 text-green-400 mr-4" />
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Admin Login</h2>
            <p className="text-slate-500">Sign in to manage your business</p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your admin username"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all">Forgot password?</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;