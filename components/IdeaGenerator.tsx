import React, { useState, useRef, useEffect } from 'react';
import { Idea, ElfConfig, Kid, CalendarDay } from '../types';
import { chatWithIdeaAssistant } from '../services/geminiService';
import IdeaWizard from './IdeaWizard';
import IdeaDetail from './IdeaDetail';
import ConfirmModal from './ConfirmModal';

interface Props {
  elfConfig: ElfConfig;
  onAddIdea: (idea: Idea) => void;
  onDeleteIdea: (ideaId: string) => void;
  existingIdeas: Idea[];
  kids: Kid[];
  calendar: CalendarDay[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ideas?: Idea[];
}

const IdeaGenerator: React.FC<Props> = ({ elfConfig, onAddIdea, onDeleteIdea, existingIdeas, kids, calendar }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      text: `Psst! Brauchst du Nachschub? Ich habe ein paar Tricks auf Lager.`,
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<'collection' | 'chat'>('collection');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIdeaWizard, setShowIdeaWizard] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Idea | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
        scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const excludeTitles = existingIdeas.map(i => i.title);

    const response = await chatWithIdeaAssistant(textToSend, history, elfConfig, kids, excludeTitles);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: response.reply,
      ideas: response.ideas
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmingDelete) {
        // Check if idea is used in calendar
        const isUsedInCalendar = calendar.some(day => day.idea?.id === confirmingDelete.id);

        if (!isUsedInCalendar) {
            onDeleteIdea(confirmingDelete.id);
        }
        setConfirmingDelete(null);
    }
  };

  const isIdeaUsedInCalendar = (ideaId: string) => {
    return calendar.some(day => day.idea?.id === ideaId);
  };

  const QUICK_PROMPTS = [
    "Einzug",
    "Abschied",
    "Schnell",
    "Lustig",
    "Magisch",
    "Basteln",
    "Küche",
    "Frech"
  ];

  const filteredSavedIdeas = existingIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (idea.materials || []).some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-7xl mx-auto bg-[#e6dac0] rounded-xl shadow-2xl overflow-hidden border-4 border-[#5d4037] relative">
      
      {selectedIdea && (
        <IdeaDetail 
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
            onAdd={(idea) => { onAddIdea(idea); setSelectedIdea(null); }}
            isSaved={existingIdeas.some(i => i.id === selectedIdea.id)}
        />
      )}

      {confirmingDelete && (() => {
          const isUsed = isIdeaUsedInCalendar(confirmingDelete.id);
          return (
              <ConfirmModal
                  title={isUsed ? "Idee wird verwendet!" : "Idee löschen?"}
                  message={isUsed
                      ? `Die Idee "${confirmingDelete.title}" wird im Planer verwendet und kann erst gelöscht werden, wenn sie aus dem Planer entfernt wurde.`
                      : `Möchtest du die Idee "${confirmingDelete.title}" wirklich löschen?`}
                  onConfirm={isUsed ? () => setConfirmingDelete(null) : handleDeleteConfirm}
                  onCancel={() => setConfirmingDelete(null)}
                  confirmLabel={isUsed ? "OK" : undefined}
              />
          );
      })()}

      {/* Wooden Header Frame */}
      <div className="bg-wood-texture p-4 border-b-4 border-[#2d1b14] flex justify-between items-center shadow-lg relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-elf-red rounded shadow-wood-bezel flex items-center justify-center border-2 border-[#b91c1c]">
                 <span className="material-icons-round text-white">menu_book</span>
             </div>
             <div>
                 <h2 className="text-xl font-serif font-bold text-amber-100 text-shadow">Ideen-Katalog</h2>
                 <p className="hidden md:block text-xs text-amber-200/70 uppercase tracking-widest">Archiv & Inspiration</p>
             </div>
          </div>

          {/* Search Bar - styled like engraved wood */}
          <div className="hidden md:flex relative w-64 lg:w-96">
                <span className="material-icons-round absolute left-3 top-2.5 text-[#5d4037]/50 text-lg">search</span>
                <input 
                    type="text"
                    placeholder="In Sammlung suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#d4c5a5] pl-10 pr-4 py-2 rounded-lg text-sm text-[#2d1b14] placeholder-[#5d4037]/50 border-b border-white/20 shadow-inner-deep focus:outline-none focus:bg-[#fcfaf2] transition-colors"
                />
          </div>

           {/* Mobile Tab Switcher */}
           <div className="flex md:hidden bg-[#2d1b14] p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('collection')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'collection' ? 'bg-[#fcfaf2] text-elf-dark shadow-sm' : 'text-amber-100/50'}`}
              >
                  Sammlung
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-elf-gold text-elf-dark shadow-sm' : 'text-amber-100/50'}`}
              >
                  Assistent
              </button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative bg-[#fcfaf2]">
        
        {/* LEFT COLUMN: Main Collection (Saved Ideas) */}
        <div className={`flex-1 flex flex-col min-w-0 bg-parchment ${activeTab === 'collection' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* Mobile Search (visible only on mobile) */}
            <div className="md:hidden p-3 bg-[#e6dac0] border-b border-[#d4c5a5]">
                <input 
                    type="text"
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white p-2 rounded text-sm shadow-inner"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                 <div className="flex justify-end mb-4">
                     <button 
                         onClick={() => setShowIdeaWizard(true)} // Open wizard
                         className="bg-elf-green text-white px-4 py-2 rounded font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-2"
                     >
                         <span className="material-icons-round text-sm">add</span>
                         Eigene Idee
                     </button>
                 </div>
                 {filteredSavedIdeas.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                         <span className="material-icons-round text-6xl mb-2 text-[#d4c5a5]">inventory_2</span>
                         <p className="font-serif italic text-lg text-[#a08c6c]">Das Regal ist leer.</p>
                         <p className="text-sm">Frag den Assistenten nach neuen Plänen!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {filteredSavedIdeas.map(idea => (
                            <div 
                                key={idea.id} 
                                onClick={() => setSelectedIdea(idea)}
                                className="bg-white p-5 rounded-2xl border-2 border-[#e6dac0] shadow-md relative group hover:border-elf-gold transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col h-full cursor-pointer"
                            >
                                {/* Tape effect */}
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-yellow-100/50 border-l border-r border-white/40 rotate-1 shadow-sm opacity-80"></div>

                                <div className="absolute top-2 right-2 flex gap-1">
                                    {idea.isUserCreated && (
                                        <span className="material-icons-round text-xs bg-green-100 text-green-700 rounded-full p-0.5" title="Eigene Idee">person</span>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmingDelete(idea); }}
                                        className="material-icons-round text-xs bg-red-100 text-red-700 rounded-full p-0.5 opacity-50 hover:opacity-100"
                                        title="Löschen"
                                    >
                                        delete
                                    </button>
                                </div>
                                
                                <div className="mb-2 pr-6">
                                    <h3 className="font-bold text-lg text-elf-dark font-serif leading-tight">{idea.title}</h3>
                                </div>

                                {idea.type === 'arrival' && <div className="absolute -right-1 top-4 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 shadow-sm transform rotate-3 rounded-sm">EINZUG</div>}
                                {idea.type === 'departure' && <div className="absolute -right-1 top-4 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 shadow-sm transform rotate-3 rounded-sm">ABSCHIED</div>}

                                <p className="text-sm text-slate-600 mb-4 flex-grow leading-relaxed font-serif text-justify">
                                    {idea.description}
                                </p>

                                <div className="mt-auto pt-3 border-t border-dashed border-slate-200">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {(idea.materials || []).slice(0, 3).map((m, i) => (
                                            <span key={i} className="text-[10px] bg-[#f9f5e6] px-2 py-1 rounded-full text-[#855E42] border border-[#e6dac0]">{m}</span>
                                        ))}
                                        {(idea.materials || []).length > 3 && <span className="text-[10px] text-slate-400 self-center">+{(idea.materials || []).length - 3}</span>}
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400">
                                        <span className={`flex items-center gap-1 ${
                                            idea.effort === 'niedrig' ? 'text-green-600' : idea.effort === 'mittel' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            <span className="material-icons-round text-sm">schedule</span> {idea.effort}
                                        </span>
                                        <span>{idea.messiness}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-[#e6dac0] border-t border-[#d4c5a5] text-center text-xs font-bold text-[#855E42] uppercase tracking-wider">
                {filteredSavedIdeas.length} Baupläne archiviert
            </div>
        </div>

        {/* RIGHT COLUMN: AI Assistant (Sidebar style) */}
        <div className={`w-full md:w-80 lg:w-96 bg-[#2d1b14] border-l-4 border-[#5d4037] flex-col shadow-2xl z-20 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-3 bg-[#3e2720] border-b border-[#5d4037] flex items-center gap-2">
                <span className="material-icons-round text-elf-gold animate-pulse">auto_awesome</span>
                <h3 className="text-amber-100 font-bold text-sm uppercase tracking-wide">Ideen-Generator</h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-wood-texture">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                            max-w-[90%] p-3 text-sm rounded-lg shadow-md relative
                            ${msg.role === 'user' 
                                ? 'bg-elf-red text-white rounded-tr-none border border-red-800' 
                                : 'bg-[#fffdf5] text-[#2d1b14] border border-[#d4c5a5] rounded-tl-none font-serif'}
                        `}>
                            {msg.text}
                        </div>

                        {/* Generated Ideas in Chat */}
                        {msg.ideas && (
                            <div className="mt-2 w-full space-y-2">
                                {msg.ideas.map(idea => {
                                    const isSaved = existingIdeas.some(i => i.title === idea.title);
                                    return (
                                        <div
                                            key={idea.id}
                                            onClick={() => setSelectedIdea(idea)}
                                            className="bg-[#fcfaf2] p-2.5 rounded-xl border border-slate-300 shadow-sm text-left cursor-pointer hover:border-elf-gold hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-elf-dark text-xs">{idea.title}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isSaved) onAddIdea(idea);
                                                    }}
                                                    disabled={isSaved}
                                                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase transition-colors ${
                                                        isSaved
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-elf-gold text-elf-dark hover:bg-yellow-300 shadow-sm'
                                                    }`}
                                                >
                                                    {isSaved ? 'Drin' : 'Speichern'}
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{idea.description}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-1 justify-center py-2">
                        <div className="w-2 h-2 bg-elf-gold rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-elf-gold rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-elf-gold rounded-full animate-bounce delay-200"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#3e2720] border-t border-[#5d4037] space-y-2">
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {QUICK_PROMPTS.map(p => (
                        <button 
                            key={p} 
                            onClick={() => handleSend(p)}
                            disabled={loading}
                            className="bg-[#5d4037] text-amber-100 text-[10px] px-2 py-1 rounded border border-[#755246] hover:bg-[#755246] whitespace-nowrap"
                        >
                            {p}
                        </button>
                    ))}
                 </div>
                 <div className="flex gap-2">
                     <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Neue Anfrage..."
                        className="flex-1 bg-[#2d1b14] text-amber-50 border border-[#5d4037] rounded p-2 text-sm shadow-inner focus:border-elf-gold outline-none placeholder-white/20"
                     />
                     <button 
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="bg-elf-gold text-elf-dark w-10 h-10 rounded flex items-center justify-center shadow-lg border-b-2 border-yellow-700 active:border-b-0 active:translate-y-[2px]"
                     >
                         <span className="material-icons-round text-lg">send</span>
                     </button>
                 </div>
            </div>
        </div>
      </div>
      {showIdeaWizard && (
          <IdeaWizard onComplete={(idea) => { onAddIdea(idea); setShowIdeaWizard(false); }} onCancel={() => setShowIdeaWizard(false)} />
      )}
    </div>
  );
};

export default IdeaGenerator;