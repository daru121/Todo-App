import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import Header from '../components/tasks/Header';
import TaskContainer from '../components/tasks/TaskContainer';
import TaskDetailContainer from '../components/tasks/TaskDetailContainer';
import ReminderPopup from '../components/tasks/ReminderPopup';
import ImagePreviewModal from '../components/tasks/ImagePreviewModal';
import MoveToPopup from '../components/tasks/MoveToPopup';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { useTaskDetails } from '../hooks/useTaskDetails';
import { useReminders } from '../hooks/useReminders';

function Work() {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [showMoveToPopup, setShowMoveToPopup] = useState(false);
  const [selectedTaskForMove, setSelectedTaskForMove] = useState(null);

  const {
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
    handleRenameTask
  } = useTaskOperations('work'); // Menggunakan 'work' sebagai list_type

  const {
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
  } = useTaskDetails(setTasks);

  const {
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
  } = useReminders(tasks, setTasks);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      handleTaskClick(tasks[0]);
    } else if (tasks.length === 0) {
      handleTaskClick(null);
    }
  }, [tasks, handleTaskClick, selectedTask]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMoveClick = (task) => {
    setSelectedTaskForMove(task);
    setShowMoveToPopup(true);
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#F8F9FF] via-[#F3F6FF] to-[#F5F7FF] p-8">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        tasks={filteredTasks}
        completedTasks={completedTasks}
        title="Work" // Mengubah title
        subtitle="View and manage your work tasks" // Mengubah subtitle
      />

      <div className="flex gap-8 max-w-[1600px] mx-auto">
        <TaskContainer 
          filteredTasks={filteredTasks}
          handleDragEnd={handleDragEnd}
          handleTaskClick={handleTaskClick}
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          completedTasks={completedTasks}
          selectedTask={selectedTask}
          newTask={newTask}
          setNewTask={setNewTask}
          handleAddTask={handleAddTask}
          loading={loading}
          listType="work" // Mengubah listType menjadi work
        />

        <TaskDetailContainer 
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
          hasReminder={hasReminder}
          tasks={tasks}
          onMoveClick={handleMoveClick}
          handleRenameTask={handleRenameTask}
        />
      </div>

      {showReminderPopup && (
        <ReminderPopup
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          currentMonth={currentMonth}
          setSelectedDate={setSelectedDate}
          setSelectedTime={setSelectedTime}
          setCurrentMonth={setCurrentMonth}
          setShowReminderPopup={setShowReminderPopup}
          handleSaveReminder={handleSaveReminder}
        />
      )}

      {previewImage && (
        <ImagePreviewModal 
          image={previewImage} 
          onClose={() => setPreviewImage(null)} 
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

export default Work; 