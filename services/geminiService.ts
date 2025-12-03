import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ElfConfig, Idea } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

// Define the single Idea schema item to be reused
const ideaItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    materials: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    effort: { type: Type.STRING, enum: ['niedrig', 'mittel', 'hoch'] },
    messiness: { type: Type.STRING, enum: ['sauber', 'etwas chaos', 'chaos pur'] },
    type: { type: Type.STRING, enum: ['normal', 'arrival', 'departure'], description: "Type of the idea. 'arrival' for start/move-in, 'departure' for goodbye, 'normal' for daily pranks." }
  },
  required: ['title', 'description', 'materials', 'effort', 'messiness', 'type']
};

// Original Array Schema for bulk generation
const ideaArraySchema: Schema = {
  type: Type.ARRAY,
  items: ideaItemSchema
};

// New Schema for Chat Assistant (Text + Ideas)
const assistantResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING, description: "A friendly, short conversational reply from the elf management to the parents." },
    ideas: { type: Type.ARRAY, items: ideaItemSchema, description: "A list of suggested ideas based on the user request." }
  },
  required: ['reply', 'ideas']
};

const getKidsDescription = (elf: ElfConfig, allKids: Kid[]) => {
  if (!elf.kidIds || elf.kidIds.length === 0) return "Kinder";
  const assignedKids = allKids.filter(k => elf.kidIds.includes(k.id));
  if (assignedKids.length === 0) return "Kinder";
  return assignedKids.map(k => `${k.name} (${k.age} Jahre)`).join(' und ');
};

export const generateElfIdeas = async (
  elf: ElfConfig, 
  kids: Kid[], // Added kids
  count: number, 
  theme: string,
  exclude: string[]
): Promise<Idea[]> => {
  const kidsDesc = getKidsDescription(elf, kids);
  const prompt = `
    Wir sind das Wichtel-Management. Generiere ${count} kreative Elf on the Shelf Ideen für die Eltern von: ${kidsDesc}.
    Der Wichtel vor Ort heißt ${elf.name} und ist ${elf.personality}.
    Thema: ${theme}.
    
    CRITICAL REQUIREMENTS:
    1. Altersgerechtigkeit: Eines der Kinder ist 1 Jahr alt. Die Ideen müssen SICHER sein (keine verschluckbaren Kleinteile in Reichweite des Kleinkinds, nichts Giftiges).
    2. Das ältere Kind (6 Jahre) soll den Witz verstehen und Spaß daran haben.
    3. Vermeide diese bereits bekannten Ideen: ${exclude.join(', ')}.
    4. Setze das Feld 'type' korrekt: 'arrival' für Einzugsideen, 'departure' für Abschiedsideen, sonst 'normal'.
    
    Gib die Antwort strikt als JSON Array zurück.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ideaArraySchema,
        systemInstruction: "Du bist das 'Wichtel-Management-Center'. Du sprichst mit den Eltern und lieferst professionelle, magische Ideen."
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }));

  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const chatWithIdeaAssistant = async (
  userMessage: string,
  history: { role: string; text: string }[],
  elf: ElfConfig,
  kids: Kid[], // Added kids
  excludeTitles: string[]
): Promise<{ reply: string; ideas: Idea[] }> => {
  const kidsDesc = getKidsDescription(elf, kids);
  
  // Construct a chat history string for context
  const historyText = history.slice(-4).map(h => `${h.role === 'user' ? 'Elternteil' : 'Wichtel-Management'}: ${h.text}`).join('\n');

  const prompt = `
    Du bist das 'Wichtel-Management' (Zentrale). Du hilfst den Eltern von ${kidsDesc}, Ideen für ihren "Elf on the Shelf" (${elf.name}) zu finden.
    
    Kontext des Chats:
    ${historyText}
    
    Aktuelle Anfrage: "${userMessage}"
    
    Aufgabe:
    1. Antworte aus der Sicht des Managements an die Eltern (professionell, hilfreich, magisch-organisiert). NICHT aus der Sicht des Wichtels.
    2. Generiere dazu passend 2-4 konkrete Ideen als JSON Daten.
    
    Wichtig:
    - Wenn der Nutzer nach Einzug/Ankunft/Start fragt, setze type='arrival'.
    - Wenn der Nutzer nach Auszug/Abschied/Ende fragt, setze type='departure'.
    - Sonst type='normal'.
    - Achte auf das Alter (1 Jahr & 6 Jahre).
    - Vermeide Ideen mit diesen Titeln: ${excludeTitles.join(', ')}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: assistantResponseSchema,
      }
    });

    const data = JSON.parse(response.text || '{ "reply": "Ho ho ho, da ist im System was schief gelaufen!", "ideas": [] }');
    
    // Add IDs
    const ideasWithIds = (data.ideas || []).map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9)
    }));

    return {
        reply: data.reply,
        ideas: ideasWithIds
    };

  } catch (e) {
    console.error("Chat Error", e);
    return { reply: "Entschuldigung, unsere Schreibmaschinen sind eingefroren. Probieren Sie es nochmal!", ideas: [] };
  }
};

export const generateElfLetter = async (
  elf: ElfConfig,
  kids: Kid[], // Added kids
  topic: string,
  tone: string,
  voice: string
): Promise<string> => {
  const kidsDesc = getKidsDescription(elf, kids);
  const prompt = `
    Schreibe einen Brief aus der **Ich-Perspektive** des Wichtels ${elf.name} an die Kinder: ${kidsDesc}.
    
    Thema: ${topic}.
    Stil/Tonfall: ${tone}.
    Stimme/Laune: ${voice}.
    
    Anweisungen:
    - Du BIST der Wichtel. Benutze "Ich", "Mein", "Mir".
    - Sprich das 6-jährige Kind mit etwas komplexeren Sätzen an.
    - Erwähne das 1-jährige Kind liebevoll (z.B. "kleine Maus" oder "winkt mir zu").
    - Der Brief sollte magisch wirken.
    - Pass die Sprache an die Stimme an (z.B. bei "verschlafen" viel Gähnen, bei "aufgeregt" viele Ausrufezeichen).
    - Formatierre den Text schön mit Absätzen.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "Der Wichtel hat gerade Schreibblockade...";
  } catch (error) {
    console.error("Letter Gen Error", error);
    return "Fehler beim Schreiben des Briefes.";
  }
};

export const generateDailyMessage = async (
  elf: ElfConfig,
  kids: Kid[], // Added kids
  idea: Idea
): Promise<string> => {
  const kidsDesc = getKidsDescription(elf, kids);
  const prompt = `
    Erstelle eine kurze Nachricht aus der **Ich-Perspektive** des Wichtels ${elf.name} für ${kidsDesc}.
    Es geht um die heutige Aktion: "${idea.title}".
    
    Struktur der Nachricht:
    1. Ein kurzer Reim oder ein kleines Rätsel für das 6-jährige Kind darüber, was ICH (der Wichtel) gemacht habe.
    2. Ein ganz einfacher, lieber Gruß extra für das 1-jährige Kind (z.B. "Hallo kleine Lina!").
    
    Wichtig: Schreibe aus Sicht des Wichtels ("Ich habe...", "Schaut mal..."). Max 40 Worte.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "Ho ho ho! Schaut mal, was ich gemacht habe!";
  } catch (error) {
    return "Habt einen zauberhaften Tag!";
  }
};

export const generateShoppingListEnhancement = async (
  currentList: string[]
): Promise<string[]> => {
  if (currentList.length === 0) return [];

  const prompt = `
    Optimiere diese Materialliste für Bastelbedarf/Wichtel-Zubehör:
    ${currentList.join(', ')}
    
    Fasse zusammen (z.B. "Mehl" und "etwas Mehl" -> "Mehl").
    Gib ein JSON Array von Strings zurück.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return currentList;
  }
};

export const generateElfExcuse = async (
  elf: ElfConfig,
  kids: Kid[] // Added kids
): Promise<string> => {
    const kidsDesc = getKidsDescription(elf, kids);
    const prompt = `
      Generiere eine kreative, lustige und magische Ausrede aus der **Ich-Perspektive** des Wichtels ${elf.name}, warum ICH mich heute Nacht NICHT bewegt habe.
      
      Zielgruppe: ${kidsDesc}.
      
      Kontext: Die Eltern haben vergessen, den Wichtel umzusetzen. Der Text dient zur Rettung der Magie.
      
      Beispiele für Gründe (aber denke dir was neues aus):
      - Ich habe zu viele Kekse gegessen und war zu schwer zum Fliegen.
      - Ich musste am Nordpol bei der Inventur helfen und kam erst kurz vor dem Aufwachen zurück, direkt auf meinen alten Platz.
      - Ich fand den Platz so gemütlich, dass ich verschlafen habe.
      
      WICHTIG:
      - Schreibe als Wichtel ("Ich", "Mir"). 
      - Sprich die Kinder direkt an.
      - Kurz und glaubwürdig (für einen 6-Jährigen).
    `;

    try {
        const response = await ai.models.generateContent({
          model: MODEL_FAST,
          contents: prompt,
        });
        return response.text || "Ich bin heute einfach zu müde gewesen...";
    } catch (e) {
        return "Pst! Ich beobachte euch von hier aus heute ganz genau!";
    }
}

export const generateLatePreparationSolution = async (
  elf: ElfConfig,
  kids: Kid[] // Added kids
): Promise<{ instruction: string, letter: string }> => {
    const kidsDesc = getKidsDescription(elf, kids);
    const prompt = `
      SITUATION: Die Eltern haben vergessen, die Wichtel-Aktion für heute vorzubereiten. Es ist morgens, die Kinder wachen gleich auf.
      
      AUFGABE:
      1. Generiere eine "Blitz-Idee" für die Eltern (Management-Sicht), die in unter 2 Minuten mit Haushaltsgegenständen umsetzbar ist (z.B. Wichtel versteckt sich im Schuh, Wichtel liest Buch, Wichtel hat sich in Decke eingekuschelt).
      2. Schreibe dazu einen kurzen Brief vom Wichtel an die Kinder (${kidsDesc}) aus der Ich-Perspektive, der zur Situation passt.
      
      OUTPUT FORMAT (JSON):
      {
        "instruction": "Anweisung an die Eltern (Management-Tonfall)",
        "letter": "Text des Briefes an die Kinder (Wichtel-Tonfall: Ich, mein...)"
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        instruction: { type: Type.STRING },
                        letter: { type: Type.STRING }
                    },
                    required: ['instruction', 'letter']
                }
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            instruction: data.instruction || "Setz den Wichtel einfach irgendwo hin, wo er gut aussieht.",
            letter: data.letter || "Hallo ihr Lieben, ich bin heute etwas faul!"
        };
    } catch (e) {
        return {
            instruction: "Schnell! Setz den Wichtel in den Kühlschrank mit einer Decke.",
            letter: "Brrr, mir war so heiß vom Flug, ich wollte mich abkühlen!"
        };
    }
}