import React from 'react';
import { X } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, title, message, isLoading, onRegenerate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-red-50 via-white to-green-50 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-8 relative border-4 border-red-500 animate-pulse-border">
        {/* Snowflake decorations */}
        <div className="absolute -top-6 -left-6 text-6xl animate-spin-slow">❄️</div>
        <div className="absolute -top-6 -right-6 text-6xl animate-spin-slow-reverse">❄️</div>

        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="text-center space-y-6 flex flex-col min-h-0">
          {/* Emergency icon */}
          <div className="text-8xl animate-bounce">
            {isLoading ? '⏳' : '🚨'}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-red-700">
            {title}
          </h2>

          {/* Message - Scrollable */}
          <div className="bg-white/80 rounded-2xl p-6 border-2 border-red-300 overflow-y-auto flex-shrink min-h-0">
            <p className="text-lg text-gray-800 whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>

          {/* Buttons */}
          {!isLoading && (
            <div className="flex flex-col gap-3">
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-full font-bold text-base hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  🔄 Neu generieren
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-red-600 to-green-600 text-white py-4 px-6 rounded-full font-bold text-lg hover:from-red-700 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Verstanden! 🎄
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgb(239, 68, 68); }
          50% { border-color: rgb(34, 197, 94); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default EmergencyModal;
