import * as THREE from 'three';
import gsap from 'gsap';
// Import only the StartMenu
import { StartMenu } from './StartMenu';

export class Game {
    constructor() {
        this.STATES = {
            'LOADING': 'loading',
            'PLAYING': 'playing',
            'READY': 'ready',
            'ENDED': 'ended',
            'RESETTING': 'resetting',
            'MENU': 'menu'
        };
        
        // Initialize basic elements
        this.blocks = [];
        this.state = this.STATES.LOADING;
        this.mainContainer = document.getElementById('container');
        this.scoreContainer = document.getElementById('score');
        this.startButton = document.getElementById('start-button');
        this.instructions = document.getElementById('instructions');
        this.scoreContainer.innerHTML = '0';
        
        // Initialize the menu only
        this.startMenu = new StartMenu(this);
        this.updateState(this.STATES.MENU);
        
        // Add event listeners
        document.addEventListener('keydown', e => {
            if (e.keyCode == 32 && this.state !== this.STATES.MENU)
                this.onAction();
        });
        
        document.addEventListener('click', e => {
            // We'll let the menu handle its own clicks
            if (this.state !== this.STATES.MENU) {
                this.onAction();
            }
        });
        
        document.addEventListener('touchstart', e => {
            e.preventDefault();
        });
    }
    
    updateState(newState) {
        for (let key in this.STATES)
            this.mainContainer.classList.remove(this.STATES[key]);
        this.mainContainer.classList.add(newState);
        this.state = newState;
    }
    
    onAction() {
        switch (this.state) {
            case this.STATES.READY:
                this.showGameUnavailableMessage();
                break;
            case this.STATES.PLAYING:
                this.showGameUnavailableMessage();
                break;
            case this.STATES.ENDED:
                this.showMenu();
                break;
        }
    }
    
    // Called by the StartMenu when user clicks Play Game
    startGame() {
        this.showGameUnavailableMessage();
    }
    
    showGameUnavailableMessage() {
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'game-error-message';
        errorMessage.style.position = 'absolute';
        errorMessage.style.top = '50%';
        errorMessage.style.left = '50%';
        errorMessage.style.transform = 'translate(-50%, -50%)';
        errorMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        errorMessage.style.padding = '20px';
        errorMessage.style.borderRadius = '10px';
        errorMessage.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        errorMessage.style.zIndex = '1000';
        errorMessage.style.fontFamily = '"Comfortaa", cursive';
        errorMessage.style.textAlign = 'center';
        
        errorMessage.innerHTML = `
            <h2 style="color: #333344; margin-bottom: 15px;">Game Unavailable</h2>
            <p style="color: #555566; margin-bottom: 10px;">Required game components are missing.</p>
            <p style="color: #777777; font-size: 14px; margin-bottom: 20px;">Stage and Block modules not found.</p>
            <button style="background-color: #333344; color: white; border: none; padding: 10px 20px; 
                    border-radius: 4px; cursor: pointer; font-family: 'Comfortaa', cursive;">
                Return to Menu
            </button>
        `;
        
        // Add to container
        this.mainContainer.appendChild(errorMessage);
        
        // Add click event to return button
        const returnButton = errorMessage.querySelector('button');
        returnButton.addEventListener('click', () => {
            this.mainContainer.removeChild(errorMessage);
            this.showMenu();
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (errorMessage.parentNode === this.mainContainer) {
                this.mainContainer.removeChild(errorMessage);
                this.showMenu();
            }
        }, 5000);
    }
    
    // Method to go back to menu
    showMenu() {
        if (this.startMenu) {
            this.startMenu.showMenu();
        } else {
            this.startMenu = new StartMenu(this);
        }
        this.updateState(this.STATES.MENU);
    }
    
    // Dummy methods to satisfy any StartMenu calls
    placeBlock() {
        this.showGameUnavailableMessage();
    }
    
    endGame() {
        this.updateState(this.STATES.ENDED);
    }
    
    restartGame() {
        this.showMenu();
    }
    
    // Empty placeholder for tick method that StartMenu might expect
    tick() {
        // Do nothing - just a placeholder
    }
}