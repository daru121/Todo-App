import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import AttachmentSection from './AttachmentSection';
import NotesSection from './NotesSection';
import MoveToPopup from './MoveToPopup';

function TaskDetail({
  selectedTask,
  notes,
  handleNotesChange,
  handleRenameTask,
  isSaving,
  attachments,
  handleFileUpload,
  handleDeleteAttachment,
  fileInputRef,
  isUploading,
  uploadProgress,
  setPreviewImage,
  handleToggleReminder,
  hasReminder,
  onMoveClick
}) {
  const [showMoveToPopup, setShowMoveToPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (selectedTask) {
      setEditedTitle(selectedTask.title);
    }
  }, [selectedTask]);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (editedTitle.trim() && editedTitle !== selectedTask.title) {
      handleRenameTask(selectedTask.id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy, HH:mm');
  };

  if (!selectedTask) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Select a task to view details
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-200/70">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium text-slate-500">
              My lists {'>'} {selectedTask.list_type}
            </div>
            <div className="text-sm text-slate-400">
            {formatDate(selectedTask.created_at)}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            {isEditing ? (
              <form onSubmit={handleTitleSubmit} className="flex-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  className="w-full px-3 py-2 text-2xl font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </form>
            ) : (
              <h2 
                className="text-2xl font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                onClick={() => {
                  setIsEditing(true);
                  setTimeout(() => titleInputRef.current?.focus(), 0);
                }}
              >
                {selectedTask.title}
              </h2>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => handleToggleReminder(selectedTask.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors duration-200 ${
                hasReminder(selectedTask.id)
                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <svg className={`w-4 h-4 ${hasReminder(selectedTask.id) ? 'text-amber-500' : 'text-white'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {hasReminder(selectedTask.id) ? 'Reminder On' : 'Remind me'}
            </button>
            <button
              onClick={() => onMoveClick(selectedTask)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors duration-200"
            >
              {selectedTask.list_type}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <NotesSection 
            notes={notes}
            handleNotesChange={handleNotesChange}
            isSaving={isSaving}
          />
          
          <AttachmentSection
            attachments={attachments}
            handleFileUpload={handleFileUpload}
            handleDeleteAttachment={handleDeleteAttachment}
            fileInputRef={fileInputRef}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            setPreviewImage={setPreviewImage}
          />
        </div>
      </div>

      <MoveToPopup
        isOpen={showMoveToPopup}
        onClose={() => setShowMoveToPopup(false)}
        onMove={(newListType) => {
          // TODO: Implement move functionality
          console.log(`Moving task to ${newListType}`);
          setShowMoveToPopup(false);
        }}
        currentList={selectedTask?.list_type?.toLowerCase()}
      />
    </>
  );
}

export default TaskDetail; 