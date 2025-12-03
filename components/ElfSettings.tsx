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
  const [newKidAge, setNewKidAge] = useState(5);
  const [newElfName, setNewElfName] = useState('');

  // --- Kid Management ---
  const createNewKid = () => {
    if (!newKidName.trim()) return;
    const newKid: Kid = {
      id: uuidv4(),
      name: newKidName.trim(),
      age: newKidAge,
      gender: 'boy'
    };
    setState(prev => ({ ...prev, kids: [...prev.kids, newKid] }));
    setNewKidName('');
    setNewKidAge(5);
  };
  
  const updateKid = (id: string, updatedKid: Partial<Kid>) => {
    setState(prev => ({
      ...prev,
      kids: prev.kids.map(k => k.id === id ? { ...k, ...updatedKid } : k)
    }));
  };

  const deleteKid = (id: string, name: string) => {
    if (window.confirm(`Sind Sie sicher, dass Sie ${name} löschen möchten? Das Kind wird auch von allen Wichteln entfernt.`)) {
      setState(prev => ({
          ...prev,
          kids: prev.kids.filter(k => k.id !== id),
          elves: prev.elves.map(elf => ({
              ...elf,
              kidIds: elf.kidIds.filter(kidId => kidId !== id)
          }))
      }));
    }
  };

  // --- Elf Management ---
  const createNewElf = () => {
    if (!newElfName.trim()) return;
    const newElf: ElfConfig = {
      id: uuidv4(),
      name: newElfName.trim(),
      personality: 'frech und verspielt',
      kidIds: state.kids.map(k => k.id), // Assign all existing kids by default
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

  const updateElf = (id: string, updatedElf: Partial<ElfConfig>) => {
      setState(prev => ({
          ...prev,
          elves: prev.elves.map(e => e.id === id ? { ...e, ...updatedElf } : e)
      }));
  };

  const deleteElf = (id: string, name: string) => {
    if (window.confirm(`Sind Sie sicher, dass Sie den Wichtel ${name} löschen möchten?`)) {
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
    }
  };
  
  const toggleKidForElf = (elfId: string, kidId: string) => {
      const elf = state.elves.find(e => e.id === elfId);
      if (!elf) return;
      
      const newKidIds = elf.kidIds.includes(kidId)
          ? elf.kidIds.filter(id => id !== kidId)
          : [...elf.kidIds, kidId];
      
      updateElf(elfId, { kidIds: newKidIds });
  };

  // --- Render Logic ---

  // If no elves exist, show a dedicated setup screen to create the first one.
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

      {/* Kids Management */}
       <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-bold text-lg mb-4">Ihre Kinder</h2>
        <div className="space-y-3">
          {state.kids.map(kid => (
            <div key={kid.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                    <input 
                        type="text"
                        value={kid.name}
                        onChange={(e) => updateKid(kid.id, { name: e.target.value })}
                        className="p-2 border-b-2"
                    />
                     <input 
                        type="number"
                        value={kid.age}
                        onChange={(e) => updateKid(kid.id, { age: parseInt(e.target.value) || 0 })}
                        className="p-2 border-b-2 w-20"
                    />
                </div>
                 <button onClick={() => deleteKid(kid.id, kid.name)} className="text-xs p-2 bg-red-100 text-red-700 rounded">Löschen</button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
            <input value={newKidName} onChange={e => setNewKidName(e.target.value)} placeholder="Name des Kindes" className="flex-grow p-2 border rounded" />
            <input type="number" value={newKidAge} onChange={e => setNewKidAge(parseInt(e.target.value) || 0)} placeholder="Alter" className="w-24 p-2 border rounded" />
            <button onClick={createNewKid} className="p-2 bg-green-200 rounded">Kind hinzufügen</button>
        </div>
      </div>

      {/* Elves Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-bold text-lg mb-4">Ihre Wichtel</h2>
        <div className="space-y-6">
          {state.elves.map(elf => (
            <div key={elf.id} className="p-4 border rounded-lg bg-slate-50">
                <div className="flex justify-between items-start">
                    <input 
                        type="text"
                        value={elf.name}
                        onChange={(e) => updateElf(elf.id, { name: e.target.value })}
                        className="font-bold text-lg p-1"
                    />
                    <div>
                        <button onClick={() => setState(prev => ({...prev, activeElfId: elf.id}))} disabled={state.activeElfId === elf.id} className="text-xs px-2 py-1 bg-blue-100 disabled:bg-blue-300 rounded">Aktiv</button>
                        <button onClick={() => deleteElf(elf.id, elf.name)} className="text-xs px-2 py-1 bg-red-100 ml-2 rounded">Löschen</button>
                    </div>
                </div>
                <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Zugeordnete Kinder:</h4>
                    <div className="flex flex-wrap gap-2">
                        {state.kids.map(kid => (
                            <label key={kid.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={elf.kidIds.includes(kid.id)}
                                    onChange={() => toggleKidForElf(elf.id, kid.id)}
                                />
                                {kid.name}
                            </label>
                        ))}
                         {state.kids.length === 0 && <p className="text-xs text-slate-500">Bitte legen Sie zuerst Kinder an.</p>}
                    </div>
                </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex gap-2">
            <input value={newElfName} onChange={e => setNewElfName(e.target.value)} placeholder="Neuer Wichtel-Name" className="flex-grow p-2 border rounded" />
            <button onClick={createNewElf} className="p-2 bg-green-200 rounded">Wichtel hinzufügen</button>
        </div>
      </div>
    </div>
  );
};

export default ElfSettings;