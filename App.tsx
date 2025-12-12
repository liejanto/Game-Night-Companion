import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  Plus, 
  Clock, 
  BookOpen,
  Hammer,
  Settings
} from 'lucide-react';
import PlayerManager from './components/PlayerManager';
import RuleBook from './components/RuleBook';
import Tools from './components/Tools';
import { Player, GameStatus, TurnMode } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'rules' | 'tools'>('timer');
  
  // Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [startPlayerId, setStartPlayerId] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [globalTime, setGlobalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [turnMode, setTurnMode] = useState<TurnMode>('orbit'); // 'orbit' or 'pass'
  const [maxRounds, setMaxRounds] = useState(0); // 0 = unlimited
  const [isShuffling, setIsShuffling] = useState(false);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Load Players & State
  useEffect(() => {
    const savedPlayers = localStorage.getItem('bg-players');
    if (savedPlayers) {
        try { setPlayers(JSON.parse(savedPlayers)); } catch(e) {}
    } else {
        // Default demo players
        setPlayers([
            { id: 1, name: 'Player 1', color: '#6366f1', timeSeconds: 0, score: 0, hasPassed: false }, // Indigo
            { id: 2, name: 'Player 2', color: '#ec4899', timeSeconds: 0, score: 0, hasPassed: false }, // Rose
        ]);
    }
  }, []);

  // Save Players
  useEffect(() => {
    localStorage.setItem('bg-players', JSON.stringify(players));
  }, [players]);

  // Global Timer & Turn Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (gameStatus === 'playing' && !isPaused && players.length > 0 && !isShuffling) {
      interval = setInterval(() => {
        setGlobalTime(t => t + 1);
        if (activePlayerId) {
            setPlayers(prev => prev.map(p => 
                p.id === activePlayerId ? { ...p, timeSeconds: p.timeSeconds + 1 } : p
            ));
        }
      }, 1000);
    }
    return () => { if(interval) clearInterval(interval); };
  }, [gameStatus, isPaused, activePlayerId, players.length, isShuffling]);


  // Game Actions
  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    // Indigo, Rose, Emerald, Amber, Cyan, Fuchsia
    const colors = [
        '#6366f1', // Indigo
        '#f43f5e', // Rose
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#06b6d4', // Cyan
        '#d946ef', // Fuchsia
        '#8b5cf6', // Violet
        '#84cc16'  // Lime
    ];

    const newPlayer: Player = {
      id: Date.now(),
      name: newPlayerName.trim(),
      color: colors[players.length % colors.length],
      timeSeconds: 0,
      score: 0,
      hasPassed: false
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const handleUpdatePlayer = (id: number, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleUpdateScore = (id: number, delta: number) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p));
  };

  const handleAction = (action: 'pickFirst' | 'toggleTimer' | 'endTurn' | 'pass' | 'reset' | 'resume') => {
    if (action === 'resume') {
        setIsPaused(false);
        return;
    }
    if (action === 'toggleTimer') {
        setIsPaused(!isPaused);
        return;
    }
    
    if (action === 'pickFirst') {
        if (players.length === 0) return;
        
        // Start visual shuffle
        setIsShuffling(true);
        let shuffleCount = 0;
        const maxShuffles = 15; // Number of hops
        const shuffleSpeed = 100; // ms

        const interval = setInterval(() => {
            // cycle through players visually
            setActivePlayerId(players[shuffleCount % players.length].id);
            shuffleCount++;

            if (shuffleCount > maxShuffles) {
                clearInterval(interval);
                
                // Determine actual winner
                const randomIdx = Math.floor(Math.random() * players.length);
                const winner = players[randomIdx];
                
                setStartPlayerId(winner.id);
                setActivePlayerId(winner.id);
                setGameStatus('playing');
                setIsPaused(false);
                setRound(1);
                setGlobalTime(0);
                // Reset stats for new game
                setPlayers(prev => prev.map(p => ({ ...p, hasPassed: false, timeSeconds: 0, score: 0 })));
                setIsShuffling(false);
            }
        }, shuffleSpeed);
        
        return;
    }

    if (action === 'reset') {
        // If game is finished, we don't need to confirm "End session", because it's already done.
        if (gameStatus === 'finished' || window.confirm("End current session and reset?")) {
            setGameStatus('setup');
            setIsPaused(true);
            setActivePlayerId(null);
            setStartPlayerId(null);
            setGlobalTime(0);
            setRound(1);
            setIsShuffling(false);
            setPlayers(prev => prev.map(p => ({ ...p, timeSeconds: 0, score: 0, hasPassed: false })));
        }
        return;
    }

    // Logic for End Turn / Pass
    if (!activePlayerId || players.length === 0) return;
    
    let currentIndex = players.findIndex(p => p.id === activePlayerId);
    if (currentIndex === -1) return;

    if (action === 'pass') {
        // Mark current player as passed
        const updatedPlayers = [...players];
        updatedPlayers[currentIndex].hasPassed = true;
        setPlayers(updatedPlayers);
        
        // Check if everyone has passed
        const activeCount = updatedPlayers.filter(p => !p.hasPassed).length;
        if (activeCount === 0) {
            // End of Round (Pass Mode)
            nextRound(updatedPlayers);
            return;
        }
    }

    // Find Next Player
    let nextIndex = (currentIndex + 1) % players.length;
    let loopCount = 0;
    
    // In pass mode, skip passed players
    // In orbit mode, we generally just go to next, but if we wanted to support 'dropping out' we could check passed.
    // Standard Orbit: next player.
    
    while (players[nextIndex].hasPassed && loopCount < players.length) {
        nextIndex = (nextIndex + 1) % players.length;
        loopCount++;
    }

    const nextPlayer = players[nextIndex];
    setActivePlayerId(nextPlayer.id);

    // Round Increment Logic for Orbit Mode
    // If we return to start player
    if (turnMode === 'orbit' && nextPlayer.id === startPlayerId) {
        // Only increment if we just finished a full loop
        const newRound = round + 1;
        setRound(newRound);
        if (maxRounds > 0 && newRound > maxRounds) {
            setGameStatus('finished');
            setIsPaused(true);
        }
    }
  };

  const nextRound = (currentPlayers: Player[]) => {
    const newRound = round + 1;
    if (maxRounds > 0 && newRound > maxRounds) {
        setGameStatus('finished');
        setIsPaused(true);
        return;
    }
    setRound(newRound);
    
    // Clear passes
    const resetPasses = currentPlayers.map(p => ({ ...p, hasPassed: false }));
    setPlayers(resetPasses);

    // Rotate Start Player
    if (startPlayerId) {
        const currentStartIdx = resetPasses.findIndex(p => p.id === startPlayerId);
        const nextStartIdx = (currentStartIdx + 1) % resetPasses.length;
        const newStartPlayer = resetPasses[nextStartIdx];
        setStartPlayerId(newStartPlayer.id);
        setActivePlayerId(newStartPlayer.id);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg z-10 shrink-0">
        <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg cursor-pointer hover:bg-indigo-500 transition-colors">
                <Dices className="text-white" size={24} />
            </div>
            <h1 className="font-bold text-xl hidden sm:block cursor-pointer">Game Night OS</h1>
            <h1 className="font-bold text-xl sm:hidden cursor-pointer">GN/OS</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
            >
                <Settings size={20} />
            </button>
            <form onSubmit={addPlayer} className="flex gap-2">
                <input 
                type="text" 
                placeholder="Name..." 
                className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-24 sm:w-32 transition-all text-white placeholder-gray-500"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-3 rounded-lg text-white transition-colors flex items-center justify-center">
                <Plus size={20} />
                </button>
            </form>
          </div>
        </div>
        
        {/* Settings Dropdown */}
        {showSettings && (
            <div className="max-w-2xl mx-auto mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700 animate-in slide-in-from-top-2">
                <h3 className="font-bold mb-3 text-gray-300">Session Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Turn Logic</label>
                        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
                            <button 
                                onClick={() => setTurnMode('orbit')}
                                className={`flex-1 py-1 text-sm rounded ${turnMode === 'orbit' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >Orbit</button>
                            <button 
                                onClick={() => setTurnMode('pass')}
                                className={`flex-1 py-1 text-sm rounded ${turnMode === 'pass' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >Pass</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Max Rounds</label>
                        <input 
                            type="number" 
                            min="0"
                            value={maxRounds}
                            onChange={(e) => setMaxRounds(parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-white focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">0 for unlimited</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-700 bg-gray-800 shrink-0">
        <button 
          onClick={() => setActiveTab('timer')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
            ${activeTab === 'timer' ? 'border-indigo-500 text-indigo-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`}
        >
          <Clock size={16} /> Game
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
            ${activeTab === 'tools' ? 'border-indigo-500 text-indigo-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`}
        >
          <Hammer size={16} /> Tools
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
            ${activeTab === 'rules' ? 'border-indigo-500 text-indigo-400 bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`}
        >
          <BookOpen size={16} /> Rules
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {activeTab === 'timer' && (
            <PlayerManager 
                players={players} 
                activePlayerId={activePlayerId}
                startPlayerId={startPlayerId}
                isPaused={isPaused}
                gameStatus={gameStatus}
                round={round}
                maxRounds={maxRounds}
                isShuffling={isShuffling}
                globalTime={globalTime}
                onAction={handleAction}
                onUpdatePlayer={handleUpdatePlayer}
                onRemovePlayer={(id) => setPlayers(prev => prev.filter(p => p.id !== id))}
                onUpdateScore={handleUpdateScore}
            />
          )}
          {activeTab === 'tools' && <Tools />}
          {activeTab === 'rules' && <RuleBook />}
        </div>
      </div>
    </div>
  );
};

export default App;