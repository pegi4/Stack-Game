// StartMenu.js
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
    
    createMenuOption(text, callback) {
        const option = document.createElement('div');
        option.textContent = text;
        option.className = 'menu-option';
        option.addEventListener('click', callback);
        this.menuContainer.appendChild(option);
        return option;
    }
    
    animateMenuIn() {
        // Animate menu elements in
        gsap.fromTo(this.title, 
            { y: -50, opacity: 0 }, 
            { duration: 0.8, y: 0, opacity: 1, ease: "power2.out" }
        );
        
        const options = this.menuContainer.querySelectorAll('.menu-option');
        gsap.fromTo(options, 
            { x: -30, opacity: 0 }, 
            { 
                duration: 0.5, 
                x: 0, 
                opacity: 1, 
                stagger: 0.1, 
                ease: "power2.out",
                delay: 0.3
            }
        );
    }
    
    startGame() {
        // Hide menu
        this.hideMenu();
        
        // Start the game (using your existing game start method)
        setTimeout(() => {
            this.game.startGame();
        }, 500);
    }
    
    showInstructions() {
        this.hideMenu();
        this.instructionsPanel.classList.add('visible');
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
    
    showHighScores() {
        this.hideMenu();
        this.highScoresPanel.classList.add('visible');
        // Here you would typically load scores from Supabase
    }
    
    createHighScoresPanel() {
        this.highScoresPanel = document.createElement('div');
        this.highScoresPanel.className = 'panel high-scores-panel';
        
        const title = document.createElement('h2');
        title.textContent = 'High Scores';
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="score-row"><span>PlayerOne</span><span>42</span></div>
            <div class="score-row"><span>BlockMaster</span><span>37</span></div>
            <div class="score-row"><span>TowerBuilder</span><span>35</span></div>
            <div class="score-row"><span>StackChamp</span><span>31</span></div>
            <div class="score-row"><span>NewPlayer</span><span>28</span></div>
        `;
        
        const backButton = document.createElement('div');
        backButton.textContent = 'Back to Menu';
        backButton.className = 'back-button';
        backButton.addEventListener('click', () => {
            this.highScoresPanel.classList.remove('visible');
            this.showMenu();
        });
        
        this.highScoresPanel.appendChild(title);
        this.highScoresPanel.appendChild(content);
        this.highScoresPanel.appendChild(backButton);
        this.container.appendChild(this.highScoresPanel);
    }
    
    showSettings() {
        this.hideMenu();
        this.settingsPanel.classList.add('visible');
    }
    
    createSettingsPanel() {
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.className = 'panel settings-panel';
        
        const title = document.createElement('h2');
        title.textContent = 'Settings';
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="setting-row">
                <span>Sound</span>
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="setting-row">
                <span>Music</span>
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="setting-row">
                <span>Difficulty</span>
                <select>
                    <option>Easy</option>
                    <option selected>Normal</option>
                    <option>Hard</option>
                </select>
            </div>
        `;
        
        const backButton = document.createElement('div');
        backButton.textContent = 'Back to Menu';
        backButton.className = 'back-button';
        backButton.addEventListener('click', () => {
            this.settingsPanel.classList.remove('visible');
            this.showMenu();
        });
        
        this.settingsPanel.appendChild(title);
        this.settingsPanel.appendChild(content);
        this.settingsPanel.appendChild(backButton);
        this.container.appendChild(this.settingsPanel);
    }
    
    hideMenu() {
        const options = this.menuContainer.querySelectorAll('.menu-option');
        gsap.to(options, { 
            duration: 0.3, 
            x: -30, 
            opacity: 0, 
            stagger: 0.05, 
            ease: "power2.in" 
        });
        
        gsap.to(this.title, { 
            duration: 0.5, 
            y: -50, 
            opacity: 0, 
            ease: "power2.in",
            onComplete: () => {
                this.menuContainer.style.display = 'none';
                this.isVisible = false;
            }
        });
    }
    
    showMenu() {
        this.menuContainer.style.display = 'flex';
        this.isVisible = true;
        this.animateMenuIn();
    }
    
    // Method to destroy/cleanup the menu
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
}