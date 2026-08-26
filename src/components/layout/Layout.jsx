import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased print:bg-white">
      {/* Sidebar - hidden automatically on print via its print:hidden style (we'll make sure to hide it, or it will be out of viewport since it's translated or fixed, but let's add print:hidden to sidebar inside its component or in Layout) */}
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen lg:pl-72 print:pl-0">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Outlet */}
        <main className="flex-1 p-6 md:p-8 print:p-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
