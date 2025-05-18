import './menu.css';
import { InstructionsPanel } from './InstructionsPanel';
import { ShopPanel } from './ShopPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { ProfilePanel } from './ProfilePanel';
import { SettingsPanel } from './SettingsPanel';
import { AuthPanel } from './AuthPanel';
import { getCurrentUser } from '../utils/globalUser';

export class StartMenu {
  constructor(game) {
    this.game = game;
    this.isVisible = true;
    this.container = document.getElementById('container');

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
    
    // Start menu audio when menu is created
    if (window.audioManager) {
      window.audioManager.playMenuAudio();
    }
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
    
    // Stop menu audio when game starts
    if (window.audioManager) {
      // Note: The game class will handle starting the game audio
      window.audioManager.stopMenuAudio();
    }
    
    setTimeout(() => {
      this.game.startGame();
    }, 500);
  }

  showInstructions() {
    this.hideMenu();
    this.instructionsPanel.show();
  }

  showShop() {
    this.hideMenu();
    this.shopPanel.show();
  }

  showLeaderboard() {
    this.hideMenu();
    this.leaderboardPanel.show();
  }

  showProfile() {
    this.hideMenu();
    this.profilePanel.show();
  }

  showSettings() {
    this.hideMenu();
    this.settingsPanel.show();
  }
  
  showAuth() {
    this.hideMenu();
    this.authPanel.show();
  }

  showMenu() {
    this.isVisible = true;
    // Refresh menu options in case auth state changed
    this.createMenuOptions();
    this.menuContainer.style.display = 'flex';
    
    // Ensure menu audio is playing when showing the menu
    if (window.audioManager && this.game.state !== this.game.STATES.PLAYING) {
      window.audioManager.playMenuAudio();
    }
    
    // Hide all panels
    this.instructionsPanel.hide();
    this.shopPanel.hide();
    this.leaderboardPanel.hide();
    this.profilePanel.hide();
    this.settingsPanel.hide();
    this.authPanel.hide();
  }

  hideMenu() {
    this.menuContainer.style.display = 'none';
  }
}