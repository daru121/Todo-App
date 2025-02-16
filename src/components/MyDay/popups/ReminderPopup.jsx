import React, { useEffect } from 'react';
import axios from 'axios';

const ReminderPopup = ({
  selectedTaskId,
  taskReminders,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  currentMonth,
  setCurrentMonth,
  setShowReminderPopup,
  setTasks,
  setTaskReminders
}) => {
  // Inisialisasi state dengan data dari database jika ada
  useEffect(() => {
    if (selectedTaskId && taskReminders[selectedTaskId]) {
      const reminder = taskReminders[selectedTaskId];
      setSelectedDate(reminder.date);
      setSelectedTime(reminder.time);
      setCurrentMonth(reminder.date); // Set current month sesuai dengan tanggal reminder
    }
  }, [selectedTaskId]);

  // Format date untuk input
  const formatDate = (date) => {
    return `${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}`;
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  // Handle time change
  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  // Handle save reminder
  const handleSaveReminder = async () => {
    try {
      // Format date dan time untuk database
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const formattedTime = selectedTime; // Format: HH:MM

      // Kirim ke database
      await axios.patch(`/api/tasks/${selectedTaskId}`, {
        reminder_date: formattedDate,
        reminder_time: formattedTime
      });
      
      // Update tasks state
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === selectedTaskId) {
          return {
            ...task,
            reminder_date: formattedDate,
            reminder_time: formattedTime
          };
        }
        return task;
      }));

      // Tutup popup
      setShowReminderPopup(false);
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  };

  // Generate calendar dates
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const selectedDay = selectedDate.getDate();
    const isSelectedMonth = selectedDate.getMonth() === month && 
                          selectedDate.getFullYear() === year;

    let days = [];
    
    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, -firstDay + i + 1);
      days.push(
        <div key={`prev-${i}`} className="text-slate-400/50 p-2 text-center">
          {prevDate.getDate()}
        </div>
      );
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <div 
          key={i}
          onClick={() => handleDateSelect(i)}
          className={`p-2 text-center cursor-pointer transition-colors ${
            isSelectedMonth && i === selectedDay
              ? 'bg-indigo-500 text-white rounded-full' 
              : 'text-slate-700 hover:bg-slate-100 rounded-full'
          }`}
        >
          {i}
        </div>
      );
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    for (let i = daysInMonth + firstDay; i < totalCells; i++) {
      const nextDate = new Date(year, month + 1, i - daysInMonth - firstDay + 1);
      days.push(
        <div key={`next-${i}`} className="text-slate-400/50 p-2 text-center">
          {nextDate.getDate()}
        </div>
      );
    }

    return days;
  };

  // Handle month change
  const handleMonthChange = (direction) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-[400px] overflow-hidden shadow-xl border border-slate-200/70">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70">
          <div className="text-slate-500">Set Reminder</div>
          <button 
            onClick={() => setShowReminderPopup(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-slate-400">DATE</label>
              <input 
                type="text"
                value={formatDate(selectedDate)}
                readOnly
                className="w-full bg-white/70 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/70"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-sm text-slate-400">TIME</label>
              <input 
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full bg-white/70 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/70"
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/70 rounded-xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-700">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleMonthChange('prev')}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleMonthChange('next')}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-slate-400 p-2 text-center text-sm">{day}</div>
              ))}
              {generateCalendarDates()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex border-t border-slate-200/70">
          <button 
            onClick={() => setShowReminderPopup(false)}
            className="flex-1 px-6 py-4 text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-r border-slate-200/70 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveReminder}
            className="flex-1 px-6 py-4 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup; 