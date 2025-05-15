import './menu.css';
import { signIn, signUp } from '../db/auth';

export class AuthPanel {
  constructor(container, onBack) {
    this.container = container;
    this.onBack = onBack;
    this.isVisible = false;
    this.isLoading = false;
    
    // Create panel container
    this.panelContainer = document.createElement('div');
    this.panelContainer.className = 'panel auth-panel';
    this.container.appendChild(this.panelContainer);
    
    // Create panel header with back button and title
    this.createPanelHeader();
    
    // Create mode toggle
    this.createModeToggle();
    
    // Create login form initially
    this.currentMode = 'login';
    this.createLoginForm();
    
    // Initially hide panel
    this.hide();
  }
  
  createPanelHeader() {
    // Create header container
    const headerContainer = document.createElement('div');
    headerContainer.className = 'panel-header';
    
    // Create back button as an icon
    const backButton = document.createElement('button');
    backButton.className = 'back-icon';
    backButton.innerHTML = '&larr;'; // Left arrow symbol
    backButton.title = 'Back to menu';
    backButton.addEventListener('click', () => {
      if (!this.isLoading) {
        this.onBack();
      }
    });
    
    // Create panel title
    this.title = document.createElement('h2');
    this.title.textContent = 'Login / Register';
    this.title.className = 'panel-title';
    
    // Add elements to header
    headerContainer.appendChild(backButton);
    headerContainer.appendChild(this.title);
    
    // Add header to panel
    this.panelContainer.appendChild(headerContainer);
  }
  
  createModeToggle() {
    this.modeToggleContainer = document.createElement('div');
    this.modeToggleContainer.className = 'mode-toggle';
    
    this.loginToggle = document.createElement('button');
    this.loginToggle.textContent = 'Login';
    this.loginToggle.className = 'toggle-btn active';
    this.loginToggle.addEventListener('click', () => this.switchMode('login'));
    
    this.registerToggle = document.createElement('button');
    this.registerToggle.textContent = 'Register';
    this.registerToggle.className = 'toggle-btn';
    this.registerToggle.addEventListener('click', () => this.switchMode('register'));
    
    this.modeToggleContainer.appendChild(this.loginToggle);
    this.modeToggleContainer.appendChild(this.registerToggle);
    this.panelContainer.appendChild(this.modeToggleContainer);
  }
  
  switchMode(mode) {
    if (mode === this.currentMode || this.isLoading) return;
    
    this.currentMode = mode;
    
    // Clear form area
    if (this.formContainer) {
      this.panelContainer.removeChild(this.formContainer);
    }
    
    // Update toggle buttons
    if (mode === 'login') {
      this.loginToggle.className = 'toggle-btn active';
      this.registerToggle.className = 'toggle-btn';
      this.createLoginForm();
    } else {
      this.loginToggle.className = 'toggle-btn';
      this.registerToggle.className = 'toggle-btn active';
      this.createRegisterForm();
    }
  }
  
  createLoginForm() {
    this.formContainer = document.createElement('div');
    this.formContainer.className = 'auth-form';
    
    // Create email input
    const emailContainer = document.createElement('div');
    emailContainer.className = 'form-group';
    
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email:';
    emailLabel.setAttribute('for', 'email');
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Enter your email';
    
    emailContainer.appendChild(emailLabel);
    emailContainer.appendChild(emailInput);
    
    // Create password input
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'form-group';
    
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password:';
    passwordLabel.setAttribute('for', 'password');
    
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Enter your password';
    
    passwordContainer.appendChild(passwordLabel);
    passwordContainer.appendChild(passwordInput);
    
    // Create login button
    this.loginButton = document.createElement('button');
    this.loginButton.textContent = 'Login';
    this.loginButton.className = 'auth-button';
    this.loginButton.addEventListener('click', () => this.handleLogin(emailInput.value, passwordInput.value));
    
    // Add keypress event listener to inputs
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        passwordInput.focus();
      }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin(emailInput.value, passwordInput.value);
      }
    });
    
    // Create status message container
    this.statusContainer = document.createElement('div');
    this.statusContainer.className = 'auth-status-container';
    
    // Create loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.innerHTML = '<div class="spinner"></div>';
    this.loadingIndicator.style.display = 'none';
    
    // Create error message area
    this.errorMessage = document.createElement('p');
    this.errorMessage.className = 'error-message';
    
    // Create success message area
    this.successMessage = document.createElement('p');
    this.successMessage.className = 'success-message';
    
    // Append all elements
    this.statusContainer.appendChild(this.loadingIndicator);
    this.statusContainer.appendChild(this.errorMessage);
    this.statusContainer.appendChild(this.successMessage);
    
    this.formContainer.appendChild(emailContainer);
    this.formContainer.appendChild(passwordContainer);
    this.formContainer.appendChild(this.loginButton);
    this.formContainer.appendChild(this.statusContainer);
    
    this.panelContainer.appendChild(this.formContainer);
  }
  
  createRegisterForm() {
    this.formContainer = document.createElement('div');
    this.formContainer.className = 'auth-form';
    
    // Create username input
    const usernameContainer = document.createElement('div');
    usernameContainer.className = 'form-group';
    
    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = 'Username:';
    usernameLabel.setAttribute('for', 'username');
    
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Choose a username';
    
    usernameContainer.appendChild(usernameLabel);
    usernameContainer.appendChild(usernameInput);
    
    // Create email input
    const emailContainer = document.createElement('div');
    emailContainer.className = 'form-group';
    
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email:';
    emailLabel.setAttribute('for', 'email');
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.placeholder = 'Enter your email';
    
    emailContainer.appendChild(emailLabel);
    emailContainer.appendChild(emailInput);
    
    // Create password input
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'form-group';
    
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password:';
    passwordLabel.setAttribute('for', 'password');
    
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Choose a password';
    
    passwordContainer.appendChild(passwordLabel);
    passwordContainer.appendChild(passwordInput);
    
    // Create register button
    this.registerButton = document.createElement('button');
    this.registerButton.textContent = 'Register';
    this.registerButton.className = 'auth-button';
    this.registerButton.addEventListener('click', () => this.handleRegister(
      usernameInput.value,
      emailInput.value,
      passwordInput.value
    ));
    
    // Add keypress event listener to inputs
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        emailInput.focus();
      }
    });
    
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        passwordInput.focus();
      }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleRegister(usernameInput.value, emailInput.value, passwordInput.value);
      }
    });
    
    // Create status message container
    this.statusContainer = document.createElement('div');
    this.statusContainer.className = 'auth-status-container';
    
    // Create loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.innerHTML = '<div class="spinner"></div>';
    this.loadingIndicator.style.display = 'none';
    
    // Create error message area
    this.errorMessage = document.createElement('p');
    this.errorMessage.className = 'error-message';
    
    // Create success message area
    this.successMessage = document.createElement('p');
    this.successMessage.className = 'success-message';
    
    // Append all elements
    this.statusContainer.appendChild(this.loadingIndicator);
    this.statusContainer.appendChild(this.errorMessage);
    this.statusContainer.appendChild(this.successMessage);
    
    this.formContainer.appendChild(usernameContainer);
    this.formContainer.appendChild(emailContainer);
    this.formContainer.appendChild(passwordContainer);
    this.formContainer.appendChild(this.registerButton);
    this.formContainer.appendChild(this.statusContainer);
    
    this.panelContainer.appendChild(this.formContainer);
  }
  
  async handleLogin(email, password) {
    if (this.isLoading) return;
    
    if (!email || !password) {
      this.showError('Please enter both email and password');
      this.shakeForm();
      return;
    }
    
    try {
      this.setLoading(true);
      this.clearMessages();
      
      await signIn({ email, password });
      
      this.showSuccess('Login successful!');
      
      // Add success animation and delay before returning to menu
      this.formContainer.classList.add('auth-success');
      
      setTimeout(() => {
        this.onBack(); // Return to main menu after successful login
      }, 1500);
      
    } catch (error) {
      this.showError(error.message || 'Login failed. Please try again.');
      this.shakeForm();
    } finally {
      this.setLoading(false);
    }
  }
  
  async handleRegister(username, email, password) {
    if (this.isLoading) return;
    
    if (!username || !email || !password) {
      this.showError('Please fill in all fields');
      this.shakeForm();
      return;
    }
    
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      this.shakeForm();
      return;
    }
    
    try {
      this.setLoading(true);
      this.clearMessages();
      
      await signUp({ email, password, username });
      
      this.showSuccess('Registration successful! Please check your email to confirm your account.');
      
      // Add success animation
      this.formContainer.classList.add('auth-success');
      
      // Optionally switch to login mode after a delay
      setTimeout(() => {
        this.formContainer.classList.remove('auth-success');
        this.switchMode('login');
      }, 2000);
      
    } catch (error) {
      this.showError(error.message || 'Registration failed. Please try again.');
      this.shakeForm();
    } finally {
      this.setLoading(false);
    }
  }
  
  setLoading(isLoading) {
    this.isLoading = isLoading;
    
    if (isLoading) {
      this.loadingIndicator.style.display = 'flex';
      
      // Disable buttons during loading
      if (this.loginButton) this.loginButton.disabled = true;
      if (this.registerButton) this.registerButton.disabled = true;
      
      // Add loading class to button
      if (this.currentMode === 'login' && this.loginButton) {
        this.loginButton.classList.add('loading');
        this.loginButton.innerHTML = '<span class="btn-text">Logging in...</span><div class="btn-spinner"></div>';
      } else if (this.currentMode === 'register' && this.registerButton) {
        this.registerButton.classList.add('loading');
        this.registerButton.innerHTML = '<span class="btn-text">Registering...</span><div class="btn-spinner"></div>';
      }
    } else {
      this.loadingIndicator.style.display = 'none';
      
      // Re-enable buttons
      if (this.loginButton) {
        this.loginButton.disabled = false;
        this.loginButton.classList.remove('loading');
        this.loginButton.textContent = 'Login';
      }
      if (this.registerButton) {
        this.registerButton.disabled = false;
        this.registerButton.classList.remove('loading');
        this.registerButton.textContent = 'Register';
      }
    }
  }
  
  clearMessages() {
    this.errorMessage.textContent = '';
    this.successMessage.textContent = '';
    
    // Also remove any animation classes
    if (this.formContainer) {
      this.formContainer.classList.remove('auth-error', 'auth-success');
    }
  }
  
  showError(message) {
    this.errorMessage.textContent = message;
    this.successMessage.textContent = '';
  }
  
  showSuccess(message) {
    this.successMessage.textContent = message;
    this.errorMessage.textContent = '';
  }
  
  shakeForm() {
    // Add and remove shake animation class
    if (this.formContainer) {
      this.formContainer.classList.add('auth-error');
      setTimeout(() => {
        this.formContainer.classList.remove('auth-error');
      }, 500);
    }
  }
  
  show() {
    this.isVisible = true;
    this.panelContainer.style.display = 'flex';
    this.clearMessages();
    this.setLoading(false);
  }
  
  hide() {
    this.isVisible = false;
    this.panelContainer.style.display = 'none';
  }
} 