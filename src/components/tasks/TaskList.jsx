import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReminderIndicator from './ReminderIndicator';

function TaskList({ 
  tasks, 
  handleDragEnd, 
  handleTaskClick, 
  handleCompleteTask, 
  handleDeleteTask,
  completedTasks,
  selectedTask 
}) {
  // Urutkan tasks: yang belum selesai di atas, yang sudah selesai di bawah
  const sortedTasks = [...tasks].sort((a, b) => {
    const aCompleted = completedTasks.has(a.id);
    const bCompleted = completedTasks.has(b.id);
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  const getItemStyle = (isDragging, draggableStyle) => ({
    ...draggableStyle,
    userSelect: 'none',
    transform: draggableStyle?.transform,
    position: isDragging ? 'relative' : 'static',
    left: 'auto',
    top: 'auto',
    background: isDragging ? 'white' : 'transparent',
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
    borderRadius: '12px',
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {sortedTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={() => handleTaskClick(task)}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    className={`group bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200 cursor-pointer
                      ${selectedTask?.id === task.id ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/30' : ''}
                    `}
                  >
                    {/* Drag Handle */}
                    <div 
                      {...provided.dragHandleProps} 
                      className={`cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-slate-50 transition-colors
                        ${snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                      `}
                    >
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>

                    {/* Checkbox */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteTask(task.id);
                      }}
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ease-in-out transform hover:scale-110 ${
                        completedTasks.has(task.id)
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                      } flex items-center justify-center`}
                    >
                      {completedTasks.has(task.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-base transition-all duration-200 ${
                        completedTasks.has(task.id) 
                          ? 'text-slate-400 line-through' 
                          : 'text-slate-700'
                      }`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-0.5">{task.list_type}</p>
                      {/* Reminder Indicator */}
                      {task.reminder_date && task.reminder_time && (
                        <ReminderIndicator 
                          date={task.reminder_date} 
                          time={task.reminder_time} 
                        />
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-lg transition-all duration-200"
                    >
                      <svg 
                        className="w-5 h-5 text-rose-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default TaskList; 