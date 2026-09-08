import { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export const LoginForm = ({ onSuccess, onSwitchToRegister, showQuickFill = true }) => {
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showDemoNotification, setShowDemoNotification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password, rememberMe);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('admin@invosaas.com');
    setPassword('password123');
    setLocalError('');
    clearError();
    setShowDemoNotification(true);
    setTimeout(() => setShowDemoNotification(false), 3000);
  };

  const activeError = localError || error;

  return (
    <div className="w-full">
      {/* Error Alert */}
      {activeError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-start gap-2.5 animate-fadeIn">
          <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Sign in failed</p>
            <p className="text-xs text-rose-600 mt-0.5">{activeError}</p>
          </div>
        </div>
      )}

      {/* Demo Filled Toast */}
      {showDemoNotification && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs flex items-center gap-2 animate-fadeIn">
          <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Demo credentials loaded! Click <strong>Sign In</strong> to continue.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FiMail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => alert('Demo Reset Link: Please use password "password123" or click Quick Fill Demo Account.')}
              className="text-xs text-indigo-600 font-medium hover:text-indigo-800 hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FiLock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-600">Remember me for 7 days</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <span>Sign In</span>
              <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Demo Helper */}
      {showQuickFill && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 bg-slate-100/70 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-fill Demo Account (admin@invosaas.com)
          </button>
        </div>
      )}

      {/* Switch to Register link */}
      {onSwitchToRegister && (
        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none"
          >
            Create account
          </button>
        </p>
      )}
    </div>
  );
};

export default LoginForm;
