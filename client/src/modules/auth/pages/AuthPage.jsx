import { useNavigate, useLocation } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

export const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <AuthCard defaultTab={mode} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AuthPage;
