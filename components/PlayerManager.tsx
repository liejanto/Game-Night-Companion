import React, { useState } from 'react';
import { 
  Dices, 
  Trash2, 
  Palette, 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle2, 
  Crown, 
  Trophy,
  RotateCcw,
  Clock,
  AlertOctagon,
  Pencil
} from 'lucide-react';
import { Player, GameStatus } from '../types';

interface PlayerManagerProps {
  players: Player[];
  activePlayerId: number | null;
  startPlayerId: number | null;
  isPaused: boolean;
  gameStatus: GameStatus;
  round: number;
  maxRounds: number;
  isShuffling: boolean;
  globalTime: number;
  onAction: (action: 'pickFirst' | 'toggleTimer' | 'endTurn' | 'pass' | 'reset' | 'resume') => void;
  onUpdatePlayer: (id: number, updates: Partial<Player>) => void;
  onRemovePlayer: (id: number) => void;
  onUpdateScore: (id: number, delta: number) => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ 
  players, 
  activePlayerId, 
  startPlayerId,
  isPaused,
  gameStatus,
  round,
  maxRounds,
  isShuffling,
  globalTime,
  onAction,
  onUpdatePlayer,
  onRemovePlayer,
  onUpdateScore
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartEdit = (p: Player) => {
    setEditingId(p.id);
    setTempName(p.name);
  };

  const handleSaveEdit = (id: number) => {
    if (tempName.trim()) {
        onUpdatePlayer(id, { name: tempName.trim() });
    }
    setEditingId(null);
  };

  if (gameStatus === 'finished') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in-50 duration-500">
        <div className="relative mb-6">
          <Crown size={64} className="text-yellow-400 drop-shadow-lg" />
          <div className="absolute -top-2 -right-2 animate-bounce">
             <Trophy size={24} className="text-yellow-200" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
        <p className="text-gray-400 mb-8">Total Time: {formatTime(globalTime)}</p>

        <div className="w-full space-y-3 mb-8">
          {sortedPlayers.map((p, idx) => (
            <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border ${idx === 0 ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-gray-800 border-gray-700'}`}>
               <div className="flex items-center gap-3">
                 <span className={`font-bold font-mono w-6 ${idx === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>#{idx + 1}</span>
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: p.color, color: '#fff' }}>
                    {p.name[0]}
                 </div>
                 <span className={idx === 0 ? 'text-white font-bold' : 'text-gray-300'}>{p.name}</span>
               </div>
               <span className="text-xl font-bold font-mono">{p.score} VP</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => onAction('reset')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
        >
          <RotateCcw size={20} /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Game Info Header */}
      <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700 flex justify-between items-center sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-2 text-gray-300">
           <Clock size={16} className="text-indigo-400" />
           <span className="font-mono font-bold text-lg">{formatTime(globalTime)}</span>
        </div>
        <div className="flex items-center gap-3">
            {maxRounds > 0 && round === maxRounds && (
                <div className="flex items-center gap-1 text-red-400 animate-pulse">
                    <AlertOctagon size={14} />
                    <span className="text-xs font-bold uppercase hidden sm:inline">Final Round</span>
                </div>
            )}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Round</span>
                <div className={`bg-gray-900 px-3 py-1 rounded font-bold border ${maxRounds > 0 && round === maxRounds ? 'text-red-400 border-red-500/50' : 'text-white border-gray-600'}`}>
                {round}{maxRounds > 0 ? `/${maxRounds}` : ''}
                </div>
            </div>
        </div>
        <button onClick={() => onAction('reset')} className="text-gray-500 hover:text-white p-2">
            <RotateCcw size={16} />
        </button>
      </div>

      {/* Setup / Controls */}
      {players.length === 0 && (
         <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-800 rounded-xl">
            <p>Add players to begin session.</p>
         </div>
      )}

      {players.length > 0 && gameStatus === 'setup' && (
         <button 
            onClick={() => onAction('pickFirst')}
            disabled={isShuffling}
            className={`w-full text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all
              ${isShuffling 
                ? 'bg-indigo-500 scale-95 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-700 animate-pulse hover:animate-none'
              }
            `}
         >
            <Dices size={24} className={isShuffling ? 'animate-spin' : ''} /> 
            {isShuffling ? 'Rolling for Initiative...' : 'Roll for Initiative (Start Game)'}
         </button>
      )}

      {/* Player List */}
      <div className="grid gap-3">
        {players.map(player => {
          const isActive = activePlayerId === player.id;
          const isStartPlayer = startPlayerId === player.id;
          const isEditing = editingId === player.id;

          return (
            <div 
              key={player.id}
              className={`
                relative rounded-xl p-4 border-2 transition-all duration-300
                ${player.hasPassed ? 'opacity-50 grayscale border-gray-800 bg-gray-900' : ''}
                ${isActive 
                  ? 'border-indigo-500 bg-gray-800 shadow-lg shadow-indigo-500/10 scale-[1.02] z-10' 
                  : 'border-gray-700 bg-gray-800'
                }
              `}
            >
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <div className="relative group/picker">
                        <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-sm ring-2 ring-offset-2 ring-offset-gray-900 ring-transparent transition-all overflow-hidden"
                        style={{ backgroundColor: player.color }}
                        >
                          {player.name.charAt(0).toUpperCase()}
                          {/* Color Picker Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/picker:opacity-100 transition-opacity cursor-pointer">
                              <Palette size={16} />
                          </div>
                        </div>
                        <input 
                            type="color"
                            value={player.color}
                            onChange={(e) => onUpdatePlayer(player.id, { color: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {isStartPlayer && (
                           <div className="absolute -top-2 -left-2 bg-yellow-500 text-yellow-900 rounded-full p-1 border-2 border-gray-900 shadow-sm z-20" title="Start Player">
                              <Crown size={12} fill="currentColor" />
                           </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 group/name h-8">
                            {isEditing ? (
                                <input
                                    autoFocus
                                    type="text"
                                    className="bg-gray-700 text-white font-bold rounded px-2 py-0.5 border border-indigo-500 outline-none w-32"
                                    value={tempName}
                                    onChange={e => setTempName(e.target.value)}
                                    onBlur={() => handleSaveEdit(player.id)}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit(player.id)}
                                    onClick={e => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <h3 
                                        onClick={(e) => { e.stopPropagation(); handleStartEdit(player); }}
                                        className={`font-bold cursor-pointer hover:underline decoration-dashed underline-offset-4 ${isActive ? 'text-white' : 'text-gray-300'}`}
                                    >
                                        {player.name}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStartEdit(player); }}
                                        className="text-gray-500 hover:text-white opacity-0 group-hover/name:opacity-100 transition-opacity focus:opacity-100"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                </>
                            )}
                            {player.hasPassed && <span className="text-xs bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded border border-red-900">Passed</span>}
                        </div>
                        <div className={`font-mono text-xl font-bold tabular-nums ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}>
                           {formatTime(player.timeSeconds)}
                        </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
                    <button 
                        onClick={() => onUpdateScore(player.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >-</button>
                    <span className="min-w-[30px] text-center font-bold text-white">{player.score}</span>
                    <button 
                        onClick={() => onUpdateScore(player.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >+</button>
                 </div>
              </div>

              {/* Active Player Controls */}
              {isActive && gameStatus === 'playing' && !isShuffling && (
                  <div className="grid grid-cols-2 gap-2 mt-2 animate-in slide-in-from-top-2">
                     {isPaused ? (
                        <button 
                            onClick={() => onAction('resume')}
                            className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Play size={18} fill="currentColor" /> Resume Turn
                        </button>
                     ) : (
                        <>
                            <button 
                                onClick={() => onAction('toggleTimer')}
                                className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 border border-yellow-600/50 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Pause size={18} fill="currentColor" /> Pause
                            </button>
                            <button 
                                onClick={() => onAction('endTurn')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-colors"
                            >
                                <SkipForward size={18} fill="currentColor" /> End Turn
                            </button>
                            <button 
                                onClick={() => onAction('pass')}
                                className="col-span-2 mt-1 bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <CheckCircle2 size={16} /> Pass Round
                            </button>
                        </>
                     )}
                  </div>
              )}

              {!isActive && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); onRemovePlayer(player.id); }}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 opacity-50 hover:opacity-100 transition-opacity"
                    title="Remove Player"
                 >
                    <Trash2 size={18} />
                 </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerManager;