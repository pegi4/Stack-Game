// src/audio/AudioManager.js

class AudioManager {
  constructor() {
    // Audio context
    this.audioContext = null;
    
    // Music tracks
    this.menuMusic = null;
    this.gameMusic = null;
    
    // Current playing music track
    this.currentMusic = null;
    
    // Music settings
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    
    // Sound effects nodes reference
    this.soundEffects = {
      blockPlace: null,
      blockMiss: null,
      blockPerfect: null,
      menuClick: null,
      gameStart: null,
      gameOver: null
    };
    
    // Initialize
    this.init();
  }
  
  init() {
    // Create audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load music tracks
    this.loadMusic();
    
    // Initialize sound effects
    this.initSoundEffects();
    
    // Load settings from localStorage
    this.loadSettings();
    
    // Handle page visibility changes to prevent music restarting when switching tabs
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden (user switched tabs)
        console.log('Page hidden, audio context suspended');
        this.audioContext.suspend();
      } else {
        // Page is visible again
        console.log('Page visible, audio context resumed');
        this.audioContext.resume();
      }
    });
  }
  
  loadMusic() {
    // Load menu music
    this.loadAudio('Menu.wav').then(buffer => {
      this.menuMusic = buffer;
      console.log('Menu music loaded');
    }).catch(error => {
      console.error('Failed to load menu music:', error);
    });
    
    // Load game music
    this.loadAudio('Game.wav').then(buffer => {
      this.gameMusic = buffer;
      console.log('Game music loaded');
    }).catch(error => {
      console.error('Failed to load game music:', error);
    });
  }
  
  loadAudio(filename) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', `src/audio/music/${filename}`, true);
      request.responseType = 'arraybuffer';
      
      request.onload = () => {
        this.audioContext.decodeAudioData(
          request.response,
          buffer => resolve(buffer),
          error => reject(error)
        );
      };
      
      request.onerror = error => reject(error);
      request.send();
    });
  }
  
  initSoundEffects() {
    // We'll create the actual oscillator nodes on demand
    // to avoid issues with starting/stopping oscillators
  }
  
  playMusic(track) {
    // Skip if music is disabled
    if (!this.musicEnabled) return;
    
    // Check if the same track is already playing to avoid restarting it
    if (this.currentMusic && this.currentMusic.track === track) {
      console.log(`${track} music already playing, not restarting`);
      return; // Already playing this track, do nothing
    }
    
    // Stop current music if playing
    this.stopMusic();
    
    // Select the track
    let buffer;
    if (track === 'menu') {
      buffer = this.menuMusic;
    } else if (track === 'game') {
      buffer = this.gameMusic;
    }
    
    // If buffer is not loaded yet, try again in 500ms
    if (!buffer) {
      console.log(`Buffer for ${track} music not loaded yet, retrying in 500ms`);
      setTimeout(() => this.playMusic(track), 500);
      return;
    }
    
    console.log(`Playing ${track} music`);
    
    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.musicVolume;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Loop music
    source.loop = true;
    
    try {
      // Play
      source.start(0);
      
      // Store reference to current music
      this.currentMusic = {
        source,
        gainNode,
        track
      };
    } catch (e) {
      console.error('Error starting music:', e);
    }
  }
  
  stopMusic() {
    if (this.currentMusic && this.currentMusic.source) {
      try {
        this.currentMusic.source.stop();
      } catch (e) {
        console.log('Music already stopped');
      }
      this.currentMusic = null;
    }
  }
  
  // Create and play an oscillator-based sound effect
  playSoundEffect(type) {
    // Skip if sound effects are disabled
    if (!this.sfxEnabled) return;
    
    // Ensure audio context is running (needed for browsers that suspend it)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Create oscillator and gain node
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect oscillator to gain node, then to destination
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Set volume
    gainNode.gain.value = this.sfxVolume;
    
    // Configure sound based on type
    switch (type) {
      case 'blockPlace':
        // Simple, clean click sound for block placement
        oscillator.type = 'square'; // Square wave for sharp attack
        oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime); // Start with high frequency
        oscillator.frequency.exponentialRampToValueAtTime(
          800, this.audioContext.currentTime + 0.03 // Very quick drop for crisp click
        );
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05); // Short duration
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05); // Very short sound
        break;
        
      case 'blockPerfect':
        // Simple success sound for perfect block placement
        oscillator.type = 'sine';
        oscillator.frequency.value = 880; // A5 - higher note for perfect placement
        
        const now = this.audioContext.currentTime;
        oscillator.start(now);
        
        // Slightly longer fade-out for a "success" sound
        gainNode.gain.setValueAtTime(this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.stop(now + 0.3);
        break;
        
      case 'blockMiss':
        // Lower tone for missing
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          110, this.audioContext.currentTime + 0.3
        );
        gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.4);
        break;
        
      case 'menuClick':
        // Short click sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          440, this.audioContext.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;
        
      case 'gameStart':
        // Upward sound for game start
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          660, this.audioContext.currentTime + 0.2
        );
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
        
        // Add a second oscillator for a richer sound
        const startOsc2 = this.audioContext.createOscillator();
        const startGain2 = this.audioContext.createGain();
        startOsc2.connect(startGain2);
        startGain2.connect(this.audioContext.destination);
        startOsc2.type = 'sine';
        startOsc2.frequency.setValueAtTime(440, this.audioContext.currentTime + 0.1);
        startOsc2.frequency.exponentialRampToValueAtTime(
          880, this.audioContext.currentTime + 0.3
        );
        startGain2.gain.setValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime + 0.1);
        startGain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        startOsc2.start(this.audioContext.currentTime + 0.1);
        startOsc2.stop(this.audioContext.currentTime + 0.4);
        break;
        
      case 'gameOver':
        // Sad downward sound for game over
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          220, this.audioContext.currentTime + 0.5
        );
        gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.6);
        
        // Add another tone for richness
        setTimeout(() => {
          const overOsc2 = this.audioContext.createOscillator();
          const overGain2 = this.audioContext.createGain();
          overOsc2.connect(overGain2);
          overGain2.connect(this.audioContext.destination);
          overOsc2.type = 'sine';
          overOsc2.frequency.setValueAtTime(330, this.audioContext.currentTime);
          overOsc2.frequency.exponentialRampToValueAtTime(
            165, this.audioContext.currentTime + 0.5
          );
          overGain2.gain.setValueAtTime(this.sfxVolume * 0.7, this.audioContext.currentTime);
          overGain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.7);
          overOsc2.start();
          overOsc2.stop(this.audioContext.currentTime + 0.7);
        }, 200);
        break;
        
      default:
        console.warn('Unknown sound effect type:', type);
        return;
    }
  }
  
  setMusicVolume(value) {
    this.musicVolume = value;
    
    // Update current music if playing
    if (this.currentMusic && this.currentMusic.gainNode) {
      this.currentMusic.gainNode.gain.value = value;
    }
    
    // Save settings
    this.saveSettings();
  }
  
  setSFXVolume(value) {
    this.sfxVolume = value;
    this.saveSettings();
  }
  
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.currentMusic) {
      // Restart the previous music
      this.playMusic(this.currentMusic.track);
    }
    
    this.saveSettings();
    return this.musicEnabled;
  }
  
  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    this.saveSettings();
    return this.sfxEnabled;
  }
  
  saveSettings() {
    const settings = {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled
    };
    
    try {
      localStorage.setItem('stackGameAudioSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save audio settings:', e);
    }
  }
  
  loadSettings() {
    try {
      const settings = localStorage.getItem('stackGameAudioSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.musicVolume = parsedSettings.musicVolume ?? 0.5;
        this.sfxVolume = parsedSettings.sfxVolume ?? 0.7;
        this.musicEnabled = parsedSettings.musicEnabled ?? true;
        this.sfxEnabled = parsedSettings.sfxEnabled ?? true;
      }
    } catch (e) {
      console.error('Failed to load audio settings:', e);
    }
  }
}

// Create a singleton instance
const audioManager = new AudioManager();

export default audioManager;