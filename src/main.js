import './style.css';
import { Game } from './game/game';
import { testConnection } from './utils/supabase';
import gsap from 'gsap';

// Initialize GSAP plugins if needed
// import { Power1 } from 'gsap/all';
// gsap.registerPlugin(Power1);

// Test Supabase connection and initialize game
async function initApp() {
    try {
        const isConnected = await testConnection()
        if (isConnected) {
            console.log('Ready to use Supabase!')
        } else {
            console.error('Failed to connect to Supabase')
        }

        // Initialize the game after Supabase connection test
        const game = new Game();
    } catch (error) {
        console.error('Initialization error:', error)
    }
}

initApp();