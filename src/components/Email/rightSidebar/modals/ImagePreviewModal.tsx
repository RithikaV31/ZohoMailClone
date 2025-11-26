// modals/ImagePreviewModal.tsx
import React from 'react';

export const ImagePreviewModal: React.FC<{ src: string; name?: string; onClose: () => void }> = ({ src, name, onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded p-4 max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">{name || 'Image'}</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">Close</button>
        </div>
        <img src={src} alt={name} className="w-full h-auto object-contain" />
      </div>
    </div>
  );
};
