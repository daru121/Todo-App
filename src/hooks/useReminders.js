import { useState } from 'react';
import axios from 'axios';

export function useReminders(tasks, setTasks) {
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleToggleReminder = async (taskId) => {
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      if (task.reminder_date && task.reminder_time) {
        // Remove reminder
        await axios.patch(`/api/tasks/${taskId}`, {
          reminder_date: null,
          reminder_time: null
        });

        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId 
              ? { ...t, reminder_date: null, reminder_time: null }
              : t
          )
        );
      } else {
        // Show reminder popup to set new reminder
        setSelectedTaskId(taskId);
        setShowReminderPopup(true);
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleSaveReminder = async () => {
    if (!selectedTaskId) return;

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      await axios.patch(`/api/tasks/${selectedTaskId}`, {
        reminder_date: formattedDate,
        reminder_time: selectedTime
      });

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === selectedTaskId 
            ? { ...task, reminder_date: formattedDate, reminder_time: selectedTime }
            : task
        )
      );

      setShowReminderPopup(false);
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const hasReminder = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task && task.reminder_date && task.reminder_time;
  };

  return {
    showReminderPopup,
    selectedDate,
    selectedTime,
    currentMonth,
    setShowReminderPopup,
    setSelectedDate,
    setSelectedTime,
    setCurrentMonth,
    handleSaveReminder,
    handleToggleReminder,
    hasReminder
  };
} 