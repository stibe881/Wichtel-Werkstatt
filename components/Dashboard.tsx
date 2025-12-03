import React from 'react';
import { AppState, ElfConfig } from '../types';

interface Props {
    state: AppState;
    activeElf: ElfConfig;
    weather: { temp: number; condition: string };
}

const Dashboard: React.FC<Props> = ({ state, activeElf, weather }) => {
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

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-[#2d1b14] rounded-xl p-1 shadow-2xl border-2 border-[#5d4037]">
                <div className="bg-wood-texture rounded-lg p-6 md:p-8 border border-white/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 text-amber-100 drop-shadow-md">
                                Hallo Eltern!
                            </h1>
                            <p className="opacity-90 text-lg font-medium text-amber-200/80 italic">
                                "{activeElf.name}" ist bereit für {state.kids.filter(k => activeElf.kidIds.includes(k.id)).map(k => k.name).join(' & ')}.
                            </p>
                        </div>
                        <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-200/20 text-center">
                            <div className="text-xs uppercase font-bold text-blue-200">Nordpol</div>
                            <div className="text-2xl font-bold text-white">{weather.temp}°</div>
                            <div className="text-xs text-blue-100">{weather.condition}</div>
                        </div>
                    </div>
                    <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                        {state.kids.filter(k => activeElf.kidIds.includes(k.id)).map(kid => {
                            const score = calculateKidBehaviorScore(kid.id);
                            const percent = score === 0 ? 50 : (score / 5) * 100;
                            let statusText = 'Noch keine Daten';
                            if (score > 0) statusText = score < 2.5 ? 'Wichtel ist besorgt...' : score > 4 ? 'Absoluter Engel!' : 'Auf gutem Weg';

                            return (
                                <div key={kid.id} className="bg-black/40 p-3 rounded-lg border border-white/10">
                                    <div className="flex justify-between text-xs uppercase font-bold text-amber-100 mb-1">
                                        <span>{kid.name}</span>
                                        <span>{statusText}</span>
                                    </div>
                                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                                        <div
                                            className="h-full bg-gradient-to-r from-elf-green to-emerald-300 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
