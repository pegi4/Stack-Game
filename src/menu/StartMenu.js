import gsap from 'gsap';
import './menu.css';
import { InstructionsPanel } from './InstructionsPanel';
import { ShopPanel } from './ShopPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { ProfilePanel } from './ProfilePanel';
import { HighScoresPanel } from './HighScoresPanel';
import { SettingsPanel } from './SettingsPanel';

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
    this.createMenuOption('Play Game', () => this.startGame());
    this.createMenuOption('How To Play', () => this.showInstructions());
    this.createMenuOption('Shop', () => this.showShop());
    this.createMenuOption('Leaderboard', () => this.showLeaderboard());
    this.createMenuOption('Profile', () => this.showProfile());
    this.createMenuOption('High Scores', () => this.showHighScores());
    this.createMenuOption('Settings', () => this.showSettings());

    // Create initial animations
    this.animateMenuIn();

    // Initialize panels
    this.instructionsPanel = new InstructionsPanel(this.container, () => this.showMenu());
    this.shopPanel = new ShopPanel(this.container, () => this.showMenu());
    this.leaderboardPanel = new LeaderboardPanel(this.container, () => this.showMenu());
    this.profilePanel = new ProfilePanel(this.container, () => this.showMenu());
    this.highScoresPanel = new HighScoresPanel(this.container, () => this.showMenu());
    this.settingsPanel = new SettingsPanel(this.container, () => this.showMenu());
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

  showHighScores() {
    this.hideMenu();
    this.highScoresPanel.show();
  }

  showSettings() {
    this.hideMenu();
    this.settingsPanel.show();
  }

  showMenu() {
    this.isVisible = true;
    this.menuContainer.style.display = 'flex';
    // Hide all panels
    this.instructionsPanel.hide();
    this.shopPanel.hide();
    this.leaderboardPanel.hide();
    this.profilePanel.hide();
    this.highScoresPanel.hide();
    this.settingsPanel.hide();
  }

  hideMenu() {
    this.menuContainer.style.display = 'none';
  }
} 