import React, { useState, useEffect, useCallback } from 'react';
import { View, AppState, ElfConfig, Idea, ArchivedYear, Kid } from './types';
import ElfSettings from './components/ElfSettings';
import IdeaGenerator from './components/IdeaGenerator';
import Calendar from './components/Calendar';
import LetterGenerator from './components/LetterGenerator';
import ShoppingList from './components/ShoppingList';
import Recipes from './components/Recipes';
import Printables from './components/Printables';
import KidsZone from './components/KidsZone';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import { generateElfExcuse, generateLatePreparationSolution } from './services/geminiService';
import { getWeather } from './services/weatherService';


const API_URL = 'http://localhost:3001';
const USER_ID = 'default_user';

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

const DEFAULT_CONFIG: ElfConfig = {
  name: '',
  personality: 'frech und verspielt',
  kids: [
      { name: '', age: 6, gender: 'boy' },
      { name: '', age: 1, gender: 'girl' }
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('wichtel_authenticated') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);

  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);
  

  // Fetch state from backend
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetch(`${API_URL}/api/state/${USER_ID}`)
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          // For non-ok responses (404, 500), we'll let it be caught by .catch
          // so we don't reset state unnecessarily.
          throw new Error(`Failed to fetch: ${res.status}`);
        })
        .then(data => {
            // Only update state if we received valid data.
            // An empty object or null from the backend means new user, so use default.
            if (data && data.isConfigured) {
                setState(data);
            } else {
                setState(DEFAULT_STATE); // This is for a new user or unconfigured state.
            }
        })
        .catch((error) => {
            console.error("Could not fetch state:", error);
            // On error, we DO NOT reset the state. The user might be offline.
            // They can continue, and the save effect will try to save later.
        })
        .finally(() => {
            setHasLoadedFromBackend(true); // Always do this to unblock UI and saving
            setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Save state to backend with internal debouncing
  useEffect(() => {
    // Do not save the initial default state.
    // Only save if the state is not the default reference and has been configured.
    if (state === DEFAULT_STATE || !state.isConfigured || !isAuthenticated || !hasLoadedFromBackend) {
      return;
    }

    const handler = setTimeout(() => {
      fetch(`${API_URL}/api/state/${USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
    }, 1000);

    // Cleanup function to cancel the timeout if the effect runs again
    return () => {
      clearTimeout(handler);
    };
  }, [state, isAuthenticated, hasLoadedFromBackend]);

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [bossMode, setBossMode] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicType, setPanicType] = useState<'movement' | 'preparation' | null>(null);
  const [panicText, setPanicText] = useState('');
  const [panicInstruction, setPanicInstruction] = useState('');
  const [generatingExcuse, setGeneratingExcuse] = useState(false);

  // Weather state
  const [weather, setWeather] = useState({ temp: -20, condition: 'Schnee' });

  useEffect(() => {
    const w = getWeather();
    setWeather(w);
  }, []);

  const updateElfConfig = (newConfig: ElfConfig) => {
    setState(prev => ({ ...prev, elf: newConfig }));
  };

  const completeSetup = async () => {
      // Create the new state with isConfigured = true
      // We need to capture the current state synchronously before setState is called
      const newState = { ...state, isConfigured: true };

      setState(newState);
      setCurrentView(View.DASHBOARD);

      // Immediately save to backend after setup
      if (isAuthenticated) {
          try {
              console.log('Saving state to database:', {
                  isConfigured: newState.isConfigured,
                  elfName: newState.elf?.name,
                  kidsCount: newState.elf?.kids?.length
              });

              const response = await fetch(`${API_URL}/api/state/${USER_ID}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newState),
              });

              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }

              console.log('Setup data saved to database successfully');
          } catch (error) {
              console.error('Failed to save setup data:', error);
          }
      } else {
          console.error('Cannot save: isAuthenticated =', isAuthenticated);
      }
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

  const handlePanicSave = () => {
      const nextOpenDay = state.calendar.find(d => !d.completed)?.day || 1;
      const updates: any = { secretMessage: panicText };
      if (panicType === 'preparation') {
          updates.idea = {
              id: 'panic-' + Date.now(),
              title: 'Notfall-Aktion',
              description: panicInstruction,
              materials: [],
              effort: 'niedrig',
              messiness: 'sauber',
              type: 'normal'
          };
          updates.completed = true;
          updates.prepared = true;
      }
      updateDay(nextOpenDay, updates);
      setShowPanicModal(false);
  };

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

  const calculateKidBehaviorScore = (kidName: string): number => {
      let total = 0;
      let count = 0;
      state.calendar.forEach(day => {
          if (day.behavior && day.behavior[kidName]) {
              total += day.behavior[kidName];
              count++;
          }
      });
      return count === 0 ? 0 : total / count;
  };

    const handleAuth = (email: string, password: string, username?: string) => {
      // For now, we'll just set the local flag. In a real app, this would
      // involve a call to a /login or /register endpoint on the backend.
      localStorage.setItem('wichtel_authenticated', 'true');
      setIsAuthenticated(true);
      setShowAuthModal(false);
      if (username) {
        // This is a registration, start with default state
        setState(DEFAULT_STATE);
      }
    };

  const handleLogout = () => {
    localStorage.removeItem('wichtel_authenticated');
    setIsAuthenticated(false);
    setState(DEFAULT_STATE); // Reset state on logout
    setCurrentView(View.DASHBOARD);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const daysPrepared = state.calendar.filter(d => d.prepared).length;
  const nextOpenDay = state.calendar.find(d => !d.completed)?.day || 24;
  const currentDayPlan = state.calendar[nextOpenDay - 1];

  if (isLoading) {
    return (
        <div className="h-screen w-screen bg-elf-dark flex items-center justify-center text-white">
            <p>Wichtel-Werkstatt wird geladen...</p>
        </div>
    )
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={handleLogin} onRegister={handleRegister} />
        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSubmit={handleAuth}
          />
        )}
      </>
    );
  }

  // Show setup only on first login (when not configured)
  if (!state.isConfigured) {
      return (
          <div className="h-full w-full bg-[#fcfaf2] overflow-y-auto bg-parchment">
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8">
              <ElfSettings config={state.elf} onUpdate={updateElfConfig} isSetup={true} onComplete={completeSetup} />
            </div>
          </div>
      );
  }

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
      case View.KIDS_ZONE:
        return <KidsZone elfConfig={state.elf} calendar={state.calendar} onExit={() => setCurrentView(View.DASHBOARD)} />;
      case View.DASHBOARD:
      default:
        return (
          <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-0">
            {/* Hero Card */}
            <div className="bg-[#2d1b14] rounded-xl p-1 shadow-2xl border-2 border-[#5d4037] relative group">
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
                             
                             {/* WEATHER WIDGET */}
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
                            "{state.elf.name}" ist bereit für {state.elf.kids.map(k => k.name).join(' & ')}.
                        </p>
                        
                        {/* MULTI BRAV-O-METER */}
                        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                            {state.elf.kids.map(kid => {
                                const score = calculateKidBehaviorScore(kid.name);
                                const percent = score === 0 ? 50 : (score / 5) * 100; // Default to middle if no data
                                let statusText = 'Noch keine Daten';
                                if (score > 0) statusText = score < 2.5 ? 'Wichtel ist besorgt...' : score > 4 ? 'Absoluter Engel!' : 'Auf gutem Weg';
                                
                                return (
                                    <div key={kid.name} className="bg-black/40 p-3 rounded-lg border border-white/10">
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
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                             <button onClick={() => setCurrentView(View.CALENDAR)} className="bg-elf-gold text-elf-dark px-6 py-3 rounded font-bold hover:bg-yellow-400 transition-colors text-sm md:text-base shadow-lg flex items-center gap-2 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1">
                                <span className="material-icons-round">calendar_month</span>
                                Zum Planer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Button Area (Styled as Real Buttons) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handlePanicMovement}
                    className="w-full bg-gradient-to-b from-orange-50 to-orange-100 border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 active:mt-1 p-4 rounded-xl shadow-lg flex items-center gap-4 group transition-all relative overflow-hidden border border-orange-300"
                >
                    <div className="bg-orange-500 p-3 rounded-full shadow-inner text-white group-hover:scale-110 transition-transform border-2 border-orange-400">
                         <span className="material-icons-round text-3xl">warning</span>
                    </div>
                    <div className="text-left z-10">
                        <div className="text-[10px] uppercase text-orange-700 font-bold tracking-wider">Notfall-Protokoll</div>
                        <div className="font-bold text-orange-900 font-serif text-lg">Wichtel nicht bewegt?</div>
                    </div>
                </button>
                <button 
                    onClick={handlePanicPreparation}
                    className="w-full bg-gradient-to-b from-purple-50 to-purple-100 border-b-4 border-purple-600 active:border-b-0 active:translate-y-1 active:mt-1 p-4 rounded-xl shadow-lg flex items-center gap-4 group transition-all relative overflow-hidden border border-purple-300"
                >
                    <div className="bg-purple-500 p-3 rounded-full shadow-inner text-white group-hover:scale-110 transition-transform border-2 border-purple-400">
                         <span className="material-icons-round text-3xl">hourglass_empty</span>
                    </div>
                    <div className="text-left z-10">
                        <div className="text-[10px] uppercase text-purple-700 font-bold tracking-wider">Notfall-Protokoll</div>
                        <div className="font-bold text-purple-900 font-serif text-lg">Vorbereitung vergessen?</div>
                    </div>
                </button>
            </div>

            {/* Next Action Card */}
            <div className="bg-[#855E42] p-1 rounded-lg shadow-xl relative mt-4">
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

            {/* Stats */}
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

  if (bossMode) {
      return (
          <div className="h-screen w-screen bg-white text-black p-0 m-0 overflow-auto" onClick={() => setBossMode(false)}>
               <div className="bg-[#e6e6e6] p-2 border-b border-[#ccc] text-xs flex gap-4 mb-2"><span>File</span> <span>Edit</span> <span>View</span></div>
               <div className="p-4"><h1 className="text-xl font-bold mb-4 font-sans text-left">Q4 Budget Analysis</h1><table className="spreadsheet-table"><thead><tr><th>ID</th><th>Category</th><th>Total</th></tr></thead><tbody>{[...Array(20)].map((_, i) => (<tr key={i}><td>{1000 + i}</td><td>Operating Exp</td><td><strong>{(Math.random() * 5000).toFixed(2)}</strong></td></tr>))}</tbody></table></div>
          </div>
      )
  }

  return (
    <div className="flex h-screen bg-[#2d1b14] font-sans text-slate-900 overflow-hidden">
      {/* Panic Modal */}
      {showPanicModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#fcfaf2] w-full max-w-lg rounded-sm shadow-2xl animate-slide-up flex flex-col max-h-[90vh] border-8 border-[#2d1b14] relative">
                  <div className="absolute top-2 left-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner"></div>
                  <div className="flex justify-between items-start p-6 border-b-2 border-[#e6dac0] flex-shrink-0 bg-[#f9f5e6]">
                      <h3 className="text-xl font-bold text-elf-dark font-serif">{panicType === 'movement' ? 'Wichtel-Rettung' : 'Plan B Protokoll'}</h3>
                      <button onClick={() => setShowPanicModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-icons-round">close</span></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-parchment">
                      {generatingExcuse ? <div className="text-center py-10">Verbinde zum Nordpol...</div> : <div className="space-y-6">{panicType === 'preparation' && panicInstruction && <div className="bg-[#2d1b14] text-amber-50 p-4 rounded shadow-md"><p className="font-medium text-sm">{panicInstruction}</p></div>}<div className="border-4 border-double border-orange-200 p-8 bg-white shadow-lg"><p className="font-serif text-lg leading-loose text-center">"{panicText}"</p></div><div className="text-center"><button onClick={() => printContent('Wichtel Nachricht', panicText)} className="text-xs font-bold text-[#855E42] bg-[#e6dac0] px-3 py-1 rounded-full">Ausdrucken</button></div></div>}
                  </div>
                  <div className="p-6 border-t-2 border-[#e6dac0] flex gap-3 flex-shrink-0 bg-[#f9f5e6]">
                      <button onClick={panicType === 'movement' ? handlePanicMovement : handlePanicPreparation} disabled={generatingExcuse} className="flex-1 py-3 bg-white border border-slate-300 rounded font-bold uppercase text-xs">Neu generieren</button>
                      <button onClick={handlePanicSave} disabled={generatingExcuse || !panicText} className="flex-1 py-3 rounded font-bold text-white bg-elf-red uppercase text-xs border-b-4 border-red-900 active:border-b-0 active:translate-y-1">Speichern</button>
                  </div>
              </div>
          </div>
      )}

      {/* Sidebar */}
      {currentView !== View.KIDS_ZONE && (
      <aside className="hidden md:flex w-20 lg:w-72 bg-[#2d1b14] text-amber-50 flex-shrink-0 flex-col transition-all duration-300 bg-wood-texture border-r-4 border-[#1a100c] shadow-2xl z-20 relative">
        <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20 shadow-inner">
            <div className="bg-[#855E42] p-2 rounded shadow-wood-bezel border border-[#5d4037]">
                <span className="material-icons-round text-elf-gold text-2xl drop-shadow-md">handyman</span>
            </div>
            <span className="font-serif font-bold text-xl hidden lg:block tracking-wide text-amber-100 text-shadow">Wichtel<br/>Werkstatt</span>
        </div>
        <nav className="flex-1 py-6 space-y-3 px-3 overflow-y-auto">
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
            {/* KIDS ZONE BUTTON */}
            <button
                onClick={() => setCurrentView(View.KIDS_ZONE)}
                className="w-full flex items-center gap-3 px-4 py-3 mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-lg text-white font-bold shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
            >
                <span className="material-icons-round">child_care</span>
                <span className="hidden lg:block text-xs uppercase tracking-wide">Kinder-Zone</span>
            </button>

            <NavButton view={View.SETTINGS} icon="settings" label="Konfiguration" current={currentView} onClick={setCurrentView} />
            <button onClick={() => setBossMode(true)} className="w-full flex items-center gap-4 px-4 py-2 mt-2 text-xs text-slate-500 hover:text-white transition-colors opacity-50 hover:opacity-100"><span className="material-icons-round">visibility_off</span><span className="hidden lg:block">Chef! (Boss Mode)</span></button>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-2 mt-auto text-xs text-elf-red hover:text-white transition-colors"><span className="material-icons-round">logout</span><span className="hidden lg:block">Abmelden</span></button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative shadow-inner bg-wood-texture">
        {currentView !== View.KIDS_ZONE && (
            <header className="bg-[#2d1b14] border-b border-[#5d4037] px-4 py-3 md:px-8 md:py-4 flex justify-between items-center shadow-lg z-10 flex-shrink-0">
                <div className="flex items-center gap-2 md:hidden">
                    <span className="material-icons-round text-elf-gold">handyman</span>
                    <span className="font-serif font-bold text-lg text-amber-100">Werkstatt</span>
                </div>
                <h2 className="hidden md:block text-2xl font-bold text-amber-100 font-serif capitalize flex items-center gap-2 text-shadow">
                    {currentView === View.DASHBOARD ? `Hauptquartier` : currentView === View.CALENDAR ? 'Planungs-Kalender' : 'Wichtel-Bereich'}
                </h2>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block"><p className="text-sm font-bold text-amber-100">{state.elf.name}</p></div>
                    <div onClick={() => setCurrentView(View.SETTINGS)} className="w-10 h-10 bg-[#855E42] rounded shadow-wood-bezel flex items-center justify-center text-amber-100 font-serif font-bold border border-[#5d4037] cursor-pointer hover:bg-[#a07050] transition-colors">{state.elf.name.charAt(0) || 'E'}</div>
                </div>
            </header>
        )}

        <div className={`flex-1 overflow-y-auto ${currentView === View.KIDS_ZONE ? 'p-0' : 'p-3 md:p-6 pb-24 md:pb-6'} relative scroll-smooth bg-[#d4c5a5]`}>
             {renderContent()}
        </div>
        
        {currentView !== View.KIDS_ZONE && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2d1b14] border-t-4 border-[#5d4037] flex justify-around items-center p-2 pb-safe z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.5)] overflow-x-auto no-scrollbar">
                <MobileNavButton view={View.DASHBOARD} icon="dashboard" label="Start" current={currentView} onClick={setCurrentView} />
                <MobileNavButton view={View.CALENDAR} icon="calendar_month" label="Planer" current={currentView} onClick={setCurrentView} />
                <MobileNavButton view={View.IDEAS} icon="menu_book" label="Ideen" current={currentView} onClick={setCurrentView} />
                <MobileNavButton view={View.RECIPES} icon="bakery_dining" label="Bäckerei" current={currentView} onClick={setCurrentView} />
                <MobileNavButton view={View.PRINTABLES} icon="print" label="Druck" current={currentView} onClick={setCurrentView} />
                <MobileNavButton view={View.KIDS_ZONE} icon="child_care" label="Kids" current={currentView} onClick={setCurrentView} />
            </div>
        )}
      </main>
    </div>
  );
};

const NavButton: React.FC<{ view: View; icon: string; label: string; current: View; onClick: (v: View) => void; }> = ({ view, icon, label, current, onClick }) => {
  const active = current === view;
  return (
    <button onClick={() => onClick(view)} className={`w-full flex items-center gap-4 px-4 py-3 transition-all relative rounded-l-lg ml-2 mb-1 shadow-sm ${active ? 'text-[#2d1b14] bg-[#d4c5a5] font-bold border-l-4 border-elf-gold translate-x-1' : 'text-amber-200/60 hover:text-amber-100 hover:bg-white/5'}`}>
      <span className={`material-icons-round ${active ? 'text-[#2d1b14]' : ''}`}>{icon}</span>
      <span className="hidden lg:block text-sm uppercase tracking-wider">{label}</span>
    </button>
  );
};

const MobileNavButton: React.FC<{ view: View; icon: string; label: string; current: View; onClick: (v: View) => void; }> = ({ view, icon, label, current, onClick }) => {
  const active = current === view;
  return (
    <button onClick={() => onClick(view)} className={`flex flex-col items-center justify-center w-14 py-1 transition-colors flex-shrink-0 ${active ? 'text-elf-gold font-bold' : 'text-[#855E42]'}`}>
      <span className={`material-icons-round text-2xl mb-0.5 drop-shadow-sm`}>{icon}</span>
      <span className="text-[9px] uppercase tracking-wide truncate w-full text-center">{label}</span>
    </button>
  );
};

export default App;