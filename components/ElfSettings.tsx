import React, { useState } from 'react';
import { AppState, Kid, ElfConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onLogout?: () => void;
}

const ElfSettings: React.FC<Props> = ({ state, setState, onLogout }) => {
  const [newKidName, setNewKidName] = useState('');
  const [newElfName, setNewElfName] = useState('');

  const createNewKid = () => {
    if (!newKidName.trim()) return;
    const newKid: Kid = {
      id: uuidv4(),
      name: newKidName.trim(),
      age: 1,
      gender: 'boy'
    };
    setState(prev => ({ ...prev, kids: [...prev.kids, newKid] }));
    setNewKidName('');
  };
  
  const createNewElf = () => {
    if (!newElfName.trim()) return;
    const newElf: ElfConfig = {
      id: uuidv4(),
      name: newElfName.trim(),
      personality: 'frech und verspielt',
      kidIds: [],
      arrivalDate: '2025-12-01',
      departureDate: '2025-12-24',
    };
    setState(prev => {
        const newState = { ...prev, elves: [...prev.elves, newElf] };
        if (!newState.activeElfId) {
            newState.activeElfId = newElf.id;
        }
        return newState;
    });
    setNewElfName('');
  };

  const updateKid = (id: string, updatedKid: Partial<Kid>) => {
    setState(prev => ({
      ...prev,
      kids: prev.kids.map(k => k.id === id ? { ...k, ...updatedKid } : k)
    }));
  };
  
  const updateElf = (id: string, updatedElf: Partial<ElfConfig>) => {
      setState(prev => ({
          ...prev,
          elves: prev.elves.map(e => e.id === id ? { ...e, ...updatedElf } : e)
      }));
  };

  const deleteKid = (id: string) => {
    setState(prev => ({
        ...prev,
        kids: prev.kids.filter(k => k.id !== id),
        elves: prev.elves.map(elf => ({
            ...elf,
            kidIds: elf.kidIds.filter(kidId => kidId !== id)
        }))
    }));
  };

  const deleteElf = (id: string) => {
      setState(prev => {
          const remainingElves = prev.elves.filter(e => e.id !== id);
          let newActiveElfId = prev.activeElfId;
          if (prev.activeElfId === id) {
              newActiveElfId = remainingElves.length > 0 ? remainingElves[0].id : null;
          }
          return {
              ...prev,
              elves: remainingElves,
              activeElfId: newActiveElfId
          };
      });
  };

  // If no elves exist, show a dedicated setup screen.
  if (state.elves.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-16">
        <h1 className="text-3xl font-bold font-serif text-elf-dark mb-4">Willkommen in der Wichtel-Werkstatt!</h1>
        <p className="text-slate-600 mb-8">Es sieht so aus, als ob noch kein Wichtel für diese Familie zuständig ist. Lassen Sie uns Ihren ersten Wichtel anlegen, um zu beginnen.</p>
        <div className="bg-white p-6 rounded-xl border-2 border-dashed border-elf-gold">
            <input
                type="text"
                value={newElfName}
                onChange={(e) => setNewElfName(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg text-lg text-center"
                placeholder="Name des ersten Wichtels"
            />
            <button
                onClick={createNewElf}
                disabled={!newElfName.trim()}
                className="mt-4 w-full py-3 bg-elf-red text-white font-bold rounded-lg disabled:bg-slate-300"
            >
                Wichtel erstellen
            </button>
        </div>
        {onLogout && (
             <div className="text-center mt-8">
                <button
                type="button"
                onClick={onLogout}
                className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
                >
                Abmelden und zur Startseite
                </button>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-serif text-elf-dark">Wichtel & Kinder Profile</h1>
        <p className="text-slate-500">Verwalten Sie hier Ihre Wichtel und die zugehörigen Kinder.</p>
      </div>

      {/* Elves Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-bold text-lg mb-4">Ihre Wichtel</h2>
        <div className="space-y-4">
          {state.elves.map(elf => (
            <div key={elf.id} className="p-4 border rounded-lg">
                <p><strong>{elf.name}</strong> {state.activeElfId === elf.id && <span className="text-xs text-green-600 font-bold">(Aktiv)</span>}</p>
                 <button onClick={() => setState(prev => ({...prev, activeElfId: elf.id}))} disabled={state.activeElfId === elf.id} className="text-xs p-1 bg-blue-100 disabled:bg-slate-200">Aktivieren</button>
                 <button onClick={() => deleteElf(elf.id)} className="text-xs p-1 bg-red-100 ml-2">Löschen</button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex gap-2">
            <input value={newElfName} onChange={e => setNewElfName(e.target.value)} placeholder="Neuer Wichtel-Name" className="flex-grow p-2 border rounded" />
            <button onClick={createNewElf} className="p-2 bg-green-200 rounded">Hinzufügen</button>
        </div>
      </div>

       {/* Kids Management */}
       <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-bold text-lg mb-4">Ihre Kinder</h2>
        <div className="space-y-4">
          {state.kids.map(kid => (
            <div key={kid.id} className="p-4 border rounded-lg flex justify-between items-center">
                <p><strong>{kid.name}</strong> ({kid.age} Jahre)</p>
                 <button onClick={() => deleteKid(kid.id)} className="text-xs p-1 bg-red-100">Löschen</button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex gap-2">
            <input value={newKidName} onChange={e => setNewKidName(e.target.value)} placeholder="Neues Kind-Name" className="flex-grow p-2 border rounded" />
            <button onClick={createNewKid} className="p-2 bg-green-200 rounded">Hinzufügen</button>
        </div>
      </div>
    </div>
  );
};

export default ElfSettings;
