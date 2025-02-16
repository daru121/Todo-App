import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export function useTaskDetails(setTasks) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const saveNotesTimeoutRef = useRef(null);

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    if (task) {
      setNotes(task.notes || '');
      fetchAttachments(task.id);
    } else {
      setNotes('');
      setAttachments([]);
    }
  }, []);

  const handleNotesChange = useCallback(async (taskId, newNotes) => {
    if (!taskId) return;

    setNotes(newNotes);

    if (saveNotesTimeoutRef.current) {
      clearTimeout(saveNotesTimeoutRef.current);
    }

    saveNotesTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);

      try {
        await axios.patch(`/api/tasks/${taskId}`, { notes: newNotes });
        
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, notes: newNotes }
              : task
          )
        );
      } catch (error) {
        console.error('Error saving notes:', error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [setTasks]);

  const fetchAttachments = async (taskId) => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/attachments`);
      setAttachments(response.data);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleFileUpload = async (files) => {
    if (!selectedTask) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `/api/tasks/${selectedTask.id}/attachments`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            },
          }
        );

        setAttachments(prev => [...prev, response.data]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedTask) return;
    
    try {
      await axios.delete(`/api/tasks/${selectedTask.id}/attachments/${attachmentId}`);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  return {
    selectedTask,
    notes,
    isSaving,
    attachments,
    fileInputRef,
    uploadProgress,
    isUploading,
    handleTaskClick,
    handleNotesChange,
    handleFileUpload,
    handleDeleteAttachment
  };
}