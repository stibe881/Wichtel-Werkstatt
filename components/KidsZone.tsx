import React, { useEffect, useState } from 'react';
import Recipes from './Recipes';
import { getWeather } from '../services/weatherService';
import { ElfConfig, CalendarDay, Kid } from '../types'; // This line is different from the original search and file content.

interface Props {
    elfConfig: ElfConfig;
    calendar?: CalendarDay[]; // Renamed from DayPlan to CalendarDay
    kids: Kid[]; // Added kids prop
    onExit?: () => void;
}

const KidsZone: React.FC<Props> = ({ elfConfig, calendar, kids, onExit }) => {
    const [weather, setWeather] = useState({ temp: -20, condition: 'Schnee' });
    const [clickCount, setClickCount] = useState(0);

    // Weather Init
    useEffect(() => {
        setWeather(getWeather());
    }, []);

    // Triple Click Logic to Exit
    useEffect(() => {
        if (clickCount === 3 && onExit) {
            onExit();
        }
        const timer = setTimeout(() => {
            setClickCount(0);
        }, 1000); // Reset clicks after 1 second of inactivity

        return () => clearTimeout(timer);
    }, [clickCount, onExit]);

    const handleInteraction = () => {
        setClickCount(prev => prev + 1);
    };

    // Calculate Behavior Score
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

    return (
        <div 
            className="min-h-screen bg-slate-900 text-white pb-20 select-none cursor-default"
            onClick={handleInteraction}
        >
             {/* Header */}
             <div className="bg-[#1a237e] p-4 sm:p-6 text-center border-b-4 border-[#5c6bc0] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                 <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] relative z-10">
                     Kinder-Zone
                 </h1>
                 <p className="text-blue-200 text-base sm:text-lg font-bold mt-2 uppercase tracking-widest relative z-10">
                     Offizieller Wichtel-Bereich
                 </p>
             </div>

             {/* North Pole Live Cam Widget */}
             <div className="max-w-4xl mx-auto mt-8 p-4">
                 <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-3xl p-4 sm:p-8 border-4 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] text-center relative overflow-hidden">
                     {/* Snowflakes decoration */}
                     <div className="absolute top-4 left-10 text-4xl opacity-50 animate-bounce">❄️</div>
                     <div className="absolute bottom-10 right-10 text-6xl opacity-30 animate-pulse">❄️</div>

                     <h2 className="text-xl sm:text-2xl font-bold text-blue-200 mb-6 uppercase tracking-wider flex items-center justify-center gap-2">
                        <span className="material-icons-round">public</span>
                        Nordpol Wetter-Station
                     </h2>
                     
                     <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                         <div className="flex flex-col items-center">
                             <span className="text-7xl sm:text-8xl md:text-9xl font-bold text-white drop-shadow-xl">{weather.temp}°</span>
                             <span className="text-blue-300 font-bold uppercase mt-2 text-sm sm:text-base">Temperatur</span>
                         </div>
                         <div className="w-24 h-1 bg-blue-500/30 md:w-1 md:h-24"></div>
                         <div className="flex flex-col items-center">
                             <span className="text-5xl sm:text-6xl md:text-7xl mb-2">
                                 {weather.condition.includes('Schnee') ? '🌨️' : weather.condition.includes('Sonne') ? '☀️' : weather.condition.includes('Klar') ? '✨' : '🌪️'}
                             </span>
                             <span className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-300">{weather.condition}</span>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Brav-o-Meter Display */}
             {elfConfig && (
                <div className="max-w-4xl mx-auto mt-8 px-4">
                    <div className="bg-[#2d1b14] rounded-3xl p-4 sm:p-6 border-4 border-[#855E42] shadow-2xl relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-elf-gold text-elf-dark px-4 sm:px-6 py-1 rounded-full font-bold border-2 border-[#855E42] shadow-lg text-sm sm:text-base">
                            Wie brav seid ihr?
                        </div>
                        <div className="mt-4 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                            {kids.filter(k => elfConfig.kidIds.includes(k.id)).map(kid => { // Filter kids by elfConfig.kidIds
                                const percent = calculateScore(kid.id); // Changed kid.name to kid.id
                                return (
                                    <div key={kid.id} className="bg-black/30 p-3 sm:p-4 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="material-icons-round text-yellow-400 text-2xl sm:text-3xl">{kid.gender === 'girl' ? 'face_3' : 'face_6'}</span>
                                            <span className="text-lg sm:text-xl font-bold text-amber-100">{kid.name}</span>
                                        </div>
                                        <div className="h-5 sm:h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600 relative shadow-inner">
                                             <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 w-full opacity-30"></div>
                                             <div 
                                                className="h-full bg-gradient-to-r from-elf-green to-emerald-300 rounded-full relative shadow-[0_0_15px_white]"
                                                style={{ width: `${percent}%`, transition: 'width 2s ease-out' }}
                                             >
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"></div>
                                             </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
             )}

             {/* Recipes Section */}
             <div className="mt-12 px-4">
                 <div className="bg-[#fcfaf2] rounded-3xl p-4 sm:p-6 md:p-8 max-w-5xl mx-auto shadow-2xl border-4 border-[#855E42] relative">
                     {/* Decoration */}
                     <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 bg-[#D42426] text-white px-6 sm:px-8 py-2 rounded-full font-bold text-base sm:text-xl shadow-lg border-2 border-[#855E42]">
                         Wichtel-Bäckerei
                     </div>
                     
                     <div className="mt-6">
                        <Recipes />
                     </div>
                 </div>
             </div>

             <div className="text-center mt-12 text-slate-500 text-sm">
                 <p>Geheimer Bereich • Nur für brave Kinder</p>
                 <p className="text-[10px] opacity-30 mt-2">(3x Klicken zum Verlassen)</p>
             </div>
        </div>
    );
};

export default KidsZone;