import React, { useState } from 'react';
import { Dices, RotateCcw, History, Coins } from 'lucide-react';

const Tools: React.FC = () => {
  const [history, setHistory] = useState<{ val: string; type: string; id: number }[]>([]);
  const [coinSide, setCoinSide] = useState<'Heads' | 'Tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const roll = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    addToHistory(result.toString(), `d${sides}`);
  };

  const flipCoin = () => {
    setIsFlipping(true);
    setCoinSide(null);
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
      setCoinSide(result);
      addToHistory(result, 'Coin');
      setIsFlipping(false);
    }, 1000);
  };

  const addToHistory = (val: string, type: string) => {
    setHistory(prev => [{ val, type, id: Date.now() }, ...prev].slice(0, 10));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Dice Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
          <Dices /> Dice Roller
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[4, 6, 8, 10, 12, 20].map(sides => (
            <button
              key={sides}
              onClick={() => roll(sides)}
              className="aspect-square bg-gray-700 hover:bg-indigo-600 rounded-xl border border-gray-600 hover:border-indigo-400 transition-all flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 group"
            >
              <span className="text-xs text-gray-400 group-hover:text-indigo-200">d{sides}</span>
              <Dices className="opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
            </button>
          ))}
        </div>
      </div>

      {/* Coin Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
          <Coins /> Coin Flipper
        </h2>
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-xl font-bold mb-6 transition-all duration-500 
            ${isFlipping ? 'animate-spin border-indigo-500' : 'border-amber-400 bg-amber-900/20 text-amber-100'}`}
          >
             {isFlipping ? '...' : coinSide || '?'}
          </div>
          <button 
            onClick={flipCoin}
            disabled={isFlipping}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors disabled:opacity-50"
          >
            Flip Coin
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <History size={16} /> Recent Results
          </h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex justify-between items-center text-sm p-2 bg-gray-800 rounded border border-gray-700">
                <span className="text-gray-400">{h.type}</span>
                <span className="font-mono font-bold text-white">{h.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;