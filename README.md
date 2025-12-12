# Game Night OS

Game Night OS is a comprehensive companion web application designed to streamline board game sessions. It replaces scattered helper apps with a single, cohesive interface for tracking turns, time, scores, and rules.

## Features

### 🎮 Session Management
- **Player Tracking**: Manage multiple players with custom colors and names.
- **Scorekeeping**: Simple VP (Victory Point) tracker for each player.
- **Turn Timers**: Track how long each player takes. Great for identifying "Analysis Paralysis"!
- **Initiative Roller**: A visual animation to randomly select the starting player.

### ⏱️ Turn Logic
- **Global Timer**: Track the total duration of your game session.
- **Turn Modes**:
  - **Orbit**: Standard turn cycling.
  - **Pass**: For round-based games where players pass until the end of the round.
- **Round Tracking**: Optional max round limit with visual indicators for the final round.

### 📚 Digital Rulebook
- **Rule Notes**: Save quick reference rules for your favorite games.
- **Search**: Instantly filter rules by keyword.
- **External Search**: Quick links to search BoardGameGeek or Google if a rule isn't found locally.
- **Persistence**: Rules are saved to your browser's local storage.

### 🛠️ Tools
- **Dice Roller**: Instant random numbers for d4, d6, d8, d10, d12, and d20.
- **Coin Flipper**: A simple heads/tails generator with history.

## Technology

- **React 19**: Modern UI component architecture.
- **TypeScript**: Type-safe development.
- **Tailwind CSS**: Utility-first styling for a sleek, dark-mode interface.
- **Lucide React**: Clean, consistent iconography.
- **Local Storage**: All data (players, rules) persists between page reloads.

## Usage

1. **Add Players**: Enter names in the top bar to join the lobby.
2. **Roll for Initiative**: Click the big button to pick a start player.
3. **Play**: 
   - Click "End Turn" to pass to the next player.
   - Click "Pause" to stop timers (e.g., for snack breaks).
   - Click "Pass Round" (if enabled) to drop out of the current round.
4. **Tools & Rules**: Switch tabs at the bottom to access dice or look up rules without leaving the app.

## License

MIT