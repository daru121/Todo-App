import React from 'react';

function ImagePreviewModal({ image, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center">
      <div className="relative max-w-[90%] max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <img 
          src={image} 
          alt="" 
          className="rounded-lg max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
}

export default ImagePreviewModal; 