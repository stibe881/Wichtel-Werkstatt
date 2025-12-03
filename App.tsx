import React, { useState, useEffect } from 'react';
import { View, AppState, ElfConfig, Idea, Kid } from './types';
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
import Dashboard from './components/Dashboard';
import { generateElfExcuse, generateLatePreparationSolution } from './services/geminiService';
import { getWeather } from './services/weatherService';

const API_URL = 'https://api.wichtel-werkstatt.ch';

const STARTER_IDEAS: Idea[] = [
    { id: 'start-1', title: 'Der magische Einzug', description: 'Die Wichteltür ist über Nacht erschienen! Davor liegt ein kleiner Brief und etwas "Feenstaub" (Glitzer).', materials: ['Wichteltür', 'Glitzer', 'Brief'], effort: 'mittel', messiness: 'sauber', type: 'arrival' },
    { id: '1', title: 'Mehl-Engel', description: 'Der Wichtel hat einen Schnee-Engel im Mehl auf der Küchenzeile gemacht.', materials: ['Mehl'], effort: 'niedrig', messiness: 'etwas chaos', type: 'normal' },
];

const DEFAULT_STATE: AppState = {
  elves: [],
  kids: [],
  activeElfId: null,
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

const getInitialState = (): AppState => {
  try {
    const cachedState = localStorage.getItem('wichtel_cached_state');
    if (cachedState) {
      const parsed = JSON.parse(cachedState);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.elves)) {
        return { ...DEFAULT_STATE, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to load cached state", e);
  }
  return DEFAULT_STATE;
};

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('wichtel_user_id'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!userId);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppState>(getInitialState);
  const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [weather, setWeather] = useState({ temp: -20, condition: 'Schnee' });

  // Initial data load
  useEffect(() => {
    if (isAuthenticated && userId) {
      setIsLoading(true);
      fetch(`${API_URL}/state/${encodeURIComponent(userId)}`)
        .then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch: ${res.status}`))
        .then(data => {
            const mergedState: AppState = { ...DEFAULT_STATE, ...data, savedIdeas: STARTER_IDEAS };
            if (mergedState.elves.length > 0 && !mergedState.activeElfId) {
                mergedState.activeElfId = mergedState.elves[0].id;
            }
            setState(mergedState);
        })
        .catch(error => console.error("Could not sync state:", error))
        .finally(() => {
            setHasLoadedFromBackend(true);
            setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    setWeather(getWeather());
  }, [isAuthenticated, userId]);

  // Debounced save effect
  useEffect(() => {
    if (!isAuthenticated || !userId || !hasLoadedFromBackend) return;
    
    const handler = setTimeout(() => {
      const stateToSave = { ...state };
      delete (stateToSave as any).savedIdeas; // Don't save starter ideas to backend

      fetch(`${API_URL}/state/${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave),
      });
      localStorage.setItem('wichtel_cached_state', JSON.stringify(stateToSave));
    }, 1500);

    return () => clearTimeout(handler);
  }, [state, isAuthenticated, userId, hasLoadedFromBackend]);

  const handleAuth = (email: string) => {
    localStorage.setItem('wichtel_user_id', email);
    setUserId(email);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setState(DEFAULT_STATE); // Reset to default on new login/register
    localStorage.removeItem('wichtel_cached_state');
  };

  const handleLogout = () => {
    localStorage.removeItem('wichtel_user_id');
    localStorage.removeItem('wichtel_cached_state');
    setUserId(null);
    setIsAuthenticated(false);
    setState(DEFAULT_STATE);
  };

  const activeElf = state.elves.find(e => e.id === state.activeElfId);

  if (isLoading && !hasLoadedFromBackend) {
    return <div className="h-screen w-screen bg-elf-dark flex items-center justify-center text-white"><p>Wichtel-Werkstatt wird geladen...</p></div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} onRegister={() => { setAuthMode('register'); setShowAuthModal(true); }} />
        {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} onSubmit={handleAuth} />}
      </>
    );
  }

  // If authenticated, always show the main app structure.
  // The ElfSettings component will handle the "no elf" case.
  return (
    <div className="flex h-screen bg-[#2d1b14] font-sans text-slate-900 overflow-hidden">
      {currentView !== View.KIDS_ZONE && <NavSidebar currentView={currentView} setCurrentView={setCurrentView} handleLogout={handleLogout} />}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {currentView !== View.KIDS_ZONE && (
            <header className="bg-[#2d1b14] border-b border-[#5d4037] px-4 py-3 flex justify-between items-center shadow-lg z-10 flex-shrink-0">
                <h2 className="text-xl font-bold text-amber-100 font-serif capitalize">
                    {View[currentView].replace('_', ' ')}
                </h2>
                {activeElf && (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-amber-100">{activeElf.name}</p>
                            <p className="text-xs text-amber-200/60">Aktiver Wichtel</p>
                        </div>
                        <div onClick={() => setCurrentView(View.SETTINGS)} className="w-10 h-10 bg-[#855E42] rounded-full flex items-center justify-center text-amber-100 font-serif font-bold border-2 border-[#5d4037] cursor-pointer">
                            {activeElf.name.charAt(0) || '?'}
                        </div>
                    </div>
                )}
            </header>
        )}
        <div className="flex-1 overflow-y-auto p-6 bg-[#d4c5a5]">
            <Content
                currentView={currentView}
                state={state}
                setState={setState}
                activeElf={activeElf}
                weather={weather}
            />
        </div>
        {currentView !== View.KIDS_ZONE && <MobileNav currentView={currentView} setCurrentView={setCurrentView} />}
      </main>
    </div>
  );
};

// --- Helper Components ---

const Content: React.FC<{ currentView: View, state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>, activeElf: ElfConfig | undefined, weather: any }> = 
({ currentView, state, setState, activeElf, weather }) => {
    if (!activeElf) {
        return <ElfSettings state={state} setState={setState} />;
    }
    const onUpdateDay = (day: number, updates: Partial<CalendarDay>) => {
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
    const onUpdateItems = (items: string[]) => {
        setState(prev => ({ ...prev, shoppingList: items }));
    };
    const onAddIdea = (idea: Idea) => {
        setState(prev => ({ ...prev, savedIdeas: [...prev.savedIdeas, idea] }));
    };

    switch (currentView) {
        case View.SETTINGS:
            return <ElfSettings state={state} setState={setState} />;
        case View.IDEAS:
            return <IdeaGenerator elfConfig={activeElf} onAddIdea={onAddIdea} existingIdeas={state.savedIdeas} kids={state.kids} />;
        case View.CALENDAR:
            return <Calendar calendar={state.calendar} savedIdeas={state.savedIdeas} onUpdateDay={onUpdateDay} elfConfig={activeElf} kids={state.kids} />;
        case View.LETTERS:
            return <LetterGenerator elfConfig={activeElf} kids={state.kids} />;
        case View.SHOPPING:
            return <ShoppingList items={state.shoppingList} onUpdateItems={onUpdateItems} />;
        case View.RECIPES:
            return <Recipes />;
        case View.PRINTABLES:
            return <Printables elfConfig={activeElf} kids={state.kids} />;
        case View.KIDS_ZONE:
            return <KidsZone elfConfig={activeElf} calendar={state.calendar} kids={state.kids} onExit={() => setState(prev => ({...prev, currentView: View.DASHBOARD}))} />;
        case View.DASHBOARD:
        default:
            return <Dashboard 
                state={state} 
                activeElf={activeElf} 
                weather={weather} 
                setCurrentView={setCurrentView}
                handlePanicMovement={handlePanicMovement}
                handlePanicPreparation={handlePanicPreparation}
            />;
    }
};

const NavSidebar: React.FC<{ currentView: View, setCurrentView: (v: View) => void, handleLogout: () => void }> = ({ currentView, setCurrentView, handleLogout }) => (
    <aside className="hidden md:flex w-64 bg-[#2d1b14] text-amber-50 flex-col">
        <div className="p-6 text-center border-b border-white/10">
            <h1 className="text-2xl font-serif">Wichtel-Werkstatt</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <NavButton view={View.DASHBOARD} icon="dashboard" label="Werkbank" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.CALENDAR} icon="calendar_month" label="Planer" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.IDEAS} icon="menu_book" label="Ideen-Katalog" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.LETTERS} icon="history_edu" label="Schreibstube" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.SHOPPING} icon="inventory_2" label="Material-Lager" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.PRINTABLES} icon="print" label="Druckerei" current={currentView} onClick={setCurrentView} />
            <NavButton view={View.RECIPES} icon="bakery_dining" label="Wichtel-Bäckerei" current={currentView} onClick={setCurrentView} />
            <div className="pt-4 mt-4 border-t border-white/10">
                <NavButton view={View.KIDS_ZONE} icon="child_care" label="Kinder-Zone" current={currentView} onClick={setCurrentView} />
                <NavButton view={View.SETTINGS} icon="settings" label="Wichtel-Profil" current={currentView} onClick={setCurrentView} />
            </div>
        </nav>
        <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 rounded hover:bg-white/10 text-red-400">
                <span className="material-icons-round">logout</span>
                Abmelden
            </button>
        </div>
    </aside>
);

const MobileNav: React.FC<{ currentView: View, setCurrentView: (v: View) => void }> = ({ currentView, setCurrentView }) => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2d1b14] border-t-2 border-[#5d4037] flex justify-around p-2">
        <MobileNavButton view={View.DASHBOARD} icon="dashboard" label="Start" current={currentView} onClick={setCurrentView} />
        <MobileNavButton view={View.CALENDAR} icon="calendar_month" label="Planer" current={currentView} onClick={setCurrentView} />
        <MobileNavButton view={View.IDEAS} icon="menu_book" label="Ideen" current={currentView} onClick={setCurrentView} />
        <MobileNavButton view={View.SHOPPING} icon="inventory_2" label="Lager" current={currentView} onClick={setCurrentView} />
        <MobileNavButton view={View.SETTINGS} icon="settings" label="Profil" current={currentView} onClick={setCurrentView} />
    </div>
);

const NavButton: React.FC<{ view: View; icon: string; label: string; current: View; onClick: (v: View) => void; }> = ({ view, icon, label, current, onClick }) => {
  const active = current === view;
  return (
    <button onClick={() => onClick(view)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-elf-gold text-elf-dark font-bold' : 'hover:bg-white/10'}`}>
      <span className="material-icons-round">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const MobileNavButton: React.FC<{ view: View; icon: string; label: string; current: View; onClick: (v: View) => void; }> = ({ view, icon, label, current, onClick }) => {
  const active = current === view;
  return (
    <button onClick={() => onClick(view)} className={`flex flex-col items-center transition-colors ${active ? 'text-elf-gold' : 'text-amber-200/70'}`}>
      <span className="material-icons-round">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export default App;
