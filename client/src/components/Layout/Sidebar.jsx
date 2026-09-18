import { NavLink } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { navItems } from './navConfig';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = navItems;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
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
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
              I
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-wide">InvoSaaS</span>
              <span className="block text-xs text-indigo-400 font-medium">Enterprise Billing</span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Admin Dashboard</p>
              <p className="text-[10px] text-slate-500">v1.0.0 Stable</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
