import { getProfile, updateProfile, uploadAvatar, deleteAvatar, updatePassword, signOut } from '../db/auth';
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
    
    // Create notification container
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'notification-container';
    this.container.appendChild(this.notificationContainer);
    
    // Create initial structure
    this.renderPanel();
    
    // Initially hide the panel
    this.hide();
  }
  
  renderPanel() {
    this.panel.innerHTML = `
      <div class="panel-header">
        <button class="back-icon">&larr;</button>
        <h2 class="panel-title">User Profile</h2>
      </div>
      <div class="profile-content">
        <div class="profile-loading">Loading profile...</div>
      </div>
    `;
    
    // Add click handler for back button
    const backButton = this.panel.querySelector('.back-icon');
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
        this.showNotification('Using default profile until saved', 'error');
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

      <div class="profile-section profile-actions">
        <button class="logout-btn">Logout</button>
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
    
    // Logout
    const logoutBtn = this.panel.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', () => this.handleLogout());
  }
  
  async handleLogout() {
    try {
      this.showNotification('Logging out...');
      
      await signOut();
      
      // Return to menu - this will refresh the menu options based on auth state
      this.onBack();
      
    } catch (error) {
      this.showNotification('Failed to logout: ' + error.message, 'error');
    }
  }
  
  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      this.showNotification('Uploading avatar...');
      
      const user = getGlobalUser();
      const avatarUrl = await uploadAvatar(user.id, file);
      
      // Update profile
      this.profile.avatar_url = avatarUrl;
      this.renderProfileContent();
      
      this.showNotification('Avatar uploaded successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to upload avatar: ' + error.message, 'error');
    }
  }
  
  async handleDeleteAvatar() {
    try {
      this.showNotification('Deleting avatar...');
      
      const user = getGlobalUser();
      await deleteAvatar(user.id);
      
      // Update profile
      this.profile.avatar_url = null;
      this.renderProfileContent();
      
      this.showNotification('Avatar deleted successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to delete avatar: ' + error.message, 'error');
    }
  }
  
  async handleUpdateUsername() {
    const usernameInput = this.panel.querySelector('#username');
    const newUsername = usernameInput.value.trim();
    
    if (!newUsername) {
      this.showNotification('Username cannot be empty', 'error');
      return;
    }
    
    try {
      this.showNotification('Updating username...');
      
      const user = getGlobalUser();
      const updatedProfile = await updateProfile({
        userId: user.id,
        updates: { username: newUsername }
      });
      
      // Update profile
      this.profile = updatedProfile;
      
      this.showNotification('Username updated successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to update username: ' + error.message, 'error');
    }
  }
  
  async handleUpdatePassword() {
    const newPasswordInput = this.panel.querySelector('#new-password');
    const confirmPasswordInput = this.panel.querySelector('#confirm-password');
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!newPassword) {
      this.showNotification('Password cannot be empty', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.showNotification('Passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      this.showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      this.showNotification('Updating password...');
      
      await updatePassword(newPassword);
      
      // Clear password fields
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      
      this.showNotification('Password updated successfully!', 'success');
    } catch (error) {
      this.showNotification('Failed to update password: ' + error.message, 'error');
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
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = '💬';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
    `;
    
    // Add to container
    this.notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto remove after timeout
    const timeout = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hide');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, timeout);
    
    return notification;
  }
  
  show() {
    this.panel.style.display = 'flex';
    this.loadProfile();
  }
  
  hide() {
    this.panel.style.display = 'none';
  }
} 