import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';

function MyDay() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pinnedTasks, setPinnedTasks] = useState(new Set());
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('9:35 PM');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [taskReminders, setTaskReminders] = useState({});
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [editedTitle, setEditedTitle] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveNotesTimeoutRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const today = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.map(task => ({
        ...task,
        notes: task.notes || '' // Pastikan notes selalu ada
      })));
      
      // Set task reminders
      const reminders = {};
      response.data.forEach(task => {
        if (task.reminder_date && task.reminder_time) {
          reminders[task.id] = {
            date: new Date(task.reminder_date),
            time: task.reminder_time
          };
        }
      });
      setTaskReminders(reminders);
      
      // Set initial completed tasks
      const initialCompletedTasks = new Set(
        response.data
          .filter(task => task.completed)
          .map(task => task.id)
      );
      setCompletedTasks(initialCompletedTasks);

      // Set initial pinned tasks
      const initialPinnedTasks = new Set(
        response.data
          .filter(task => task.priority)
          .map(task => task.id)
      );
      setPinnedTasks(initialPinnedTasks);

    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/tasks', {
        title: newTask,
        list_type: 'Personal'
      });
      
      // Update tasks list with new task
      setTasks(prevTasks => [response.data, ...prevTasks]);
      setNewTask('');
      
      // Refresh task counts
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  // Update taskCounts calculation
  const taskCounts = {
    total: tasks.length,
    completed: completedTasks.size,
    priority: pinnedTasks.size  // Menggunakan size dari Set pinnedTasks
  };

  // Update handlePinTask untuk menghitung priority
  const handlePinTask = async (taskId) => {
    try {
      const isPinned = pinnedTasks.has(taskId);
      
      // Update di database
      await axios.patch(`/api/tasks/${taskId}`, {
        priority: !isPinned
      });

      // Update state pinnedTasks
      setPinnedTasks(prev => {
        const newPinned = new Set(prev);
        if (newPinned.has(taskId)) {
          newPinned.delete(taskId);
        } else {
          newPinned.add(taskId);
        }
        return newPinned;
      });

      // Refresh tasks untuk memastikan data terupdate
      fetchTasks();

    } catch (error) {
      console.error('Error updating task priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  // Fungsi untuk handle complete/uncomplete task
  const handleCompleteTask = async (taskId) => {
    try {
      // Update di database
      await axios.patch(`/api/tasks/${taskId}`, {
        completed: !completedTasks.has(taskId)
      });

      // Update state completedTasks
      setCompletedTasks(prev => {
        const newCompleted = new Set(prev);
        if (newCompleted.has(taskId)) {
          newCompleted.delete(taskId);
        } else {
          newCompleted.add(taskId);
        }
        return newCompleted;
      });

      // Update task counts di overview
      const updatedTaskCounts = {
        ...taskCounts,
        completed: completedTasks.has(taskId) ? taskCounts.completed - 1 : taskCounts.completed + 1
      };

      // Trigger re-render dengan update tasks
      setTasks(prevTasks => {
        return prevTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: !completedTasks.has(taskId) };
          }
          return task;
        });
      });

    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Tambahkan fungsi handleDeleteTask
  const handleDeleteTask = async (taskId) => {
    try {
      // Delete dari database
      await axios.delete(`/api/tasks/${taskId}`);
      
      // Update state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Hapus dari completedTasks jika ada
      setCompletedTasks(prev => {
        const newCompleted = new Set(prev);
        newCompleted.delete(taskId);
        return newCompleted;
      });

      // Hapus dari pinnedTasks jika ada
      setPinnedTasks(prev => {
        const newPinned = new Set(prev);
        newPinned.delete(taskId);
        return newPinned;
      });

      // Hapus dari taskReminders jika ada
      setTaskReminders(prev => {
        const newReminders = { ...prev };
        delete newReminders[taskId];
        return newReminders;
      });

    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Update sorting untuk menempatkan completed tasks di bawah
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to bottom
    if (completedTasks.has(a.id) && !completedTasks.has(b.id)) return 1;
    if (!completedTasks.has(a.id) && completedTasks.has(b.id)) return -1;
    // Pinned tasks go to top (if not completed)
    if (!completedTasks.has(a.id) && !completedTasks.has(b.id)) {
      if (pinnedTasks.has(a.id) && !pinnedTasks.has(b.id)) return -1;
      if (!pinnedTasks.has(a.id) && pinnedTasks.has(b.id)) return 1;
    }
    return 0;
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle reminder click dari dropdown
  const handleReminderClick = (taskId) => {
    setSelectedTaskId(taskId);
    setShowReminderPopup(true);
    setOpenMenuId(null); // Tutup dropdown
  };

  // Fungsi untuk handle perubahan bulan
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

  // Update ReminderPopup component
  const ReminderPopup = () => {
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
                  onChange={(e) => setSelectedTime(e.target.value)}
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

  // Tambahkan fungsi untuk menangani klik task
  const handleTaskClick = async (task) => {
    try {
      // Fetch attachments untuk task
      const response = await axios.get(`/api/tasks/${task.id}/attachments`);
      setAttachments(response.data.attachments);
      
    setSelectedTaskDetail(task);
    setShowTaskDetail(true);
    } catch (error) {
      console.error('Error fetching task attachments:', error);
      setAttachments([]);
      setSelectedTaskDetail(task);
      setShowTaskDetail(true);
    }
  };

  // Tambahkan komponen TaskDetailPopup
  const TaskDetailPopup = () => {
    // Inisialisasi state dengan nilai dari task yang dipilih
    const [editedTitle, setEditedTitle] = useState(selectedTaskDetail?.title || '');
    const [notes, setNotes] = useState(selectedTaskDetail?.notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const saveNotesTimeoutRef = useRef(null);

    // Update notes state ketika task berubah
    useEffect(() => {
      setNotes(selectedTaskDetail?.notes || '');
    }, [selectedTaskDetail]);

    // Handle notes change dengan debounce
    const handleNotesChange = (e) => {
      const newNotes = e.target.value;
      setNotes(newNotes);

      if (saveNotesTimeoutRef.current) {
        clearTimeout(saveNotesTimeoutRef.current);
      }

      saveNotesTimeoutRef.current = setTimeout(() => {
        saveNotes(newNotes);
      }, 500);
    };

    // Fungsi untuk menyimpan notes
    const saveNotes = async (notesContent) => {
      if (notesContent === selectedTaskDetail?.notes) return;
      
      setIsSaving(true);
      try {
        const response = await axios.patch(`/api/tasks/${selectedTaskDetail.id}`, {
          notes: notesContent
        });

        if (response.status === 200) {
          // Update tasks state
          setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === selectedTaskDetail.id) {
              return { ...task, notes: notesContent };
            }
            return task;
          }));

          // Update selectedTaskDetail
          setSelectedTaskDetail(prev => ({
            ...prev,
            notes: notesContent
          }));
        }
      } catch (error) {
        console.error('Error saving notes:', error);
        setNotes(selectedTaskDetail?.notes || '');
        alert('Failed to save notes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };

    // Cleanup timeout when component unmounts
    useEffect(() => {
      return () => {
        if (saveNotesTimeoutRef.current) {
          clearTimeout(saveNotesTimeoutRef.current);
        }
      };
    }, []);

    // Save on blur
    const handleBlur = () => {
      if (saveNotesTimeoutRef.current) {
        clearTimeout(saveNotesTimeoutRef.current);
      }
      saveNotes(notes);
    };

    // Handle title change sementara (tidak langsung update ke database)
    const handleTitleChange = (e) => {
      setEditedTitle(e.target.value);
    };

    // Handle save title ketika selesai edit
    const handleTitleSave = async () => {
      if (editedTitle === selectedTaskDetail?.title) return;
      
      try {
        // Update di database
        await axios.patch(`/api/tasks/${selectedTaskDetail.id}`, {
          title: editedTitle
        });

        // Update tasks state
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === selectedTaskDetail.id) {
            return { ...task, title: editedTitle };
          }
          return task;
        }));

        // Update selectedTaskDetail
        setSelectedTaskDetail(prev => ({
          ...prev,
          title: editedTitle
        }));

      } catch (error) {
        console.error('Error updating task title:', error);
        // Kembalikan ke title sebelumnya jika error
        setEditedTitle(selectedTaskDetail?.title);
      }
    };

    // Tambahkan fungsi untuk toggle reminder
    const handleToggleReminder = async (taskId) => {
      try {
        // Jika reminder sudah ada, hapus reminder
        if (taskReminders[taskId]) {
          await axios.patch(`/api/tasks/${taskId}`, {
            reminder_date: null,
            reminder_time: null
          });

          // Update state
          setTaskReminders(prev => {
            const newReminders = { ...prev };
            delete newReminders[taskId];
            return newReminders;
          });

          // Update tasks state
          setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                reminder_date: null,
                reminder_time: null
              };
            }
            return task;
          }));
        } else {
          // Jika belum ada reminder, buka popup untuk set reminder
          handleReminderClick(taskId);
        }
      } catch (error) {
        console.error('Error toggling reminder:', error);
      }
    };

    // Update fungsi handleFileUpload
    const handleFileUpload = async (files) => {
      setIsUploading(true);
      try {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const fileArray = Array.from(files);
        
        // Filter hanya file gambar
        const imageFiles = fileArray.filter(file => allowedTypes.includes(file.type));
        
        if (imageFiles.length === 0) {
          alert('Only image files (JPG, PNG, GIF) are allowed');
          return;
        }

        // Upload setiap file
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        const response = await axios.post(`/api/tasks/${selectedTaskDetail.id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Update attachments state dengan URL gambar baru
        if (response.data.urls) {
          const newAttachments = response.data.urls.map(url => ({
            id: Date.now(), // temporary id
            file_url: url
          }));
          setAttachments(prev => [...prev, ...newAttachments]);
        }

      } catch (error) {
        console.error('Error uploading files:', error);
        alert('Failed to upload files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    // Update fungsi untuk menghapus attachment
    const handleDeleteAttachment = async (attachmentId) => {
      try {
        await axios.delete(`/api/tasks/${selectedTaskDetail.id}/attachments/${attachmentId}`);
        
        // Update state attachments setelah berhasil delete
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
        
        // Refresh attachments dari server
        const response = await axios.get(`/api/tasks/${selectedTaskDetail.id}/attachments`);
        setAttachments(response.data.attachments);
        
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-[400px] overflow-hidden shadow-xl border border-slate-200/70">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-500">
              My lists {'>'} {selectedTaskDetail?.list_type}
            </div>
            <button 
              onClick={() => setShowTaskDetail(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Title Input */}
            <input
              type="text"
              value={editedTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleSave}
              className="text-2xl font-semibold text-slate-700 mb-6 bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-2 py-1"
            />

            {/* Action Buttons */}
            <div className="flex gap-2 mb-8">
              <button 
                onClick={() => handleToggleReminder(selectedTaskDetail.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  taskReminders[selectedTaskDetail.id] 
                    ? 'bg-amber-100/50 text-amber-600'
                    : 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {taskReminders[selectedTaskDetail.id] ? 'Reminder On' : 'Remind me'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/50 text-rose-600 hover:bg-rose-100/70 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Personal
              </button>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-sm text-slate-500">NOTES</label>
              <div className="relative">
                <textarea 
                  value={notes}
                  onChange={handleNotesChange}
                  onBlur={handleBlur}
                  placeholder="Insert your notes here"
                  className="w-full h-32 bg-white/70 text-slate-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/70"
                />
                {isSaving && (
                  <div className="absolute right-3 top-3">
                    <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="mt-6 space-y-2">
              <label className="text-sm text-slate-500">ATTACHMENTS</label>
              
              {/* Image Preview Grid */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="relative group">
                      <img 
                        src={attachment.file_url} 
                        alt={`Attachment ${attachment.id}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAttachment(attachment.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop Area */}
              <div 
                className="relative border-2 border-dashed border-slate-200/70 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400">Click to add / drop your image files here</p>
                    <p className="text-xs text-slate-500 mt-1">Supports: JPG, PNG, GIF</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#F3F6FF] to-[#F5F7FF] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
            Good {getTimeOfDay()}, Daru Caraka
          </h1>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white/70 rounded-3xl p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-slate-100">
          <div className="flex items-start gap-8">
            {/* Date Display */}
            <div className="text-center bg-gradient-to-b from-indigo-50 to-blue-50/50 px-6 py-4 rounded-2xl border border-indigo-100/30">
              <div className="text-xl font-bold text-indigo-500 mb-1">{days[today.getDay()]}</div>
              <div className="text-5xl font-bold text-slate-700 mb-1">{today.getDate()}</div>
              <div className="text-lg text-indigo-400">{months[today.getMonth()]}</div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-700 mb-6">Today's Overview</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Tasks Today</div>
                  <div className="text-2xl font-semibold text-slate-700">{taskCounts.total}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Completed</div>
                  <div className="text-2xl font-semibold text-green-600">{taskCounts.completed}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Priority</div>
                  <div className="text-2xl font-semibold text-indigo-600">{taskCounts.priority}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List with Drag and Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 mb-8 ${
                  snapshot.isDraggingOver ? 'bg-indigo-50/30 rounded-3xl p-4' : ''
                }`}
              >
                {sortedTasks.map((task, index) => {
                  // Define dropdownMenu inside the map function to access task.id
                  const dropdownMenu = (
                    <button 
                      onClick={() => handleReminderClick(task.id)}
                      className="w-full px-4 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Reminder
                    </button>
                  );

                  return (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`group bg-white/70 rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200 backdrop-blur-xl
                            ${snapshot.isDragging ? 'shadow-2xl scale-[1.02] rotate-2 bg-white' : ''}
                          `}
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging 
                              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                              : provided.draggableProps.style?.transform
                          }}
                          data-task-id={task.id}
                        >
                          {/* Drag Handle */}
                          <div className="w-6 h-6 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>

                          {/* Checkbox */}
                          <div 
                            onClick={() => handleCompleteTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              completedTasks.has(task.id)
                                ? 'border-indigo-400 bg-indigo-400'
                                : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
                            } flex items-center justify-center cursor-pointer transition-all duration-200`}
                          >
                            {completedTasks.has(task.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>

                          {/* Pin Button */}
                          <button 
                            onClick={() => handlePinTask(task.id)}
                            className={`w-10 h-10 flex items-center justify-center transition-colors ${
                              pinnedTasks.has(task.id) 
                                ? 'text-indigo-500' 
                                : 'text-slate-400 hover:text-indigo-500'
                            }`}
                          >
                            <svg 
                              className="w-6 h-6" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M15.5 3.5L18.5 6.5" />
                              <path d="M8.2 11L13 6.2L17.8 11L13 15.8L8.2 11Z" />
                              <path d="M11 13L5 19" />
                            </svg>
                          </button>

                          {/* Task Title and Reminder */}
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => handleTaskClick(task)}
                          >
                            <span className={`font-medium ${
                              completedTasks.has(task.id)
                                ? 'text-slate-400 line-through'
                                : 'text-slate-700'
                            }`}>
                              {task.title}
                            </span>
                            
                            {/* Show reminder if exists */}
                            {taskReminders[task.id] && (
                              <div className="text-sm text-indigo-500 mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(taskReminders[task.id].date).toLocaleDateString()} {taskReminders[task.id].time}
                              </div>
                            )}
                          </div>

                          {/* List Type */}
                          <div className="text-sm text-slate-400 group-hover:text-indigo-400 transition-colors duration-200">
                            My lists {'>'} {task.list_type}
                          </div>

                          {/* Three Dots Menu */}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const button = e.currentTarget;
                                const rect = button.getBoundingClientRect();
                                setMenuPosition({ x: rect.x, y: rect.y + rect.height });
                                setOpenMenuId(openMenuId === task.id ? null : task.id);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                              </svg>
                            </button>

                            {/* Dropdown Menu Portal */}
                            {openMenuId === task.id && createPortal(
                              <div 
                                className="fixed w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[9999]"
                                style={{
                                  left: menuPosition.x - 180, // Adjust position to align with button
                                  top: menuPosition.y + 8
                                }}
                              >
                                {dropdownMenu}
                                <button className="w-full px-4 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  Lists
                                </button>
                              </div>,
                              document.body
                            )}
                          </div>

                          {/* Close Button */}
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Task Input moved to bottom */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
          <div className="relative">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add task"
              disabled={loading}
              className="w-full px-7 py-5 bg-white/90 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/70 shadow-lg backdrop-blur-xl disabled:opacity-50"
            />
            <button 
              onClick={handleAddTask}
              disabled={loading || !newTask.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {showReminderPopup && <ReminderPopup />}
      {showTaskDetail && <TaskDetailPopup />}
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