import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiX, FiSettings } from 'react-icons/fi';
import { navItems } from './navConfig';
import { useCompanySettings } from './CompanySettingsContext';
import { trimImageEdges } from '../../core/utils';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = navItems;
  const { settings } = useCompanySettings();

  // Trim blank edges so the logo fills the header
  const rawLogo = settings.logo || null;
  const [trimmed, setTrimmed] = useState({ src: null, out: null });
  useEffect(() => {
    if (!rawLogo) return undefined;
    let cancelled = false;
    trimImageEdges(rawLogo).then((out) => { if (!cancelled) setTrimmed({ src: rawLogo, out }); });
    return () => { cancelled = true; };
  }, [rawLogo]);
  const logoSrc = rawLogo ? (trimmed.src === rawLogo ? trimmed.out : rawLogo) : null;

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
        style={{ backgroundColor: 'var(--brand-primary-light)' }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 border-r border-slate-200 text-slate-600 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ── Header / Brand ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            {logoSrc ? (
              // With a logo, the logo alone is shown — no company name or tagline
              <div className="flex items-center justify-center h-14 max-w-[190px] px-3 shrink-0 overflow-hidden">
                <img src={logoSrc} alt={settings.companyName || 'Logo'} className="max-h-10 max-w-full w-auto h-auto object-contain" />
              </div>
            ) : (
              <>
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-xl shrink-0"
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    boxShadow: '0 4px 14px var(--brand-shadow)',
                  }}
                >
                  {getInitial(settings.companyName)}
                </div>
                <div className="min-w-0">
                  <span className="block text-lg font-bold text-slate-900 tracking-wide truncate">
                    {settings.companyName}
                  </span>
                  <span
                    className="block text-xs font-medium truncate"
                    style={{ color: 'var(--brand-sidebar-accent)' }}
                  >
                    {settings.tagline}
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus:outline-none shrink-0"
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
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 group hover:bg-white/70"
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
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                    />
                    <span className={isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 bg-white/50">
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
                      : { backgroundColor: 'rgb(255,255,255)' }
                  }
                >
                  <FiSettings
                    size={14}
                    className="transition-transform duration-300 group-hover:rotate-90"
                    style={{ color: isActive ? 'var(--brand-primary)' : '#475569' }}
                  />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: isActive ? 'var(--brand-sidebar-accent)' : '#334155' }}
                >
                  Company Settings
                </span>
              </>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
