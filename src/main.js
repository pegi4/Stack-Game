import './style.css';
import { Game } from './game/game';
import { testConnection } from './utils/supabase';
import gsap from 'gsap';
import { StartMenu } from './StartMenu';

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
        
        // Initialize the menu with the game instance
        const menu = new StartMenu(game);
        
        // Make menu accessible globally
        window.menu = menu;
        
        // Hide the original start button and instructions since we're using the menu now
        const startButton = document.getElementById('start-button');
        const instructions = document.getElementById('instructions');
        
        if (startButton) startButton.style.display = 'none';
        if (instructions) instructions.style.display = 'none';
        
    } catch (error) {
        console.error('Initialization error:', error)
    }
}

initApp();