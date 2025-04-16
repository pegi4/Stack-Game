import gsap from 'gsap';
import './menu.css'; // We'll create this file next

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
        this.createMenuOption('High Scores', () => this.showHighScores());
        this.createMenuOption('Settings', () => this.showSettings());
        
        // Create initial animations
        this.animateMenuIn();
        
        // Create instructions panel (hidden by default)
        this.createInstructionsPanel();
        
        // Create high scores panel (hidden by default)
        this.createHighScoresPanel();
        
        // Create settings panel (hidden by default)
        this.createSettingsPanel();
    }

    destroy() {
        if (this.menuContainer && this.menuContainer.parentNode) {
            this.menuContainer.parentNode.removeChild(this.menuContainer);
        }
        
        if (this.instructionsPanel && this.instructionsPanel.parentNode) {
            this.instructionsPanel.parentNode.removeChild(this.instructionsPanel);
        }
        
        if (this.highScoresPanel && this.highScoresPanel.parentNode) {
            this.highScoresPanel.parentNode.removeChild(this.highScoresPanel);
        }
        
        if (this.settingsPanel && this.settingsPanel.parentNode) {
            this.settingsPanel.parentNode.removeChild(this.settingsPanel);
        }
    }

    createMenuOption(text, callback) {
        const option = document.createElement('div');
        option.textContent = text;
        option.className = 'menu-option';
        option.addEventListener('click', callback);
        this.menuContainer.appendChild(option);
        return option;
    }

    createInstructionsPanel() {
        this.instructionsPanel = document.createElement('div');
        this.instructionsPanel.className = 'panel instructions-panel';
        
        const title = document.createElement('h2');
        title.textContent = 'How To Play';
        
        const content = document.createElement('div');
        content.innerHTML = `
            <p>• Click or press spacebar to place blocks</p>
            <p>• Try to align each block perfectly</p>
            <p>• Perfect alignments give bonus points</p>
            <p>• Game ends when a block completely misses the stack</p>
        `;
        
        const backButton = document.createElement('div');
        backButton.textContent = 'Back to Menu';
        backButton.className = 'back-button';
        backButton.addEventListener('click', () => {
            this.instructionsPanel.classList.remove('visible');
            this.showMenu();
        });
        
        this.instructionsPanel.appendChild(title);
        this.instructionsPanel.appendChild(content);
        this.instructionsPanel.appendChild(backButton);
        this.container.appendChild(this.instructionsPanel);
    }
}