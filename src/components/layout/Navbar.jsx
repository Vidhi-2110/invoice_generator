import { useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiCalendar } from 'react-icons/fi';
import { UserDropdown } from '../../modules/auth';

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  // Determine dynamic title based on location path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/invoice')) {
      if (path.includes('/edit')) return 'Edit Invoice';
      if (path.match(/\/invoice\/[^/]+$/)) return 'Invoice Details';
      return 'Invoices Management';
    }
    if (path.startsWith('/proforma-invoice')) {
      if (path.includes('/edit')) return 'Edit Proforma Invoice';
      if (path.match(/\/proforma-invoice\/[^/]+$/)) return 'Proforma Invoice Details';
      return 'Proforma Invoices';
    }
    return 'InvoSaaS';
  };

  // Get current formatted date
  const getFormattedDate = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-white border-b border-slate-200/80 shadow-sm shadow-slate-100/40 print:hidden">
      {/* Left side: Hamburger Toggle (mobile) & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open sidebar"
        >
          <FiMenu size={22} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight transition-all duration-300">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Utilities */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
          <FiCalendar size={14} className="text-slate-400" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* Notifications Mock */}
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline-none transition-colors border border-slate-100">
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
        </button>

        {/* Divider */}
        <span className="h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* Profile Info Dropdown */}
        <UserDropdown />
      </div>
    </header>
  );
};

export default Navbar;
