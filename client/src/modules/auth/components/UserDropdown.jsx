import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiShield, FiChevronDown, FiMail, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export const UserDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 focus:outline-none cursor-pointer group"
      >
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
            {user.name}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {user.email}
          </p>
        </div>

        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 border border-indigo-200 flex items-center justify-center font-bold text-white text-base shadow-sm shadow-indigo-500/20">
            {getInitial(user.name)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>

        <FiChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 py-2 z-50 animate-fadeIn">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Signed in as
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 flex items-center gap-1">
                <FiShield size={10} />
                {user.role || 'Member'}
              </span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 truncate mt-1">{user.name}</p>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <FiMail size={12} className="text-slate-400" />
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowProfileModal(true);
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FiUser size={16} className="text-slate-400 group-hover:text-indigo-600" />
              View Account Profile
            </button>
          </div>

          {/* Logout Divider & Button */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FiLogOut size={16} className="text-rose-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Account Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
                {getInitial(user.name)}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <FiCheckCircle size={14} className="text-emerald-500" />
                Active Session
              </div>
            </div>

            <div className="mt-5 space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">User ID</span>
                <span className="font-mono text-slate-700 font-semibold">{user.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="text-slate-800 font-bold">{user.role || 'Member'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="text-slate-800 font-semibold">{user.company || 'InvoSaaS User'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
