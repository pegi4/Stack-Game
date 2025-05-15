import { getProfile, updateProfile, uploadAvatar, deleteAvatar, updatePassword } from '../auth';
import { getCurrentUser as getGlobalUser } from '../utils/globalUser';

export class ProfilePanel {
  constructor(container, onBack) {
    this.container = container;
    this.onBack = onBack;
    this.isLoading = false;
    this.profile = null;
    
    // Create panel elements
    this.panel = document.createElement('div');
    this.panel.className = 'panel profile-panel';
    container.appendChild(this.panel);
    
    // Create initial structure
    this.renderPanel();
    
    // Initially hide the panel
    this.hide();
  }
  
  renderPanel() {
    this.panel.innerHTML = `
      <h2>User Profile</h2>
      <div class="profile-content">
        <div class="profile-loading">Loading profile...</div>
      </div>
      <div class="back-button">Back to Menu</div>
    `;
    
    // Add click handler for back button
    const backButton = this.panel.querySelector('.back-button');
    backButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling to game
      this.onBack();
    });
  }
  
  async loadProfile() {
    try {
      this.isLoading = true;
      this.showLoading();
      
      const user = getGlobalUser();
      if (!user) {
        this.showError('User not logged in');
        return;
      }
      
      try {
        this.profile = await getProfile(user.id);
        this.renderProfileContent();
      } catch (error) {
        console.error('Profile load error:', error);
        
        // If there's an error, create a default profile object
        this.profile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'Player',
          avatar_url: null
        };
        
        this.renderProfileContent();
        this.showStatusMessage('Using default profile until saved', 'error');
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      this.showError(`Failed to load profile: ${error.message || 'Unknown error'}`);
    } finally {
      this.isLoading = false;
    }
  }
  
  renderProfileContent() {
    if (!this.profile) return;
    
    const content = this.panel.querySelector('.profile-content');
    content.innerHTML = `
      <div class="profile-section">
        <div class="avatar-container">
          ${this.profile.avatar_url 
            ? `<img src="${this.profile.avatar_url}" alt="Profile" class="profile-avatar" />`
            : `<div class="profile-avatar-placeholder">No Avatar</div>`
          }
          <div class="avatar-buttons">
            <label for="avatar-upload" class="button-small">Upload</label>
            <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
            ${this.profile.avatar_url ? `<button class="button-small delete-avatar">Delete</button>` : ''}
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" value="${this.profile.username || ''}" />
        </div>
        <button class="update-username-btn">Update Username</button>
      </div>
      
      <div class="profile-section">
        <h3>Change Password</h3>
        <div class="form-group">
          <label for="new-password">New Password</label>
          <input type="password" id="new-password" />
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input type="password" id="confirm-password" />
        </div>
        <button class="update-password-btn">Update Password</button>
      </div>
      
      <div class="profile-section">
        <div class="status-message"></div>
      </div>
    `;
    
    // Add event listeners
    this.addEventListeners();
  }
  
  addEventListeners() {
    // Avatar upload
    const avatarInput = this.panel.querySelector('#avatar-upload');
    avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
    
    // Delete avatar
    const deleteAvatarBtn = this.panel.querySelector('.delete-avatar');
    if (deleteAvatarBtn) {
      deleteAvatarBtn.addEventListener('click', () => this.handleDeleteAvatar());
    }
    
    // Update username
    const updateUsernameBtn = this.panel.querySelector('.update-username-btn');
    updateUsernameBtn.addEventListener('click', () => this.handleUpdateUsername());
    
    // Update password
    const updatePasswordBtn = this.panel.querySelector('.update-password-btn');
    updatePasswordBtn.addEventListener('click', () => this.handleUpdatePassword());
  }
  
  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      this.showStatusMessage('Uploading avatar...');
      
      const user = getGlobalUser();
      const avatarUrl = await uploadAvatar(user.id, file);
      
      // Update profile
      this.profile.avatar_url = avatarUrl;
      this.renderProfileContent();
      
      this.showStatusMessage('Avatar uploaded successfully!', 'success');
    } catch (error) {
      this.showStatusMessage('Failed to upload avatar: ' + error.message, 'error');
    }
  }
  
  async handleDeleteAvatar() {
    try {
      this.showStatusMessage('Deleting avatar...');
      
      const user = getGlobalUser();
      await deleteAvatar(user.id);
      
      // Update profile
      this.profile.avatar_url = null;
      this.renderProfileContent();
      
      this.showStatusMessage('Avatar deleted successfully!', 'success');
    } catch (error) {
      this.showStatusMessage('Failed to delete avatar: ' + error.message, 'error');
    }
  }
  
  async handleUpdateUsername() {
    const usernameInput = this.panel.querySelector('#username');
    const newUsername = usernameInput.value.trim();
    
    if (!newUsername) {
      this.showStatusMessage('Username cannot be empty', 'error');
      return;
    }
    
    try {
      this.showStatusMessage('Updating username...');
      
      const user = getGlobalUser();
      const updatedProfile = await updateProfile({
        userId: user.id,
        updates: { username: newUsername }
      });
      
      // Update profile
      this.profile = updatedProfile;
      
      this.showStatusMessage('Username updated successfully!', 'success');
    } catch (error) {
      this.showStatusMessage('Failed to update username: ' + error.message, 'error');
    }
  }
  
  async handleUpdatePassword() {
    const newPasswordInput = this.panel.querySelector('#new-password');
    const confirmPasswordInput = this.panel.querySelector('#confirm-password');
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!newPassword) {
      this.showStatusMessage('Password cannot be empty', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.showStatusMessage('Passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      this.showStatusMessage('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      this.showStatusMessage('Updating password...');
      
      await updatePassword(newPassword);
      
      // Clear password fields
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      
      this.showStatusMessage('Password updated successfully!', 'success');
    } catch (error) {
      this.showStatusMessage('Failed to update password: ' + error.message, 'error');
    }
  }
  
  showLoading() {
    const content = this.panel.querySelector('.profile-content');
    content.innerHTML = `<div class="profile-loading">Loading profile...</div>`;
  }
  
  showError(message) {
    const content = this.panel.querySelector('.profile-content');
    content.innerHTML = `<div class="profile-error">${message}</div>`;
  }
  
  showStatusMessage(message, type = '') {
    const statusMessage = this.panel.querySelector('.status-message');
    if (statusMessage) {
      statusMessage.textContent = message;
      statusMessage.className = 'status-message';
      if (type) {
        statusMessage.classList.add(`status-${type}`);
      }
      
      // Clear success messages after 3 seconds
      if (type === 'success') {
        setTimeout(() => {
          if (statusMessage.textContent === message) {
            statusMessage.textContent = '';
          }
        }, 3000);
      }
    }
  }
  
  show() {
    this.panel.style.display = 'flex';
    this.loadProfile();
  }
  
  hide() {
    this.panel.style.display = 'none';
  }
} 