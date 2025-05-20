// src/menu/InstructionsPanel.js
import audioManager from '../audio/AudioManager';

export class InstructionsPanel {
  constructor(container, onBack) {
    this.panel = document.createElement('div');
    this.panel.className = 'panel instructions-panel';
    this.panel.innerHTML = `
      <h2>How To Play</h2>
      <div>
        <p>• Click or press spacebar to place blocks</p>
        <p>• Try to align each block perfectly</p>
        <p>• Perfect alignments give bonus points</p>
        <p>• Game ends when a block completely misses the stack</p>
      </div>
      <div class="back-button">Back to Menu</div>
    `;
    container.appendChild(this.panel);
    
    // Add click handler for back button
    const backButton = this.panel.querySelector('.back-button');
    backButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to game
      
      // Play menu click sound
      audioManager.playSoundEffect('menuClick');
      
      onBack();
    });
  }
  
  show() { 
    this.panel.classList.add('visible');
    
    // Play menu click sound when panel is shown
    audioManager.playSoundEffect('menuClick');
  }
  
  hide() { 
    this.panel.classList.remove('visible'); 
  }
}