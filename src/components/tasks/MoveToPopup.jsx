import React from 'react';

function MoveToPopup({ isOpen, onClose, onMove, currentList }) {
  if (!isOpen) return null;

  const lists = ['Personal', 'Work'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-[320px] rounded-2xl shadow-lg">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Move to</h3>
        </div>
        
        <div className="p-4 space-y-2">
          {lists.map(list => (
            <button
              key={list}
              onClick={() => {
                onMove(list.toLowerCase());
                onClose();
              }}
              disabled={currentList === list.toLowerCase()}
              className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200
                ${currentList === list.toLowerCase() 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'hover:bg-slate-50 text-slate-700'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  {list === 'Personal' ? (
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </span>
                {list}
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoveToPopup; 