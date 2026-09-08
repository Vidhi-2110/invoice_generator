import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export const AuthCard = ({
  defaultTab = 'login', // 'login' | 'register'
  onSuccess,
  appName = 'InvoSaaS',
  logo = null,
  showQuickFill = true
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl shadow-indigo-500/10 p-6 sm:p-8 transition-all duration-300">
      {/* Header / Logo */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-black text-2xl shadow-lg shadow-indigo-500/30 mb-3 ring-4 ring-indigo-50">
          {logo || 'I'}
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {appName}
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {activeTab === 'login'
            ? 'Sign in to access your dashboard & invoices'
            : 'Get started with a free professional account'}
        </p>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100/80 rounded-xl border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'register'
              ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form Content */}
      <div className="transition-all duration-300">
        {activeTab === 'login' ? (
          <LoginForm
            onSuccess={onSuccess}
            onSwitchToRegister={() => setActiveTab('register')}
            showQuickFill={showQuickFill}
          />
        ) : (
          <RegisterForm
            onSuccess={onSuccess}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthCard;
