import React, { useEffect, useState } from 'react';
import Recipes from './Recipes';
import { getWeather } from '../services/weatherService';
import { ElfConfig, CalendarDay, Kid } from '../types';

interface Props {
    elfConfig: ElfConfig;
    calendar: CalendarDay[];
    kids: Kid[];
    onExit: () => void;
}

const KidsZone: React.FC<Props> = ({ elfConfig, calendar, kids, onExit }) => {
    const [weather, setWeather] = useState({ temp: -20, condition: 'Schnee' });
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        setWeather(getWeather());
    }, []);

    useEffect(() => {
        if (clickCount >= 3) {
            onExit();
        }
        const timer = setTimeout(() => setClickCount(0), 1000); // Reset after 1s
        return () => clearTimeout(timer);
    }, [clickCount, onExit]);

    const calculateScore = (kidId: string) => {
        if (!calendar) return 50;
        let total = 0;
        let count = 0;
        calendar.forEach(day => {
            if (day.behavior && day.behavior[kidId]) {
                total += day.behavior[kidId];
                count++;
            }
        });
        return count === 0 ? 50 : (total / count) * 100;
    };
    
    const assignedKids = kids.filter(k => elfConfig.kidIds.includes(k.id));

    return (
        <div 
            className="min-h-screen bg-slate-900 text-white pb-20 select-none cursor-default"
            onClick={() => setClickCount(prev => prev + 1)}
        >
             <div className="bg-[#1a237e] p-6 text-center border-b-4 border-[#5c6bc0] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                 <h1 className="text-4xl md:text-6xl font-serif font-bold text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] relative z-10">
                     Kinder-Zone
                 </h1>
             </div>

             <div className="max-w-4xl mx-auto mt-8 p-4">
                 <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-3xl p-8 border-4 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] text-center">
                     <h2 className="text-2xl font-bold text-blue-200 mb-6 uppercase tracking-wider">Nordpol Wetter</h2>
                     <div className="flex items-center justify-center gap-12">
                         <div>
                             <span className="text-9xl font-bold text-white drop-shadow-xl">{weather.temp}°</span>
                         </div>
                         <div>
                             <span className="text-7xl mb-2">{weather.condition.includes('Schnee') ? '🌨️' : '☀️'}</span>
                             <span className="text-2xl block font-bold text-yellow-300">{weather.condition}</span>
                         </div>
                     </div>
                 </div>
             </div>

             {assignedKids.length > 0 && (
                <div className="max-w-4xl mx-auto mt-8 px-4">
                    <div className="bg-[#2d1b14] rounded-3xl p-6 border-4 border-[#855E42] shadow-2xl">
                         <h2 className="text-center text-2xl font-bold text-elf-gold mb-4">Brav-o-Meter</h2>
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            {assignedKids.map(kid => {
                                const percent = calculateScore(kid.id);
                                return (
                                    <div key={kid.id} className="bg-black/30 p-4 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="material-icons-round text-yellow-400 text-3xl">{kid.gender === 'girl' ? 'face_3' : 'face_6'}</span>
                                            <span className="text-xl font-bold text-amber-100">{kid.name}</span>
                                        </div>
                                        <div className="h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600 relative shadow-inner">
                                             <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 w-full opacity-30"></div>
                                             <div 
                                                className="h-full bg-gradient-to-r from-elf-green to-emerald-300 rounded-full relative shadow-[0_0_15px_white]"
                                                style={{ width: `${percent}%`, transition: 'width 2s ease-out' }}
                                             />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
             )}

             <div className="mt-8">
                <Recipes />
             </div>

             <div className="text-center mt-12 text-slate-500 text-xs opacity-50">
                 3x tippen zum Verlassen
             </div>
        </div>
    );
};

export default KidsZone;
