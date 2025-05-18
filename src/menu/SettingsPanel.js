export class SettingsPanel {
  constructor(container, onBack) {
    this.panel = document.createElement('div');
    this.panel.className = 'panel settings-panel';
    
    // Create panel content with volume sliders
    this.panel.innerHTML = `
      <div class="panel-header">
        <button class="back-icon">&larr;</button>
        <h2 class="panel-title">Settings</h2>
      </div>
      
      <div class="settings-content">
        <div class="settings-section">
          <h3>Audio Settings</h3>
          
          <div class="form-group">
            <label for="menu-volume">Menu Audio Volume</label>
            <div class="volume-control">
              <input type="range" id="menu-volume" min="0" max="100" value="50" class="volume-slider">
              <span class="volume-value">50%</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="game-volume">Game Audio Volume</label>
            <div class="volume-control">
              <input type="range" id="game-volume" min="0" max="100" value="50" class="volume-slider">
              <span class="volume-value">50%</span>
            </div>
          </div>
          
          <div class="status-message"></div>
        </div>
      </div>
    `;
    container.appendChild(this.panel);
    
    // Get references to elements
    this.backButton = this.panel.querySelector('.back-icon');
    this.menuVolumeSlider = this.panel.querySelector('#menu-volume');
    this.gameVolumeSlider = this.panel.querySelector('#game-volume');
    this.menuVolumeValue = this.panel.querySelector('#menu-volume + .volume-value');
    this.gameVolumeValue = this.panel.querySelector('#game-volume + .volume-value');
    this.statusMessage = this.panel.querySelector('.status-message');
    
    // Add event listeners
    this.backButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to game
      this.saveSettings();
      onBack();
    });
    
    // Update volume display values when sliders change
    this.menuVolumeSlider.addEventListener('input', () => {
      this.updateVolumeDisplay(this.menuVolumeSlider, this.menuVolumeValue);
      this.updateMenuVolume(this.menuVolumeSlider.value);
    });
    
    this.gameVolumeSlider.addEventListener('input', () => {
      this.updateVolumeDisplay(this.gameVolumeSlider, this.gameVolumeValue);
      this.updateGameVolume(this.gameVolumeSlider.value);
    });
    
    // Load saved settings when panel is created
    this.loadSettings();
  }
  
  updateVolumeDisplay(slider, valueDisplay) {
    valueDisplay.textContent = `${slider.value}%`;
  }
  
  updateMenuVolume(value) {
    // The actual audio implementation will depend on how audio is handled in the app
    const normalizedVolume = value / 100;
    if (window.audioManager) {
      window.audioManager.setMenuVolume(normalizedVolume);
    }
  }
  
  updateGameVolume(value) {
    // The actual audio implementation will depend on how audio is handled in the app
    const normalizedVolume = value / 100;
    if (window.audioManager) {
      window.audioManager.setGameVolume(normalizedVolume);
    }
  }
  
  loadSettings() {
    // Load settings from localStorage if available
    try {
      const savedSettings = localStorage.getItem('stackGameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        if (settings.menuVolume !== undefined) {
          this.menuVolumeSlider.value = settings.menuVolume;
          this.updateVolumeDisplay(this.menuVolumeSlider, this.menuVolumeValue);
          this.updateMenuVolume(settings.menuVolume);
        }
        
        if (settings.gameVolume !== undefined) {
          this.gameVolumeSlider.value = settings.gameVolume;
          this.updateVolumeDisplay(this.gameVolumeSlider, this.gameVolumeValue);
          this.updateGameVolume(settings.gameVolume);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  saveSettings() {
    // Save settings to localStorage
    try {
      const settings = {
        menuVolume: parseInt(this.menuVolumeSlider.value),
        gameVolume: parseInt(this.gameVolumeSlider.value)
      };
      
      localStorage.setItem('stackGameSettings', JSON.stringify(settings));
      
      this.showStatusMessage('Settings saved!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatusMessage('Failed to save settings', 'error');
    }
  }
  
  showStatusMessage(message, type = 'info') {
    this.statusMessage.textContent = message;
    this.statusMessage.className = 'status-message';
    this.statusMessage.classList.add(`status-${type}`);
    
    // Clear the message after a few seconds
    setTimeout(() => {
      this.statusMessage.textContent = '';
      this.statusMessage.className = 'status-message';
    }, 3000);
  }
  
  show() { 
    this.panel.classList.add('visible');
    // Reload settings when panel is shown
    this.loadSettings();
  }
  
  hide() { 
    this.panel.classList.remove('visible');
    // Save settings when panel is hidden
    this.saveSettings();
  }
}