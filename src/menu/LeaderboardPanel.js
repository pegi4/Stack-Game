export class LeaderboardPanel {
  constructor(container, onBack) {
    this.panel = document.createElement('div');
    this.panel.className = 'panel leaderboard-panel';
    this.panel.innerHTML = `
      <h2>Leaderboard</h2>
      <div>
        <p>Leaderboard content goes here.</p>
      </div>
      <div class="back-button">Back to Menu</div>
    `;
    container.appendChild(this.panel);
    
    // Add click handler for back button
    const backButton = this.panel.querySelector('.back-button');
    backButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to game
      onBack();
    });
  }
  show() { this.panel.classList.add('visible'); }
  hide() { this.panel.classList.remove('visible'); }
} 