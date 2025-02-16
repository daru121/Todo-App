import React from 'react';
import TaskDetail from './TaskDetail';

function TaskDetailContainer({
  selectedTask,
  notes,
  handleNotesChange,
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
  tasks,
  onMoveClick,
  handleRenameTask
}) {
  return (
    <div className="w-[400px] bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-md overflow-hidden h-[600px]">
      <TaskDetail
        selectedTask={selectedTask}
        notes={notes}
        handleNotesChange={handleNotesChange}
        isSaving={isSaving}
        attachments={attachments}
        handleFileUpload={handleFileUpload}
        handleDeleteAttachment={handleDeleteAttachment}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        setPreviewImage={setPreviewImage}
        handleToggleReminder={handleToggleReminder}
        hasReminder={(taskId) => hasReminder(taskId, tasks)}
        onMoveClick={onMoveClick}
        handleRenameTask={handleRenameTask}
      />
    </div>
  );
}

export default TaskDetailContainer; 