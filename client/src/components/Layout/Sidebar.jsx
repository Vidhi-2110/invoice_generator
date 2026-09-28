import { NavLink } from 'react-router-dom';
import { FiX, FiSettings } from 'react-icons/fi';
import { navItems } from './navConfig';
import { useCompanySettings } from './CompanySettingsContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = navItems;
  const { settings } = useCompanySettings();

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'I');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Header / Brand ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-10 h-10 rounded-xl object-cover shrink-0"
                style={{
                  border: '2px solid var(--brand-sidebar-accent)',
                  boxShadow: '0 4px 14px var(--brand-shadow)',
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-xl shrink-0"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  boxShadow: '0 4px 14px var(--brand-shadow)',
                }}
              >
                {getInitial(settings.companyName)}
              </div>
            )}
            <div className="min-w-0">
              <span className="block text-lg font-bold text-white tracking-wide truncate">
                {settings.companyName}
              </span>
              <span
                className="block text-xs font-medium truncate"
                style={{ color: 'var(--brand-sidebar-accent)' }}
              >
                {settings.tagline}
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden focus:outline-none shrink-0"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* ── Navigation Links ────────────────────────────────────────────── */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 group"
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: 'var(--brand-primary)',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px var(--brand-shadow)',
                      }
                    : {}
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="border-t border-slate-800 bg-slate-950/40">
          {/* Settings link */}
          <NavLink
            to="/settings"
            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
            className="w-full flex items-center gap-3 px-6 py-3.5 transition-colors group"
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: 'var(--brand-primary)', opacity: 0.15 }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className="p-1.5 rounded-lg transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }
                      : { backgroundColor: 'rgb(30,41,59)' }
                  }
                >
                  <FiSettings
                    size={14}
                    className="transition-transform duration-300 group-hover:rotate-90"
                    style={{ color: isActive ? 'var(--brand-primary)' : '#94a3b8' }}
                  />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: isActive ? 'var(--brand-sidebar-accent)' : '#94a3b8' }}
                >
                  Company Settings
                </span>
              </>
            )}
          </NavLink>

          {/* Admin info */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-800/60">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-xs"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin Dashboard</p>
              <p className="text-[10px] text-slate-500">v1.0.0 Stable</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
