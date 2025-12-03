import React from 'react';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmModal: React.FC<Props> = ({ title, message, onConfirm, onCancel, confirmLabel = 'Löschen', cancelLabel = 'Abbrechen' }) => {
  return (
    <div 
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onCancel}
    >
        <div 
            className="bg-[#fcfaf2] w-full max-w-md rounded-lg shadow-2xl animate-slide-up border-4 border-[#2d1b14] flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 border-b-2 border-[#e6dac0] bg-[#f9f5e6]">
                <h3 className="font-bold text-2xl text-elf-dark font-serif text-center">{title}</h3>
            </div>
            <div className="p-8 text-center">
                <p className="text-slate-700 text-lg">{message}</p>
            </div>
            <div className="p-4 border-t-2 border-[#e6dac0] flex justify-center gap-4 bg-[#f9f5e6]">
                <button 
                    onClick={onCancel} 
                    className="px-8 py-3 bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                >
                    {cancelLabel}
                </button>
                <button 
                    onClick={onConfirm} 
                    className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold shadow-lg hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmModal;
