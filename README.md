# Stack Game

A 3D tower-stacking game built with Three.js and Vite, inspired by the mobile game "Stack". Players stack blocks by clicking to place them, aiming for perfect alignment. Misaligned blocks get trimmed, and the game ends when a block misses entirely.

## Features

- 3D graphics powered by Three.js
- Smooth animations with GSAP
- Responsive design that works on both desktop and mobile
- Player profiles and statistics (via Supabase)
- Global leaderboard
- In-game store for block skins

## Technologies Used

- JavaScript (ES6+)
- Three.js - 3D graphics
- GSAP - Animations
- Supabase - Backend and authentication
- Tailwind CSS - Styling
- Vite - Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stack-game.git
cd stack-game
```

2. Install dependencies:
```bash
npm install
# or if using pnpm
pnpm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
# or
pnpm build
```

The built files will be in the `dist` directory.

## Game Controls

- Click or press spacebar to place a block
- Try to align each block as perfectly as possible with the one below
- Perfect alignments give bonus points
- Game ends when a block misses the stack completely

## Project Structure 