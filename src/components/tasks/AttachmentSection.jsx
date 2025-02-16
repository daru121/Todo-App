import React from 'react';

function AttachmentSection({
  attachments,
  handleFileUpload,
  handleDeleteAttachment,
  fileInputRef,
  isUploading,
  uploadProgress,
  setPreviewImage
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-500">ATTACHMENTS</label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        {isUploading ? (
          <div className="space-y-2">
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-slate-500">Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500">Click to add / drop your files here</p>
            <p className="text-xs text-slate-400 mt-1">Supports: JPG, PNG, GIF</p>
          </>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200"
            >
              <img 
                src={attachment.file_url} 
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewImage(attachment.file_url)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  className="p-2 bg-rose-500/20 rounded-lg hover:bg-rose-500/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttachmentSection; 