import './style.css';
import { Game } from './game/game';
import { testConnection } from './utils/supabase';
import { StartMenu } from './menu';
import { supabase } from './utils/supabase';
import { setCurrentUser } from './utils/globalUser';
import { AudioManager } from './audio/AudioManager';
import './db/scores';

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

// Initialize audio manager
function initializeAudio() {
    // Create audio manager and make it globally accessible
    window.audioManager = new AudioManager();
    
    console.log('Audio system initialized');
}

// Initialize auth before starting the app
initializeAuth();

// Initialize the audio system
initializeAudio();

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
        
        // Start menu audio when menu is first shown
        if (window.audioManager) {
            window.audioManager.playMenuAudio();
        }
        
    } catch (error) {
        console.error('Initialization error:', error)
    }
}

initApp();