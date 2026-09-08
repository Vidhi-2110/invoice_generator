import { useNavigate, useLocation } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 -right-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Side Info */}
          <div className="lg:col-span-7 text-white space-y-6 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              Join InvoSaaS Today
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Generating <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                Professional Invoices.
              </span>
            </h1>

            <p className="text-slate-400 text-base max-w-lg leading-relaxed">
              Create your account in seconds to manage customer estimates, proforma invoices, and automated totals effortlessly.
            </p>

            {/* Benefit Bullets */}
            <ul className="space-y-3 pt-2">
              {[
                'Instant access to all invoice & proforma features',
                'Multi-reference line item auto-fill engine',
                'Export high quality PDFs ready for clients',
                'No credit card required to test out features'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Form Card Side */}
          <div className="lg:col-span-5 flex justify-center">
            <AuthCard defaultTab="register" onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
