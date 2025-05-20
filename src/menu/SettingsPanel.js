// src/menu/SettingsPanel.js
import audioManager from '../audio/AudioManager';

export class SettingsPanel {
  constructor(container, onBack) {
    this.panel = document.createElement('div');
    this.panel.className = 'panel settings-panel';
    
    // Store the onBack callback
    this.onBack = onBack;
    
    // Initial render of the panel
    this.render();
    
    container.appendChild(this.panel);
    
    // Add event listeners
    this.addEventListeners();
  }
  
  render() {
    this.panel.innerHTML = `
      <div class="panel-header">
        <button class="back-icon">&larr;</button>
        <h2 class="panel-title">Settings</h2>
      </div>
      
      <div class="settings-section">
        <h3>Audio Settings</h3>
        
        <div class="setting-item">
          <div class="setting-label">
            <span>Music</span>
            <button id="toggle-music" class="toggle-button ${audioManager.musicEnabled ? 'active' : ''}">
              ${audioManager.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div class="slider-container">
            <input 
              type="range" 
              id="music-volume" 
              min="0" 
              max="1" 
              step="0.1" 
              value="${audioManager.musicVolume}" 
              ${!audioManager.musicEnabled ? 'disabled' : ''}
            >
            <span class="volume-value">${Math.round(audioManager.musicVolume * 100)}%</span>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            <span>Sound Effects</span>
            <button id="toggle-sfx" class="toggle-button ${audioManager.sfxEnabled ? 'active' : ''}">
              ${audioManager.sfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div class="slider-container">
            <input 
              type="range" 
              id="sfx-volume" 
              min="0" 
              max="1" 
              step="0.1" 
              value="${audioManager.sfxVolume}" 
              ${!audioManager.sfxEnabled ? 'disabled' : ''}
            >
            <span class="volume-value">${Math.round(audioManager.sfxVolume * 100)}%</span>
          </div>
        </div>
        
        <div class="setting-actions">
          <button id="test-audio" class="setting-button">Test Sounds</button>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Game Settings</h3>
        <!-- Add game settings here in the future -->
        <p>More settings coming soon!</p>
      </div>
      
      <div class="back-button">Back to Menu</div>
    `;
    
    // Add CSS for the settings panel
    this.addStyles();
  }
  
  addStyles() {
    // Add CSS if not already present
    if (!document.getElementById('settings-panel-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'settings-panel-styles';
      styleElement.textContent = `
        .settings-section {
          width: 100%;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .settings-section:last-child {
          border-bottom: none;
        }
        
        .settings-section h3 {
          font-size: 20px;
          color: #333344;
          margin-bottom: 15px;
        }
        
        .setting-item {
          margin-bottom: 15px;
          width: 100%;
        }
        
        .setting-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .toggle-button {
          background-color: #ccc;
          color: #fff;
          border: none;
          border-radius: 15px;
          padding: 5px 15px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .toggle-button.active {
          background-color: #333344;
        }
        
        .slider-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .slider-container input[type="range"] {
          flex: 1;
          height: 5px;
          background: #ddd;
          outline: none;
          border-radius: 5px;
        }
        
        .volume-value {
          min-width: 40px;
          text-align: right;
        }
        
        .setting-actions {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }
        
        .setting-button {
          background-color: #333344;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .setting-button:hover {
          background-color: #444455;
          transform: scale(1.05);
        }
      `;
      document.head.appendChild(styleElement);
    }
  }
  
  addEventListeners() {
    // Back button
    const backButton = this.panel.querySelector('.back-button');
    backButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to game
      audioManager.playSoundEffect('menuClick');
      this.onBack();
    });
    
    // Same for back icon
    const backIcon = this.panel.querySelector('.back-icon');
    backIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      audioManager.playSoundEffect('menuClick');
      this.onBack();
    });
    
    // Music toggle
    const toggleMusic = this.panel.querySelector('#toggle-music');
    toggleMusic.addEventListener('click', () => {
      const isEnabled = audioManager.toggleMusic();
      toggleMusic.textContent = isEnabled ? 'ON' : 'OFF';
      toggleMusic.classList.toggle('active', isEnabled);
      
      // Enable/disable the volume slider
      const musicVolume = this.panel.querySelector('#music-volume');
      musicVolume.disabled = !isEnabled;
      
      // Play test sound
      audioManager.playSoundEffect('menuClick');
      
      // Re-render to update UI
      this.render();
      this.addEventListeners();
    });
    
    // SFX toggle
    const toggleSFX = this.panel.querySelector('#toggle-sfx');
    toggleSFX.addEventListener('click', () => {
      const isEnabled = audioManager.toggleSFX();
      toggleSFX.textContent = isEnabled ? 'ON' : 'OFF';
      toggleSFX.classList.toggle('active', isEnabled);
      
      // Enable/disable the volume slider
      const sfxVolume = this.panel.querySelector('#sfx-volume');
      sfxVolume.disabled = !isEnabled;
      
      // Play test sound if enabled
      if (isEnabled) {
        audioManager.playSoundEffect('menuClick');
      }
      
      // Re-render to update UI
      this.render();
      this.addEventListeners();
    });
    
    // Music volume
    const musicVolume = this.panel.querySelector('#music-volume');
    const musicVolumeValue = this.panel.querySelector('#music-volume + .volume-value');
    
    musicVolume.addEventListener('input', () => {
      const value = parseFloat(musicVolume.value);
      audioManager.setMusicVolume(value);
      musicVolumeValue.textContent = `${Math.round(value * 100)}%`;
    });
    
    // SFX volume
    const sfxVolume = this.panel.querySelector('#sfx-volume');
    const sfxVolumeValue = this.panel.querySelector('#sfx-volume + .volume-value');
    
    sfxVolume.addEventListener('input', () => {
      const value = parseFloat(sfxVolume.value);
      audioManager.setSFXVolume(value);
      sfxVolumeValue.textContent = `${Math.round(value * 100)}%`;
      
      // Play a test sound to demonstrate the volume
      audioManager.playSoundEffect('menuClick');
    });
    
    // Test audio button
    const testAudio = this.panel.querySelector('#test-audio');
    testAudio.addEventListener('click', () => {
      // Play a sequence of test sounds
      audioManager.playSoundEffect('menuClick');
      
      setTimeout(() => audioManager.playSoundEffect('blockPlace'), 300);
      setTimeout(() => audioManager.playSoundEffect('blockPerfect'), 600);
      setTimeout(() => audioManager.playSoundEffect('blockMiss'), 1000);
    });
  }
  
  show() { 
    this.panel.classList.add('visible');
    // Refresh settings when panel is shown
    this.render();
    this.addEventListeners();
  }
  
  hide() { 
    this.panel.classList.remove('visible'); 
  }
}