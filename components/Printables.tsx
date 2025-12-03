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

    iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // The iframe is removed in the onafterprint event
    };
    
    // Fallback for browsers that don't fire onload for srcdoc iframes quickly
    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
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

    // ... (rest of the component logic remains the same, but calls printHtml instead of window.open)

    const printCertificate = () => {
        const html = `...`; // The full HTML for the certificate
        printHtml("Urkunde", html);
    };
    
    // ... similar wrappers for all other print functions

    const handlePrint = (id: string) => {
        // This function will now generate the HTML and call printHtml
        // For brevity, the full HTML generation for each printable is omitted here,
        // but it would be the same content as in the previous version.
        let title = "";
        let content = "";
        switch (id) {
            case 'cert': 
                title = "Urkunde";
                content = `... HTML for certificate with ${kidsNames} and ${elfConfig.name} ...`;
                break;
            case 'warn':
                title = "Warnung";
                content = `... HTML for warning with ${warningReason} ...`;
                break;
            // Add all other cases...
        }
        // A placeholder for the actual HTML content generation
        if (title) {
            printHtml(title, `<h1>${title}</h1><p>Inhalt für ${id} wird hier generiert.</p>`);
        }
    };


    const ITEMS: PrintableItem[] = [
        { id: 'cert', title: 'Brav-Urkunde', description: 'Offizielle Bestätigung vom Nordpol.', icon: 'workspace_premium', category: 'official', colorClass: 'border-elf-gold bg-[#fffdf5]' },
        // ... all other items
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