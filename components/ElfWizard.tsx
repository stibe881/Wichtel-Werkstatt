import React, { useState } from 'react';
import { ElfConfig } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreateElf: (elf: Omit<ElfConfig, 'id'>) => void;
    kids: { id: string; name: string }[];
}

type WizardStep = 'name' | 'personality' | 'dates' | 'kids' | 'review';

interface ElfPersonality {
    traits: string[];
    favoriteActivity: string;
    quirk: string;
}

const ElfWizard: React.FC<Props> = ({ isOpen, onClose, onCreateElf, kids }) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>('name');
    const [name, setName] = useState('');
    const [isGeneratingName, setIsGeneratingName] = useState(false);
    const [personality, setPersonality] = useState<ElfPersonality>({
        traits: [],
        favoriteActivity: '',
        quirk: ''
    });
    const [arrivalDate, setArrivalDate] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [selectedKids, setSelectedKids] = useState<string[]>([]);

    const traitOptions = [
        'Lustig', 'Frech', 'Ordentlich', 'Chaotisch', 'Künstlerisch',
        'Sportlich', 'Neugierig', 'Schüchtern', 'Mutig', 'Verspielt'
    ];

    const activityOptions = [
        'Backen', 'Basteln', 'Verstecken spielen', 'Briefe schreiben',
        'Dekorieren', 'Streiche spielen', 'Singen', 'Tanzen'
    ];

    const handleGenerateName = async () => {
        setIsGeneratingName(true);
        try {
            const traitsText = personality.traits.length > 0
                ? `Der Wichtel ist ${personality.traits.join(', ')}.`
                : 'Der Wichtel ist ein magischer Nordpol-Helfer.';

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Generiere einen kreativen, niedlichen Wichtel-Namen für einen Weihnachtswichtel mit folgenden Eigenschaften: ${traitsText}.

                    Der Name sollte:
                    - Süß und kinderfreundlich sein
                    - Zum Charakter passen
                    - Nur der Vorname (kein Nachname)

                    Antworte NUR mit dem Namen, ohne zusätzliche Erklärung.`,
                    schema: null
                })
            });

            if (response.ok) {
                const data = await response.json();
                const generatedName = data.text.trim().replace(/^["']|["']$/g, '');
                setName(generatedName);
            }
        } catch (error) {
            console.error('Error generating name:', error);
            setName('Wichtel-' + Math.floor(Math.random() * 100));
        } finally {
            setIsGeneratingName(false);
        }
    };

    const toggleTrait = (trait: string) => {
        setPersonality(prev => ({
            ...prev,
            traits: prev.traits.includes(trait)
                ? prev.traits.filter(t => t !== trait)
                : [...prev.traits, trait]
        }));
    };

    const handleNext = () => {
        const steps: WizardStep[] = ['name', 'personality', 'dates', 'kids', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: WizardStep[] = ['name', 'personality', 'dates', 'kids', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const handleComplete = () => {
        const newElf: Omit<ElfConfig, 'id'> = {
            name,
            kidIds: selectedKids,
            arrivalDate: arrivalDate || new Date().toISOString(),
            departureDate: departureDate || new Date(new Date().getFullYear(), 11, 24).toISOString(),
            personality
        };
        onCreateElf(newElf);
        onClose();
    };

    const isStepComplete = () => {
        switch (currentStep) {
            case 'name': return name.trim().length > 0;
            case 'personality': return personality.traits.length > 0;
            case 'dates': return arrivalDate && departureDate;
            case 'kids': return true; // Optional
            case 'review': return true;
            default: return false;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#fcfaf2] w-full max-w-2xl rounded-xl shadow-2xl border-4 border-[#2d1b14] flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b-2 border-[#e6dac0] bg-gradient-to-r from-elf-red to-elf-green">
                    <h2 className="text-2xl font-bold font-serif text-white text-center flex items-center justify-center gap-2">
                        <span className="material-icons-round">auto_awesome</span>
                        Wichtel-Ersteller Wizard
                    </h2>
                    <div className="flex justify-center gap-2 mt-4">
                        {['name', 'personality', 'dates', 'kids', 'review'].map((step, index) => (
                            <div
                                key={step}
                                className={`w-8 h-1 rounded-full transition-all ${
                                    currentStep === step ? 'bg-elf-gold' : 'bg-white/30'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#e6dac0]">
                    {/* Step 1: Name */}
                    {currentStep === 'name' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">🎅</div>
                                <h3 className="text-xl font-bold text-elf-dark mb-2">Wie soll dein Wichtel heißen?</h3>
                                <p className="text-sm text-slate-600">Gib einen Namen ein oder lass die KI einen für dich generieren!</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0]">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Wichtel-Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="z.B. Schneeflöckchen, Zimtstern..."
                                    className="w-full p-3 border-2 border-[#e6dac0] rounded-lg focus:border-elf-gold outline-none text-lg font-serif"
                                />
                            </div>

                            <button
                                onClick={handleGenerateName}
                                disabled={isGeneratingName}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isGeneratingName ? (
                                    <>
                                        <span className="material-icons-round animate-spin">autorenew</span>
                                        Generiere magischen Namen...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-round">auto_awesome</span>
                                        ✨ Wichtel-Zauber: Namen erschaffen
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personality */}
                    {currentStep === 'personality' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">✨</div>
                                <h3 className="text-xl font-bold text-elf-dark mb-2">Persönlichkeit von {name || 'deinem Wichtel'}</h3>
                                <p className="text-sm text-slate-600">Wähle Eigenschaften, die zu deinem Wichtel passen!</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0]">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Charakter-Eigenschaften</label>
                                <div className="flex flex-wrap gap-2">
                                    {traitOptions.map(trait => (
                                        <button
                                            key={trait}
                                            onClick={() => toggleTrait(trait)}
                                            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                                personality.traits.includes(trait)
                                                    ? 'bg-elf-gold text-elf-dark'
                                                    : 'bg-[#e6dac0] text-[#855E42] hover:bg-[#d4c5a5]'
                                            }`}
                                        >
                                            {trait}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0]">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Lieblingsbeschäftigung</label>
                                <select
                                    value={personality.favoriteActivity}
                                    onChange={(e) => setPersonality(prev => ({ ...prev, favoriteActivity: e.target.value }))}
                                    className="w-full p-3 border-2 border-[#e6dac0] rounded-lg focus:border-elf-gold outline-none"
                                >
                                    <option value="">-- Wähle eine Aktivität --</option>
                                    {activityOptions.map(activity => (
                                        <option key={activity} value={activity}>{activity}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0]">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Besondere Eigenart/Marotte</label>
                                <input
                                    type="text"
                                    value={personality.quirk}
                                    onChange={(e) => setPersonality(prev => ({ ...prev, quirk: e.target.value }))}
                                    placeholder="z.B. Sammelt Glitzersterne, spricht in Reimen..."
                                    className="w-full p-3 border-2 border-[#e6dac0] rounded-lg focus:border-elf-gold outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Dates */}
                    {currentStep === 'dates' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-bold text-elf-dark mb-2">Wann kommt {name}?</h3>
                                <p className="text-sm text-slate-600">Lege den Zeitraum für den Wichtel-Besuch fest.</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0]">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Ankunftsdatum</label>
                                <input
                                    type="date"
                                    value={arrivalDate}
                                    onChange={(e) => setArrivalDate(e.target.value)}
                                    className="w-full p-3 border-2 border-[#e6dac0] rounded-lg focus:border-elf-gold outline-none"
                                />
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0]">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Abreisedatum</label>
                                <input
                                    type="date"
                                    value={departureDate}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    className="w-full p-3 border-2 border-[#e6dac0] rounded-lg focus:border-elf-gold outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Kids */}
                    {currentStep === 'kids' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                                <h3 className="text-xl font-bold text-elf-dark mb-2">Welche Kinder betreut {name}?</h3>
                                <p className="text-sm text-slate-600">Wähle die Kinder aus, für die dieser Wichtel zuständig ist.</p>
                            </div>

                            {kids.length === 0 ? (
                                <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-xl text-center">
                                    <span className="material-icons-round text-yellow-600 text-5xl mb-2">warning</span>
                                    <p className="text-slate-700 font-bold">Noch keine Kinder angelegt!</p>
                                    <p className="text-sm text-slate-600 mt-2">Du kannst später Kinder zuordnen.</p>
                                </div>
                            ) : (
                                <div className="bg-white p-4 rounded-xl border-2 border-[#e6dac0] space-y-3">
                                    {kids.map(kid => (
                                        <label
                                            key={kid.id}
                                            className="flex items-center gap-3 p-3 border-2 border-[#e6dac0] rounded-lg cursor-pointer hover:bg-[#f9f5e6] transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedKids.includes(kid.id)}
                                                onChange={() => {
                                                    setSelectedKids(prev =>
                                                        prev.includes(kid.id)
                                                            ? prev.filter(id => id !== kid.id)
                                                            : [...prev, kid.id]
                                                    );
                                                }}
                                                className="w-5 h-5"
                                            />
                                            <span className="font-bold text-lg">{kid.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 'review' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">🎁</div>
                                <h3 className="text-xl font-bold text-elf-dark mb-2">Wichtel-Profil Übersicht</h3>
                                <p className="text-sm text-slate-600">Überprüfe die Angaben und erstelle deinen Wichtel!</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border-2 border-elf-gold space-y-4">
                                <div className="text-center pb-4 border-b border-[#e6dac0]">
                                    <div className="text-5xl mb-2">🎅</div>
                                    <h4 className="text-2xl font-bold text-elf-dark font-serif">{name}</h4>
                                </div>

                                <div>
                                    <h5 className="font-bold text-sm text-slate-600 mb-2">Persönlichkeit</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {personality.traits.map(trait => (
                                            <span key={trait} className="bg-elf-gold text-elf-dark px-3 py-1 rounded-full text-sm font-bold">
                                                {trait}
                                            </span>
                                        ))}
                                    </div>
                                    {personality.favoriteActivity && (
                                        <p className="text-sm text-slate-700 mt-2">
                                            <strong>Lieblingsbeschäftigung:</strong> {personality.favoriteActivity}
                                        </p>
                                    )}
                                    {personality.quirk && (
                                        <p className="text-sm text-slate-700 mt-1">
                                            <strong>Eigenart:</strong> {personality.quirk}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <h5 className="font-bold text-sm text-slate-600 mb-2">Zeitraum</h5>
                                    <p className="text-sm text-slate-700">
                                        <strong>Ankunft:</strong> {new Date(arrivalDate).toLocaleDateString('de-DE')}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                        <strong>Abreise:</strong> {new Date(departureDate).toLocaleDateString('de-DE')}
                                    </p>
                                </div>

                                {selectedKids.length > 0 && (
                                    <div>
                                        <h5 className="font-bold text-sm text-slate-600 mb-2">Zugeordnete Kinder</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {kids.filter(k => selectedKids.includes(k.id)).map(kid => (
                                                <span key={kid.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                    {kid.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-[#e6dac0] flex justify-between bg-[#f9f5e6]">
                    <button
                        onClick={currentStep === 'name' ? onClose : handleBack}
                        className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                    >
                        {currentStep === 'name' ? 'Abbrechen' : 'Zurück'}
                    </button>

                    {currentStep === 'review' ? (
                        <button
                            onClick={handleComplete}
                            className="px-6 py-2 bg-gradient-to-r from-elf-red to-elf-green text-white rounded-lg font-bold hover:shadow-lg transition-all"
                        >
                            ✨ Wichtel erstellen!
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!isStepComplete()}
                            className="px-6 py-2 bg-elf-gold text-elf-dark rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Weiter
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ElfWizard;
