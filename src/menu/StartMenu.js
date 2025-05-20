import './menu.css';
import { InstructionsPanel } from './InstructionsPanel';
import { ShopPanel } from './ShopPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { ProfilePanel } from './ProfilePanel';
import { SettingsPanel } from './SettingsPanel';
import { AuthPanel } from './AuthPanel';
import { getCurrentUser } from '../utils/globalUser';
import audioManager from '../audio/AudioManager';

export class StartMenu {
  constructor(game) {
    this.game = game;
    this.isVisible = true;
    this.container = document.getElementById('container');
    this.activePanel = null; // Track which panel is currently active

    // Create menu container
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'game-menu';
    this.container.appendChild(this.menuContainer);

    // Create menu title
    this.title = document.createElement('h1');
    this.title.textContent = 'STACK';
    this.title.className = 'menu-title';
    this.menuContainer.appendChild(this.title);

    // Create menu options
    this.createMenuOptions();

    // Create initial animations
    this.animateMenuIn();

    // Initialize panels
    this.instructionsPanel = new InstructionsPanel(this.container, () => this.showMenu());
    this.shopPanel = new ShopPanel(this.container, () => this.showMenu());
    this.leaderboardPanel = new LeaderboardPanel(this.container, () => this.showMenu());
    this.profilePanel = new ProfilePanel(this.container, () => this.showMenu());
    this.settingsPanel = new SettingsPanel(this.container, () => this.showMenu());
    this.authPanel = new AuthPanel(this.container, () => this.showMenu());
    
    // Initialize audio context with first user interaction
    this.menuContainer.addEventListener('click', () => {
      // This ensures audio context is activated on first user interaction
      if (audioManager.audioContext.state === 'suspended') {
        audioManager.audioContext.resume().then(() => {
          console.log('AudioContext resumed by user interaction');
          // Start menu music once audio context is active
          audioManager.playMusic('menu');
        });
      }
    }, { once: true });
    
    // Start menu music when created (this might not work until user interaction)
    setTimeout(() => {
      audioManager.playMusic('menu');
    }, 500);
    
    // Add a visibility change handler to explicitly prevent menu from showing after tab switch
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log("Tab visible again, checking if we should prevent menu");
        if (window.preventMenuAfterTabSwitch) {
          console.log("PREVENTING MENU AFTER TAB SWITCH");
          // Hide menu if it somehow became visible
          this.hideMenu();
          
          // Make sure panels stay visible if one was active
          this.restoreState();
        }
      }
    });
  }

  createMenuOptions() {
    // Clear existing options
    while (this.menuContainer.children.length > 1) {
      this.menuContainer.removeChild(this.menuContainer.lastChild);
    }

    this.createMenuOption('Play Game', () => this.startGame());
    this.createMenuOption('How To Play', () => this.showInstructions());
    this.createMenuOption('Leaderboard', () => this.showLeaderboard());
    
    // Check if user is logged in
    const user = getCurrentUser();
    if (user) {
      this.createMenuOption('Shop', () => this.showShop());
      this.createMenuOption('Profile', () => this.showProfile());
    } else {
      this.createMenuOption('Login / Register', () => this.showAuth());
    }

    this.createMenuOption('Settings', () => this.showSettings());
  }

  createMenuOption(text, onClick) {
    const option = document.createElement('div');
    option.textContent = text;
    option.className = 'menu-option';
    option.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to game
      
      // Play menu click sound
      audioManager.playSoundEffect('menuClick');
      
      onClick();
    });
    this.menuContainer.appendChild(option);
  }

  animateMenuIn() {
    // Add animation logic here if needed
  }

  startGame() {
    this.isVisible = false;
    this.hideMenu();
    this.activePanel = null; // Reset active panel
    
    // Make sure audio context is running before starting the game
    if (audioManager.audioContext.state === 'suspended') {
      audioManager.audioContext.resume();
    }
    
    // Play the start game sound
    audioManager.playSoundEffect('gameStart');
    
    // Start the game if it exists
    if (this.game) {
      setTimeout(() => {
        // Don't call game.startGame() if the game is already in PLAYING or PAUSED states
        if (this.game.state !== this.game.STATES.PLAYING && 
            this.game.state !== this.game.STATES.PAUSED) {
          this.game.startGame();
        }
      }, 500);
    }
  }

  showInstructions() {
    this.hideMenu();
    this.activePanel = 'instructions';
    this.instructionsPanel.show();
  }

  showShop() {
    this.hideMenu();
    this.activePanel = 'shop';
    this.shopPanel.show();
  }

  showLeaderboard() {
    this.hideMenu();
    this.activePanel = 'leaderboard';
    this.leaderboardPanel.show();
  }

  showProfile() {
    this.hideMenu();
    this.activePanel = 'profile';
    this.profilePanel.show();
  }

  showSettings() {
    this.hideMenu();
    this.activePanel = 'settings';
    this.settingsPanel.show();
  }
  
  showAuth() {
    this.hideMenu();
    this.activePanel = 'auth';
    this.authPanel.show();
  }

  showMenu() {
    // Skip showing menu if we're in a tab switch from gameplay
    if (window.preventMenuAfterTabSwitch) {
      console.log("SKIPPING MENU SHOW DUE TO TAB SWITCH");
      return;
    }
    
    this.isVisible = true;
    this.activePanel = null;
    
    // Refresh menu options in case auth state changed
    this.createMenuOptions();
    this.menuContainer.style.display = 'flex';
    
    // Make sure menu music is playing when menu is shown
    // The audioManager will check if it's already playing this track
    audioManager.playMusic('menu');
    
    // Hide all panels
    this.instructionsPanel.hide();
    this.shopPanel.hide();
    this.leaderboardPanel.hide();
    this.profilePanel.hide();
    this.settingsPanel.hide();
    this.authPanel.hide();
  }

  hideMenu() {
    this.isVisible = false;
    this.menuContainer.style.display = 'none';
  }
  
  // Method to restore the correct panel after tab switch
  restoreState() {
    console.log("Restoring state, active panel:", this.activePanel);
    
    // If a panel was active, make sure it stays visible
    if (this.activePanel) {
      switch (this.activePanel) {
        case 'instructions':
          this.instructionsPanel.show();
          break;
        case 'shop':
          this.shopPanel.show();
          break;
        case 'leaderboard':
          this.leaderboardPanel.show();
          break;
        case 'profile':
          this.profilePanel.show();
          break;
        case 'settings':
          this.settingsPanel.show();
          break;
        case 'auth':
          this.authPanel.show();
          break;
      }
    } else if (this.isVisible && !window.preventMenuAfterTabSwitch) {
      // Only show menu if it was visible and we're not preventing it
      this.menuContainer.style.display = 'flex';
    }
  }
}