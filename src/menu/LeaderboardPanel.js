import { fetchLeaderboard } from '../db/scores.js';

export class LeaderboardPanel {
  constructor(container, onBack) {
    this.panel = document.createElement('div');
    this.panel.className = 'panel leaderboard-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Leaderboard</h2>
      </div>
      <div class="leaderboard-content">
        <div class="leaderboard-loading">Loading scores...</div>
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

    // Reference to content container
    this.contentContainer = this.panel.querySelector('.leaderboard-content');

    // Initial load
    this.loadScores();
  }

  async loadScores() {
    try {
      this.contentContainer.innerHTML = '<div class="leaderboard-loading">Loading scores...</div>';
      
      const scores = await fetchLeaderboard({ limit: 10, includeUserDetails: true });
      
      if (scores.length === 0) {
        this.contentContainer.innerHTML = '<p class="leaderboard-empty">No scores yet. Be the first to play!</p>';
        return;
      }

      let html = '<div class="leaderboard-table">';
      
      // Header
      html += `
        <div class="leaderboard-row header">
          <div class="rank">Rank</div>
          <div class="player">Player</div>
          <div class="score">Score</div>
        </div>
      `;

      // Scores
      scores.forEach((score, index) => {
        const username = score.profiles?.username || 'Unknown Player';
        const avatar = score.profiles?.avatar_url || null;
        
        // Highlight top 3 players, showing other 7 players too
        html += `
          <div class="leaderboard-row${index < 3 ? ' top-' + (index + 1) : ''}">
            <div class="rank">${index + 1}</div>
            <div class="player">
              ${avatar ? `<img src="${avatar}" alt="${username}" class="player-avatar" />` : ''}
              <span>${username}</span>
            </div>
            <div class="score">${score.score}</div>
          </div>
        `;
      });

      html += '</div>';
      this.contentContainer.innerHTML = html;

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      this.contentContainer.innerHTML = '<p class="leaderboard-error">Failed to load scores. Please try again later.</p>';
    }
  }

  show() { 
    this.panel.classList.add('visible');
    // Refresh scores when panel is shown
    this.loadScores();
  }

  hide() { 
    this.panel.classList.remove('visible'); 
  }
} 