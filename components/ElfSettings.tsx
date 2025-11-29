import React from 'react';
import { ElfConfig, Kid, ArchivedYear } from '../types';

interface Props {
  config: ElfConfig;
  onUpdate: (newConfig: ElfConfig) => void;
  isSetup?: boolean;
  onComplete?: () => void;
  archives?: ArchivedYear[];
  onArchiveYear?: () => void;
}

const ELF_NAMES = [
  "Nisse", "Snorre", "Lasse", "Fiete", "Bosse", 
  "Jule", "Snickerdoodle", "Buddy", "Elvis", "Pepper", 
  "Sugar", "Twinkle", "Zippy", "Keks", "Krümel",
  "Fussel", "Schabernack", "Wobble", "Tinsel", "Pip",
  "Knopf", "Pixel", "Cookie", "Frosty", "Barnaby"
];

const ElfSettings: React.FC<Props> = ({ config, onUpdate, isSetup = false, onComplete, archives = [], onArchiveYear }) => {
  const [archiveSearchTerm, setArchiveSearchTerm] = React.useState('');

  const handleChange = (field: keyof ElfConfig, value: any) => {
    onUpdate({ ...config, [field]: value });
  };

  const handleKidChange = (index: number, field: keyof Kid, value: any) => {
    const newKids = [...config.kids];
    newKids[index] = { ...newKids[index], [field]: value };
    handleChange('kids', newKids);
  };

  const addKid = () => {
    handleChange('kids', [...config.kids, { name: '', age: 1, gender: 'boy' }]);
  };

  const removeKid = (index: number) => {
    const newKids = config.kids.filter((_, i) => i !== index);
    handleChange('kids', newKids);
  };

  const suggestName = () => {
    const random = ELF_NAMES[Math.floor(Math.random() * ELF_NAMES.length)];
    handleChange('name', random);
  };

  const isValid = config.name.trim().length > 0 && config.kids.every(k => k.name.trim().length > 0);

  const PERSONALITIES = [
      'frech und verspielt', 
      'lieb und fürsorglich', 
      'magisch und geheimnisvoll', 
      'tollpatschig',
      'abenteuerlustig und mutig',
      'kreativ und künstlerisch',
      'verfressen und gemütlich',
      'schlau und belesen',
      'verträumt und poetisch',
      'sportlich und aktiv',
      'musikalisch und laut',
      'alt und weise'
  ];

  // --- SPECIAL SETUP VIEW (Workshop Style) ---
  if (isSetup) {
      return (
          <div className="w-full max-w-2xl mx-auto px-2 md:px-0">
              <div className="bg-[#fcfaf2] rounded-2xl shadow-2xl overflow-hidden border-4 border-[#e6dac0] animate-slide-up relative">
                  {/* Decorative bolts */}
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#d4c5a5] shadow-inner"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#d4c5a5] shadow-inner"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#d4c5a5] shadow-inner"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#d4c5a5] shadow-inner"></div>

                  {/* Hero Header */}
                  <div className="bg-[#2d1b14] p-8 text-center relative overflow-hidden bg-wood-texture border-b-4 border-[#e6dac0]">
                      <div className="relative z-10">
                          <div className="w-24 h-24 bg-[#fcfaf2] rounded-full flex items-center justify-center text-elf-red mx-auto mb-4 shadow-lg border-4 border-elf-gold transform hover:rotate-12 transition-transform duration-500">
                              <span className="material-icons-round text-5xl">handyman</span>
                          </div>
                          <h1 className="text-3xl md:text-4xl font-serif font-bold text-elf-gold mb-2 shadow-sm drop-shadow-md">Wichtel-Werkstatt</h1>
                          <p className="text-amber-100/80 font-medium text-lg font-serif italic">Registrierungs-Formular</p>
                      </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-8 bg-parchment">
                      {/* Intro Text */}
                      <p className="text-slate-700 text-center leading-relaxed font-serif text-lg">
                          Willkommen! Damit wir den passenden Wichtel zuteilen können, benötigen wir ein paar Angaben für das Große Buch.
                      </p>

                      {/* Elf Name Section */}
                      <div className="bg-white p-6 rounded-xl border-2 border-dashed border-[#e6dac0] relative group hover:border-elf-gold transition-colors">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Name des Wichtels</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                              <input
                                  type="text"
                                  value={config.name}
                                  onChange={(e) => handleChange('name', e.target.value)}
                                  className="flex-1 p-4 border-2 border-[#e6dac0] rounded-xl focus:ring-0 focus:border-elf-gold outline-none text-xl text-center font-serif text-elf-dark shadow-sm bg-[#fafafa]"
                                  placeholder="Name eintragen..."
                                  autoFocus
                              />
                              <button 
                                  onClick={suggestName}
                                  className="bg-elf-gold text-elf-dark px-5 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                              >
                                  <span className="material-icons-round">auto_fix_high</span>
                                  <span>Zaubern</span>
                              </button>
                          </div>
                          
                          <div className="mt-6">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Charakter</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {PERSONALITIES.slice(0, 8).map((p) => { // Show 8 for variety
                                      return (
                                      <button
                                          key={p}
                                          onClick={() => handleChange('personality', p)}
                                          className={`p-2.5 text-sm rounded-lg border-2 text-center transition-all font-medium capitalize ${
                                              config.personality === p
                                              ? 'bg-elf-red text-white border-elf-red shadow-md transform scale-105' 
                                              : 'bg-white border-[#e6dac0] text-slate-600 hover:border-elf-gold hover:bg-[#fffdf5]'
                                          }`}
                                      >
                                          {p}
                                      </button>
                                  )})}
                              </div>
                          </div>
                      </div>

                      {/* Kids Section */}
                      <div>
                          <div className="flex justify-center mb-4">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#e6dac0] px-3 py-1 rounded-full">Die Kinder</label>
                          </div>
                          <div className="space-y-3">
                              {config.kids.map((kid, index) => (
                                  <div key={index} className="flex gap-3 items-center bg-white p-3 pr-4 rounded-xl border border-[#e6dac0] shadow-sm">
                                      <button 
                                        onClick={() => handleKidChange(index, 'gender', kid.gender === 'girl' ? 'boy' : 'girl')}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm border-2 border-white transition-colors ${kid.gender === 'girl' ? 'bg-pink-400 text-white' : 'bg-blue-400 text-white'}`}
                                        title="Geschlecht ändern"
                                      >
                                          <span className="material-icons-round text-lg">{kid.gender === 'girl' ? 'face_3' : 'face_6'}</span>
                                      </button>
                                      
                                      <div className="flex-1 flex flex-col justify-center">
                                          <input
                                              type="text"
                                              value={kid.name}
                                              onChange={(e) => handleKidChange(index, 'name', e.target.value)}
                                              placeholder="Vorname"
                                              className="w-full bg-transparent outline-none font-bold text-elf-dark placeholder-slate-300 text-lg font-serif"
                                          />
                                          <div className="flex items-center gap-1 border-t border-slate-100 pt-1 mt-1">
                                            <input
                                                type="number"
                                                value={kid.age}
                                                onChange={(e) => handleKidChange(index, 'age', parseInt(e.target.value) || 0)}
                                                className="w-12 bg-transparent outline-none text-sm text-slate-500 font-medium"
                                            />
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Jahre alt</span>
                                          </div>
                                      </div>
                                      
                                      {config.kids.length > 1 && (
                                          <button onClick={() => removeKid(index)} className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                                              <span className="material-icons-round text-lg">close</span>
                                          </button>
                                      )}
                                  </div>
                              ))}
                              <button onClick={addKid} className="w-full py-2 border-2 border-dashed border-elf-green/30 text-elf-green font-bold rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                                  <span className="material-icons-round text-base">add</span>
                                  Weiteres Kind eintragen
                              </button>
                          </div>
                      </div>

                       {/* Dates Section simplified for setup */}
                       <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer group text-center">
                                <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1">
                                    Einzug
                                </label>
                                <input 
                                    type="date" 
                                    value={config.arrivalDate} 
                                    onChange={(e) => handleChange('arrivalDate', e.target.value)}
                                    className="bg-transparent font-bold text-slate-800 outline-none w-full text-center cursor-pointer font-serif" 
                                />
                            </div>
                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 hover:border-red-300 transition-colors cursor-pointer group text-center">
                                <label className="text-[10px] font-bold text-red-800 uppercase block mb-1">
                                    Abreise
                                </label>
                                <input 
                                    type="date" 
                                    value={config.departureDate} 
                                    onChange={(e) => handleChange('departureDate', e.target.value)}
                                    className="bg-transparent font-bold text-slate-800 outline-none w-full text-center cursor-pointer font-serif" 
                                />
                            </div>
                       </div>

                      {/* Footer Action */}
                      <div className="pt-4">
                          <button 
                              onClick={onComplete}
                              disabled={!isValid}
                              className={`w-full py-4 rounded-xl font-bold text-xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 border-b-4 active:border-b-0 active:translate-y-1 ${
                                  isValid 
                                  ? 'bg-elf-red text-white hover:bg-red-700 shadow-red-200 hover:shadow-2xl border-red-800' 
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border-slate-300'
                              }`}
                          >
                              <span>Zauberei starten</span>
                              <span className="material-icons-round">arrow_forward</span>
                          </button>
                      </div>
                  </div>
              </div>
              <p className="text-center text-slate-400 text-xs mt-8 mb-4 font-serif italic">© WichtelWerkstatt • Offizielles Dokument</p>
          </div>
      );
  }

  // --- STANDARD SETTINGS VIEW ---
  const filteredArchives = archives
    .filter(a => a.year.toString().includes(archiveSearchTerm))
    .sort((a, b) => b.year - a.year);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e6dac0]">
        <h2 className="text-2xl font-bold text-elf-dark mb-6 flex items-center gap-3 pb-4 border-b border-slate-100 font-serif">
            <div className="w-10 h-10 bg-elf-dark text-elf-gold rounded-full flex items-center justify-center shadow-sm">
                <span className="material-icons-round">settings</span>
            </div>
            Werkstatt-Konfiguration
        </h2>
      
        <div className="space-y-8 text-left">
            {/* Section: Der Wichtel */}
            <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-elf-gold pl-2">Der Wichtel</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={config.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-elf-gold focus:border-transparent outline-none transition-shadow bg-[#fafafa]"
                                placeholder="z.B. Snickerdoodle"
                            />
                            <button 
                                onClick={suggestName}
                                className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 rounded-lg transition-colors border border-purple-100"
                                title="Name vorschlagen"
                            >
                                <span className="material-icons-round">auto_fix_high</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Persönlichkeit</label>
                        <select
                            value={config.personality}
                            onChange={(e) => handleChange('personality', e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-elf-gold outline-none bg-white capitalize"
                        >
                            {PERSONALITIES.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Section: Die Kinder */}
            <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-elf-gold pl-2">Die Kinder</h3>
                <div className="space-y-3 bg-[#fafafa] p-4 rounded-xl border border-slate-100">
                    {config.kids.map((kid, index) => (
                    <div key={index} className="flex gap-3">
                        <button 
                            onClick={() => handleKidChange(index, 'gender', kid.gender === 'girl' ? 'boy' : 'girl')}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold shrink-0 border transition-colors ${kid.gender === 'girl' ? 'bg-pink-100 text-pink-500 border-pink-200' : 'bg-blue-100 text-blue-500 border-blue-200'}`}
                            title={kid.gender === 'girl' ? 'Mädchen' : 'Junge'}
                        >
                            <span className="material-icons-round">{kid.gender === 'girl' ? 'face_3' : 'face_6'}</span>
                        </button>
                        <div className="flex-1">
                             <input
                                type="text"
                                value={kid.name}
                                onChange={(e) => handleKidChange(index, 'name', e.target.value)}
                                placeholder="Name"
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-elf-gold outline-none bg-white mb-1"
                            />
                        </div>
                        <div className="relative w-24">
                            <input
                            type="number"
                            value={kid.age}
                            onChange={(e) => handleKidChange(index, 'age', parseInt(e.target.value) || 0)}
                            placeholder="Alter"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-elf-gold outline-none bg-white"
                            />
                            <span className="absolute right-3 top-3.5 text-xs text-slate-400 pointer-events-none">J.</span>
                        </div>
                        <button 
                        onClick={() => removeKid(index)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={config.kids.length <= 1}
                        >
                        <span className="material-icons-round">delete</span>
                        </button>
                    </div>
                    ))}
                    <button 
                    onClick={addKid}
                    className="text-sm text-elf-green font-bold flex items-center gap-1 hover:text-green-800 px-1 py-1"
                    >
                    <span className="material-icons-round text-base">add_circle</span>
                    Kind hinzufügen
                    </button>
                </div>
            </section>

            {/* Section: Reiseplanung */}
            <section className="bg-[#fcfaf2] p-6 rounded-xl border border-[#e6dac0]">
                <h3 className="font-bold text-elf-dark mb-4 flex items-center gap-2 border-b border-[#e6dac0] pb-2">
                    <span className="material-icons-round text-elf-red">flight_takeoff</span>
                    Reiseplanung
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Einzug (Ankunft)</label>
                        <input
                            type="date"
                            value={config.arrivalDate}
                            onChange={(e) => handleChange('arrivalDate', e.target.value)}
                            className="w-full p-3 border border-[#e6dac0] rounded-lg focus:ring-2 focus:ring-elf-gold outline-none shadow-sm bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Auszug (Abschied)</label>
                        <input
                            type="date"
                            value={config.departureDate}
                            onChange={(e) => handleChange('departureDate', e.target.value)}
                            className="w-full p-3 border border-[#e6dac0] rounded-lg focus:ring-2 focus:ring-elf-gold outline-none shadow-sm bg-white"
                        />
                    </div>
                </div>
            </section>

             {/* Section: Saison/Archiv */}
             <section className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-slate-300 pl-2">Saison-Archiv</h3>
                
                {archives.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-xs font-bold text-slate-500">Gespeicherte Jahre</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Jahr suchen..." 
                                    value={archiveSearchTerm}
                                    onChange={(e) => setArchiveSearchTerm(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1 px-2 pl-7 focus:outline-none focus:ring-1 focus:ring-slate-300 w-32"
                                />
                                <span className="material-icons-round text-slate-400 text-sm absolute left-1.5 top-1.5">search</span>
                             </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {filteredArchives.length > 0 ? (
                                filteredArchives.map((arch) => (
                                <div key={arch.year} className="bg-white text-slate-600 px-3 py-1.5 rounded-lg text-sm border border-slate-200 flex items-center gap-2 shadow-sm">
                                    <span className="material-icons-round text-base text-slate-400">inventory</span>
                                    <span>Jahr {arch.year}</span>
                                    <span className="text-[10px] opacity-50 ml-1">({arch.calendar.filter(d => d.completed).length} Aktionen)</span>
                                </div>
                            ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">Keine Archive gefunden.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <h4 className="font-bold text-red-800 mb-1 flex items-center gap-2">
                        <span className="material-icons-round">update</span>
                        Neues Jahr starten
                    </h4>
                    <p className="text-sm text-red-700/80 mb-4 leading-relaxed">
                        Wenn die Adventszeit vorbei ist, kannst du das aktuelle Jahr archivieren. 
                        Der Kalender wird geleert, aber deine gesammelten Ideen bleiben erhalten.
                    </p>
                    <button 
                        onClick={() => {
                            if(window.confirm(`Möchtest du das aktuelle Jahr wirklich abschließen und archivieren? Der Kalender wird zurückgesetzt.`)) {
                                onArchiveYear?.();
                            }
                        }}
                        className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-icons-round">archive</span>
                        Jahr abschließen
                    </button>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default ElfSettings;