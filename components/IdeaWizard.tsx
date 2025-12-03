import React, { useState } from 'react';
import { Idea } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    onComplete: (idea: Idea) => void;
    onCancel: () => void;
}

const IdeaWizard: React.FC<Props> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [materials, setMaterials] = useState('');
    const [effort, setEffort] = useState<'niedrig' | 'mittel' | 'hoch'>('mittel');
    const [messiness, setMessiness] = useState<'sauber' | 'etwas chaos' | 'chaos pur'>('sauber');
    const [type, setType] = useState<'normal' | 'arrival' | 'departure'>('normal');

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = () => {
        const newIdea: Idea = {
            id: uuidv4(),
            title,
            description,
            materials: materials.split(',').map(m => m.trim()).filter(m => m.length > 0),
            effort,
            messiness,
            type
        };
        onComplete(newIdea);
    };

    const isStepOneValid = title.trim() !== '' && description.trim() !== '';

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#fcfaf2] w-full max-w-lg rounded shadow-2xl animate-slide-up border-4 border-[#2d1b14] flex flex-col max-h-[90vh]">
                <div className="p-4 border-b-2 border-[#e6dac0] flex justify-between items-center bg-[#f9f5e6]">
                    <h3 className="font-bold text-xl text-elf-dark font-serif">Neue Idee erstellen (Schritt {step} / 3)</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-[#e6dac0] rounded-full">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 space-y-4 bg-parchment">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-elf-dark">Was ist der Schabernack?</h4>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Titel der Idee</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="Ein kurzer, prägnanter Name"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Beschreibung</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Erzähle, was passiert..."
                                    rows={4}
                                    className="w-full p-2 border rounded resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-elf-dark">Details zur Umsetzung</h4>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Benötigte Materialien (Komma-getrennt)</label>
                                <input 
                                    type="text" 
                                    value={materials} 
                                    onChange={(e) => setMaterials(e.target.value)} 
                                    placeholder="Glitzer, Mehl, Klopapier..."
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Aufwand</label>
                                <select value={effort} onChange={(e) => setEffort(e.target.value as any)} className="w-full p-2 border rounded">
                                    <option value="niedrig">Niedrig (0-5 Min)</option>
                                    <option value="mittel">Mittel (5-15 Min)</option>
                                    <option value="hoch">Hoch (>15 Min)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Chaos-Faktor</label>
                                <select value={messiness} onChange={(e) => setMessiness(e.target.value as any)} className="w-full p-2 border rounded">
                                    <option value="sauber">Sauber</option>
                                    <option value="etwas chaos">Etwas Chaos</option>
                                    <option value="chaos pur">Chaos pur</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-elf-dark">Kategorie</h4>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Typ der Idee</label>
                                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full p-2 border rounded">
                                    <option value="normal">Normaler Schabernack</option>
                                    <option value="arrival">Einzug des Wichtels</option>
                                    <option value="departure">Abschied des Wichtels</option>
                                </select>
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                <p className="font-bold">Zusammenfassung:</p>
                                <p>Titel: {title}</p>
                                <p>Beschreibung: {description}</p>
                                <p>Materialien: {materials || 'Keine'}</p>
                                <p>Aufwand: {effort}</p>
                                <p>Chaos: {messiness}</p>
                                <p>Typ: {type}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t-2 border-[#e6dac0] flex justify-between bg-[#f9f5e6]">
                    <button 
                        onClick={handleBack} 
                        disabled={step === 1}
                        className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
                    >
                        Zurück
                    </button>
                    {step < 3 ? (
                        <button 
                            onClick={handleNext} 
                            disabled={step === 1 && !isStepOneValid}
                            className="px-4 py-2 bg-elf-gold text-elf-dark rounded disabled:opacity-50"
                        >
                            Weiter
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            className="px-4 py-2 bg-elf-red text-white rounded"
                        >
                            Idee speichern
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdeaWizard;
