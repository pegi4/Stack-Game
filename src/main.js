import './style.css';
import { testConnection } from './utils/supabase';
import { StartMenu } from './StartMenu';

// Test Supabase connection and initialize game
async function initApp() {
    try {
        const isConnected = await testConnection()
        if (isConnected) {
            console.log('Ready to use Supabase!')
        } else {
            console.error('Failed to connect to Supabase')
        }
        
        // Create a temporary game object to pass to StartMenu
        // You'll replace this with your actual Game class later
        const tempGame = {
            startGame: () => console.log('Game started!')
        };
        
        // Initialize the start menu
        const startMenu = new StartMenu(tempGame);
        
    } catch (error) {
        console.error('Initialization error:', error)
    }
}

// Initialize the application
initApp();