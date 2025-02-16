import React from 'react';

function NotesSection({ notes, handleNotesChange, isSaving }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-500">NOTES</label>
      <div className="relative">
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Insert your notes here"
          className="w-full h-32 bg-slate-50 text-slate-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 placeholder-slate-400 transition-all duration-200"
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
  );
}

export default NotesSection; 