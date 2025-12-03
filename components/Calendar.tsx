import React, { useState, useRef } from 'react';
import { CalendarDay, Idea, ElfConfig, Kid } from '../types';
import { generateDailyMessage } from '../services/geminiService';

interface Props {
  calendar: CalendarDay[];
  savedIdeas: Idea[];
  onUpdateDay: (day: number, updates: Partial<CalendarDay>) => void;
  elfConfig: ElfConfig;
  kids: Kid[]; // Added kids prop
}

const Calendar: React.FC<Props> = ({ calendar, savedIdeas, onUpdateDay, elfConfig, kids }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);
  const [draggedFromDay, setDraggedFromDay] = useState<number | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [showIdeaPicker, setShowIdeaPicker] = useState(false);
  const [ideaFilter, setIdeaFilter] = useState<'all' | 'arrival' | 'departure' | 'normal'>('all');
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to check for Special Days
  const getSpecialDayType = (day: number) => {
      // Ensure elfConfig and its dates are valid before parsing
      if (!elfConfig || !elfConfig.arrivalDate || !elfConfig.departureDate) {
          return null;
      }
      const arrivalDate = new Date(elfConfig.arrivalDate);
      const isArrival = arrivalDate.getDate() === day && arrivalDate.getMonth() === 11; // Month is 0-indexed (11 for December)
      
      const departureDate = new Date(elfConfig.departureDate);
      const isDeparture = departureDate.getDate() === day && departureDate.getMonth() === 11;

      if (isArrival) return 'arrival';
      if (isDeparture) return 'departure';
      return null;
  };

  const getBehaviorEmoji = (score: number) => {
      if (score === 1) return '👿';
      if (score === 2) return '😠';
      if (score === 3) return '😐';
      if (score === 4) return '🙂';
      if (score === 5) return '😇';
      return '❓';
  };

  const handleDragStart = (e: React.DragEvent, idea: Idea, fromDay?: number) => {
    setDraggedIdea(idea);
    setDraggedFromDay(fromDay || null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(idea));
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    if (draggedIdea) {
      if (draggedFromDay !== null && draggedFromDay !== targetDay) {
          onUpdateDay(draggedFromDay, { 
              idea: null, 
              secretMessage: '', 
              prepared: false, 
              completed: false, 
              imageEvidence: undefined,
              behavior: undefined
          });
      }
      onUpdateDay(targetDay, { idea: draggedIdea });
      setDraggedIdea(null);
      setDraggedFromDay(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDragEnd = () => {
    setDraggedIdea(null);
    setDraggedFromDay(null);
  };

  const handleGenerateMessage = async (dayPlan: CalendarDay) => {
    if (!dayPlan.idea) return;
    setGeneratingMessage(true);
    const msg = await generateDailyMessage(elfConfig, dayPlan.idea);
    onUpdateDay(dayPlan.day, { secretMessage: msg });
    setGeneratingMessage(false);
  };

  const handlePrintMessage = (secretMessage: string) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
              <html>
                  <head>
                      <title>Nachricht vom Wichtel</title>
                      <style>
                          body { 
                              margin: 0;
                              padding: 20px;
                              background-color: white; 
                              font-family: 'Times New Roman', serif;
                          }
                          .scroll-letter { 
                              width: 80mm; 
                              margin: 0 auto;
                              padding: 10mm 5mm;
                              font-size: 11pt; 
                              line-height: 1.5;
                              text-align: justify;
                              color: #2d1b14;
                              page-break-inside: avoid;
                          }
                          .header { 
                              text-align: center; 
                              font-weight: bold; 
                              font-size: 14pt; 
                              color: #D42426; 
                              margin-bottom: 5mm; 
                              text-transform: uppercase;
                              letter-spacing: 2px;
                          }
                          .content { white-space: pre-wrap; }
                          .signature { 
                              margin-top: 8mm; 
                              text-align: center; 
                              font-style: italic; 
                              font-weight: bold; 
                              font-size: 14pt; 
                              color: #D42426; 
                              font-family: 'Brush Script MT', cursive;
                          }
                          .deco { text-align: center; font-size: 20pt; color: #D42426; margin: 10px 0; opacity: 0.6; }
                          @media print {
                              body { background: none; }
                              .no-print { display: none; }
                              .scroll-letter { page-break-inside: avoid; }
                          }
                      </style>
                  </head>
                  <body>
                      <div class="no-print" style="text-align: center; font-family: sans-serif; padding: 10px; background: #eee; border-bottom: 1px solid #ccc;">
                        <b>Druckvorschau (Schriftrolle)</b><br>
                        Nach dem Drucken ausschneiden und rollen.
                      </div>
                      <div class="scroll-letter">
                          <div class="header">🌟 Post vom Nordpol 🌟</div>
                          <div class="content">${secretMessage}</div>
                          <div class="deco">~ ❄ ~</div>
                          <div class="signature">Dein ${elfConfig.name}</div>
                      </div>
                      <script>window.onload = function() { window.print(); }</script>
                  </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  const handleSelectIdea = (idea: Idea) => {
      if (selectedDay) {
          onUpdateDay(selectedDay, { idea: idea });
          setShowIdeaPicker(false);
      }
  };

  const openIdeaPicker = (day: number) => {
      const type = getSpecialDayType(day);
      if (type === 'arrival') setIdeaFilter('arrival');
      else if (type === 'departure') setIdeaFilter('departure');
      else setIdeaFilter('normal');
      setShowIdeaPicker(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !selectedDay) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 600;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              const base64String = canvas.toDataURL('image/jpeg', 0.7);
              onUpdateDay(selectedDay, { imageEvidence: base64String });
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const removeImage = () => {
      if (selectedDay) {
          onUpdateDay(selectedDay, { imageEvidence: undefined });
      }
  };
  
  const updateBehavior = (kidId: string, score: number) => { // Changed kidName to kidId
      if (!selectedDay) return;
      const currentDay = calendar[selectedDay - 1];
      const newBehavior = { ...(currentDay.behavior || {}), [kidId]: score };
      onUpdateDay(selectedDay, { behavior: newBehavior });
  };

  const filteredIdeas = savedIdeas.filter(idea => {
      if (ideaFilter === 'all') return true;
      const type = idea.type || 'normal';
      return type === ideaFilter;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full md:h-[calc(100vh-140px)] relative">
      {/* Calendar Grid */}
      <div className="flex-1 pb-24 lg:pb-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {calendar.map((dayPlan) => {
            const specialType = getSpecialDayType(dayPlan.day);
            const isDropTarget = draggedIdea && !dayPlan.idea;
            
            return (
            <div
              key={dayPlan.day}
              draggable={!!dayPlan.idea}
              onDragStart={(e) => dayPlan.idea && handleDragStart(e, dayPlan.idea, dayPlan.day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dayPlan.day)}
              onDragEnd={handleDragEnd}
              onClick={() => setSelectedDay(dayPlan.day)}
              className={`
                relative p-3 md:p-4 min-h-[120px] md:min-h-[140px] cursor-pointer transition-all flex flex-col justify-between overflow-hidden group
                rounded-sm border-b-4 border-r-4 border-[#2d1b14] shadow-xl
                ${dayPlan.idea 
                    ? 'bg-[#fcfaf2] border-t border-l border-[#e6dac0] hover:bg-white' 
                    : 'bg-[#855E42] border-t border-l border-[#a07050]'}
                ${selectedDay === dayPlan.day ? 'ring-4 ring-elf-gold z-10' : ''}
                ${isDropTarget ? 'ring-4 ring-elf-green scale-[1.05] z-10' : ''}
                active:translate-y-1 active:border-b-0 active:border-r-0 active:shadow-none
              `}
            >
              {!dayPlan.idea && (
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-4 bg-[#2d1b14] rounded-full shadow-lg opacity-40"></div>
              )}

              <div className="flex justify-between items-start z-10 relative">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-lg border-2 shadow-inner
                    ${dayPlan.idea 
                        ? 'bg-elf-red text-white border-red-800' 
                        : specialType === 'arrival' ? 'bg-blue-500 text-white border-blue-800'
                        : specialType === 'departure' ? 'bg-red-500 text-white border-red-800'
                        : 'bg-[#5d4037] text-amber-100/50 border-[#2d1b14]'}
                  `}>
                    {dayPlan.day}
                  </div>
                  <div className="flex gap-1 bg-black/10 rounded px-1 backdrop-blur-sm">
                    {dayPlan.imageEvidence && (
                        <span className="material-icons-round text-blue-200 text-sm" title="Foto vorhanden">photo_camera</span>
                    )}
                    {dayPlan.prepared && !dayPlan.completed && (
                        <span className="material-icons-round text-green-400 text-sm" title="Vorbereitet">check_circle</span>
                    )}
                    {dayPlan.completed && (
                        <span className="material-icons-round text-elf-gold text-sm">star</span>
                    )}
                  </div>
              </div>

              {specialType === 'arrival' && !dayPlan.idea && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 text-blue-200">
                        <span className="material-icons-round text-6xl">flight_land</span>
                        <span className="text-sm font-bold">Einzug</span>
                   </div>
              )}
               {specialType === 'departure' && !dayPlan.idea && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 text-red-200">
                        <span className="material-icons-round text-6xl">flight_takeoff</span>
                        <span className="text-sm font-bold">Abschied</span>
                   </div>
              )}
              
              {dayPlan.idea ? (
                <div className="mt-2 relative z-10 bg-white/50 p-2 rounded border border-[#e6dac0]">
                   <h4 className="font-bold text-elf-dark text-xs md:text-sm line-clamp-2 leading-tight font-serif">{dayPlan.idea.title}</h4>
                   {dayPlan.secretMessage && (
                       <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-800 font-bold">
                           <span className="material-icons-round text-[12px]">mail</span> Post
                       </div>
                   )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-end pb-2 relative z-10">
                    {specialType === 'arrival' ? (
                        <span className="text-[10px] font-bold uppercase text-blue-100 tracking-wider bg-blue-800/50 px-2 py-0.5 rounded">Einzug</span>
                    ) : specialType === 'departure' ? (
                        <span className="text-[10px] font-bold uppercase text-red-100 tracking-wider bg-red-800/50 px-2 py-0.5 rounded">Abschied</span>
                    ) : (
                        <span className="text-[10px] font-bold uppercase text-[#2d1b14]/40 tracking-widest group-hover:text-amber-100 transition-colors">Leer</span>
                    )}
                </div>
              )}

              {/* Behavior Icons in Grid */}
              {dayPlan.idea && dayPlan.behavior && (
                  <div className="flex gap-1 absolute bottom-1 right-1 z-10">
                      {Object.entries(dayPlan.behavior).map(([kidId, score]) => {
                          const kid = kids.find(k => k.id === kidId);
                          return (
                          <span key={kidId} title={`${kid?.name || kidId}: ${score}`} className="text-xs bg-white/80 rounded-full px-0.5 shadow-sm">
                              {getBehaviorEmoji(score as number)}
                          </span>
                      )})}
                  </div>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* Detail Overlay/Sidebar */}
      {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-end lg:static lg:items-stretch lg:z-auto bg-black/60 lg:bg-transparent lg:w-96">
            <div 
                className="w-full bg-[#fcfaf2] lg:border-4 lg:border-[#2d1b14] flex flex-col rounded-t-2xl lg:rounded-sm shadow-2xl lg:shadow-none h-[85vh] lg:h-auto overflow-hidden animate-slide-up lg:animate-none relative"
                onClick={(e) => e.stopPropagation()} 
            >
              <div className="hidden lg:block absolute top-2 left-2 w-2 h-2 rounded-full bg-[#1a1a1a] opacity-50"></div>
              <div className="hidden lg:block absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1a1a1a] opacity-50"></div>

              <div className="p-4 md:p-6 flex justify-between items-center border-b-2 border-[#e6dac0] bg-[#fcfaf2] sticky top-0 z-10">
                 <div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-elf-dark">Schublade {selectedDay}</h3>
                    {getSpecialDayType(selectedDay) === 'arrival' && <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">🏠 Ankunftstag</span>}
                    {getSpecialDayType(selectedDay) === 'departure' && <span className="text-xs font-bold text-red-600 uppercase tracking-wide">👋 Abreisetag</span>}
                 </div>
                 <button onClick={() => setSelectedDay(null)} className="p-2 bg-[#e6dac0] rounded-full hover:bg-[#d4c5a5] transition-colors">
                   <span className="material-icons-round text-elf-dark">close</span>
                 </button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6 bg-parchment">
                 {calendar[selectedDay - 1].idea ? (
                   <>
                     {/* Idea Card */}
                     <div className="bg-white p-4 rounded border-2 border-[#e6dac0] shadow-sm relative rotate-1">
                       <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-lg text-elf-dark pr-8 leading-snug font-serif">{calendar[selectedDay - 1].idea?.title}</h4>
                            <button 
                                onClick={() => onUpdateDay(selectedDay, { idea: null, secretMessage: '', prepared: false, completed: false, imageEvidence: undefined, behavior: undefined })}
                                className="text-red-400 hover:text-red-600 p-1 absolute top-3 right-3"
                                title="Leeren"
                            >
                                <span className="material-icons-round">delete_outline</span>
                            </button>
                       </div>
                       <p className="text-slate-700 mb-4 text-sm leading-relaxed font-serif">{calendar[selectedDay - 1].idea?.description}</p>
                       
                       <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`text-xs px-2 py-1 rounded font-bold border ${
                              calendar[selectedDay - 1].idea?.effort === 'niedrig' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            ⏱ {calendar[selectedDay - 1].idea?.effort}
                          </span>
                       </div>

                       <div className="bg-[#f9f5e6] p-3 rounded border border-[#d4c5a5]">
                           <h5 className="font-bold text-xs mb-2 uppercase tracking-wider text-[#855E42] flex items-center gap-1">
                               <span className="material-icons-round text-sm">construction</span> Benötigtes Material
                           </h5>
                           <div className="flex flex-wrap gap-1">
                             {calendar[selectedDay - 1].idea?.materials.map((m, idx) => (
                               <span key={idx} className="text-xs bg-white text-slate-800 px-2 py-1 rounded border border-[#e6dac0] shadow-sm">{m}</span>
                             ))}
                           </div>
                       </div>
                     </div>

                     {/* Behavior Rating (Brav-o-Meter Input) */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                         <h5 className="font-bold text-[#2d1b14] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="material-icons-round text-base text-elf-gold">stars</span>
                            Brav-o-Meter (Heute)
                        </h5>
                        <div className="space-y-3">
                            {kids.map((kid) => { // Changed from elfConfig.kids to kids
                                const score = calendar[selectedDay - 1].behavior?.[kid.id] || 0; // Changed kid.name to kid.id
                                return (
                                    <div key={kid.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-round text-slate-400">{kid.gender === 'girl' ? 'face_3' : 'face_6'}</span>
                                            <span className="font-bold text-sm text-elf-dark truncate w-20">{kid.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map((val: number) => (
                                                <button 
                                                    key={val}
                                                    onClick={() => updateBehavior(kid.id, val)} // Changed kid.name to kid.id
                                                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all ${
                                                        score >= val 
                                                        ? 'bg-elf-gold text-elf-dark shadow-sm scale-110' 
                                                        : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {getBehaviorEmoji(val)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                     </div>

                     {/* Organization Toggles */}
                     <div>
                        <h5 className="font-bold text-[#2d1b14] mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="material-icons-round text-base">fact_check</span>
                            Abhaken
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`flex flex-col items-center justify-center p-3 rounded border-2 cursor-pointer transition-all ${
                                calendar[selectedDay - 1].prepared 
                                ? 'bg-green-50 border-green-500 text-green-800' 
                                : 'bg-white border-[#e6dac0] text-slate-400'
                            }`}>
                                <input 
                                    type="checkbox" 
                                    checked={calendar[selectedDay - 1].prepared}
                                    onChange={(e) => onUpdateDay(selectedDay, { prepared: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="material-icons-round mb-1 text-2xl">{calendar[selectedDay - 1].prepared ? 'check_box' : 'check_box_outline_blank'}</span>
                                <span className="text-xs font-bold uppercase">Vorbereitet</span>
                            </label>

                            <label className={`flex flex-col items-center justify-center p-3 rounded border-2 cursor-pointer transition-all ${
                                calendar[selectedDay - 1].completed 
                                ? 'bg-yellow-50 border-yellow-500 text-yellow-800' 
                                : 'bg-white border-[#e6dac0] text-slate-400'
                            }`}>
                                <input 
                                    type="checkbox" 
                                    checked={calendar[selectedDay - 1].completed}
                                    onChange={(e) => onUpdateDay(selectedDay, { completed: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="material-icons-round mb-1 text-2xl">{calendar[selectedDay - 1].completed ? 'star' : 'star_border'}</span>
                                <span className="text-xs font-bold uppercase">Erledigt</span>
                            </label>
                        </div>
                     </div>

                     {/* Photo Evidence Section */}
                     <div>
                         <h5 className="font-bold text-[#2d1b14] mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span className="material-icons-round text-base">photo_camera</span>
                            Beweisfoto
                        </h5>
                        <div className="bg-[#e6dac0] border-2 border-dashed border-[#855E42] rounded p-2 overflow-hidden relative min-h-[100px] flex items-center justify-center">
                            {calendar[selectedDay - 1].imageEvidence ? (
                                <div className="relative group w-full">
                                    <img 
                                        src={calendar[selectedDay - 1].imageEvidence} 
                                        alt="Wichtel Beweisfoto" 
                                        className="w-full h-auto object-cover rounded shadow-md transform -rotate-1"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-4">
                                        <button onClick={removeImage} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50">
                                            <span className="material-icons-round">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={triggerFileInput}
                                    className="flex flex-col items-center justify-center text-[#855E42] cursor-pointer opacity-70 hover:opacity-100"
                                >
                                    <span className="material-icons-round text-3xl mb-1">add_a_photo</span>
                                    <span className="text-xs font-bold uppercase">Foto einkleben</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                            />
                        </div>
                     </div>

                     {/* Secret Message */}
                     <div>
                        <div className="flex justify-between items-end mb-2">
                            <h5 className="font-bold text-[#2d1b14] flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span className="material-icons-round text-base">mail</span>
                                Brief an die Kinder
                            </h5>
                            <div className="flex gap-2">
                                {calendar[selectedDay - 1].secretMessage && (
                                    <button 
                                        onClick={() => handlePrintMessage(calendar[selectedDay - 1].secretMessage || '')}
                                        className="text-xs text-[#855E42] hover:text-elf-red px-2 py-1 bg-[#e6dac0] rounded flex items-center gap-1 font-bold"
                                        title="Drucken"
                                    >
                                        <span className="material-icons-round text-sm">print</span>
                                    </button>
                                )}
                                {!calendar[selectedDay - 1].secretMessage && (
                                    <button
                                        onClick={() => handleGenerateMessage(calendar[selectedDay - 1])}
                                        disabled={generatingMessage}
                                        className="text-xs text-[#2d1b14] bg-elf-gold hover:bg-yellow-400 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold shadow-sm"
                                    >
                                        <span className={`material-icons-round text-sm ${generatingMessage ? 'animate-spin' : ''}`}>auto_awesome</span>
                                        Vorschlag
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={calendar[selectedDay - 1].secretMessage || ''}
                            onChange={(e) => onUpdateDay(selectedDay, { secretMessage: e.target.value })}
                            placeholder="Hier steht die Nachricht vom Wichtel..."
                            className="w-full p-4 text-base font-serif bg-white border border-[#e6dac0] rounded focus:border-elf-gold outline-none min-h-[120px] resize-none shadow-inner italic text-slate-700 leading-relaxed"
                        />
                     </div>
                   </>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full pb-20 text-center">
                     <div className="w-24 h-24 bg-[#e6dac0] rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <span className="material-icons-round text-5xl text-[#fcfaf2]">inventory_2</span>
                     </div>
                     <h4 className="text-xl font-serif font-bold text-[#2d1b14] mb-2">Leere Schublade</h4>
                     <p className="text-[#855E42] text-sm mb-8 px-8">
                       Für diesen Tag ist noch kein Schabernack geplant.
                     </p>
                     
                     <button 
                        onClick={() => openIdeaPicker(selectedDay)}
                        className="bg-elf-red text-white px-8 py-4 rounded font-bold shadow-lg shadow-red-200/50 hover:bg-red-700 transition-all active:scale-95 border-b-4 border-red-900 active:border-b-0 active:translate-y-1 uppercase tracking-wider text-sm"
                     >
                        Akte anlegen
                     </button>
                   </div>
                 )}
              </div>
            </div>
          </div>
      )}

      <div className="hidden lg:flex w-72 bg-[#fcfaf2] border-l-4 border-[#2d1b14] flex-col h-full shadow-inner relative">
        <div className="absolute top-0 bottom-0 -left-1 w-1 bg-black/20 z-20"></div>
        <div className="p-4 border-b border-[#e6dac0] bg-[#f9f5e6]">
            <h3 className="font-bold text-[#2d1b14] flex items-center gap-2 font-serif uppercase tracking-wider text-xs">
              <span className="material-icons-round text-elf-gold text-lg">stars</span>
              Gespeicherte Pläne
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#e6dac0]">
              {savedIdeas.map(idea => (
                <div
                  key={idea.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idea)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setExpandedIdeaId(expandedIdeaId === idea.id ? null : idea.id)}
                  className="p-3 bg-white border border-[#d4c5a5] rounded shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
                >
                  <p className="font-bold text-sm text-elf-dark font-serif leading-tight mb-1 flex justify-between">
                      {idea.title}
                      <span className="material-icons-round text-sm opacity-50">{expandedIdeaId === idea.id ? 'expand_less' : 'expand_more'}</span>
                  </p>
                  {expandedIdeaId === idea.id && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed italic border-t border-slate-100 pt-2 animate-slide-up">
                          {idea.description}
                      </p>
                  )}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;