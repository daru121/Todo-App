import React from 'react';

function ReminderIndicator({ date, time }) {
  const formatDateTime = (dateStr, timeStr) => {
    const reminderDate = new Date(dateStr);
    const month = reminderDate.getMonth() + 1;
    const day = reminderDate.getDate();
    const year = reminderDate.getFullYear();
    
    return `${month}/${day}/${year} ${timeStr}`;
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-indigo-500 mt-1">
      <svg 
        className="w-3.5 h-3.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span>{formatDateTime(date, time)}</span>
    </div>
  );
}

export default ReminderIndicator; 