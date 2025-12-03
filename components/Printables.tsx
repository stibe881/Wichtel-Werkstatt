import React, { useState } from 'react';
import { ElfConfig, Kid } from '../types';

interface Props {
    elfConfig: ElfConfig;
    kids: Kid[];
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

// Helper function for mobile-friendly printing
const printHtml = (title: string, htmlContent: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
        document.body.removeChild(iframe);
        return;
    }
    
    doc.open();
    doc.write(`<html><head><title>${title}</title></head><body>${htmlContent}</body></html>`);
    doc.close();

    const handlePrint = () => {
        try {
            const result = iframe.contentWindow?.document.execCommand('print', false, undefined);
            if (!result) {
                iframe.contentWindow?.print();
            }
        } catch(e) {
            iframe.contentWindow?.print();
        }
    }

    iframe.onload = () => {
        handlePrint();
    };
    
    // Fallback for browsers that don't fire onload quickly
    setTimeout(() => {
        handlePrint();
    }, 500);

    iframe.contentWindow?.addEventListener('afterprint', () => {
        document.body.removeChild(iframe);
    });
};


const Printables: React.FC<Props> = ({ elfConfig, kids }) => {
    const [warningReason, setWarningReason] = useState('Zimmer aufräumen!');
    const [filter, setFilter] = useState<'all' | PrintableCategory>('all');

    const assignedKids = kids.filter(k => elfConfig.kidIds.includes(k.id));
    const kidsNames = assignedKids.map(k => k.name).join(' & ');

    const getPrintableContent = (id: string): string => {
        const baseCss = `
            body { font-family: sans-serif; }
            .page { width: 180mm; height: 267mm; margin: 0 auto; padding: 20mm; border: 1px solid #ccc; box-sizing: border-box; }
            .header { text-align: center; font-family: serif; color: #D42426; }
            .content { margin-top: 20px; font-size: 14pt; line-height: 1.6; }
            .signature { font-family: 'Brush Script MT', cursive; font-size: 24pt; color: #D42426; }
        `;

        switch (id) {
            case 'cert': return `
                <style>
                    ${baseCss}
                    .page { border: 10px solid #c0a060; background-color: #fdfaf2; }
                    .header h1 { font-size: 42pt; margin: 0; }
                    .header h2 { font-size: 22pt; margin-top: 10px; color: #2d1b14; }
                    .content { text-align: center; }
                    .recipient { font-size: 28pt; font-weight: bold; color: #2d1b14; margin: 30px 0; font-family: serif; }
                </style>
                <div class="page">
                    <div class="header">
                        <h2>Offizielles Dokument vom Nordpol</h2>
                        <h1>Brav-Urkunde</h1>
                    </div>
                    <div class="content">
                        Hiermit wird feierlich bestätigt, dass
                        <div class="recipient">${kidsNames || 'die Kinder'}</div>
                        im vergangenen Zeitraum außergewöhnlich brav war(en).
                        <br/><br/>
                        Weiter so!
                        <br/><br/>
                        <div class="signature">${elfConfig.name}</div>
                        (i.A. des Weihnachtsmanns)
                    </div>
                </div>`;
            case 'warn': return `
                 <style>
                    ${baseCss}
                    .page { border: 5px dashed #2d1b14; background-color: #fff0f0; }
                    .header h1 { font-size: 48pt; margin: 0; color: #b91c1c; }
                    .content { text-align: center; font-size: 18pt; }
                    .reason { font-weight: bold; text-decoration: underline; margin: 20px; }
                </style>
                <div class="page">
                    <div class="header">
                        <h1>ACHTUNG!</h1>
                        <h2>Offizielle Verwarnung vom Nordpol</h2>
                    </div>
                    <div class="content">
                        Mir ist zu Ohren gekommen, dass es Probleme gibt beim Thema:
                        <div class="reason">${warningReason}</div>
                        Bitte verbessert euch, sonst muss ich dem Weihnachtsmann davon berichten!
                        <br/><br/>
                        <div class="signature">${elfConfig.name}</div>
                        (In Sorge)
                    </div>
                </div>`;
            case 'adopt': return `
                <style>
                    ${baseCss}
                    .page { border: 5px solid #4caf50; background-color: #f2fff2; }
                    .header h1 { font-size: 38pt; }
                    .content { font-size: 12pt; }
                    .elf-name { font-size: 24pt; font-weight: bold; color: #D42426; }
                </style>
                <div class="page">
                    <div class="header">
                        <h1>Wichtel-Adoptionsurkunde</h1>
                    </div>
                    <div class="content">
                        Hiermit adoptiert die Familie von <strong>${kidsNames}</strong> feierlich den Wichtel
                        <br/><br/>
                        <div class="elf-name">${elfConfig.name}</div>
                        <br/>
                        für die Weihnachtszeit. Wir versprechen, gut auf ihn aufzupassen, an seine Magie zu glauben und jeden Morgen nach seinen nächtlichen Abenteuern zu suchen.
                        <br/><br/><br/>
                        Unterschrieben,<br/>
                        Die Familie & Wichtel ${elfConfig.name}
                    </div>
                </div>`;
            case 'color': return `
                <style>
                    ${baseCss}
                    .page { text-align: center; }
                    img { width: 100%; max-width: 600px; height: auto; margin-top: 20px; }
                </style>
                <div class="page">
                    <h1>Malvorlage</h1>
                    <p>Liebe Grüße vom Nordpol! Hier ist etwas zum Ausmalen für dich/euch.</p>
                    <img src="https://i.imgur.com/3d6Qz6c.png" alt="Wichtel zum Ausmalen"/>
                    <p>Dein ${elfConfig.name}</p>
                </div>
            `;
            default: return `<h1>Unbekannte Vorlage</h1>`;
        }
    };

    const handlePrint = (id: string) => {
        const content = getPrintableContent(id);
        const title = ITEMS.find(i => i.id === id)?.title || 'Drucksache';
        printHtml(title, content);
    };

    const ITEMS: PrintableItem[] = [
        { id: 'cert', title: 'Brav-Urkunde', description: 'Offizielle Bestätigung für besonders liebe Kinder.', icon: 'workspace_premium', category: 'official', colorClass: 'border-elf-gold bg-[#fffdf5]' },
        { id: 'warn', title: 'Offizielle Warnung', description: 'Ein ernstes Wort, wenn mal was nicht rund läuft.', icon: 'gpp_bad', category: 'official', colorClass: 'border-red-700 bg-red-50' },
        { id: 'adopt', title: 'Adoptions-Urkunde', description: 'Um den Wichtel feierlich in der Familie willkommen zu heißen.', icon: 'favorite', category: 'official', colorClass: 'border-green-700 bg-green-50' },
        { id: 'color', title: 'Malvorlage', description: 'Eine lustige Wichtel-Malvorlage für zwischendurch.', icon: 'palette', category: 'fun', colorClass: 'border-blue-500 bg-blue-50' },
    ];

    const displayedItems = ITEMS.filter(item => filter === 'all' || item.category === filter);

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
             <div className="bg-white p-8 rounded-xl border border-[#e6dac0] shadow-xl">
                <h2 className="text-3xl font-serif font-bold text-[#2d1b14] mb-6">Druckerei</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedItems.map((item) => (
                         <div key={item.id} className={`border-2 border-dashed p-6 rounded-xl flex flex-col items-center text-center ${item.colorClass}`}>
                            <span className="material-icons-round text-6xl mb-4 opacity-80">{item.icon}</span>
                            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                            <p className="text-sm opacity-70 mb-6 flex-grow">{item.description}</p>
                            
                            {item.id === 'warn' && (
                                <div className="w-full mb-4">
                                    <input 
                                        type="text" 
                                        value={warningReason}
                                        onChange={(e) => setWarningReason(e.target.value)}
                                        className="w-full p-2 text-sm border border-black/20 rounded bg-white/50"
                                        placeholder="Grund für die Warnung..."
                                    />
                                </div>
                            )}

                            <button onClick={() => handlePrint(item.id)} className="mt-auto bg-[#2d1b14] text-amber-100 px-6 py-2 rounded font-bold">
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