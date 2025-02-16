import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const NavItem = ({ id, icon, label, to }) => {
    const isActive = (
      (to === '/my-day' && currentPath === '/') || 
      currentPath === to ||
      (to === '/next7days' && currentPath === '/next7days')
    );

    return (
      <div className="relative">
        {isActive && (
          <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
        )}
        
        <Link
          to={to}
          onClick={() => {
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          className={`group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${
            isActive 
              ? 'bg-blue-50/50 text-blue-600'
              : 'text-slate-600'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
            isActive 
              ? 'bg-white shadow-sm' 
              : 'bg-white'
          }`}>
            <div className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-600'} transition-transform duration-300 group-hover:rotate-6`}>
              {icon}
            </div>
          </div>
          <span className={`font-medium ${isActive ? 'text-blue-600' : ''}`}>{label}</span>
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg border border-slate-200"
      >
        <svg 
          className="w-6 h-6 text-slate-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-[100vh] flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="relative w-[280px] h-full m-4 bg-white rounded-[40px] p-6 border border-[#E5E9FF] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
          {/* Rest of your existing sidebar code... */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFF] via-white to-[#F8F9FF] rounded-[40px]"></div>
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-white/50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F7FF] via-white to-transparent rounded-b-[40px]"></div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Your existing content... */}
            {/* Logo Section */}
            <div className="mb-6 px-2">
              <div className="relative">
                <h1 className="text-4xl font-bold tracking-tight">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">      
                      {/* Logo Text - Now Clickable */}
                      <Link 
                        to="/my-day" 
                        className="flex items-center hover:opacity-80 transition-opacity"
                      >
                        <span className="text-slate-800">Todo</span>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
                          ctive
                        </span>
                      </Link>
                    </div>
                  </div>
                </h1>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-20"></div>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="relative space-y-0.5 mb-6 px-2">
              {/* Subtle separator line */}
              <div className="absolute -left-6 top-0 w-[1px] h-full bg-[#E5E9FF]"></div>
              
              {/* NavItems */}
              <NavItem
                id="my-day"
                to="/my-day"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                label="My Day"
              />

              <NavItem
                id="next-7-days"
                to="/next7days"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                label="Next 7 Days"
              />

              <NavItem
                id="all-tasks"
                to="/alltasks"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                label="All Tasks"
              />

              <NavItem
                id="calendar"
                to="/calendar"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                label="My Calendar"
              />
            </nav>

            {/* Lists Section */}
            <div className="px-2 flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-400 text-sm uppercase tracking-wider">
                  My Lists
                </h3>
                <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-all duration-200 border border-slate-200 shadow-sm">
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-0.5">
                <NavItem
                  id="personal"
                  to="/personal"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  label="Personal"
                />
                <NavItem
                  id="work"
                  to="/work"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Work"
                />
              </div>
            </div>

            {/* Logout Section */}
            <div className="px-2 mt-4 pt-4 border-t border-[#E5E9FF]">
              <a
                href="#"
                className="group flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 text-slate-600"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white transition-all duration-300">
                  <svg 
                    className="w-5 h-5 text-red-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                </div>
                <span className="font-medium">Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar; 