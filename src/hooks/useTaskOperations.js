import { useState, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export function useTaskOperations(listType = null) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tasks');
      const filteredTasks = listType 
        ? response.data.filter(task => task.list_type.toLowerCase() === listType.toLowerCase())
        : response.data;
      
      setTasks(filteredTasks);
      
      const initialCompletedTasks = new Set(
        filteredTasks
          .filter(task => task.completed)
          .map(task => task.id)
      );
      setCompletedTasks(initialCompletedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskTitle) => {
    if (!taskTitle || !taskTitle.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/tasks', {
        title: taskTitle,
        list_type: listType || 'Personal',
        completed: false,
        priority: false,
        notes: '',
        reminder_date: null,
        reminder_time: null,
      });
      
      if (!listType || response.data.list_type.toLowerCase() === listType.toLowerCase()) {
        setTasks(prevTasks => [...prevTasks, response.data]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = useCallback((taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          const isCompleted = !completedTasks.has(taskId);
          // Update completedTasks
          setCompletedTasks(prev => {
            const newSet = new Set(prev);
            if (isCompleted) {
              newSet.add(taskId);
            } else {
              newSet.delete(taskId);
            }
            return newSet;
          });
          return { ...task, completed: isCompleted };
        }
        return task;
      });
      return updatedTasks;
    });
  }, [completedTasks]);

  const handleDeleteTask = async (taskId, callbacks = {}) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      setCompletedTasks(prev => {
        const newCompleted = new Set(prev);
        newCompleted.delete(taskId);
        return newCompleted;
      });

      if (callbacks.onDelete) {
        callbacks.onDelete(taskId);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  const handleMoveTask = async (taskId, newListType) => {
    try {
      // Kirim request ke backend untuk update list_type
      const capitalizedListType = newListType.charAt(0).toUpperCase() + newListType.slice(1);
      
      await axios.patch(`/api/tasks/${taskId}`, {
        list_type: capitalizedListType
      });

      // Update state lokal
      if (listType) {
        // Jika dalam view specific list (Personal/Work), hapus task dari list
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        // Hapus dari completedTasks jika ada
        setCompletedTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });

        // Reset selectedTask jika task yang dipindahkan adalah task yang sedang dipilih
        if (selectedTask?.id === taskId) {
          handleTaskClick(null);
        }
      } else {
        // Jika dalam view All Tasks, update list_type task
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, list_type: capitalizedListType }
              : task
          )
        );
      }

      // Refresh data jika diperlukan
      await fetchTasks();

    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleRenameTask = async (taskId, newTitle) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, {
        title: newTitle
      });

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, title: newTitle }
            : task
        )
      );
    } catch (error) {
      console.error('Error renaming task:', error);
    }
  };

  return {
    tasks,
    loading,
    completedTasks,
    setTasks,
    fetchTasks,
    handleAddTask,
    handleCompleteTask,
    handleDeleteTask,
    handleDragEnd,
    handleMoveTask,
    handleTaskClick,
    handleRenameTask,
  };
} 