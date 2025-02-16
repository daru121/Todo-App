import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';

function TaskList({ 
  tasks, 
  onDragEnd, 
  onComplete, 
  completedTasks, 
  onPin, 
  pinnedTasks,
  onDelete,
  onTaskClick,
  onReminderClick,
  taskReminders,
  openMenuId,
  setOpenMenuId,
  menuPosition,
  setMenuPosition,
  dropdownMenu
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 mb-8 ${
              snapshot.isDraggingOver ? 'bg-indigo-50/30 rounded-3xl p-4' : ''
            }`}
          >
            {tasks.map((task, index) => {
              return (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group bg-white/70 rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200 backdrop-blur-xl
                        ${snapshot.isDragging ? 'shadow-2xl scale-[1.02] rotate-2 bg-white' : ''}
                      `}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                          ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                          : provided.draggableProps.style?.transform
                      }}
                    >
                      {/* Drag Handle */}
                      <div className="w-6 h-6 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      {/* Checkbox */}
                      <div 
                        onClick={() => onComplete(task.id)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          completedTasks.has(task.id)
                            ? 'border-indigo-400 bg-indigo-400'
                            : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
                        } flex items-center justify-center cursor-pointer transition-all duration-200`}
                      >
                        {completedTasks.has(task.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Pin Button */}
                      <button 
                        onClick={() => onPin(task.id)}
                        className={`w-10 h-10 flex items-center justify-center transition-colors ${
                          pinnedTasks.has(task.id) 
                            ? 'text-indigo-500' 
                            : 'text-slate-400 hover:text-indigo-500'
                        }`}
                      >
                        <svg 
                          className="w-6 h-6" 
                          viewBox="0 0 24 24" 
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15.5 3.5L18.5 6.5" />
                          <path d="M8.2 11L13 6.2L17.8 11L13 15.8L8.2 11Z" />
                          <path d="M11 13L5 19" />
                        </svg>
                      </button>

                      {/* Task Title and Reminder */}
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onTaskClick(task)}
                      >
                        <span className={`font-medium ${
                          completedTasks.has(task.id)
                            ? 'text-slate-400 line-through'
                            : 'text-slate-700'
                        }`}>
                          {task.title}
                        </span>
                        
                        {/* Show reminder if exists */}
                        {taskReminders[task.id] && (
                          <div className="text-sm text-indigo-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(taskReminders[task.id].date).toLocaleDateString()} {taskReminders[task.id].time}
                          </div>
                        )}
                      </div>

                      {/* List Type */}
                      <div className="text-sm text-slate-400 group-hover:text-indigo-400 transition-colors duration-200">
                        My lists {'>'} {task.list_type}
                      </div>

                      {/* Three Dots Menu */}
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            setMenuPosition({ x: rect.x, y: rect.y + rect.height });
                            setOpenMenuId(openMenuId === task.id ? null : task.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu Portal */}
                        {openMenuId === task.id && createPortal(
                          <div 
                            className="fixed w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[9999]"
                            style={{
                              left: menuPosition.x - 180,
                              top: menuPosition.y + 8
                            }}
                          >
                            {dropdownMenu(task.id)}
                          </div>,
                          document.body
                        )}
                      </div>

                      {/* Close Button */}
                      <button 
                        onClick={() => onDelete(task.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default TaskList; 