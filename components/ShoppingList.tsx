import React, { useState } from 'react';
import { generateShoppingListEnhancement } from '../services/geminiService';

interface Props {
  items: string[];
  onUpdateItems: (items: string[]) => void;
}

const ShoppingList: React.FC<Props> = ({ items, onUpdateItems }) => {
  const [newItem, setNewItem] = useState('');
  const [optimizing, setOptimizing] = useState(false);

  const addItem = () => {
    if (newItem.trim()) {
      onUpdateItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    onUpdateItems(newItems);
  };

  const optimizeList = async () => {
    setOptimizing(true);
    const optimized = await generateShoppingListEnhancement(items);
    if (optimized && optimized.length > 0) {
      onUpdateItems(optimized);
    }
    setOptimizing(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-h-[60vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="material-icons-round text-elf-gold">inventory_2</span>
          Materialliste
        </h2>
        <button
          onClick={optimizeList}
          disabled={optimizing || items.length < 2}
          className="text-sm text-elf-green hover:text-green-700 flex items-center gap-1 disabled:opacity-50"
          title="Liste mit AI aufräumen"
        >
          <span className={`material-icons-round ${optimizing ? 'animate-spin' : ''}`}>auto_fix_high</span>
          {optimizing ? 'Optimiere...' : 'Aufräumen'}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Neues Material hinzufügen..."
          className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-elf-gold outline-none"
        />
        <button
          onClick={addItem}
          className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-900"
        >
          <span className="material-icons-round">add</span>
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-slate-400 py-10">Die Materialliste ist leer.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border border-slate-300 bg-white"></div>
                <span className="text-slate-700">{item}</span>
              </div>
              <button
                onClick={() => removeItem(idx)}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-icons-round">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-100">
        <p className="flex items-start gap-2">
          <span className="material-icons-round text-base">info</span>
          Tipp: Wenn du Ideen im Kalender planst, werden die Materialien automatisch hier gesammelt, sofern du auf "Synchronisieren" im Dashboard klickst (optional).
        </p>
      </div>
    </div>
  );
};

export default ShoppingList;