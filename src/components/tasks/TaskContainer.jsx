import React from 'react';
import TaskList from './TaskList';
import TaskInput from './TaskInput';

function TaskContainer({ 
  filteredTasks, 
  handleDragEnd, 
  handleTaskClick, 
  handleCompleteTask, 
  handleDeleteTask,
  completedTasks,
  selectedTask,
  newTask,
  setNewTask,
  handleAddTask,
  loading
}) {
  return (
    <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-md overflow-hidden flex flex-col h-[600px]">
      <div className="flex-1 p-8 overflow-y-auto">
        <TaskList
          tasks={filteredTasks}
          handleDragEnd={handleDragEnd}
          handleTaskClick={handleTaskClick}
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          completedTasks={completedTasks}
          selectedTask={selectedTask}
        />
      </div>

      <TaskInput 
        newTask={newTask}
        setNewTask={setNewTask}
        handleAddTask={handleAddTask}
        loading={loading}
      />
    </div>
  );
}

export default TaskContainer; 