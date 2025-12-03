import React from 'react';
import { AppState, ElfConfig, Kid } from '../types';

interface Props {
    state: AppState;
    activeElf: ElfConfig;
    weather: { temp: number; condition: string };
    setCurrentView: (view: any) => void;
    handlePanicMovement: (elf: ElfConfig) => void;
    handlePanicPreparation: (elf: ElfConfig) => void;
}

const Dashboard: React.FC<Props> = ({ state, activeElf, weather, setCurrentView, handlePanicMovement, handlePanicPreparation }) => {
    
    const calculateKidBehaviorScore = (kidId: string): number => {
        let total = 0;
        let count = 0;
        state.calendar.forEach(day => {
            if (day.behavior && day.behavior[kidId]) {
                total += day.behavior[kidId];
                count++;
            }
        });
        return count === 0 ? 0 : total / count;
    };

    const daysPrepared = state.calendar.filter(d => d.prepared).length;
    const nextOpenDay = state.calendar.find(d => !d.completed)?.day || 24;
    const currentDayPlan = state.calendar[nextOpenDay - 1];
    
    const assignedKids = state.kids.filter(k => activeElf.kidIds.includes(k.id));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Hero Card */}
            <div className="bg-[#2d1b14] rounded-xl p-1 shadow-2xl border-2 border-[#5d4037] relative group">
                <div className="bg-wood-texture rounded-lg p-6 md:p-8 border border-white/10 relative overflow-hidden">
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 text-amber-100 drop-shadow-md tracking-tight">
                                    Hallo Eltern!
                                </h1>
                             </div>
                             <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-200/20 backdrop-blur-sm text-center transform -rotate-2">
                                 <div className="text-[9px] uppercase font-bold text-blue-200 tracking-wider">Nordpol</div>
                                 <div className="flex items-center justify-center gap-1 my-1">
                                    <span className="material-icons-round text-white text-2xl">ac_unit</span>
                                    <span className="text-2xl font-bold text-white">{weather.temp}°</span>
                                 </div>
                                 <div className="text-[10px] text-blue-100 italic">{weather.condition}</div>
                             </div>
                        </div>
                        
                        <p className="opacity-90 text-base md:text-lg font-medium text-amber-200/80 mt-2 font-serif italic">
                            "{activeElf.name}" ist bereit für {assignedKids.map(k => k.name).join(' & ')}.
                        </p>
                        
                        {/* MULTI BRAV-O-METER */}
                        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                            {assignedKids.map(kid => {
                                const score = calculateKidBehaviorScore(kid.id);
                                const percent = score === 0 ? 50 : (score / 5) * 100;
                                let statusText = 'Noch keine Daten';
                                if (score > 0) statusText = score < 2.5 ? 'Wichtel ist besorgt...' : score > 4 ? 'Absoluter Engel!' : 'Auf gutem Weg';
                                
                                return (
                                    <div key={kid.id} className="bg-black/40 p-3 rounded-lg border border-white/10">
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-amber-100 tracking-wider mb-1">
                                            <span>{kid.name}</span>
                                            <span>{statusText}</span>
                                        </div>
                                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600 relative">
                                            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 w-full opacity-30"></div>
                                            <div 
                                                className="h-full bg-gradient-to-r from-elf-green to-emerald-300 rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                                                style={{ width: `${percent}%` }}
                                            >
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;