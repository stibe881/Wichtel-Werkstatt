import React, { useState, useEffect } from 'react';
import { View, AppState, ElfConfig, Idea, ArchivedYear } from './types';
import ElfSettings from './components/ElfSettings';
import IdeaGenerator from './components/IdeaGenerator';
import Calendar from './components/Calendar';
import LetterGenerator from './components/LetterGenerator';
import ShoppingList from './components/ShoppingList';
import Recipes from './components/Recipes';
import Printables from './components/Printables';
import { generateElfExcuse, generateLatePreparationSolution } from './services/geminiService';

// Extended Idea List (30 Items)
const STARTER_IDEAS: Idea[] = [
    { id: 'start-1', title: 'Der magische Einzug', description: 'Die Wichteltür ist über Nacht erschienen! Davor liegt ein kleiner Brief und etwas "Feenstaub" (Glitzer).', materials: ['Wichteltür', 'Glitzer', 'Brief'], effort: 'mittel', messiness: 'sauber', type: 'arrival' },
    { id: '1', title: 'Mehl-Engel', description: 'Der Wichtel hat einen Schnee-Engel im Mehl auf der Küchenzeile gemacht.', materials: ['Mehl'], effort: 'niedrig', messiness: 'etwas chaos', type: 'normal' },
    { id: '2', title: 'Klopapier-Schneemann', description: 'Ein Schneemann aus Klopapierrollen gestapelt. Levin kann ihn umwerfen!', materials: ['Klopapier', 'Filzstifte'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '3', title: 'Spielzeug-Parade', description: 'Der Wichtel führt eine Parade von Linas Kuscheltieren und Levins Autos an.', materials: ['Spielzeug'], effort: 'mittel', messiness: 'sauber', type: 'normal' },
    { id: '4', title: 'Rote Nasen', description: 'Der Wichtel hat allen auf den Familienfotos rote Rudolph-Nasen gemalt (abwaschbar oder klebend).', materials: ['Rote Klebepunkte'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '5', title: 'Magische Samen', description: 'Der Wichtel bringt "magische Samen" (TicTac) mit, die Levin einpflanzen soll. Am nächsten Tag wachsen Zuckerstangen.', materials: ['TicTac', 'Zucker', 'Schüssel'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '6', title: 'Der Boden ist Lava', description: 'Der Wichtel klebt an der Wand, weil "der Boden Lava ist".', materials: ['Klebeband'], effort: 'mittel', messiness: 'sauber', type: 'normal' },
    { id: '7', title: 'Schokoladen-Frühstück', description: 'Der Wichtel hat kleine Schokostückchen in das Müsli gezaubert.', materials: ['Schokolade', 'Müsli'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '8', title: 'Zahnpasta-Botschaft', description: 'Eine Nachricht am Spiegel geschrieben mit Zahnpasta: "Putzt ihr gut?"', materials: ['Zahnpasta'], effort: 'niedrig', messiness: 'etwas chaos', type: 'normal' },
    { id: '9', title: 'Schuh-Zug', description: 'Alle Schuhe der Familie sind wie ein Zug hintereinander aufgereiht. Der Wichtel sitzt im ersten Schuh.', materials: ['Schuhe'], effort: 'mittel', messiness: 'sauber', type: 'normal' },
    { id: '10', title: 'Weihnachtsbaum-Versteck', description: 'Der Wichtel versteckt sich gut getarnt im Weihnachtsbaum. Levin muss ihn suchen.', materials: ['Weihnachtsbaum'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '11', title: 'Klorollen-Abfahrt', description: 'Der Wichtel rutscht eine lange Bahn aus Klopapier die Treppe herunter.', materials: ['Klopapier'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '12', title: 'Banannen-Minions', description: 'Der Wichtel hat Gesichter auf die Bananen in der Obstschale gemalt.', materials: ['Bananen', 'Stift'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '13', title: 'Schlafende Spielzeuge', description: 'Der Wichtel hat allen Dinosauriern und Puppen Taschentücher als Decken gegeben und liest ihnen vor.', materials: ['Taschentücher', 'Buch'], effort: 'mittel', messiness: 'sauber', type: 'normal' },
    { id: '14', title: 'Milch-Magie', description: 'Der Wichtel hat die Milch im Kühlschrank mit Lebensmittelfarbe blau oder grün gefärbt.', materials: ['Lebensmittelfarbe'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '15', title: 'Eier-Gesichter', description: 'Die Eier im Kühlschrank haben lustige Gesichter bekommen.', materials: ['Eier', 'Stift'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '16', title: 'Socken-Girlande', description: 'Der Wichtel hat Socken im ganzen Wohnzimmer als Girlande aufgehängt.', materials: ['Socken', 'Wäscheklammern'], effort: 'mittel', messiness: 'etwas chaos', type: 'normal' },
    { id: '17', title: 'Gefangen im Glas', description: 'Der Wichtel wurde "versehentlich" unter einem Glas gefangen. Ein Schild "Hilfe" steht daneben.', materials: ['Glas', 'Zettel'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '18', title: 'Marshmallow-Bad', description: 'Der Wichtel nimmt ein Bad in einer Schüssel voller Mini-Marshmallows.', materials: ['Schüssel', 'Marshmallows'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '19', title: 'Keks-Dieb', description: 'Der Wichtel wurde mit der Hand in der Keksdose erwischt und ist dort "eingeschlafen".', materials: ['Kekse'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '20', title: 'Selfie-Alarm', description: 'Der Wichtel hat nachts lustige Selfies mit dem Handy der Eltern gemacht. Levin darf sie morgens anschauen.', materials: ['Handy'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '21', title: 'Donut-Samen', description: 'Der Wichtel bringt "Cheerios" (Donut-Samen). Wenn man sie einpflanzt, liegen am nächsten Tag echte Donuts da.', materials: ['Cheerios', 'Donuts', 'Erde'], effort: 'hoch', messiness: 'sauber', type: 'normal' },
    { id: '22', title: 'Lego-Falle', description: 'Die Lego-Figuren haben den Wichtel mit Lego-Steinen am Boden gefesselt (Gulliver Stil).', materials: ['Lego', 'Klebeband'], effort: 'hoch', messiness: 'sauber', type: 'normal' },
    { id: '23', title: 'Auto-Werkstatt', description: 'Der Wichtel liegt unter einem Spielzeugauto und "repariert" es mit echtem Werkzeug.', materials: ['Spielzeugauto', 'Werkzeug'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: '24', title: 'Fernbedienungs-Dieb', description: 'Der Wichtel hat die Fernbedienung und Popcorn. Er wollte wohl nachts Fernsehen.', materials: ['Popcorn', 'Fernbedienung'], effort: 'niedrig', messiness: 'etwas chaos', type: 'normal' },
    { id: '25', title: 'Toilettenpapier-Weihnachtsbaum', description: 'Der Wichtel hat den Weihnachtsbaum mit Klopapier "geschmückt".', materials: ['Klopapier'], effort: 'mittel', messiness: 'chaos pur', type: 'normal' },
    { id: '26', title: 'Geschenk-Verpackung', description: 'Der Wichtel hat das Pausenbrot oder den Schulranzen in Geschenkpapier eingepackt.', materials: ['Geschenkpapier'], effort: 'mittel', messiness: 'sauber', type: 'normal' },
    { id: '27', title: 'Schneeball-Schlacht', description: 'Der Wichtel und eine andere Puppe bewerfen sich mit kleinen Papierkugeln oder Marshmallows.', materials: ['Papier' ,'Marshmallows'], effort: 'mittel', messiness: 'etwas chaos', type: 'normal' },
    { id: '28', title: 'Malbuch-Künstler', description: 'Der Wichtel hat in einem Malbuch ein Bild ausgemalt (vielleicht etwas krakelig).', materials: ['Malbuch', 'Stifte'], effort: 'niedrig', messiness: 'sauber', type: 'normal' },
    { id: 'end-1', title: 'Der Abschiedskoffer', description: 'Der Wichtel sitzt mit gepacktem Koffer da. Er hat ein kleines Abschiedsgeschenk für Levin und Lina da gelassen.', materials: ['Kleiner Koffer', 'Geschenk'], effort: 'mittel', messiness: 'sauber', type: 'departure' }
];

// Empty default config to force user input
const DEFAULT_CONFIG: ElfConfig = {
  name: '',
  personality: 'frech und verspielt',
  kids: [
      { name: '', age: 6 },
      { name: '', age: 1 }
  ],
  arrivalDate: '2025-12-01',
  departureDate: '2025-12-24'
};

const DEFAULT_STATE: AppState = {
  isConfigured: false,
  elf: DEFAULT_CONFIG,
  calendar: Array.from({ length: 24 }, (_, i) => ({
    day: i + 1,
    idea: null,
    completed: false,
    prepared: false,
    notes: '',
    secretMessage: ''
  })),
  shoppingList: [],
  savedIdeas: STARTER_IDEAS,
  archives: []
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('wichtel_werkstatt_v4');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Migration check: ensure isConfigured exists
            if (parsed.isConfigured === undefined) {
                return { ...parsed, isConfigured: true, archives: parsed.archives || [] }; 
            }
            // Migration check: ensure archives exists
            if (!parsed.archives) {
                return { ...parsed, archives: [] };
            }
            return parsed;
        } catch (e) {
            return DEFAULT_STATE;
        }
    }
    return DEFAULT_STATE;
  });

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [bossMode, setBossMode] = useState(false);
  
  // Panic Modal State
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicType, setPanicType] = useState<'movement' | 'preparation' | null>(null);
  
  const [panicText, setPanicText] = useState(''); // Holds simple excuse or letter
  const [panicInstruction, setPanicInstruction] = useState(''); // For preparation panic

  const [generatingExcuse, setGeneratingExcuse] = useState(false);

  useEffect(() => {
    localStorage.setItem('wichtel_werkstatt_v4', JSON.stringify(state));
  }, [state]);

  const updateElfConfig = (newConfig: ElfConfig) => {
    setState(prev => ({ ...prev, elf: newConfig }));
  };

  const completeSetup = () => {
      setState(prev => ({ ...prev, isConfigured: true }));
      setCurrentView(View.DASHBOARD);
  };

  const addIdea = (idea: Idea) => {
    setState(prev => ({ ...prev, savedIdeas: [...prev.savedIdeas, idea] }));
  };

  const updateDay = (day: number, updates: any) => {
    setState(prev => {
      const newCalendar = prev.calendar.map(d => d.day === day ? { ...d, ...updates } : d);
      
      let newShoppingList = prev.shoppingList;
      if (updates.idea) {
          const materials = updates.idea.materials || [];
          const uniqueMaterials = materials.filter((m: string) => !prev.shoppingList.includes(m));
          newShoppingList = [...prev.shoppingList, ...uniqueMaterials];
      }

      return { ...prev, calendar: newCalendar, shoppingList: newShoppingList };
    });
  };

  const updateShoppingList = (items: string[]) => {
    setState(prev => ({ ...prev, shoppingList: items }));
  };

  const archiveCurrentYear = () => {
    const currentYear = new Date(state.elf.arrivalDate).getFullYear();
    const archive: ArchivedYear = {
      year: currentYear,
      calendar: state.calendar,
      shoppingList: state.shoppingList,
      timestamp: new Date().toISOString()
    };

    // Calculate new dates (+1 year)
    const nextArrival = new Date(state.elf.arrivalDate);
    nextArrival.setFullYear(nextArrival.getFullYear() + 1);
    
    const nextDeparture = new Date(state.elf.departureDate);
    nextDeparture.setFullYear(nextDeparture.getFullYear() + 1);

    setState(prev => ({
      ...prev,
      archives: [...(prev.archives || []), archive],
      calendar: Array.from({ length: 24 }, (_, i) => ({
        day: i + 1,
        idea: null,
        completed: false,
        prepared: false,
        notes: '',
        secretMessage: ''
      })),
      shoppingList: [],
      elf: {
        ...prev.elf,
        arrivalDate: nextArrival.toISOString().split('T')[0],
        departureDate: nextDeparture.toISOString().split('T')[0]
      }
    }));
    
    // Switch to Dashboard to show fresh state
    setCurrentView(View.DASHBOARD);
  };

  const handlePanicMovement = async () => {
      setPanicType('movement');
      setShowPanicModal(true);
      setPanicText('');
      setPanicInstruction('');
      
      setGeneratingExcuse(true);
      const txt = await generateElfExcuse(state.elf);
      setPanicText(txt);
      setGeneratingExcuse(false);
  };

  const handlePanicPreparation = async () => {
      setPanicType('preparation');
      setShowPanicModal(true);
      setPanicText('');
      setPanicInstruction('');
      
      setGeneratingExcuse(true);
      const result = await generateLatePreparationSolution(state.elf);
      setPanicInstruction(result.instruction);
      setPanicText(result.letter);
      setGeneratingExcuse(false);
  };

  // Function to save the panic result to today's calendar
  const handlePanicSave = () => {
      // Find today or next open day
      const nextOpenDay = state.calendar.find(d => !d.completed)?.day || 1;
      
      const updates: any = {
          secretMessage: panicText
      };

      if (panicType === 'preparation') {
          // If we had no preparation, we create a dummy idea so it shows up
          updates.idea = {
              id: 'panic-' + Date.now(),
              title: 'Notfall-Aktion',
              description: panicInstruction,
              materials: [],
              effort: 'niedrig',
              messiness: 'sauber',
              type: 'normal'
          };
          updates.completed = true; // Mark as done since it's an emergency fix
          updates.prepared = true;
      }

      updateDay(nextOpenDay, updates);
      setShowPanicModal(false);
  };

  // Helper to print content
  const printContent = (title: string, content: string) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
              <html>
                  <head>
                      <title>${title}</title>
                      <style>
                          body { font-family: 'Georgia', serif; background-color: white; padding: 40px; color: #1a1a1a; }
                          .letter { border: 2px solid #D42426; padding: 40px; border-radius: 10px; background-image: repeating-linear-gradient(45deg, rgba(212, 36, 38, 0.05) 0px, rgba(212, 36, 38, 0.05) 2px, transparent 2px, transparent 4px); }
                          h1 { text-align: center; color: #D42426; font-size: 24px; margin-bottom: 30px; }
                          p { line-height: 1.8; font-size: 18px; white-space: pre-wrap; }
                          .signature { margin-top: 50px; text-align: right; font-style: italic; font-weight: bold; color: #D42426; }
                      </style>
                  </head>
                  <body>
                      <div class="letter">
                          <h1>Vom Wichtel</h1>
                          <p>${content}</p>
                          <div class="signature">Dein ${state.elf.name}</div>
                      </div>
                      <script>window.onload = function() { window.print(); window.close(); }</script>
                  </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  // Stats for Dashboard
  const daysPlanned = state.calendar.filter(d => d.idea !== null).length;
  const daysPrepared = state.calendar.filter(d => d.prepared).length;
  const nextOpenDay = state.calendar.find(d => !d.completed)?.day || 24;
  const currentDayPlan = state.calendar[nextOpenDay - 1];

  // Logic for upcoming letters (Secret Messages)
  const upcomingLetters = state.calendar
    .filter(d => d.day >= nextOpenDay && d.secretMessage && d.secretMessage.trim().length > 0)
    .slice(0, 3);

  const renderContent = () => {
    switch (currentView) {
      case View.SETTINGS:
        return <ElfSettings config={state.elf} onUpdate={updateElfConfig} archives={state.archives} onArchiveYear={archiveCurrentYear} />;
      case View.IDEAS:
        return <IdeaGenerator elfConfig={state.elf} onAddIdea={addIdea} existingIdeas={state.savedIdeas} />;
      case View.CALENDAR:
        return <Calendar calendar={state.calendar} savedIdeas={state.savedIdeas} onUpdateDay={updateDay} elfConfig={state.elf} />;
      case View.LETTERS:
        return <LetterGenerator elfConfig={state.elf} />;
      case View.SHOPPING:
        return <ShoppingList items={state.shoppingList} onUpdateItems={updateShoppingList} />;
      case View.RECIPES:
        return <Recipes />;
      case View.PRINTABLES:
        return <Printables elfConfig={state.elf} />;
      case View.DASHBOARD:
      default:
        return (
          <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-0">
            {/* Hero Card - Wooden Sign Style */}
            <div className="bg-[#2d1b14] rounded-xl p-1 shadow-2xl border-2 border-[#5d4037] relative group">
                {/* Screws */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-elf-gold shadow-sm opacity-80"></div>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-elf-gold shadow-sm opacity-80"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-elf-gold shadow-sm opacity-80"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-elf-gold shadow-sm opacity-80"></div>
                
                <div className="bg-wood-texture rounded-lg p-6 md:p-8 border border-white/10 relative overflow-hidden">
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start">
                             <div>
                                <div className="inline-block bg-[#855E42] px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest mb-3 border border-[#a07050] text-amber-100 shadow-sm">
                                    Wichtel-Zentrale
                                </div>
                                <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 text-amber-100 drop-shadow-md tracking-tight">
                                    Hallo Eltern!
                                </h1>
                             </div>
                             
                             {/* WEATHER WIDGET (ADDED) */}
                             <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-200/20 backdrop-blur-sm text-center transform -rotate-2">
                                 <div className="text-[9px] uppercase font-bold text-blue-200 tracking-wider">Nordpol</div>
                                 <div className="flex items-center justify-center gap-1 my-1">
                                    <span className="material-icons-round text-white text-2xl">ac_unit</span>
                                    <span className="text-2xl font-bold text-white">-22°</span>
                                 </div>
                                 <div className="text-[10px] text-blue-100 italic">Schneesturm</div>
                             </div>
                        </div>
                        
                        <p className="opacity-90 text-base md:text-lg font-medium text-amber-200/80 mt-2 font-serif italic">
                            "{state.elf.name}" ist bereit für {state.elf.kids.map(k => k.name).join(' & ')}.
                        </p>
                        
                        {/* BRAV-O-METER (ADDED) */}
                        <div className="mt-8 bg-black/40 p-4 rounded-lg border border-white/10 flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-amber-100 tracking-wider mb-1">
                                    <span>Unartig</span>
                                    <span>Brav-o-Meter</span>
                                    <span>Engel</span>
                                </div>
                                <div className="h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600 relative">
                                    <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 w-full opacity-30"></div>
                                    <div className="h-full bg-gradient-to-r from-elf-green to-emerald-300 w-[85%] rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="text-center text-xs text-green-300 font-bold mt-1">Status: Sehr brav!</div>
                            </div>
                            <div className="flex-shrink-0">
                                <button onClick={() => setCurrentView(View.CALENDAR)} className="bg-elf-gold text-elf-dark px-6 py-3 rounded font-bold hover:bg-yellow-400 transition-colors text-sm md:text-base shadow-lg flex items-center gap-2 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1">
                                    <span className="material-icons-round">calendar_month</span>
                                    Zum Planer
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Emergency Button Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handlePanicMovement}
                    className="w-full bg-[#fdfbf7] border-l-8 border-orange-500 p-4 rounded shadow-md flex items-center gap-4 group hover:bg-orange-50 transition-all relative overflow-hidden"
                >
                    <div className="bg-orange-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                         <span className="material-icons-round text-3xl text-orange-500">warning</span>
                    </div>
                    <div className="text-left z-10">
                        <div className="text-[10px] uppercase text-orange-500 font-bold tracking-wider">Notfall-Protokoll</div>
                        <div className="font-bold text-elf-dark font-serif text-lg">Wichtel nicht bewegt?</div>
                    </div>
                </button>
                <button 
                    onClick={handlePanicPreparation}
                    className="w-full bg-[#fdfbf7] border-l-8 border-purple-500 p-4 rounded shadow-md flex items-center gap-4 group hover:bg-purple-50 transition-all relative overflow-hidden"
                >
                    <div className="bg-purple-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                         <span className="material-icons-round text-3xl text-purple-500">hourglass_empty</span>
                    </div>
                    <div className="text-left z-10">
                        <div className="text-[10px] uppercase text-purple-500 font-bold tracking-wider">Notfall-Protokoll</div>
                        <div className="font-bold text-elf-dark font-serif text-lg">Vorbereitung vergessen?</div>
                    </div>
                </button>
            </div>

            {/* Next Action Card - Clipboard Style */}
            <div className="bg-[#855E42] p-1 rounded-lg shadow-xl relative mt-4">
                {/* Clipboard Clip */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-zinc-300 rounded-lg shadow-md border-b-4 border-zinc-400 z-20 flex items-center justify-center">
                    <div className="w-20 h-2 bg-zinc-800 rounded-full opacity-20"></div>
                </div>

                <div className="bg-[#fcfaf2] p-6 pt-8 rounded shadow-inner min-h-[200px] relative bg-parchment">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <span className="material-icons-round text-8xl text-elf-dark">event_available</span>
                     </div>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-elf-red text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm border border-red-800">TAG {nextOpenDay}</span>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wide">Tagesbefehl</h3>
                    </div>
                    
                    {currentDayPlan?.idea ? (
                        <div className="relative z-10">
                            <h2 className="text-2xl font-serif font-bold text-elf-dark mb-2 decoration-elf-gold decoration-4 underline-offset-4">{currentDayPlan.idea.title}</h2>
                            <p className="text-slate-700 mb-6 text-lg font-serif italic leading-relaxed">"{currentDayPlan.idea.description}"</p>
                            
                            <div className="flex flex-wrap gap-3">
                                <span className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 border ${currentDayPlan.prepared ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                    <span className="material-icons-round text-base">{currentDayPlan.prepared ? 'check_circle' : 'cancel'}</span>
                                    {currentDayPlan.prepared ? 'Startklar' : 'Vorbereitung fehlt'}
                                </span>
                                {currentDayPlan.secretMessage && (
                                    <span className="px-3 py-1 rounded bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1">
                                        <span className="material-icons-round text-base">mail</span>
                                        Brief liegt bei
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 text-center border-2 border-dashed border-[#e6dac0] rounded bg-[#fffdf5]">
                            <p className="text-[#a08c6c] font-serif text-lg mb-2 italic">Das Blatt ist leer.</p>
                            <button onClick={() => setCurrentView(View.CALENDAR)} className="text-elf-red font-bold text-sm hover:underline flex items-center justify-center gap-1 uppercase tracking-wide">
                                <span className="material-icons-round text-sm">edit</span> Jetzt planen
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Letters Preview */}
            {upcomingLetters.length > 0 && (
                <div className="bg-[#fcfaf2] p-6 rounded shadow-lg border-t-4 border-[#e6dac0] relative">
                     <div className="flex items-center justify-between mb-4 border-b border-[#e6dac0] pb-2">
                        <h3 className="text-[#855E42] text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                            <span className="material-icons-round text-elf-gold text-lg">drafts</span>
                            Postausgang
                        </h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingLetters.map(plan => (
                             <div key={plan.day} className="bg-white p-4 rounded shadow-sm border border-slate-200 relative group transition-all hover:border-elf-gold hover:-translate-y-1">
                                 {/* Stamp effect */}
                                 <div className="absolute top-2 right-2 w-8 h-10 border-2 border-dotted border-red-200 opacity-50"></div>

                                 <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tag {plan.day}</span>
                                 </div>
                                 <p className="text-sm text-slate-700 font-serif italic leading-relaxed line-clamp-3 pl-3 border-l-2 border-elf-red/30">"{plan.secretMessage}"</p>
                             </div>
                        ))}
                     </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#2d1b14] p-4 rounded shadow-lg border border-[#5d4037] flex flex-col items-center text-center">
                     <div className="text-amber-200/50 text-[10px] uppercase font-bold tracking-widest mb-1">Status</div>
                     <div className="text-2xl font-serif font-bold text-elf-green">{daysPrepared} / 24</div>
                </div>
                <div className="bg-[#2d1b14] p-4 rounded shadow-lg border border-[#5d4037] flex flex-col items-center text-center">
                     <div className="text-amber-200/50 text-[10px] uppercase font-bold tracking-widest mb-1">Material</div>
                     <div className="text-2xl font-serif font-bold text-amber-100">{state.shoppingList.length}</div>
                </div>
                 <button onClick={() => setCurrentView(View.IDEAS)} className="col-span-2 bg-[#855E42] p-4 rounded shadow-lg border-b-4 border-[#5d4037] hover:bg-[#a07050] transition-colors text-center group flex items-center justify-center gap-4 active:border-b-0 active:translate-y-1">
                     <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                        <span className="material-icons-round text-amber-100">menu_book</span>
                     </div>
                     <div className="text-left">
                        <div className="text-amber-200/70 text-[10px] uppercase font-bold tracking-widest mb-1">Katalog</div>
                        <div className="text-xl font-serif font-bold text-white">
                            {state.savedIdeas.length} Ideen
                        </div>
                     </div>
                </button>
            </div>
          </div>
        );
    }
  };

  // Setup / Welcome Screen
  if (!state.isConfigured) {
      return (
          <div className="h-full w-full bg-[#fcfaf2] overflow-y-auto bg-parchment">
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8">
              <ElfSettings 
                config={state.elf} 
                onUpdate={updateElfConfig} 
                isSetup={true} 
                onComplete={completeSetup}
              />
            </div>
          </div>
      );
  }

  // BOSS MODE OVERLAY
  if (bossMode) {
      return (
          <div className="h-screen w-screen bg-white text-black p-0 m-0 overflow-auto" onClick={() => setBossMode(false)}>
               <div className="bg-[#e6e6e6] p-2 border-b border-[#ccc] text-xs flex gap-4 mb-2">
                   <span>File</span> <span>Edit</span> <span>View</span> <span>Insert</span> <span>Format</span> <span>Data</span>
               </div>
               <div className="p-4">
                   <h1 className="text-xl font-bold mb-4 font-sans text-left">Q4 Budget Analysis - 2025</h1>
                   <table className="spreadsheet-table">
                       <thead>
                           <tr>
                               <th>ID</th> <th>Category</th> <th>Jan</th> <th>Feb</th> <th>Mar</th> <th>Apr</th> <th>May</th> <th>Jun</th> <th>Total</th>
                           </tr>
                       </thead>
                       <tbody>
                           {[...Array(20)].map((_, i) => (
                               <tr key={i}>
                                   <td>{1000 + i}</td>
                                   <td style={{textAlign: 'left'}}>Operating Exp {String.fromCharCode(65+i)}</td>
                                   <td>{(Math.random() * 1000).toFixed(2)}</td>
                                   <td>{(Math.random() * 1000).toFixed(2)}</td>
                                   <td>{(Math.random() * 1000).toFixed(2)}</td>
                                   <td>{(Math.random() * 1000).toFixed(2)}</td>
                                   <td>{(Math.random() * 1000).toFixed(2)}</td>
                                   <td>{(Math.random() * 1000).toFixed(2)}</td>
                                   <td><strong>{(Math.random() * 5000).toFixed(2)}</strong></td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
          </div>
      )
  }

  return (
    <div className="flex h-screen bg-[#2d1b14] font-sans text-slate-900 overflow-hidden">
      {/* Panic Modal */}
      {showPanicModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#fcfaf2] w-full max-w-lg rounded-sm shadow-2xl animate-slide-up flex flex-col max-h-[90vh] border-8 border-[#2d1b14] relative">
                   {/* Nails */}
                   <div className="absolute top-2 left-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                   <div className="absolute top-2 right-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                   <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                   <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>

                  {/* Modal Header */}
                  <div className="flex justify-between items-start p-6 border-b-2 border-[#e6dac0] flex-shrink-0 bg-[#f9f5e6]">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full border-2 ${panicType === 'movement' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-purple-100 text-purple-600 border-purple-200'}`}>
                              <span className="material-icons-round text-2xl">local_pharmacy</span>
                          </div>
                          <h3 className="text-xl font-bold text-elf-dark font-serif">
                              {panicType === 'movement' ? 'Wichtel-Rettung' : 'Plan B Protokoll'}
                          </h3>
                      </div>
                      <button onClick={() => setShowPanicModal(false)} className="text-slate-400 hover:text-slate-600">
                          <span className="material-icons-round">close</span>
                      </button>
                  </div>
                  
                  {/* Modal Body - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-6 bg-parchment">
                      {generatingExcuse ? (
                           <div className="flex flex-col items-center justify-center py-10 gap-4 text-slate-500 font-bold">
                              <div className="w-16 h-16 border-4 border-elf-red border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-elf-red font-serif">Verbinde zum Nordpol...</span>
                           </div>
                      ) : (
                          <div className="space-y-6">
                              {/* Instruction for Parents (Only for Prep Panic) */}
                              {panicType === 'preparation' && panicInstruction && (
                                  <div className="bg-[#2d1b14] text-amber-50 p-4 rounded shadow-md transform -rotate-1 border border-[#5d4037]">
                                      <h4 className="text-xs font-bold uppercase text-elf-gold mb-2 flex items-center gap-2 border-b border-white/20 pb-1">
                                          <span className="material-icons-round text-sm">visibility_off</span> Nur für Eltern
                                      </h4>
                                      <p className="font-medium text-sm leading-relaxed">{panicInstruction}</p>
                                  </div>
                              )}

                              {/* The Letter/Excuse */}
                              <div className="relative">
                                  <div className={`border-4 border-double p-8 relative bg-white shadow-lg ${panicType === 'movement' ? 'border-orange-200' : 'border-purple-200'}`}>
                                      <h4 className="text-[10px] font-bold uppercase text-slate-300 mb-4 tracking-widest text-center">Offizielles Schreiben</h4>
                                      <p className="font-serif text-lg leading-loose text-slate-800 whitespace-pre-wrap text-center">
                                        "{panicText}"
                                      </p>
                                      <div className="mt-8 text-right font-handwriting text-xl text-elf-red">
                                          - {state.elf.name}
                                      </div>
                                  </div>
                                  
                                  {/* Print Action for Modal */}
                                  <div className="mt-4 text-center">
                                      <button 
                                        onClick={() => printContent('Wichtel Nachricht', panicText)}
                                        className="text-xs font-bold text-[#855E42] hover:text-elf-red flex items-center justify-center gap-1 mx-auto bg-[#e6dac0] px-3 py-1 rounded-full"
                                      >
                                          <span className="material-icons-round text-sm">print</span> Ausdrucken
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t-2 border-[#e6dac0] flex gap-3 flex-shrink-0 bg-[#f9f5e6]">
                      <button 
                        onClick={panicType === 'movement' ? handlePanicMovement : handlePanicPreparation}
                        disabled={generatingExcuse}
                        className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-50 rounded font-bold text-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm uppercase text-xs tracking-wider"
                      >
                          <span className="material-icons-round">autorenew</span>
                          Neu generieren
                      </button>
                      <button 
                        onClick={handlePanicSave}
                        disabled={generatingExcuse || !panicText}
                        className={`flex-1 py-3 rounded font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 uppercase text-xs tracking-wider ${
                            panicType === 'movement' 
                            ? 'bg-elf-red hover:bg-red-700 border-red-900' 
                            : 'bg-purple-700 hover:bg-purple-800 border-purple-900'
                        }`}
                      >
                          <span className="material-icons-round">check</span>
                          Speichern
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Desktop Sidebar - Wooden Beam Style */}
      <aside className="hidden md:flex w-20 lg:w-72 bg-[#2d1b14] text-amber-50 flex-shrink-0 flex-col transition-all duration-300 bg-wood-texture border-r-4 border-[#1a100c] shadow-2xl z-20 relative">
        <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20 shadow-inner">
            <div className="bg-[#855E42] p-2 rounded shadow-wood-bezel border border-[#5d4037]">
                <span className="material-icons-round text-elf-gold text-2xl drop-shadow-md">handyman</span>
            </div>
            <span className="font-serif font-bold text-xl hidden lg:block tracking-wide text-amber-100 text-shadow">Wichtel<br/>Werkstatt</span>
        </div>

        <nav className="flex-1 py-6 space-y-3 px-3">
            <NavButton view={View.DASHBOARD} icon="dashboard" label="Werkbank" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.CALENDAR} icon="calendar_month" label="Planer" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.IDEAS} icon="menu_book" label="Ideen-Katalog" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.LETTERS} icon="history_edu" label="Schreibstube" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.SHOPPING} icon="inventory_2" label="Material-Lager" current={currentView} onClick={setCurrentView} />
            
            <div className="my-2 border-t border-white/10 mx-2"></div>
            
            <NavButton view={View.RECIPES} icon="bakery_dining" label="Wichtel-Bäckerei" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.PRINTABLES} icon="print" label="Druckerei" current={currentView} onClick={setCurrentView} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/10">
            <NavButton view={View.SETTINGS} icon="settings" label="Konfiguration" current={currentView} onClick={setCurrentView} />
            <button 
                onClick={() => setBossMode(true)}
                className="w-full flex items-center gap-4 px-4 py-2 mt-4 text-xs text-slate-500 hover:text-white transition-colors opacity-50 hover:opacity-100"
            >
                <span className="material-icons-round">visibility_off</span>
                <span className="hidden lg:block">Chef! (Boss Mode)</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative shadow-inner bg-wood-texture">
        {/* Mobile Header */}
        <header className="bg-[#2d1b14] border-b border-[#5d4037] px-4 py-3 md:px-8 md:py-4 flex justify-between items-center shadow-lg z-10 flex-shrink-0">
            <div className="flex items-center gap-2 md:hidden">
                 <span className="material-icons-round text-elf-gold">handyman</span>
                 <span className="font-serif font-bold text-lg text-amber-100">Werkstatt</span>
            </div>
            
            <h2 className="hidden md:block text-2xl font-bold text-amber-100 font-serif capitalize flex items-center gap-2 text-shadow">
                {currentView === View.DASHBOARD ? `Hauptquartier` : 
                 currentView === View.CALENDAR ? 'Planungs-Kalender' :
                 currentView === View.IDEAS ? 'Bibliothek der Streiche' :
                 currentView === View.LETTERS ? 'Schreibpult' :
                 currentView === View.SHOPPING ? 'Vorratskammer' : 
                 currentView === View.RECIPES ? 'Geheimrezepte' :
                 currentView === View.PRINTABLES ? 'Dokumenten-Center' : 'Einstellungen'}
            </h2>

            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-amber-100">{state.elf.name}</p>
                </div>
                <div 
                    onClick={() => setCurrentView(View.SETTINGS)}
                    className="w-10 h-10 bg-[#855E42] rounded shadow-wood-bezel flex items-center justify-center text-amber-100 font-serif font-bold border border-[#5d4037] cursor-pointer hover:bg-[#a07050] transition-colors"
                >
                    {state.elf.name.charAt(0) || 'E'}
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-24 md:pb-6 relative scroll-smooth bg-[#d4c5a5]">
             {renderContent()}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2d1b14] border-t-4 border-[#5d4037] flex justify-around items-center p-2 pb-safe z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.5)] overflow-x-auto no-scrollbar">
             <MobileNavButton view={View.DASHBOARD} icon="dashboard" label="Start" current={currentView} onClick={setCurrentView} />
             <MobileNavButton view={View.CALENDAR} icon="calendar_month" label="Planer" current={currentView} onClick={setCurrentView} />
             <div className="relative -top-6 flex-shrink-0 mx-2">
                 <button 
                    onClick={() => setCurrentView(View.IDEAS)}
                    className="w-16 h-16 bg-[#855E42] rounded-full text-amber-100 shadow-xl flex items-center justify-center border-4 border-[#2d1b14] active:scale-95 transition-transform"
                 >
                     <span className="material-icons-round text-3xl drop-shadow-md">menu_book</span>
                 </button>
             </div>
             <MobileNavButton view={View.RECIPES} icon="bakery_dining" label="Backen" current={currentView} onClick={setCurrentView} />
             <MobileNavButton view={View.PRINTABLES} icon="print" label="Druck" current={currentView} onClick={setCurrentView} />
        </div>
      </main>
    </div>
  );
};

const NavButton: React.FC<{
  view: View;
  icon: string;
  label: string;
  current: View;
  onClick: (v: View) => void;
}> = ({ view, icon, label, current, onClick }) => {
  const active = current === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`w-full flex items-center gap-4 px-4 py-3 transition-all relative rounded-l-lg ml-2 mb-1 shadow-sm
        ${active 
            ? 'text-[#2d1b14] bg-[#d4c5a5] font-bold border-l-4 border-elf-gold translate-x-1' 
            : 'text-amber-200/60 hover:text-amber-100 hover:bg-white/5'}
      `}
    >
      <span className={`material-icons-round ${active ? 'text-[#2d1b14]' : ''}`}>{icon}</span>
      <span className="hidden lg:block text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
};

const MobileNavButton: React.FC<{
  view: View;
  icon: string;
  label: string;
  current: View;
  onClick: (v: View) => void;
}> = ({ view, icon, label, current, onClick }) => {
  const active = current === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex flex-col items-center justify-center w-14 py-1 transition-colors flex-shrink-0
        ${active ? 'text-elf-gold font-bold' : 'text-[#855E42]'}
      `}
    >
      <span className={`material-icons-round text-2xl mb-0.5 drop-shadow-sm`}>{icon}</span>
      <span className="text-[9px] uppercase tracking-wide truncate w-full text-center">{label}</span>
    </button>
  );
};

export default App;
