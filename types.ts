// types.ts

export enum View {
    DASHBOARD,
    SETTINGS,
    IDEAS,
    CALENDAR,
    LETTERS,
    SHOPPING,
    RECIPES,
    PRINTABLES,
    KIDS_ZONE
}

export interface Kid {
    id: string;
    name: string;
    age: number;
    gender: 'boy' | 'girl';
}

export interface ElfConfig {
    id: string;
    name: string;
    personality: string;
    kidIds: string[]; // IDs of assigned kids
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
    type: 'normal' | 'arrival' | 'departure';
    isUserCreated?: boolean;
}

export interface CalendarDay {
    day: number;
    idea: Idea | null;
    completed: boolean;
    prepared: boolean;
    notes: string;
    secretMessage: string;
    behavior?: { [kidId: string]: number }; // Behavior score per kid ID
}

export interface ArchivedYear {
    year: number;
    calendar: CalendarDay[];
    shoppingList: string[];
    timestamp: string;
}

export interface AppState {
    elves: ElfConfig[];
    kids: Kid[];
    activeElfId: string | null;
    calendar: CalendarDay[];
    shoppingList: string[];
    savedIdeas: Idea[];
    archives: ArchivedYear[];
}