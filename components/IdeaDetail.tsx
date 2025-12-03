import React from 'react';
import { Idea } from '../types';

interface Props {
  idea: Idea;
  onClose: () => void;
  onAdd: (idea: Idea) => void;
  isSaved: boolean;
}

const IdeaDetail: React.FC<Props> = ({ idea, onClose, onAdd, isSaved }) => {
  return (
    <div 
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div 
            className="bg-[#fcfaf2] w-full max-w-lg rounded-lg shadow-2xl animate-slide-up border-4 border-[#2d1b14] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 border-b-2 border-[#e6dac0] bg-[#f9f5e6] flex justify-between items-center">
                <h3 className="font-bold text-2xl text-elf-dark font-serif">{idea.title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-[#e6dac0] rounded-full">
                    <span className="material-icons-round">close</span>
                </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4">
                <p className="text-slate-700 text-base leading-relaxed font-serif text-justify">
                    {idea.description}
                </p>

                <div className="flex flex-wrap gap-2 my-4">
                    <span className={`text-sm px-3 py-1 rounded-full font-bold border ${
                        idea.effort === 'niedrig' ? 'bg-green-100 text-green-800 border-green-200' 
                        : idea.effort === 'mittel' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                        ⏱ Aufwand: {idea.effort}
                    </span>
                     <span className={`text-sm px-3 py-1 rounded-full font-bold border ${
                        idea.messiness === 'sauber' ? 'bg-blue-100 text-blue-800 border-blue-200' 
                        : idea.messiness === 'etwas chaos' ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'bg-purple-100 text-purple-800 border-purple-200'
                    }`}>
                        🧹 Chaos: {idea.messiness}
                    </span>
                </div>

                <div className="bg-[#f9f5e6] p-4 rounded-lg border border-[#d4c5a5]">
                   <h5 className="font-bold text-sm mb-2 uppercase tracking-wider text-[#855E42] flex items-center gap-2">
                       <span className="material-icons-round text-base">construction</span> Benötigtes Material
                   </h5>
                   {idea.materials && idea.materials.length > 0 ? (
                       <div className="flex flex-wrap gap-2">
                         {idea.materials.map((m, idx) => (
                           <span key={idx} className="text-sm bg-white text-slate-800 px-3 py-1 rounded-md border border-[#e6dac0] shadow-sm">{m}</span>
                         ))}
                       </div>
                   ) : (
                       <p className="text-sm text-slate-500 italic">Kein besonderes Material benötigt.</p>
                   )}
               </div>
            </div>

            <div className="p-4 border-t-2 border-[#e6dac0] bg-[#f9f5e6]">
                <button
                    onClick={() => onAdd(idea)}
                    disabled={isSaved}
                    className="w-full py-3 bg-elf-gold text-elf-dark font-bold rounded-lg disabled:bg-slate-300 disabled:text-slate-500 enabled:hover:bg-yellow-400 transition-colors"
                >
                    {isSaved ? 'Bereits im Kalender gespeichert' : 'Zum Kalender hinzufügen'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default IdeaDetail;
