import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import axios from 'axios';

const Next7Days = () => {
  const [tasks, setTasks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Tambahkan useEffect untuk fetch tasks saat komponen dimount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fungsi untuk fetch tasks dari database
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      
      // Kelompokkan tasks berdasarkan tanggal
      const groupedTasks = {};
      response.data.forEach(task => {
        const dateKey = task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : 
                                      format(new Date(task.created_at), 'yyyy-MM-dd');
        
        if (!groupedTasks[dateKey]) {
          groupedTasks[dateKey] = [];
        }
        
        groupedTasks[dateKey].push({
          id: task.id,
          text: task.title,
          completed: task.completed
        });
      });

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alternatif lain
  const next7Days = Array(7).fill().map((_, index) => {
    const date = addDays(new Date(), index);
    return {
      date,
      formattedDate: format(date, 'EEEE, MMMM d', { locale: enUS }),
      tasks: tasks[format(date, 'yyyy-MM-dd')] || []
    };
  });

  // Get all tasks from all dates
  const allTasks = Object.values(tasks).flat();
  
  // Get completed tasks count
  const completedTasks = allTasks.filter(task => task.completed).length;

  // Filter tasks based on search query
  const filteredTasks = allTasks.filter(task => 
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update fungsi addTask untuk mengirim ke database
  const addTask = async (date, taskText) => {
    if (!taskText.trim()) return;

    try {
      const dateKey = format(date, 'yyyy-MM-dd');
      
      // Kirim ke database dengan due_date yang benar
      const response = await axios.post('/api/tasks', {
        title: taskText,
        list_type: 'Personal',
        completed: false,
        priority: false,
        notes: '',
        due_date: dateKey, // Pastikan menggunakan dateKey sebagai due_date
        reminder_date: null,
        reminder_time: null,
        created_at: new Date().toISOString() // Simpan created_at jika perlu
      });

      // Update state lokal dengan response dari server
      setTasks(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), {
          id: response.data.id,
          text: response.data.title,
          completed: response.data.completed
        }]
      }));

    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  // Update form submission untuk handle loading state
  const handleSubmit = async (e, date) => {
    e.preventDefault();
    const input = e.target.elements.task;
    const taskText = input.value.trim();
    
    if (taskText) {
      input.disabled = true; // Disable input saat loading
      await addTask(date, taskText);
      input.value = '';
      input.disabled = false; // Enable kembali setelah selesai
      input.focus(); // Focus kembali ke input
    }
  };

  // Update fungsi toggleTask untuk update di database
  const toggleTask = async (date, taskId) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    try {
      const task = tasks[dateKey].find(t => t.id === taskId);
      
      // Update di database
      await axios.patch(`/api/tasks/${taskId}`, {
        completed: !task.completed
      });

      // Update state lokal
      setTasks(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      }));
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#F3F6FF] to-[#F5F7FF] p-8">
      <div className="max-w-[1600px] mx-auto">
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
                  Next 7 Days
                </span>
              </h1>
              <p className="text-slate-500/90 text-lg font-medium leading-relaxed">
                View and manage your upcoming tasks
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Ubah loading skeleton
            Array(7).fill().map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))
          ) : (
            next7Days.map(({ date, formattedDate, tasks: dateTasks }) => (
              <div 
                key={formattedDate} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-medium text-gray-800">{formattedDate}</h2>
                  <p className="text-sm text-gray-400">
                    {dateTasks?.length > 0 ? `${dateTasks.length} ${dateTasks.length === 1 ? 'task' : 'tasks'}` : 'No tasks'}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {dateTasks.map(task => (
                      <div 
                        key={task.id}
                        className="group flex items-center gap-3 py-1"
                      >
                        <button
                          onClick={() => toggleTask(date, task.id)}
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center
                            transition-all duration-200 hover:border-indigo-500
                            ${task.completed 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent' 
                              : 'border-slate-200'
                            }`}
                        >
                          {task.completed ? (
                            <svg 
                              className="w-3 h-3 text-white" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          ) : null}
                        </button>
                        <span 
                          className={`flex-1 text-sm font-medium transition-all duration-200
                            ${task.completed 
                              ? 'text-slate-400 line-through' 
                              : 'text-slate-600'
                            }`}
                        >
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => handleSubmit(e, date)}
                    className="mt-4"
                  >
                    <input
                      type="text"
                      name="task"
                      placeholder="Add task"
                      className="w-full px-0 py-2 text-sm border-0 border-b border-gray-100
                               focus:outline-none focus:border-blue-500
                               placeholder-gray-300 transition-all duration-200
                               bg-transparent"
                    />
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Next7Days;