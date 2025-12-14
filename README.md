# Pacman Game

A modern, feature-rich clone of the classic arcade game Pacman, built with TypeScript, HTML5 Canvas, and Vite.

## Features
- **Core Gameplay**: Authentic movement, pellet eating, and collision detection.
- **Smart AI**:
  - **Red & Pink Ghosts**: Actively chase Pacman using pathfinding.
  - **Cyan & Orange Ghosts**: display complex, semi-random behavior.
  - **Scared Mode**: Ghosts turn blue and vulnerable when Power Pellets are eaten.
- **Polished Visuals**:
  - Grid-snapped movement for smooth control.
  - Animated Pacman mouth and Ghost eyes that follow direction.
  - Scalable game board.
- **High Score System**:
  - Tracks top 10 scores with player names.
  - Persistent storage using LocalStorage.
  - In-game Leaderboard.

## Technologies
- **Language**: TypeScript
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas API
- **Audio**: Web Audio API (Synthesized sound effects)

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- npm (Node Package Manager).

### Installation
1. Clone the repository (or extract the project files).
2. Navigate to the project directory:
   ```bash
   cd pacman-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the development server:
```bash
npm run dev
```
Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

### Building for Production
To create an optimized build:
```bash
npm run build
```
The output will be in the `dist` folder.

## How to Play
1. **Controls**: Use the **Arrow Keys** (Up, Down, Left, Right) to control Pacman.
2. **Objective**: Eat all the small dots (pellets) to win the level.
3. **Avoid Ghosts**: If a ghost touches you, it's Game Over.
4. **Power Pellets**: Eat the large flashing pellets in the corners to turn ghosts **Blue**.
   - While Blue, ghosts move slower and can be eaten for bonus points.
   - Eaten ghosts return to the center and respawn.
5. **High Scores**:
   - If you achieve a high score, you will be prompted to enter your name (max 5 letters) after the game.
   - Press **Enter** to submit.
   - Press **H** on the Main Menu to view the Champions Board.
