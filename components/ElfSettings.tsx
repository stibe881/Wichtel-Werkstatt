import React, { useState } from 'react';
import { AppState, Kid, ElfConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import ConfirmModal from './ConfirmModal'; // Import the new modal
import ElfWizard from './ElfWizard';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onLogout?: () => void;
}

const ElfSettings: React.FC<Props> = ({ state, setState, onLogout }) => {
  const [newKidName, setNewKidName] = useState('');
  const [newKidAge, setNewKidAge] = useState(5);
  const [newElfName, setNewElfName] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<{type: 'kid' | 'elf', id: string, name: string} | null>(null);
  const [showWizard, setShowWizard] = useState(false);

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

  const deleteKid = (id: string) => {
    setState(prev => ({
        ...prev,
        kids: prev.kids.filter(k => k.id !== id),
        elves: prev.elves.map(elf => ({
            ...elf,
            kidIds: elf.kidIds.filter(kidId => kidId !== id)
        }))
    }));
    setConfirmingDelete(null);
  };

  // --- Elf Management ---
  const createNewElf = () => {
    if (!newElfName.trim()) return;
    const newElf: ElfConfig = {
      id: uuidv4(),
      name: newElfName.trim(),
      kidIds: state.kids.map(k => k.id), // Assign all existing kids by default
      arrivalDate: new Date().toISOString(),
      departureDate: new Date(new Date().getFullYear(), 11, 24).toISOString(),
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

  const handleWizardComplete = (elfData: Omit<ElfConfig, 'id'>) => {
      const newElf: ElfConfig = {
          ...elfData,
          id: uuidv4()
      };
      setState(prev => {
          const newState = { ...prev, elves: [...prev.elves, newElf] };
          if (!newState.activeElfId) {
              newState.activeElfId = newElf.id;
          }
          return newState;
      });
      setShowWizard(false);
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
    setConfirmingDelete(null);
  };
  
  const handleConfirmDelete = () => {
      if (confirmingDelete) {
          if (confirmingDelete.type === 'kid') {
              deleteKid(confirmingDelete.id);
          } else if (confirmingDelete.type === 'elf') {
              // Check if elf has assigned kids
              const elf = state.elves.find(e => e.id === confirmingDelete.id);
              if (elf && elf.kidIds && elf.kidIds.length > 0) {
                  // Don't delete, modal will show warning
                  return;
              }
              deleteElf(confirmingDelete.id);
          }
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
      <>
        <div className="w-full max-w-2xl mx-auto text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-elf-red to-elf-green rounded-full flex items-center justify-center border-4 border-[#855E42] shadow-xl">
            <span className="material-icons-round text-white" style={{ fontSize: '80px' }}>auto_awesome</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-elf-dark mb-4">Willkommen in der Wichtel-Werkstatt!</h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Erstellen Sie Ihren ersten Wichtel, um mit der magischen Wichtel-Planung zu beginnen.
            Der Wizard führt Sie durch alle Schritte!
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="px-8 py-4 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
          >
            <span className="material-icons-round text-2xl">auto_awesome</span>
            Ersten Wichtel erstellen
          </button>
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
        {showWizard && (
          <ElfWizard
            isOpen={showWizard}
            onClose={() => setShowWizard(false)}
            onCreateElf={handleWizardComplete}
            kids={state.kids}
          />
        )}
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {confirmingDelete && (() => {
          let title = 'Bist du sicher?';
          let message = `Möchtest du ${confirmingDelete.name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`;
          let confirmLabel = 'Löschen';

          // Check if elf has assigned kids
          if (confirmingDelete.type === 'elf') {
              const elf = state.elves.find(e => e.id === confirmingDelete.id);
              if (elf && elf.kidIds && elf.kidIds.length > 0) {
                  const assignedKids = state.kids.filter(k => elf.kidIds.includes(k.id));
                  title = '🎅 Wichtel kann nicht gelöscht werden!';
                  message = `Der Wichtel "${confirmingDelete.name}" hat noch ${elf.kidIds.length} Kind(er) zugeordnet: ${assignedKids.map(k => k.name).join(', ')}.\n\nBitte entferne zuerst alle Kinder-Zuordnungen, bevor du den Wichtel löschen kannst.`;
                  confirmLabel = 'OK';
              }
          }

          return (
              <ConfirmModal
                  title={title}
                  message={message}
                  onConfirm={handleConfirmDelete}
                  onCancel={() => setConfirmingDelete(null)}
                  confirmLabel={confirmLabel}
              />
          );
      })()}
      <div>
        <h1 className="text-2xl font-bold font-serif text-elf-dark">Wichtel & Kinder Profile</h1>
        <p className="text-slate-500">Verwalten Sie hier Ihre Wichtel und die zugehörigen Kinder.</p>
      </div>

      {/* Kids Management */}
       <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <span className="material-icons-round text-elf-gold">child_care</span>
            Ihre Kinder
        </h2>
        <p className="text-sm text-slate-500 mb-4">Legen Sie hier die Kinder an, für die der Wichtel zuständig ist. Geben Sie Name und Alter ein.</p>
        <div className="space-y-3">
          {state.kids.map(kid => (
            <div key={kid.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50">
                <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-1 block">Name des Kindes</label>
                        <input
                            type="text"
                            value={kid.name}
                            onChange={(e) => updateKid(kid.id, { name: e.target.value })}
                            placeholder="z.B. Lena"
                            className="w-full p-2 border-b-2 border-[#e6dac0] focus:border-elf-gold outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-1 block">Alter (Jahre)</label>
                        <input
                            type="number"
                            value={kid.age}
                            onChange={(e) => updateKid(kid.id, { age: parseInt(e.target.value) || 0 })}
                            placeholder="z.B. 5"
                            className="w-full p-2 border-b-2 border-[#e6dac0] focus:border-elf-gold outline-none"
                        />
                    </div>
                </div>
                 <button onClick={() => setConfirmingDelete({ type: 'kid', id: kid.id, name: kid.name })} className="text-xs px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Löschen</button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#e6dac0]">
            <p className="text-xs text-slate-500 mb-2">Neues Kind hinzufügen:</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    value={newKidName}
                    onChange={e => setNewKidName(e.target.value)}
                    placeholder="Name des Kindes (z.B. Max)"
                    className="flex-grow p-2 border border-[#e6dac0] rounded focus:border-elf-gold outline-none"
                />
                <input
                    type="number"
                    value={newKidAge}
                    onChange={e => setNewKidAge(parseInt(e.target.value) || 0)}
                    placeholder="Alter"
                    className="w-24 p-2 border border-[#e6dac0] rounded focus:border-elf-gold outline-none"
                />
                <button onClick={createNewKid} className="px-4 py-2 bg-elf-gold text-elf-dark rounded font-bold hover:bg-yellow-400 transition-colors">Kind hinzufügen</button>
            </div>
        </div>
      </div>

      {/* Elves Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <span className="material-icons-round text-elf-red">person</span>
            Ihre Wichtel
        </h2>
        <p className="text-sm text-slate-500 mb-4">Erstellen Sie Ihre Wichtel-Charaktere und weisen Sie ihnen Kinder zu. Jeder Wichtel hat seinen eigenen Namen und seine eigene Persönlichkeit.</p>
        <div className="space-y-6">
          {state.elves.map(elf => (
            <div key={elf.id} className="p-6 border-2 border-[#e6dac0] rounded-xl bg-gradient-to-br from-[#fcfaf2] to-white shadow-md">
                {/* Header with Avatar and Actions */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-elf-red to-elf-green rounded-full flex items-center justify-center text-3xl font-serif font-bold text-white border-2 border-[#855E42] flex-shrink-0">
                        {elf.name.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">Wichtel-Name</label>
                        <input
                            type="text"
                            value={elf.name}
                            onChange={(e) => updateElf(elf.id, { name: e.target.value })}
                            className="font-bold text-2xl p-2 border-b-2 border-[#e6dac0] focus:border-elf-gold outline-none bg-transparent w-full"
                            placeholder="Name des Wichtels"
                        />
                    </div>
                    <div className="flex gap-2">
                        {state.activeElfId === elf.id ? (
                            <span className="px-3 py-2 bg-elf-gold text-elf-dark rounded-lg font-bold text-xs">✓ Aktiv</span>
                        ) : (
                            <button
                                onClick={() => setState(prev => ({...prev, activeElfId: elf.id}))}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-bold text-xs transition-colors"
                            >
                                Als aktiv setzen
                            </button>
                        )}
                        <button
                            onClick={() => setConfirmingDelete({ type: 'elf', id: elf.id, name: elf.name })}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold text-xs transition-colors"
                        >
                            Löschen
                        </button>
                    </div>
                </div>

                {/* Wichtel-Saison Dates */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-[#e6dac0] mb-4">
                    <h4 className="font-bold text-sm mb-3 text-elf-dark flex items-center gap-2">
                        <span className="material-icons-round text-elf-gold text-base">calendar_today</span>
                        Wichtel-Saison
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Einzug</label>
                            <input
                                type="date"
                                value={elf.arrivalDate ? new Date(elf.arrivalDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => updateElf(elf.id, { arrivalDate: new Date(e.target.value).toISOString() })}
                                className="w-full p-2 border border-[#e6dac0] rounded focus:border-elf-gold outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-1 block">Abreise</label>
                            <input
                                type="date"
                                value={elf.departureDate ? new Date(elf.departureDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => updateElf(elf.id, { departureDate: new Date(e.target.value).toISOString() })}
                                className="w-full p-2 border border-[#e6dac0] rounded focus:border-elf-gold outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Personality Section */}
                {elf.personality && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-[#e6dac0] mb-4">
                        <h4 className="font-bold text-sm mb-3 text-elf-dark flex items-center gap-2">
                            <span className="material-icons-round text-elf-gold text-base">psychology</span>
                            Persönlichkeit
                        </h4>

                        {elf.personality.traits && elf.personality.traits.length > 0 && (
                            <div className="mb-3">
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Charakterzüge</label>
                                <div className="flex flex-wrap gap-2">
                                    {elf.personality.traits.map((trait, idx) => (
                                        <span key={idx} className="bg-elf-gold/20 text-elf-dark px-3 py-1 rounded-full text-sm font-bold border border-elf-gold/30">
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {elf.personality.favoriteActivity && (
                            <div className="mb-3">
                                <label className="text-xs font-bold text-slate-600 mb-1 block">Lieblingsbeschäftigung</label>
                                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{elf.personality.favoriteActivity}</p>
                            </div>
                        )}

                        {elf.personality.quirk && (
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1 block">Besonderheit</label>
                                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{elf.personality.quirk}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Assigned Kids */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-[#e6dac0]">
                    <h4 className="font-bold text-sm mb-3 text-elf-dark flex items-center gap-2">
                        <span className="material-icons-round text-elf-gold text-base">child_care</span>
                        Zugeordnete Kinder
                    </h4>
                    {state.kids.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Bitte legen Sie zuerst Kinder an.</p>
                    ) : (
                        <div className="space-y-2">
                            {state.kids.map(kid => (
                                <label key={kid.id} className="flex items-center gap-3 p-3 border border-[#e6dac0] rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={elf.kidIds.includes(kid.id)}
                                        onChange={() => toggleKidForElf(elf.id, kid.id)}
                                        className="w-4 h-4"
                                    />
                                    <span className="material-icons-round text-xl text-elf-gold">
                                        {kid.gender === 'girl' ? 'face_3' : 'face_6'}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{kid.name}</p>
                                        <p className="text-xs text-slate-500">{kid.age} Jahre alt</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#e6dac0]">
            <p className="text-xs text-slate-500 mb-2">Neuen Wichtel erstellen:</p>
            <div className="flex gap-2">
                <button
                    onClick={() => setShowWizard(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-icons-round">auto_awesome</span>
                    Wizard starten (Empfohlen)
                </button>
                <button
                    onClick={createNewElf}
                    className="px-4 py-3 bg-[#e6dac0] text-[#855E42] rounded-lg font-bold hover:bg-[#d4c5a5] transition-colors"
                    title="Schnell-Erstellung"
                >
                    Schnell hinzufügen
                </button>
            </div>
            <div className="mt-2 flex gap-2">
                <input
                    value={newElfName}
                    onChange={e => setNewElfName(e.target.value)}
                    placeholder="Wichtel-Name für Schnell-Erstellung"
                    className="flex-grow p-2 border border-[#e6dac0] rounded focus:border-elf-gold outline-none text-sm"
                />
            </div>
        </div>
      </div>

      {/* Wizard */}
      <ElfWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onCreateElf={handleWizardComplete}
        kids={state.kids}
      />
    </div>
  );
};

export default ElfSettings;