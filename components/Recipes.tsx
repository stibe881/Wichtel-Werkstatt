import React, { useState } from 'react';

type RecipeCategory = 'food' | 'drink';

interface Recipe {
    title: string;
    desc: string;
    category: RecipeCategory;
    ingredients: string[];
    steps: string[];
}

const RECIPES: Recipe[] = [
    // ESSEN
    {
        title: "Mini-Donuts (Cheerios)",
        desc: "Der Wichtel backt winzige Donuts.",
        category: 'food',
        ingredients: ["1 kleine Packung Cheerios/Loopies", "50g Puderzucker", "20g Schokostreusel", "1 Prise Zimt"],
        steps: ["Nimm Cheerios aus der Packung.", "Bestäube einige mit Puderzucker ('Puder-Donuts').", "Tauche andere in geschmolzene Schokolade und Streusel.", "Serviere sie in einer Streichholzschachtel."]
    },
    {
        title: "Wichtel-Pfannkuchen",
        desc: "Winzig kleine Pancakes, so groß wie eine Münze.",
        category: 'food',
        ingredients: ["100ml Pfannkuchenteig", "2 Zahnstocher (als Besteck)", "1 Beere (als Deko)"],
        steps: ["Teig mit einem Teelöffel in die Pfanne geben.", "Goldbraun backen.", "Zu einem Turm stapeln.", "Mit einem Zahnstocher fixieren."]
    },
    {
        title: "Wichtel-Zauberstäbe",
        desc: "Magische Stäbe für kleine Hände.",
        category: 'food',
        ingredients: ["10 Salzstangen", "50g Weiße Schokolade", "2 EL Bunte Streusel / Glitzer"],
        steps: ["Schokolade schmelzen.", "Salzstangen zur Hälfte eintauchen.", "Sofort mit Streuseln oder essbarem Glitzer bestreuen.", "Trocknen lassen (am besten im Glas stehend)."]
    },
    {
        title: "Rentier-Nasen",
        desc: "Rote Energiebällchen für den Schlittenflug.",
        category: 'food',
        ingredients: ["100g Datteln (entsteint)", "50g Gemahlene Mandeln", "1 EL Backkakao", "30g Rote Kokosraspeln (oder Zuckerstreusel)"],
        steps: ["Datteln, Mandeln und Kakao mixen bis es klebt.", "Kleine Kugeln formen.", "In den roten Streuseln wälzen.", "Kalt stellen."]
    },
    {
        title: "Winzige Wichtel-Pizza",
        desc: "Herzhaftes für die Nachtschicht.",
        category: 'food',
        ingredients: ["5 Cracker (rund)", "1 TL Tomatenmark", "1 EL Geriebener Käse", "1 Prise Oregano"],
        steps: ["Cracker mit Tomatenmark bestreichen.", "Käse und Oregano darauf streuen.", "Kurz in der Mikrowelle oder im Ofen schmelzen lassen."]
    },
    {
        title: "Wichtel-Spaghetti",
        desc: "Das Lieblingsessen am Nordpol (Grün!).",
        category: 'food',
        ingredients: ["1 Portion Spaghetti", "2 Tropfen Grüne Lebensmittelfarbe", "1 TL Parmesan (als Schnee)", "1 Klecks Ketchup (als Sauce)"],
        steps: ["Spaghetti kochen und grüne Farbe ins Kochwasser geben.", "Abgießen und mit etwas Butter mischen.", "Auf dem Teller mit Parmesan-Schnee bestreuen."]
    },
    {
        title: "Rentier-Futter",
        desc: "Glitzerndes Müsli zum Ausstreuen vor der Tür.",
        category: 'food',
        ingredients: ["1 Tasse Haferflocken", "2 EL Zuckerstreusel (Rot/Grün)", "1 Prise Essbares Glitzer"],
        steps: ["Alles in einer Schüssel mischen.", "In kleine Säckchen füllen.", "Am Weihnachtsabend vor die Tür streuen, um Rentiere anzulocken."]
    },
    {
        title: "Nordpol-Popcorn",
        desc: "Süß-Salziger Schneesturm.",
        category: 'food',
        ingredients: ["1 Tüte Popcorn (Salzig)", "50g Weiße Schokolade", "1 Handvoll Smarties (nur rote und grüne)"],
        steps: ["Weiße Schokolade schmelzen.", "Über das Popcorn gießen und mischen.", "Smarties dazugeben und auf Backpapier trocknen lassen."]
    },
    
    // GETRÄNKE
    {
        title: "Magische Wichtel-Milch",
        desc: "Verwandelt sich magisch in Blau oder Grün!",
        category: 'drink',
        ingredients: ["200ml Milch", "1 Tropfen Lebensmittelfarbe (blau/grün)", "1 Prise Glitzer (essbar)", "1 TL Vanillezucker"],
        steps: ["Tropfe heimlich Farbe in die leere Müslischale oder das Glas.", "Verdecke es mit etwas Puderzucker oder Mehl.", "Wenn die Kinder Milch einschenken: Magie!"]
    },
    {
        title: "Schneemann-Suppe",
        desc: "Ein besonderer Kakao vom Nordpol.",
        category: 'drink',
        ingredients: ["2 EL Kakao-Pulver", "5 Mini-Marshmallows", "1 Zuckerstange", "250ml Heiße Milch"],
        steps: ["Kakao anrühren.", "Marshmallows als 'Schneebälle' hinein.", "Mit der Zuckerstange umrühren.", "Eine Notiz dazu: 'Wärmt kalte Nasen!'"]
    },
    {
        title: "Grinch-Saft",
        desc: "Ein grüner Vitamin-Kick.",
        category: 'drink',
        ingredients: ["100ml Orangensaft", "1/2 Banane", "1 Handvoll Spinat (schmeckt man nicht!)", "Oder: Orangensaft + Blue Curacao Sirup (alkoholfrei)"],
        steps: ["Alles mixen bis es leuchtend grün ist.", "Ein rotes Herz (Erdbeere oder Sticker am Glas) dazu.", "Servieren."]
    },
    {
        title: "Polarlicht-Punsch",
        desc: "Leuchtet wie der Himmel im Norden.",
        category: 'drink',
        ingredients: ["100ml Heller Traubensaft", "100ml Mineralwasser", "1 EL Gefrorene Beeren", "1 Tropfen blaue Lebensmittelfarbe"],
        steps: ["Saft und Wasser mischen.", "Ganz wenig blaue Farbe hinzu für den Türkis-Look.", "Gefrorene Beeren als 'Eisberge' hineingeben."]
    },
    {
        title: "Geschmolzener Schneemann",
        desc: "Vanille-Drink mit Gesicht.",
        category: 'drink',
        ingredients: ["200ml Vanille-Milch oder Joghurt", "1 Lebensmittelstift (Schwarz/Orange)", "1 Klarer Becher"],
        steps: ["Male ein Schneemann-Gesicht außen auf den klaren Becher.", "Fülle das weiße Getränk hinein.", "Sieht aus wie ein Schneemann im Glas!"]
    }
];

const Recipes: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'food' | 'drink'>('all');

    const handlePrintRecipe = (recipe: Recipe) => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Rezept: ${recipe.title}</title>
                    <style>
                        body { font-family: 'Georgia', serif; padding: 20px; background: #fff; color: #2d1b14; }
                        .card { 
                            border: 4px double #855E42; 
                            padding: 30px; 
                            max-width: 105mm; /* A6 width approx */
                            margin: 0 auto;
                            background-color: #fffdf5;
                            border-radius: 8px;
                        }
                        h1 { text-align: center; color: #D42426; font-size: 24px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; }
                        .meta { text-align: center; font-style: italic; color: #855E42; margin-bottom: 20px; font-size: 14px; }
                        h3 { color: #855E42; border-bottom: 1px solid #e6dac0; padding-bottom: 5px; font-size: 16px; margin-top: 20px; }
                        ul, ol { font-size: 14px; line-height: 1.6; }
                        li { margin-bottom: 5px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 10px; text-transform: uppercase; color: #ccc; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>${recipe.title}</h1>
                        <div class="meta">"${recipe.desc}"</div>
                        
                        <h3>Zutaten</h3>
                        <ul>
                            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
                        </ul>

                        <h3>Zubereitung</h3>
                        <ol>
                            ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
                        </ol>

                        <div class="footer">Wichtel-Bäckerei • Offizielles Rezept</div>
                    </div>
                    <script>window.onload = function(){ window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const displayedRecipes = RECIPES.filter(r => filter === 'all' || r.category === filter);

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
             
             {/* Header */}
             <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-full shadow-wood-bezel border-4 border-[#d4c5a5] mb-4">
                    <span className="material-icons-round text-elf-red text-4xl sm:text-5xl">bakery_dining</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#amber-100] text-shadow mb-2 text-white">
                    Wichtel-Bäckerei
                </h2>
                <p className="text-amber-200/80 italic font-serif text-base sm:text-lg">Geheime Rezepte aus der Nordpol-Kantine</p>
             </div>

             {/* Filter Tabs */}
             <div className="flex justify-center gap-2 flex-wrap">
                 <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all border-2 ${
                        filter === 'all' 
                        ? 'bg-elf-gold text-elf-dark border-yellow-600' 
                        : 'bg-[#fcfaf2] text-[#855E42] border-[#e6dac0] hover:bg-white'
                    }`}
                 >
                     Alles
                 </button>
                 <button 
                    onClick={() => setFilter('food')}
                    className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all border-2 flex items-center gap-2 ${
                        filter === 'food' 
                        ? 'bg-elf-gold text-elf-dark border-yellow-600' 
                        : 'bg-[#fcfaf2] text-[#855E42] border-[#e6dac0] hover:bg-white'
                    }`}
                 >
                     <span className="material-icons-round text-base">cookie</span>
                     Schmausereien
                 </button>
                 <button 
                    onClick={() => setFilter('drink')}
                    className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all border-2 flex items-center gap-2 ${
                        filter === 'drink' 
                        ? 'bg-elf-gold text-elf-dark border-yellow-600' 
                        : 'bg-[#fcfaf2] text-[#855E42] border-[#e6dac0] hover:bg-white'
                    }`}
                 >
                     <span className="material-icons-round text-base">local_bar</span>
                     Zaubertränke
                 </button>
             </div>

             {/* Recipe Grid */}
             <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayedRecipes.map((r, i) => (
                        <RecipeCard key={r.title} recipe={r} index={i} onPrint={handlePrintRecipe} />
                    ))}
                    {displayedRecipes.length === 0 && (
                        <div className="col-span-full text-center py-12 text-amber-100/50">
                            <p>Keine Rezepte in dieser Kategorie gefunden.</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

const RecipeCard: React.FC<{ recipe: Recipe, index: number, onPrint: (r: Recipe) => void }> = ({ recipe, index, onPrint }) => (
    <div className="bg-[#fcfaf2] p-4 sm:p-5 rounded-xl border-2 border-[#e6dac0] shadow-lg relative group hover:border-elf-gold transition-all flex flex-col h-full">
        {/* Number Badge */}
        <div className="absolute -top-3 -right-3 bg-[#2d1b14] text-elf-gold w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-md border-2 border-[#5d4037]">
            {index + 1}
        </div>
        
        <div className="mb-4">
            <h3 className="font-bold text-lg sm:text-xl text-elf-dark mb-1 font-serif leading-tight">{recipe.title}</h3>
            <p className="text-sm text-slate-500 italic">{recipe.desc}</p>
        </div>
        
        <div className="bg-white p-3 rounded border border-[#e6dac0] mb-3 shadow-inner">
            <h4 className="text-[10px] font-bold uppercase text-[#855E42] mb-2 border-b border-slate-100 pb-1">Zutaten</h4>
            <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                {recipe.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
            </ul>
        </div>
        
        <div className="flex-1">
            <h4 className="text-[10px] font-bold uppercase text-[#855E42] mb-2">Zubereitung</h4>
            <ol className="text-xs text-slate-700 list-decimal list-inside space-y-1.5 leading-relaxed">
                {recipe.steps.map((s, idx) => <li key={idx}>{s}</li>)}
            </ol>
        </div>

        <button 
            onClick={() => onPrint(recipe)}
            className="mt-6 w-full py-2 bg-[#e6dac0] text-[#2d1b14] font-bold text-xs uppercase tracking-wider rounded hover:bg-elf-gold hover:text-elf-dark transition-colors flex items-center justify-center gap-2"
        >
            <span className="material-icons-round text-sm">print</span>
            Rezept drucken
        </button>
    </div>
);

export default Recipes;