import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TaskDetailPopup = ({
  selectedTaskDetail,
  setShowTaskDetail,
  setTasks,
  attachments,
  setAttachments,
  fileInputRef,
  taskReminders,
  handleReminderClick
}) => {
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

  // Handle title change
  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  // Handle save title
  const handleTitleSave = async () => {
    if (editedTitle === selectedTaskDetail?.title) return;
    
    try {
      await axios.patch(`/api/tasks/${selectedTaskDetail.id}`, {
        title: editedTitle
      });

      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === selectedTaskDetail.id) {
          return { ...task, title: editedTitle };
        }
        return task;
      }));

    } catch (error) {
      console.error('Error updating task title:', error);
      setEditedTitle(selectedTaskDetail?.title);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const fileArray = Array.from(files);
    
    if (fileArray.some(file => !allowedTypes.includes(file.type))) {
      alert('Only image files (JPG, PNG, GIF) are allowed');
      return;
    }

    for (let file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `/api/tasks/${selectedTaskDetail.id}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        setAttachments(prev => [...prev, response.data]);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      }
    }
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await axios.delete(`/api/tasks/${selectedTaskDetail.id}/attachments/${attachmentId}`);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
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
              onClick={() => handleReminderClick(selectedTaskDetail.id)}
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
                      onClick={() => handleDeleteAttachment(attachment.id)}
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
              
              <svg className="w-8 h-8 mb-2 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-400">Click to add / drop your image files here</p>
              <p className="text-xs text-slate-500 mt-1">Supports: JPG, PNG, GIF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPopup; 