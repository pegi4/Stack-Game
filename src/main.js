import './style.css';
import { Game } from './game/game';
import { testConnection } from './utils/supabase';
import { StartMenu } from './menu';
import { supabase } from './utils/supabase';
import { setCurrentUser } from './utils/globalUser';
import './db/scores';
import audioManager from './audio/AudioManager'; // Import the audio manager

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
        // First, initialize audio system
        initAudio();
        
        const isConnected = await testConnection()
        if (isConnected) {
            console.log('Ready to use Supabase!')
        } else {
            console.error('Failed to connect to Supabase')
        }

        // Initialize the game
        const game = new Game();
        
        // Store game instance for cleanup
        window.gameInstance = game;
        
        // Initialize the menu with the game instance
        const menu = new StartMenu(game);
        
        // Make menu accessible globally
        window.menu = menu;
        
        // Hide the original start button and instructions since we're using the menu now
        const startButton = document.getElementById('start-button');
        const instructions = document.getElementById('instructions');
        
        if (startButton) startButton.style.display = 'none';
        if (instructions) instructions.style.display = 'none';
        
        // Add a beforeunload event to clean up resources
        window.addEventListener('beforeunload', () => {
            if (window.gameInstance) {
                window.gameInstance.destroy();
            }
        });
        
        // Add visibility change handler to preserve panel state
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.menu) {
                // When returning to the tab, restore the correct panel or menu state
                window.menu.restoreState();
            }
        });
        
    } catch (error) {
        console.error('Initialization error:', error)
    }
}

// Initialize audio system
function initAudio() {
    console.log('Initializing audio system...');
    
    // Add event listeners to handle first user interaction
    // (browsers require user interaction before playing audio)
    const handleFirstInteraction = () => {
        // Resume AudioContext if suspended
        if (audioManager.audioContext.state === 'suspended') {
            audioManager.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
                // Start menu music after resuming audio context
                audioManager.playMusic('menu');
            });
        }
        
        // Remove event listeners once audio is activated
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    
    console.log('Audio system initialized, waiting for user interaction');
}

initApp();