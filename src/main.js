import './style.css';
import { Game } from './game/game';
import { testConnection } from './utils/supabase';
import { StartMenu } from './menu';
import { supabase } from './utils/supabase';
import { setCurrentUser } from './utils/globalUser';
import './db/scores';
import { initAudio } from './audio'; // Import the audio initialization

async function initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
    }
  
    // Listener for auth state changes (login, logout)
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
      
      // Refresh menu if it exists
      if (window.menu) {
        window.menu.showMenu();
      }
    });
}

// Initialize auth before starting the app
initializeAuth();

// Test Supabase connection and initialize game
async function initApp() {
    try {
        // Initialize audio system
        await initAudio();
        console.log('Audio system initialized');
        
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