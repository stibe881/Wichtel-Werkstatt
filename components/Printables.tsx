import React, { useState } from 'react';
import { ElfConfig } from '../types';

interface Props {
    elfConfig: ElfConfig;
}

type PrintableCategory = 'official' | 'fun' | 'craft';

interface PrintableItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: PrintableCategory;
    colorClass: string;
}

const Printables: React.FC<Props> = ({ elfConfig }) => {
    const [warningReason, setWarningReason] = useState('Zimmer aufräumen!');
    const [filter, setFilter] = useState<'all' | PrintableCategory>('all');

    const ITEMS: PrintableItem[] = [
        { id: 'cert', title: 'Brav-Urkunde', description: 'Offizielle Bestätigung vom Nordpol.', icon: 'workspace_premium', category: 'official', colorClass: 'border-elf-gold bg-[#fffdf5]' },
        { id: 'warn', title: 'Gelbe Karte', description: 'Verwarnung für Unfug (Text anpassbar).', icon: 'warning_amber', category: 'official', colorClass: 'border-black bg-yellow-100' },
        { id: 'idcard', title: 'Wichtel-Ausweis', description: 'Offizieller Dienstausweis.', icon: 'badge', category: 'official', colorClass: 'border-blue-800 bg-blue-50' },
        { id: 'construction', title: 'Baustelle', description: 'Schild: Hier werkelt der Wichtel.', icon: 'construction', category: 'fun', colorClass: 'border-orange-500 bg-orange-50' },
        { id: 'stationery', title: 'Briefpapier', description: 'Leeres Papier mit Wichtel-Rand.', icon: 'edit_note', category: 'craft', colorClass: 'border-red-800 bg-white' },
        { id: 'coloring', title: 'Malvorlage', description: 'Wichteltür zum Ausmalen.', icon: 'palette', category: 'fun', colorClass: 'border-green-600 bg-white' },
    ];
    
    const printCertificate = () => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Urkunde</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: 'Georgia', serif; text-align: center; }
                        .cert { 
                            border: 20px solid #D42426; 
                            margin: 20px; 
                            padding: 40px; 
                            min-height: 80vh; 
                            background: #fffdf5; 
                            position: relative;
                        }
                        .cert::before { content: '★'; position: absolute; top: 10px; left: 10px; font-size: 40px; color: #D42426; }
                        .cert::after { content: '★'; position: absolute; bottom: 10px; right: 10px; font-size: 40px; color: #D42426; }
                        h1 { font-size: 60px; color: #D42426; margin-bottom: 10px; text-transform: uppercase; }
                        h2 { font-size: 30px; color: #1a1a1a; font-weight: normal; margin-top: 0; }
                        .name { font-size: 50px; color: #855E42; margin: 40px 0; font-weight: bold; border-bottom: 2px solid #ccc; display: inline-block; padding: 0 40px; }
                        .text { font-size: 24px; color: #555; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                        .seal { margin-top: 60px; font-size: 80px; color: gold; text-shadow: 2px 2px 0 #ccc; }
                        .sig { margin-top: 40px; font-size: 30px; font-style: italic; color: #D42426; }
                    </style>
                </head>
                <body>
                    <div class="cert">
                        <h1>Offizielle Urkunde</h1>
                        <h2>vom Nordpol Management</h2>
                        <div class="text">Hiermit wird bestätigt, dass</div>
                        <div class="name">${elfConfig.kids.map(k => k.name).join(' & ')}</div>
                        <div class="text">offiziell auf der Liste der braven Kinder stehen! Der Wichtel <b>${elfConfig.name}</b> hat die Fröhlichkeit und Hilfsbereitschaft bestätigt.</div>
                        <div class="seal">♛</div>
                        <div class="sig">Gezeichnet: Santa Claus</div>
                    </div>
                    <script>window.onload = function(){ window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const printWarning = () => {
        const reason = warningReason || "ZIMMER AUFRÄUMEN!";
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Warnung</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; background: #fff; padding: 50px; }
                        .box { border: 15px solid #000; padding: 60px; background: #FFF700; color: black; font-weight: bold; height: 80vh; display: flex; flex-direction: column; justify-content: center; }
                        h1 { font-size: 100px; margin: 0; text-transform: uppercase; letter-spacing: 5px; }
                        p { font-size: 60px; margin: 40px 0; border-top: 5px solid black; border-bottom: 5px solid black; padding: 20px 0; }
                        .sub { font-size: 30px; color: #D42426; }
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h1>ACHTUNG!</h1>
                        <p>${reason}</p>
                        <div class="sub">Sonst fliegt der Wichtel zurück zum Nordpol!</div>
                    </div>
                    <script>window.onload = function(){ window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const printConstruction = () => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Baustelle</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; background: #fff; padding: 0; margin: 0; }
                        .stripes {
                            background: repeating-linear-gradient(
                                45deg,
                                #000,
                                #000 20px,
                                #FFD700 20px,
                                #FFD700 40px
                            );
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .sign {
                            background: white;
                            border: 10px solid black;
                            padding: 50px;
                            transform: rotate(-5deg);
                            box-shadow: 10px 10px 0 rgba(0,0,0,0.5);
                        }
                        h1 { font-size: 80px; margin: 0; text-transform: uppercase; }
                        .icon { font-size: 100px; }
                    </style>
                </head>
                <body>
                    <div class="stripes">
                        <div class="sign">
                            <div class="icon">🚧</div>
                            <h1>Wichtel<br>Baustelle</h1>
                            <h2>Betreten verboten!</h2>
                        </div>
                    </div>
                    <script>window.onload = function(){ window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const printIDCard = () => {
         const win = window.open('', '_blank');
         if (win) {
             win.document.write(`
                 <html>
                 <head>
                     <title>Ausweis</title>
                     <style>
                         body { font-family: sans-serif; background: #fff; padding: 40px; }
                         .id-card { 
                             width: 85mm; height: 55mm; 
                             border: 1px solid #ccc; 
                             border-radius: 4px;
                             position: relative;
                             background: #f0f8ff;
                             overflow: hidden;
                             margin: 0 auto;
                         }
                         .header { background: #003366; color: white; padding: 5px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
                         .photo { 
                            position: absolute; top: 25px; left: 10px; 
                            width: 25mm; height: 30mm; 
                            border: 1px solid #999; 
                            background: #ddd; 
                            display: flex; align-items: center; justify-content: center;
                            font-size: 8px; color: #666; text-align: center;
                         }
                         .info { margin-left: 38mm; padding-top: 25px; font-size: 10px; }
                         .field { margin-bottom: 4px; }
                         .label { font-weight: bold; color: #003366; }
                         .stamp { 
                            position: absolute; bottom: 5px; right: 5px; 
                            border: 2px solid red; color: red; 
                            border-radius: 50%; width: 20mm; height: 20mm;
                            display: flex; align-items: center; justify-content: center;
                            font-weight: bold; font-size: 8px; transform: rotate(-15deg);
                            opacity: 0.6;
                         }
                     </style>
                 </head>
                 <body>
                     <div class="id-card">
                         <div class="header">Nordpol • Offizieller Ausweis</div>
                         <div class="photo">Bitte Foto<br>einkleben</div>
                         <div class="info">
                            <div class="field"><span class="label">Name:</span> ${elfConfig.name}</div>
                            <div class="field"><span class="label">Rang:</span> Ober-Wichtel</div>
                            <div class="field"><span class="label">Mission:</span> Weihnachten</div>
                            <div class="field"><span class="label">Gültig:</span> Dezember 2025</div>
                         </div>
                         <div class="stamp">OFFIZIELL</div>
                     </div>
                     <br><center>Ausschneiden und falten</center>
                     <script>window.onload = function(){ window.print(); }</script>
                 </body>
                 </html>
             `);
             win.document.close();
         }
    };

    const printStationery = () => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Briefpapier</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; background: #fff; margin: 0; padding: 0; }
                        .page { 
                            width: 210mm; height: 297mm; 
                            padding: 20mm; box-sizing: border-box; 
                            background-image: 
                                linear-gradient(#D42426 1px, transparent 1px),
                                linear-gradient(90deg, #D42426 1px, transparent 1px);
                            background-size: 100% 2px, 2px 100%;
                            background-position: 0 0, 0 0;
                            background-repeat: no-repeat;
                            border: 10px double #006400;
                            position: relative;
                        }
                        .lines {
                            margin-top: 30mm;
                            height: 200mm;
                            background-image: repeating-linear-gradient(white 0px, white 9px, #ccc 10px);
                        }
                        .header { text-align: center; font-size: 24px; color: #006400; font-weight: bold; text-transform: uppercase; }
                        .footer { position: absolute; bottom: 10mm; left: 0; right: 0; text-align: center; font-size: 12px; color: #aaa; }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <div class="header">★ Post vom Nordpol ★</div>
                        <div class="lines"></div>
                        <div class="footer">Wichtel ${elfConfig.name}</div>
                    </div>
                    <script>window.onload = function(){ window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const printColoring = () => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Malvorlage</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; }
                        .canvas { border: 1px solid #000; width: 180mm; height: 250mm; margin: 20px auto; position: relative; }
                        .door { width: 100px; height: 180px; border: 4px solid black; border-radius: 50px 50px 0 0; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); }
                        .knob { width: 10px; height: 10px; border: 2px solid black; border-radius: 50%; position: absolute; top: 100px; right: 10px; }
                        h1 { font-family: 'Comic Sans MS', cursive; }
                    </style>
                </head>
                <body>
                    <h1>Mal mich aus!</h1>
                    <div class="canvas">
                        <!-- Simple CSS Art for printing -->
                        <div class="door">
                            <div class="knob"></div>
                        </div>
                        <div style="position: absolute; bottom: 200px; left: 20px; font-size: 40px;">★</div>
                        <div style="position: absolute; top: 20px; right: 20px; font-size: 40px;">★</div>
                        <div style="position: absolute; bottom: 50px; left: 40px; font-size: 20px;">(Hier wohnt ${elfConfig.name})</div>
                    </div>
                    <script>window.onload = function(){ window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const handlePrint = (id: string) => {
        switch (id) {
            case 'cert': printCertificate(); break;
            case 'warn': printWarning(); break;
            case 'construction': printConstruction(); break;
            case 'idcard': printIDCard(); break;
            case 'stationery': printStationery(); break;
            case 'coloring': printColoring(); break;
        }
    };

    const displayedItems = ITEMS.filter(item => filter === 'all' || item.category === filter);

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
             <div className="bg-white p-8 rounded-xl border border-[#e6dac0] shadow-xl">
                {/* Header */}
                <h2 className="text-3xl font-serif font-bold text-[#2d1b14] mb-6 flex items-center gap-2">
                    <span className="material-icons-round text-elf-green text-4xl">print</span>
                    Wichtel-Druckerei
                </h2>

                {/* Filters */}
                <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                     <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide border transition-colors ${filter === 'all' ? 'bg-[#2d1b14] text-white border-[#2d1b14]' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                     >
                        Alle Vorlagen
                     </button>
                     <button 
                        onClick={() => setFilter('official')}
                        className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide border transition-colors ${filter === 'official' ? 'bg-[#2d1b14] text-white border-[#2d1b14]' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                     >
                        Offiziell
                     </button>
                     <button 
                        onClick={() => setFilter('fun')}
                        className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide border transition-colors ${filter === 'fun' ? 'bg-[#2d1b14] text-white border-[#2d1b14]' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                     >
                        Spaß & Schilder
                     </button>
                     <button 
                        onClick={() => setFilter('craft')}
                        className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide border transition-colors ${filter === 'craft' ? 'bg-[#2d1b14] text-white border-[#2d1b14]' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                     >
                        Basteln
                     </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedItems.map((item) => (
                         <div key={item.id} className={`border-2 border-dashed p-6 rounded-xl flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-sm hover:shadow-md ${item.colorClass}`}>
                            <span className="material-icons-round text-6xl mb-4 opacity-80">{item.icon}</span>
                            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                            <p className="text-sm opacity-70 mb-6">{item.description}</p>
                            
                            {/* Special Input for Warning Card */}
                            {item.id === 'warn' && (
                                <div className="w-full mb-4">
                                    <label className="text-[10px] font-bold uppercase tracking-wide block mb-1 text-left opacity-50">Grund der Verwarnung</label>
                                    <input 
                                        type="text" 
                                        value={warningReason}
                                        onChange={(e) => setWarningReason(e.target.value)}
                                        className="w-full p-2 text-sm border border-black/20 rounded bg-white/50 focus:bg-white outline-none font-bold text-center"
                                        placeholder="z.B. Zähne putzen!"
                                    />
                                </div>
                            )}

                            <button onClick={() => handlePrint(item.id)} className="mt-auto bg-[#2d1b14] text-amber-100 px-6 py-2 rounded font-bold shadow-md hover:bg-black transition-colors w-full flex items-center justify-center gap-2">
                                <span className="material-icons-round text-sm">print</span>
                                Drucken
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default Printables;