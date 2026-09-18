import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiFileText, FiShield, FiTrendingUp } from 'react-icons/fi';
import AuthCard from '../components/AuthCard';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-0 -left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Hero Side (Branding & Feature Bullets) */}
          <div className="lg:col-span-7 text-white space-y-6 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Next-Gen Invoice & Billing Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Manage Invoices <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">
                With Ultimate Speed.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Create professional invoices, manage proformas, convert orders seamlessly, and monitor real-time billing performance in one unified workflow.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                  <FiFileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Proforma Integration</h4>
                  <p className="text-xs text-slate-400 mt-0.5">1-click conversion from Proforma to Invoice.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 shrink-0">
                  <FiTrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Live Financial Stats</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time revenue & payment sync.</p>
                </div>
              </div>
            </div>

            {/* Social Trust Indicators */}
            <div className="pt-4 flex items-center gap-6 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-400" /> 256-bit SSL Security
              </div>
              <div className="flex items-center gap-1.5">
                <FiShield className="text-indigo-400" /> Enterprise Access Control
              </div>
            </div>
          </div>

          {/* Right Card Side */}
          <div className="lg:col-span-5 flex justify-center">
            <AuthCard defaultTab="login" onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
