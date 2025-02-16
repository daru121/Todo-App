import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import TaskList from '../components/TaskList';
import MoveToPopup from '../components/tasks/MoveToPopup';
import ReminderPopup from '../components/MyDay/popups/ReminderPopup';
import TaskDetailPopup from '../components/MyDay/popups/TaskDetailPopup';

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
  const [showMoveToPopup, setShowMoveToPopup] = useState(false);
  const [selectedTaskForMove, setSelectedTaskForMove] = useState(null);

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
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset waktu ke 00:00:00

      // Filter tasks untuk hari ini saja
      const todayTasks = response.data.filter(task => {
        const taskDate = task.due_date ? new Date(task.due_date) : new Date(task.created_at);
        taskDate.setHours(0, 0, 0, 0);

        // Bandingkan tanggal dengan hari ini
        return taskDate.getTime() === today.getTime();
      });

      setTasks(todayTasks.map(task => ({
        ...task,
        notes: task.notes || '' // Pastikan notes selalu ada
      })));
      
      // Set task reminders
      const reminders = {};
      todayTasks.forEach(task => {
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
        todayTasks
          .filter(task => task.completed)
          .map(task => task.id)
      );
      setCompletedTasks(initialCompletedTasks);

      // Set initial pinned tasks
      const initialPinnedTasks = new Set(
        todayTasks
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
      const today = new Date();
      
      const response = await axios.post('/api/tasks', {
        title: newTask,
        list_type: 'Personal',
        completed: false,
        priority: false,
        notes: '',
        reminder_date: null,
        reminder_time: null,
        created_at: today.toISOString() // Tambahkan created_at
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

  // Tambahkan fungsi untuk menangani klik task
  const handleTaskClick = async (task) => {
    try {
      // Fetch attachments untuk task
      const response = await axios.get(`/api/tasks/${task.id}/attachments`);
      setAttachments(response.data); // Response langsung berupa array attachments
      
      setSelectedTaskDetail(task);
      setShowTaskDetail(true);
    } catch (error) {
      console.error('Error fetching task attachments:', error);
      setAttachments([]);
      setSelectedTaskDetail(task);
      setShowTaskDetail(true);
    }
  };

  // Tambahkan fungsi handleMoveTask
  const handleMoveTask = async (taskId, newListType) => {
    try {
      const capitalizedListType = newListType.charAt(0).toUpperCase() + newListType.slice(1);
      
      await axios.patch(`/api/tasks/${taskId}`, {
        list_type: capitalizedListType
      });

      // Update tasks state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Hapus dari completedTasks jika ada
      setCompletedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });

      // Hapus dari pinnedTasks jika ada
      setPinnedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });

    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  // Modifikasi dropdownMenu di dalam TaskList
  const dropdownMenu = (taskId) => (
    <>
      <button 
        onClick={() => handleReminderClick(taskId)}
        className="w-full px-4 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Reminder
      </button>
      <button 
        onClick={() => {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            setSelectedTaskForMove(task);
            setShowMoveToPopup(true);
          }
          setOpenMenuId(null);
        }}
        className="w-full px-4 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Lists
      </button>
    </>
  );

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

        {/* Tasks List */}
        <TaskList
          tasks={sortedTasks}
          onDragEnd={handleDragEnd}
          onComplete={handleCompleteTask}
          completedTasks={completedTasks}
          onPin={handlePinTask}
          pinnedTasks={pinnedTasks}
          onDelete={handleDeleteTask}
          onTaskClick={handleTaskClick}
          onReminderClick={handleReminderClick}
          taskReminders={taskReminders}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          menuPosition={menuPosition}
          setMenuPosition={setMenuPosition}
          dropdownMenu={dropdownMenu}
        />

        {/* Task Input - Updated positioning */}
        <div className="fixed bottom-8 left-[58%] -translate-x-1/2 w-full max-w-2xl px-8">
          <div className="relative bg-white/90 rounded-2xl shadow-lg backdrop-blur-xl border border-slate-200/70">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add task"
              disabled={loading}
              className="w-full px-7 py-5 bg-transparent rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
      {showReminderPopup && (
        <ReminderPopup
          selectedTaskId={selectedTaskId}
          taskReminders={taskReminders}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          setShowReminderPopup={setShowReminderPopup}
          setTasks={setTasks}
          setTaskReminders={setTaskReminders}
        />
      )}
      {showTaskDetail && (
        <TaskDetailPopup
          selectedTaskDetail={selectedTaskDetail}
          setShowTaskDetail={setShowTaskDetail}
          setTasks={setTasks}
          attachments={attachments}
          setAttachments={setAttachments}
          fileInputRef={fileInputRef}
          taskReminders={taskReminders}
          handleReminderClick={handleReminderClick}
        />
      )}
      <MoveToPopup
        isOpen={showMoveToPopup}
        onClose={() => {
          setShowMoveToPopup(false);
          setSelectedTaskForMove(null);
        }}
        onMove={(newListType) => {
          if (selectedTaskForMove) {
            handleMoveTask(selectedTaskForMove.id, newListType);
          }
          setShowMoveToPopup(false);
          setSelectedTaskForMove(null);
        }}
        currentList={selectedTaskForMove?.list_type?.toLowerCase()}
      />
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