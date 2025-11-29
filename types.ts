export interface Kid {
  name: string;
  age: number;
  gender: 'boy' | 'girl';
}

export interface ElfConfig {
  name: string;
  personality: string; // e.g., "frech", "lieb", "verspielt"
  kids: Kid[];
  arrivalDate: string;
  departureDate: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  materials: string[];
  effort: 'niedrig' | 'mittel' | 'hoch';
  messiness: 'sauber' | 'etwas chaos' | 'chaos pur';
  type?: 'normal' | 'arrival' | 'departure';
}

export interface DayPlan {
  day: number; // 1-24
  idea: Idea | null;
  completed: boolean;
  prepared: boolean; // Status for parents: Is everything ready?
  notes: string;
  secretMessage?: string; // Message from the Elf to the kids
  imageEvidence?: string; // base64 placeholder if needed
  behavior?: Record<string, number>; // Maps kid name to score 1-5
}

export interface ArchivedYear {
  year: number;
  calendar: DayPlan[];
  shoppingList: string[];
  timestamp: string;
}

export interface AppState {
  isConfigured: boolean;
  elf: ElfConfig;
  calendar: DayPlan[];
  shoppingList: string[];
  savedIdeas: Idea[];
  archives: ArchivedYear[];
}

export enum View {
  DASHBOARD = 'dashboard',
  CALENDAR = 'calendar',
  IDEAS = 'ideas',
  LETTERS = 'letters',
  SETTINGS = 'settings',
  SHOPPING = 'shopping',
  RECIPES = 'recipes',
  PRINTABLES = 'printables',
  KIDS_ZONE = 'kids_zone'
}