import React, { useState } from 'react';

function Sidebar() {
  const [activeItem, setActiveItem] = useState('my-day');

  const NavItem = ({ id, icon, label, isActive }) => (
    <a
      href="#"
      onClick={() => setActiveItem(id)}
      className={`group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-sky-500/20 text-white border border-white/10'
          : 'hover:bg-white/5 text-white/80 hover:text-white'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-white/10' 
          : 'bg-white/10'
      }`}>
        {icon}
      </div>
      <span className="font-medium tracking-wide">{label}</span>
    </a>
  );

  return (
    <div className="relative w-72 min-h-screen bg-[#0B1437] bg-opacity-95 p-5 border-r border-white/5">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-20 w-60 h-60 bg-sky-400/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 -right-20 w-60 h-60 bg-blue-400/20 rounded-full filter blur-3xl"></div>

      {/* Glass Container */}
      <div className="relative z-10">
        {/* Profile Section */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 rounded-xl blur opacity-40"></div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 p-[1px]">
                <div className="w-full h-full rounded-xl bg-[#0B1437] flex items-center justify-center">
                  <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-sky-300">D</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-sky-100">Daru</h2>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          <NavItem
            id="my-day"
            isActive={activeItem === 'my-day'}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            }
            label="My Day"
          />

          <NavItem
            id="next-7-days"
            isActive={activeItem === 'next-7-days'}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
            label="Next 7 Days"
          />

          <NavItem
            id="all-tasks"
            isActive={activeItem === 'all-tasks'}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
            }
            label="All Tasks"
          />

          <NavItem
            id="calendar"
            isActive={activeItem === 'calendar'}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
            label="My Calendar"
          />
        </nav>

        {/* Lists Section */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-medium text-white/50 text-sm uppercase tracking-wider">My Lists</h3>
            <button className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <NavItem
              id="personal"
              isActive={activeItem === 'personal'}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              }
              label="Personal"
            />
            <NavItem
              id="work"
              isActive={activeItem === 'work'}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
              label="Work"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 