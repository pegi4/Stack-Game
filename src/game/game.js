import './style.css';
import './menu.css';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  if (container) {
    container.innerHTML = `
      <div class="game-menu">
        <h1 class="menu-title">STACK</h1>
        <div class="menu-option">Play Game</div>
        <div class="menu-option">How To Play</div>
        <div class="menu-option">High Scores</div>
        <div class="menu-option">Settings</div>
      </div>
    `;
  } else {
    console.error('Container element not found!');
  }
});