
export interface Player {
  id: number;
  name: string;
  color: string;
  timeSeconds: number;
  score: number;
  hasPassed: boolean;
}

export interface Rule {
  id: number;
  title: string;
  text: string;
}

export type TurnMode = 'orbit' | 'pass';
export type GameStatus = 'setup' | 'playing' | 'finished';

export interface GameSettings {
  mode: TurnMode;
  maxRounds: number; // 0 for unlimited
}
