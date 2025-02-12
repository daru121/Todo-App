import React from 'react';

function MyDay() {
  const today = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 p-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Good {getTimeOfDay()}, Daru
          </h1>
          <p className="text-2xl text-yellow-300/90 font-medium">
            Remove doubts with action
          </p>
        </div>

        {/* Date Card */}
        <div className="bg-[#0A1B3F] rounded-2xl p-6 mb-8 backdrop-blur-sm bg-opacity-50">
          <div className="flex items-start gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">{days[today.getDay()]}</div>
              <div className="text-4xl font-bold text-white">{today.getDate()}</div>
              <div className="text-lg text-white/80">{months[today.getMonth()]}</div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-4">
                Join video meetings with one tap
              </h2>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
                  <img src="https://www.google.com/calendar/images/favicon.ico" alt="" className="w-5 h-5" />
                  Connect Google Calendar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
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
            className="w-full px-6 py-4 bg-[#0A1B3F] rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-sm bg-opacity-50"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Tasks List */}
        <div className="mt-6 space-y-4">
          {/* Task Item */}
          <div className="group bg-[#0A1B3F] rounded-xl p-4 backdrop-blur-sm bg-opacity-50 flex items-center gap-4">
            <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10">
              {/* Checkbox */}
            </div>
            <input
              type="text"
              value="asdasd"
              className="flex-1 bg-transparent text-white focus:outline-none"
              readOnly
            />
            <div className="text-sm text-white/50">
              My lists {'>'} Personal
            </div>
          </div>

          {/* Another Task Item */}
          <div className="group bg-[#0A1B3F] rounded-xl p-4 backdrop-blur-sm bg-opacity-50 flex items-center gap-4">
            <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10">
              {/* Checkbox */}
            </div>
            <input
              type="text"
              value="Plan a trip to"
              className="flex-1 bg-transparent text-white focus:outline-none"
              readOnly
            />
            <div className="text-sm text-white/50">
              My lists {'>'} Work
            </div>
          </div>
        </div>
      </div>

      {/* Filter Button - Fixed to bottom right */}
      <button className="fixed bottom-8 right-8 bg-[#0A1B3F] text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-50 hover:bg-opacity-70 transition-all">
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