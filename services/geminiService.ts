import { ElfConfig, Idea, Kid } from "../types";

const API_URL = '/api'; // Use relative path to proxy through the same domain

// Helper to create a structured prompt and call the backend proxy
const generateContent = async (prompt: string, schema?: any): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, schema }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Proxy API Error:", errorBody);
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const text = data.text || "";

        if (schema) {
            return JSON.parse(text || '{}');
        }
        return text;

    } catch (error) {
        console.error("Error calling backend proxy:", error);
        throw error;
    }
};

const getKidsDescription = (elf: ElfConfig, allKids: Kid[]) => {
  if (!elf.kidIds || elf.kidIds.length === 0) return "Kinder";
  const assignedKids = allKids.filter(k => elf.kidIds.includes(k.id));
  if (assignedKids.length === 0) return "Kinder";
  return assignedKids.map(k => `${k.name} (${k.age} Jahre)`).join(' und ');
};

export const chatWithIdeaAssistant = async (
  userMessage: string,
  history: { role: string; text: string }[],
  elf: ElfConfig,
  kids: Kid[],
  excludeTitles: string[]
): Promise<{ reply: string; ideas: Idea[] }> => {
  
  const kidsDesc = getKidsDescription(elf, kids);
  const historyText = history.slice(-4).map(h => `${h.role === 'user' ? 'Elternteil' : 'Wichtel-Management'}: ${h.text}`).join('\n');

  const prompt = `
    Du bist das 'Wichtel-Management' (Zentrale). Du hilfst den Eltern von ${kidsDesc}, Ideen für ihren "Elf on the Shelf" (${elf.name}) zu finden.
    Kontext des Chats:
    ${historyText}
    Aktuelle Anfrage: "${userMessage}"
    
    Aufgabe: Antworte freundlich und generiere 2-4 passende Ideen.
    Wichtig: Vermeide Ideen mit diesen Titeln: ${excludeTitles.join(', ')}.
    Achte auf das Alter der Kinder.
    Setze den 'type' auf 'arrival' oder 'departure', wenn es passt, sonst 'normal'.
    Output-Schema: { "reply": "Deine Antwort", "ideas": [...] }
  `;
  
  try {
      const schema = {
        type: "OBJECT",
        properties: {
            reply: { type: "STRING" },
            ideas: { type: "ARRAY", items: { type: "OBJECT", properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                materials: { type: "ARRAY", items: { type: "STRING" } },
                effort: { type: "STRING" },
                messiness: { type: "STRING" },
                type: { type: "STRING" },
            }}}
        }
      };
      const data = await generateContent(prompt, schema);
      const ideasWithIds = (data.ideas || []).map((item: any) => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9)
      }));
      return {
          reply: data.reply || "Da ist etwas schiefgelaufen.",
          ideas: ideasWithIds
      };
  } catch(e) {
      return { reply: "Entschuldigung, unsere Schreibmaschinen sind eingefroren. Probieren Sie es nochmal!", ideas: [] };
  }
};

export const generateElfLetter = async (
  elf: ElfConfig,
  kids: Kid[],
  topic: string,
  tone: string,
  voice: string
): Promise<string> => {
  const kidsDesc = getKidsDescription(elf, kids);
  const prompt = `
    Schreibe einen kurzen Brief aus der Ich-Perspektive des Wichtels ${elf.name} an die Kinder: ${kidsDesc}.
    Thema: ${topic}. Stil/Tonfall: ${tone}. Stimme/Laune: ${voice}.
    Du BIST der Wichtel. Benutze "Ich", "Mein", "Mir". Sprich die Kinder direkt an.
  `;
  try {
    return await generateContent(prompt);
  } catch(e) {
      return "Der Wichtel hat gerade Schreibblockade...";
  }
};

export const generateElfExcuse = async (
  elf: ElfConfig,
  kids: Kid[]
): Promise<string> => {
    const kidsDesc = getKidsDescription(elf, kids);
    const prompt = `
      Generiere eine kreative, lustige, magische Ausrede aus der Ich-Perspektive des Wichtels ${elf.name}, warum ICH mich heute Nacht NICHT bewegt habe.
      Zielgruppe: ${kidsDesc}.
      Kontext: Die Eltern haben vergessen, den Wichtel umzusetzen.
    `;
    try {
        return await generateContent(prompt);
    } catch(e) {
        return "Pst! Ich beobachte euch von hier aus heute ganz genau!";
    }
}

export const generateLatePreparationSolution = async (
  elf: ElfConfig,
  kids: Kid[]
): Promise<{ instruction: string, letter: string }> => {
    const kidsDesc = getKidsDescription(elf, kids);
    const prompt = `
      SITUATION: Die Eltern haben vergessen, die Wichtel-Aktion für heute vorzubereiten. Es ist morgens.
      AUFGABE: 1. Generiere eine "Blitz-Idee" für die Eltern (Management-Sicht), die in <2 Min. umsetzbar ist. 2. Schreibe einen passenden, kurzen Brief vom Wichtel (${elf.name}) an die Kinder (${kidsDesc}).
      OUTPUT FORMAT (JSON): { "instruction": "Anweisung für Eltern", "letter": "Brief an Kinder" }
    `;
    try {
        const schema = {
            type: "OBJECT",
            properties: {
                instruction: { type: "STRING" },
                letter: { type: "STRING" }
            }
        };
        return await generateContent(prompt, schema);
    } catch (e) {
        return {
            instruction: "Schnell! Setz den Wichtel in den Kühlschrank.",
            letter: "Brrr, mir war so heiß, ich wollte mich abkühlen!"
        };
    }
}

export const generateDailyMessage = async (
    elf: ElfConfig,
    kids: Kid[],
    idea: Idea
  ): Promise<string> => {
    const topic = `Ich habe heute Folgendes vor oder erlebt: "${idea.title}".`;
    const tone = 'geheimnisvoll und freundlich';
    const voice = 'magisch';
  
    // Reusing the existing generateElfLetter function
    return generateElfLetter(elf, kids, topic, tone, voice);
  };

export const generateShoppingListEnhancement = async (items: string[]): Promise<string[]> => {
    const prompt = `
        OPTIMIERE die folgende Einkaufsliste für die Wichtel-Werkstatt.
        Fasse Duplikate zusammen, korrigiere Tippfehler und gruppiere ähnliche Artikel.
        Beispiel: "Zuckerstangen, zucker stangen, 1x Zucker-Stange" wird zu "Zuckerstangen".
        Gib NUR die optimierte Liste als JSON-Array zurück.

        Liste zum Optimieren:
        ${JSON.stringify(items)}
    `;
    try {
        const schema = {
            type: "ARRAY",
            items: { type: "STRING" }
        };
        // The backend will return a JSON array string, which we need to parse.
        const result = await generateContent(prompt, schema);
        // Assuming the result is already parsed by generateContent if a schema is provided.
        return result || [];
    } catch (e) {
        console.error("Error optimizing shopping list:", e);
        // Return original items on error to prevent data loss
        return items;
    }
};
