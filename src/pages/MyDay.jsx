import React from 'react';

function MyDay() {
  const today = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#0B1437] via-[#162454] to-[#1B2B63] p-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-sky-100 mb-2">
            Good {getTimeOfDay()}, Daru
          </h1>
          <p className="text-xl text-sky-400/90 font-medium">
            Remove doubts with action
          </p>
        </div>

        {/* Date Card */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-start gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-300 mb-1">{days[today.getDay()]}</div>
              <div className="text-4xl font-bold text-slate-100">{today.getDate()}</div>
              <div className="text-lg text-slate-400">{months[today.getMonth()]}</div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">
                Join video meetings with one tap
              </h2>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 transition-colors text-slate-200 border border-white/5">
                  <img src="https://www.google.com/calendar/images/favicon.ico" alt="" className="w-5 h-5" />
                  Connect Google Calendar
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 transition-colors text-slate-200 border border-white/5">
                  <img src="https://outlook.office.com/favicon.ico" alt="" className="w-5 h-5" />
                  Connect Outlook Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Add task"
            className="w-full px-6 py-4 bg-white/5 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 border border-white/10 shadow-lg backdrop-blur-md"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Tasks List */}
        <div className="mt-6 space-y-3">
          {/* Task Item */}
          <div className="group bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-4 hover:bg-white/10 transition-colors">
            <div className="w-6 h-6 rounded-full border-2 border-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors">
              {/* Checkbox */}
            </div>
            <input
              type="text"
              value="asdasd"
              className="flex-1 bg-transparent text-slate-200 focus:outline-none"
              readOnly
            />
            <div className="text-sm text-slate-400">
              My lists {'>'} Personal
            </div>
          </div>

          {/* Another Task Item */}
          <div className="group bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-4 hover:bg-white/10 transition-colors">
            <div className="w-6 h-6 rounded-full border-2 border-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors">
              {/* Checkbox */}
            </div>
            <input
              type="text"
              value="Plan a trip to"
              className="flex-1 bg-transparent text-slate-200 focus:outline-none"
              readOnly
            />
            <div className="text-sm text-slate-400">
              My lists {'>'} Work
            </div>
          </div>
        </div>
      </div>

      {/* Filter Button - Fixed to bottom right */}
      <button className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-sky-500/20 text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
        Filter
      </button>
    </div>
  );
}

// Helper function to get time of day greeting
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

export default MyDay; 