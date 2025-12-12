import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, BookOpen, Globe, ExternalLink } from 'lucide-react';
import { Rule } from '../types';

const RuleBook: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleText, setNewRuleText] = useState('');

  // Load Rules
  useEffect(() => {
    const saved = localStorage.getItem('bg-rules');
    if (saved) {
        try {
            setRules(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse rules", e);
        }
    } else {
      setRules([
        { id: 1, title: 'Terra Mystica: Shipping', text: 'Shipping allows you to expand to non-adjacent spaces via River. It costs 1 Priest + 4 Coins to upgrade.' },
        { id: 2, title: 'Frosthaven: Advantage', text: 'Draw two modifier cards and use the better one. If one is rolling, continue drawing until a non-rolling card is found.' }
      ]);
    }
  }, []);

  // Save Rules
  useEffect(() => {
    localStorage.setItem('bg-rules', JSON.stringify(rules));
  }, [rules]);

  const addRule = () => {
    if (!newRuleTitle || !newRuleText) return;
    const newRule: Rule = {
      id: Date.now(),
      title: newRuleTitle,
      text: newRuleText
    };
    setRules([...rules, newRule]);
    setNewRuleTitle('');
    setNewRuleText('');
    setIsAdding(false);
  };

  const deleteRule = (id: number) => {
    if(window.confirm('Delete this rule note?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const filteredRules = rules.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input 
          type="text"
          placeholder="Search rules (e.g. 'Shipping')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500 transition-all"
        />
      </div>

      {/* External Search Helper */}
      {search.length > 2 && (
        <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
          <a 
            href={`https://boardgamegeek.com/geeksearch.php?action=search&q=${encodeURIComponent(search)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 text-blue-200 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Search size={14} /> Search BGG
          </a>
          <a 
            href={`https://www.google.com/search?q=board+game+rule+${encodeURIComponent(search)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-gray-200 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Globe size={14} /> Google It
          </a>
        </div>
      )}

      {/* Add New Rule Toggle */}
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Plus size={18} /> Add New Rule Note
        </button>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700 animate-in fade-in slide-in-from-top-2">
          <input 
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 mb-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Title (e.g. 'Building Cost')"
            value={newRuleTitle}
            onChange={e => setNewRuleTitle(e.target.value)}
          />
          <textarea 
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 mb-3 text-sm text-gray-300 min-h-[100px] focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Paste rule text here..."
            value={newRuleText}
            onChange={e => setNewRuleText(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={addRule}
              className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredRules.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <BookOpen className="mx-auto mb-2 opacity-50" size={48} />
            <p>No rules found.</p>
          </div>
        ) : (
          filteredRules.map(rule => (
            <div key={rule.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-indigo-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-indigo-400">{rule.title}</h3>
                <button 
                    onClick={() => deleteRule(rule.id)} 
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    aria-label="Delete rule"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{rule.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RuleBook;