import React from 'react';

function Header({ searchQuery, setSearchQuery, tasks, completedTasks, title, subtitle }) {
  const totalTasks = tasks.length;
  const completedTasksCount = completedTasks.size;
  const remainingTasks = totalTasks - completedTasksCount;

  return (
    <div className="max-w-[1600px] mx-auto mb-10">
      {/* Header */}
      <div className="mb-10 bg-white/90 backdrop-blur-xl rounded-3xl px-8 py-6 border border-slate-200/50 shadow-lg inline-block relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"></div>
        
        <div className="flex items-center gap-3 relative">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-50 rounded-xl px-3 py-1">
                <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  Overview
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-transparent bg-clip-text">
                {title}
              </span>
            </h1>
            <p className="text-slate-500/90 text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-5 py-3.5 bg-white rounded-xl text-slate-700 placeholder-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 pl-12"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="text-sm font-medium text-slate-500 mb-2">Total Tasks</div>
          <div className="text-3xl font-bold text-slate-800">{totalTasks}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="text-sm font-medium text-slate-500 mb-2">Completed</div>
          <div className="text-3xl font-bold text-green-600">{completedTasksCount}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="text-sm font-medium text-slate-500 mb-2">Remaining</div>
          <div className="text-3xl font-bold text-indigo-600">{remainingTasks}</div>
        </div>
      </div>
    </div>
  );
}

export default Header; 