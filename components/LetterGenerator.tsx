import React, { useState } from 'react';
import { ElfConfig } from '../types';
import { generateElfLetter } from '../services/geminiService';

interface Props {
  elfConfig: ElfConfig;
}

const LetterGenerator: React.FC<Props> = ({ elfConfig }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('magisch');
  const [voice, setVoice] = useState('fröhlich');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await generateElfLetter(elfConfig, topic, tone, voice);
    setLetter(result);
    setLoading(false);
  };

  const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
              <html>
                  <head>
                      <title>Brief von ${elfConfig.name}</title>
                      <style>
                          body { 
                              margin: 0;
                              padding: 20px;
                              background-color: white; 
                              font-family: 'Times New Roman', serif;
                          }
                          /* THE SCROLL LETTER CONTAINER */
                          .scroll-letter { 
                              width: 80mm; /* Narrow width for scroll format */
                              margin: 0 auto;
                              padding: 10mm 5mm;
                              /* border: 1px dashed #ccc; Optional cutting guide */
                              font-size: 11pt; 
                              line-height: 1.5;
                              text-align: justify;
                              color: #2d1b14;
                              page-break-inside: avoid; /* Prevent cutting in half */
                          }
                          .header { 
                              text-align: center; 
                              font-weight: bold; 
                              font-size: 14pt; 
                              color: #D42426; 
                              margin-bottom: 5mm; 
                              text-transform: uppercase;
                              letter-spacing: 2px;
                          }
                          .content { white-space: pre-wrap; }
                          .signature { 
                              margin-top: 8mm; 
                              text-align: center; 
                              font-style: italic; 
                              font-weight: bold; 
                              font-size: 14pt; 
                              color: #D42426; 
                              font-family: 'Brush Script MT', cursive;
                          }
                          .deco { text-align: center; font-size: 20pt; color: #D42426; margin: 10px 0; opacity: 0.6; }
                          
                          @media print {
                              body { background: none; }
                              .no-print { display: none; }
                              /* Ensure it fits on one page */
                              .scroll-letter { page-break-inside: avoid; }
                          }
                      </style>
                  </head>
                  <body>
                      <div class="no-print" style="text-align: center; font-family: sans-serif; padding: 10px; background: #eee; border-bottom: 1px solid #ccc;">
                        <b>Druckvorschau:</b> Dieser Brief ist schmal formatiert (8cm breit).<br>
                        Nach dem Drucken einfach ausschneiden und zusammenrollen wie eine Schriftrolle!
                      </div>

                      <div class="scroll-letter">
                          <div class="header">🌟 Post vom Nordpol 🌟</div>
                          <div class="content">${letter}</div>
                          <div class="deco">~ ❄ ~</div>
                          <div class="signature">Dein ${elfConfig.name}</div>
                      </div>
                      <script>window.onload = function() { window.print(); }</script>
                  </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-[#e6dac0] h-fit overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold text-elf-dark mb-6 flex items-center gap-2 font-serif">
          <span className="material-icons-round text-elf-red">edit_note</span>
          Brief-Auftrag
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Worum geht es?</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="z.B. Ich bin angekommen, Zimmer aufräumen, Frohe Weihnachten..."
              className="w-full p-3 border border-slate-200 rounded-lg h-24 md:h-32 resize-none focus:ring-2 focus:ring-elf-gold outline-none bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tonfall</label>
                <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg outline-none text-sm bg-white"
                >
                <option value="magisch">Magisch</option>
                <option value="lustig">Lustig/Albern</option>
                <option value="streng">Streng (Warnung)</option>
                <option value="reimend">In Reimen</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stimme</label>
                <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg outline-none text-sm bg-white"
                >
                <option value="fröhlich">Fröhlich</option>
                <option value="verschlafen">Verschlafen</option>
                <option value="aufgeregt">Aufgeregt!</option>
                <option value="flüsternd">Geheimnisvoll</option>
                <option value="singend">Singend</option>
                </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
              loading || !topic 
              ? 'bg-slate-300 border-slate-400' 
              : 'bg-elf-red hover:bg-red-700 border-red-800 shadow-md'
            }`}
          >
            {loading ? 'Wichtel schreibt...' : 'Brief verfassen'}
          </button>
        </div>

        <div className="mt-6 md:mt-8 space-y-2">
            <h3 className="font-semibold text-slate-700 text-sm font-serif">Schnellwahl:</h3>
            {['Ankunftsbrief', 'Abschiedsbrief', 'Warnung: Zähne putzen!', 'Lob für braves Verhalten'].map(t => (
                <button 
                    key={t}
                    onClick={() => setTopic(t)}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-[#fcfaf2] rounded border border-transparent hover:border-[#e6dac0] transition-colors"
                >
                    {t}
                </button>
            ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-[#fcfaf2] p-8 rounded-xl shadow-md border-2 border-[#e6dac0] overflow-y-auto relative min-h-[400px] flex flex-col bg-parchment">
        
        {letter ? (
          <div className="flex-1 flex flex-col">
             {/* Print Button */}
             <div className="absolute top-4 right-4 print:hidden">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-1 bg-elf-gold text-elf-dark px-4 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                >
                    <span className="material-icons-round">print</span>
                    <span className="text-xs">Drucken (Schriftrolle)</span>
                </button>
             </div>

            <div className="prose prose-slate max-w-none flex-1 p-4 md:p-8">
                <div className="text-center mb-6 opacity-30 select-none">
                     <span className="material-icons-round text-6xl text-elf-red">ac_unit</span>
                </div>
                <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap text-slate-800 drop-shadow-sm text-justify">
                {letter}
                </div>
                <div className="mt-12 pt-8 border-t border-[#e6dac0] flex justify-end">
                    <span className="font-handwriting text-3xl text-elf-red transform -rotate-6 block pr-8">
                        Dein {elfConfig.name}
                    </span>
                </div>
            </div>
            
            <div className="flex justify-start pt-4 border-t border-slate-100 print:hidden">
                 <button 
                    onClick={() => navigator.clipboard.writeText(letter)}
                    className="text-slate-400 hover:text-elf-gold text-sm flex items-center gap-1"
                >
                    <span className="material-icons-round text-base">content_copy</span>
                    Text kopieren
                </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#d4c5a5]">
            <span className="material-icons-round text-6xl mb-4">history_edu</span>
            <p className="font-serif italic text-lg">Warte auf Inspiration...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterGenerator;