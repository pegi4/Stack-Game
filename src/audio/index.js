// src/audio/index.js
import audioManager from './AudioManager';
import { preloadAudio } from './preloadAudio';

// Initialize audio system
export const initAudio = async () => {
  console.log('Initializing audio system...');
  
  // Ensure directories exist and remind about audio files
  await preloadAudio();
  
  // Add event listeners to handle first user interaction
  // (browsers require user interaction before playing audio)
  const handleFirstInteraction = () => {
    // Resume AudioContext if suspended
    if (audioManager.audioContext.state === 'suspended') {
      audioManager.audioContext.resume().then(() => {
        console.log('AudioContext resumed successfully');
      });
    }
    
    // Remove event listeners once audio is activated
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  };
  
  document.addEventListener('click', handleFirstInteraction);
  document.addEventListener('keydown', handleFirstInteraction);
  document.addEventListener('touchstart', handleFirstInteraction);
  
  return audioManager;
};

// Export the audio manager as default
export default audioManager;