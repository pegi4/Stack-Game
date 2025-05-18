// src/audio/AudioManager.js

export class AudioManager {
  constructor() {
    // Initialize audio context
    this.audioContext = null;
    this.initialized = false;
    
    // Create audio containers
    this.menuAudio = null;
    this.gameAudio = null;
    
    // Volume settings (0 to 1)
    this.menuVolume = 0.5;
    this.gameVolume = 0.5;
    
    // Track current state
    this.menuPlaying = false;
    this.gamePlaying = false;
    
    // Initialize on first user interaction
    this.initOnInteraction();
    
    // Load settings
    this.loadSettings();
  }
  
  initOnInteraction() {
    const initAudio = () => {
      if (!this.initialized) {
        try {
          // Create audio context
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          
          // Create gain nodes for volume control
          this.menuGainNode = this.audioContext.createGain();
          this.gameGainNode = this.audioContext.createGain();
          
          this.menuGainNode.gain.value = this.menuVolume;
          this.gameGainNode.gain.value = this.gameVolume;
          
          // Connect gain nodes to destination
          this.menuGainNode.connect(this.audioContext.destination);
          this.gameGainNode.connect(this.audioContext.destination);
          
          // Load audio files
          this.loadAudioFiles();
          
          this.initialized = true;
          
          // Remove event listeners once initialized
          document.removeEventListener('click', initAudio);
          document.removeEventListener('keydown', initAudio);
          document.removeEventListener('touchstart', initAudio);
        } catch (error) {
          console.error('Failed to initialize audio:', error);
        }
      }
    };
    
    // Initialize on user interaction
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    document.addEventListener('touchstart', initAudio);
  }
  
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('stackGameSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        if (settings.menuVolume !== undefined) {
          this.menuVolume = settings.menuVolume / 100;
        }
        
        if (settings.gameVolume !== undefined) {
          this.gameVolume = settings.gameVolume / 100;
        }
        
        // Update gain nodes if already initialized
        if (this.initialized) {
          this.menuGainNode.gain.value = this.menuVolume;
          this.gameGainNode.gain.value = this.gameVolume;
        }
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }
  
  async loadAudioFiles() {
    try {
      // Menu background music
      await this.createMenuAudio();
      
      // Game audio
      await this.createGameAudio();
      
      // Load sound effects
      await this.loadSoundEffects();
      
    } catch (error) {
      console.error('Error loading audio files:', error);
    }
  }
  
  async loadAudioBuffer(url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Error loading audio file from ${url}:`, error);
      return null;
    }
  }
  
  async createMenuAudio() {
    try {
      // Load menu background music from an audio file
      // IMPORTANT: You need to place your menu_audio.mp3 file in the public folder
      // Typical path for menu background music: /audio/menu_audio.mp3
      const menuAudioUrl = './src/audio/menu/Menu.wav';
      
      this.menuAudioBuffer = await this.loadAudioBuffer(menuAudioUrl);
      
      if (this.menuAudioBuffer) {
        console.log('Menu audio loaded successfully');
      } else {
        console.error('Failed to load menu audio');
        // Fallback to simple oscillator if file loading fails
        this.createFallbackMenuAudio();
      }
    } catch (error) {
      console.error('Error creating menu audio:', error);
      // Fallback to simple oscillator if file loading fails
      this.createFallbackMenuAudio();
    }
  }
  
  async createGameAudio() {
    try {
      const gameAudioUrl = './src/audio/game/Game.wav';
      
      this.gameAudioBuffer = await this.loadAudioBuffer(gameAudioUrl);
      
      if (this.gameAudioBuffer) {
        console.log('Game audio loaded successfully');
      } else {
        console.error('Failed to load game audio');
        // Fallback to simple oscillator if file loading fails
        this.createFallbackGameAudio();
      }
    } catch (error) {
      console.error('Error creating game audio:', error);
      // Fallback to simple oscillator if file loading fails
      this.createFallbackGameAudio();
    }
  }
  
  async loadSoundEffects() {
    try {
      // I will add this later
      const soundEffects = {
        blockPlaced: '/audio/block_placed.mp3',
        perfectPlacement: '/audio/perfect_placement.mp3',
        gameOver: '/audio/game_over.mp3'
      };
      
      this.soundEffectsBuffers = {};
      
      for (const [name, url] of Object.entries(soundEffects)) {
        this.soundEffectsBuffers[name] = await this.loadAudioBuffer(url);
        if (this.soundEffectsBuffers[name]) {
          console.log(`${name} sound effect loaded successfully`);
        } else {
          console.error(`Failed to load ${name} sound effect`);
        }
      }
    } catch (error) {
      console.error('Error loading sound effects:', error);
    }
  }
  
  createFallbackMenuAudio() {
    // Create oscillator for menu music (a fallback when real audio files aren't available)
    this.menuOscillator = this.audioContext.createOscillator();
    this.menuOscillator.type = 'sine';
    this.menuOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3 note
    
    // Add some modulation for interest
    const menuLFO = this.audioContext.createOscillator();
    menuLFO.type = 'sine';
    menuLFO.frequency.setValueAtTime(0.2, this.audioContext.currentTime); // Slow modulation
    
    const menuLFOGain = this.audioContext.createGain();
    menuLFOGain.gain.setValueAtTime(10, this.audioContext.currentTime);
    
    menuLFO.connect(menuLFOGain);
    menuLFOGain.connect(this.menuOscillator.frequency);
    
    // Connect to gain node for volume control
    this.menuOscillator.connect(this.menuGainNode);
    
    // Start oscillators but keep volume at 0 until needed
    menuLFO.start();
    this.menuOscillator.start();
    this.menuGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
  }
  
  createFallbackGameAudio() {
    // Create oscillator for game audio (a fallback when real audio files aren't available)
    this.gameOscillator = this.audioContext.createOscillator();
    this.gameOscillator.type = 'triangle';
    this.gameOscillator.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4 note
    
    // Add some modulation
    const gameLFO = this.audioContext.createOscillator();
    gameLFO.type = 'sawtooth';
    gameLFO.frequency.setValueAtTime(4, this.audioContext.currentTime); // Faster modulation for game
    
    const gameLFOGain = this.audioContext.createGain();
    gameLFOGain.gain.setValueAtTime(20, this.audioContext.currentTime);
    
    gameLFO.connect(gameLFOGain);
    gameLFOGain.connect(this.gameOscillator.frequency);
    
    // Connect to gain node for volume control
    this.gameOscillator.connect(this.gameGainNode);
    
    // Start oscillators but keep volume at 0 until needed
    gameLFO.start();
    this.gameOscillator.start();
    this.gameGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
  }
  
  playMenuAudio() {
    if (!this.initialized) return;
    
    this.menuPlaying = true;
    
    if (this.menuAudioSource) {
      // Stop any existing menu audio
      this.menuAudioSource.stop();
    }
    
    if (this.menuAudioBuffer) {
      // Create a new audio source
      this.menuAudioSource = this.audioContext.createBufferSource();
      this.menuAudioSource.buffer = this.menuAudioBuffer;
      this.menuAudioSource.loop = true;
      
      // Connect to gain node for volume control
      this.menuAudioSource.connect(this.menuGainNode);
      
      // Fade in menu audio
      const currentTime = this.audioContext.currentTime;
      this.menuGainNode.gain.cancelScheduledValues(currentTime);
      this.menuGainNode.gain.setValueAtTime(0, currentTime);
      this.menuGainNode.gain.linearRampToValueAtTime(this.menuVolume, currentTime + 1);
      
      // Start playback
      this.menuAudioSource.start();
    } else if (this.menuOscillator) {
      // Fallback to oscillator if no audio buffer
      const currentTime = this.audioContext.currentTime;
      this.menuGainNode.gain.cancelScheduledValues(currentTime);
      this.menuGainNode.gain.setValueAtTime(this.menuGainNode.gain.value, currentTime);
      this.menuGainNode.gain.linearRampToValueAtTime(this.menuVolume, currentTime + 1);
    }
  }
  
  stopMenuAudio() {
    if (!this.initialized || !this.menuPlaying) return;
    
    this.menuPlaying = false;
    
    // Fade out menu audio
    const currentTime = this.audioContext.currentTime;
    this.menuGainNode.gain.cancelScheduledValues(currentTime);
    this.menuGainNode.gain.setValueAtTime(this.menuGainNode.gain.value, currentTime);
    this.menuGainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5);
    
    // Stop the source after fade out
    if (this.menuAudioSource) {
      setTimeout(() => {
        try {
          this.menuAudioSource.stop();
        } catch (error) {
          // Ignore errors if already stopped
        }
      }, 500);
    }
  }
  
  playGameAudio() {
    if (!this.initialized) return;
    
    this.gamePlaying = true;
    
    if (this.gameAudioSource) {
      // Stop any existing game audio
      this.gameAudioSource.stop();
    }
    
    if (this.gameAudioBuffer) {
      // Create a new audio source
      this.gameAudioSource = this.audioContext.createBufferSource();
      this.gameAudioSource.buffer = this.gameAudioBuffer;
      this.gameAudioSource.loop = true;
      
      // Connect to gain node for volume control
      this.gameAudioSource.connect(this.gameGainNode);
      
      // Fade in game audio
      const currentTime = this.audioContext.currentTime;
      this.gameGainNode.gain.cancelScheduledValues(currentTime);
      this.gameGainNode.gain.setValueAtTime(0, currentTime);
      this.gameGainNode.gain.linearRampToValueAtTime(this.gameVolume, currentTime + 0.3);
      
      // Start playback
      this.gameAudioSource.start();
    } else if (this.gameOscillator) {
      // Fallback to oscillator if no audio buffer
      const currentTime = this.audioContext.currentTime;
      this.gameGainNode.gain.cancelScheduledValues(currentTime);
      this.gameGainNode.gain.setValueAtTime(this.gameGainNode.gain.value, currentTime);
      this.gameGainNode.gain.linearRampToValueAtTime(this.gameVolume, currentTime + 0.3);
    }
  }
  
  stopGameAudio() {
    if (!this.initialized || !this.gamePlaying) return;
    
    this.gamePlaying = false;
    
    // Fade out game audio
    const currentTime = this.audioContext.currentTime;
    this.gameGainNode.gain.cancelScheduledValues(currentTime);
    this.gameGainNode.gain.setValueAtTime(this.gameGainNode.gain.value, currentTime);
    this.gameGainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5);
    
    // Stop the source after fade out
    if (this.gameAudioSource) {
      setTimeout(() => {
        try {
          this.gameAudioSource.stop();
        } catch (error) {
          // Ignore errors if already stopped
        }
      }, 500);
    }
  }
  
  setMenuVolume(volume) {
    // Set volume 0-1
    this.menuVolume = volume;
    
    if (this.initialized && this.menuPlaying) {
      // Update menu gain node
      const currentTime = this.audioContext.currentTime;
      this.menuGainNode.gain.cancelScheduledValues(currentTime);
      this.menuGainNode.gain.setValueAtTime(this.menuGainNode.gain.value, currentTime);
      this.menuGainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.1);
    }
  }
  
  setGameVolume(volume) {
    // Set volume 0-1
    this.gameVolume = volume;
    
    if (this.initialized && this.gamePlaying) {
      // Update game gain node
      const currentTime = this.audioContext.currentTime;
      this.gameGainNode.gain.cancelScheduledValues(currentTime);
      this.gameGainNode.gain.setValueAtTime(this.gameGainNode.gain.value, currentTime);
      this.gameGainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.1);
    }
  }
  
  // Sound effect methods
  playBlockPlacedSound() {
    if (!this.initialized) return;
    
    if (this.soundEffectsBuffers?.blockPlaced) {
      // Play the loaded sound effect
      this.playSoundEffect(this.soundEffectsBuffers.blockPlaced, this.gameVolume);
    } else {
      // Fallback to a generated sound
      // Create a short beep sound for block placement
      const beepOsc = this.audioContext.createOscillator();
      beepOsc.type = 'sine';
      beepOsc.frequency.value = 440; // A4
      
      const beepGain = this.audioContext.createGain();
      beepGain.gain.value = this.gameVolume;
      
      beepOsc.connect(beepGain);
      beepGain.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      beepOsc.start(now);
      
      // Quick fade-out for a "pop" sound
      beepGain.gain.setValueAtTime(this.gameVolume, now);
      beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      beepOsc.stop(now + 0.1);
    }
  }
  
  playPerfectPlacementSound() {
    if (!this.initialized) return;
    
    if (this.soundEffectsBuffers?.perfectPlacement) {
      // Play the loaded sound effect
      this.playSoundEffect(this.soundEffectsBuffers.perfectPlacement, this.gameVolume);
    } else {
      // Fallback to a generated sound
      // Create a success sound for perfect block placement
      const beepOsc = this.audioContext.createOscillator();
      beepOsc.type = 'sine';
      beepOsc.frequency.value = 880; // A5 - higher note for perfect placement
      
      const beepGain = this.audioContext.createGain();
      beepGain.gain.value = this.gameVolume;
      
      beepOsc.connect(beepGain);
      beepGain.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      beepOsc.start(now);
      
      // Slightly longer fade-out for a "success" sound
      beepGain.gain.setValueAtTime(this.gameVolume, now);
      beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      beepOsc.stop(now + 0.3);
    }
  }
  
  playGameOverSound() {
    if (!this.initialized) return;
    
    if (this.soundEffectsBuffers?.gameOver) {
      // Play the loaded sound effect
      this.playSoundEffect(this.soundEffectsBuffers.gameOver, this.gameVolume);
    } else {
      // Fallback to a generated sound
      // Create a game over sound
      const osc = this.audioContext.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220; // A3 - lower note for game over
      
      const gain = this.audioContext.createGain();
      gain.gain.value = this.gameVolume;
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      osc.start(now);
      
      // Descending pitch for game over
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
      
      gain.gain.setValueAtTime(this.gameVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.stop(now + 0.5);
    }
  }
  
  // Helper method to play a sound effect
  playSoundEffect(buffer, volume) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
    
    return source;
  }
}