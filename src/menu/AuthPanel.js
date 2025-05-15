import './menu.css';
import { signIn, signUp } from '../auth';

export class AuthPanel {
  constructor(container, onBack) {
    this.container = container;
    this.onBack = onBack;
    this.isVisible = false;
    
    // Create panel container
    this.panelContainer = document.createElement('div');
    this.panelContainer.className = 'panel auth-panel';
    this.container.appendChild(this.panelContainer);
    
    // Create panel title
    this.title = document.createElement('h2');
    this.title.textContent = 'Login / Register';
    this.title.className = 'panel-title';
    this.panelContainer.appendChild(this.title);
    
    // Create mode toggle
    this.createModeToggle();
    
    // Create login form initially
    this.currentMode = 'login';
    this.createLoginForm();
    
    // Create back button
    this.createBackButton();
    
    // Initially hide panel
    this.hide();
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
    if (mode === this.currentMode) return;
    
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
    const loginButton = document.createElement('button');
    loginButton.textContent = 'Login';
    loginButton.className = 'auth-button';
    loginButton.addEventListener('click', () => this.handleLogin(emailInput.value, passwordInput.value));
    
    // Create error message area
    this.errorMessage = document.createElement('p');
    this.errorMessage.className = 'error-message';
    
    // Append all elements
    this.formContainer.appendChild(emailContainer);
    this.formContainer.appendChild(passwordContainer);
    this.formContainer.appendChild(loginButton);
    this.formContainer.appendChild(this.errorMessage);
    
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
    const registerButton = document.createElement('button');
    registerButton.textContent = 'Register';
    registerButton.className = 'auth-button';
    registerButton.addEventListener('click', () => this.handleRegister(
      usernameInput.value,
      emailInput.value,
      passwordInput.value
    ));
    
    // Create error message area
    this.errorMessage = document.createElement('p');
    this.errorMessage.className = 'error-message';
    
    // Append all elements
    this.formContainer.appendChild(usernameContainer);
    this.formContainer.appendChild(emailContainer);
    this.formContainer.appendChild(passwordContainer);
    this.formContainer.appendChild(registerButton);
    this.formContainer.appendChild(this.errorMessage);
    
    this.panelContainer.appendChild(this.formContainer);
  }
  
  async handleLogin(email, password) {
    if (!email || !password) {
      this.showError('Please enter both email and password');
      return;
    }
    
    try {
      this.showError(''); // Clear previous errors
      await signIn({ email, password });
      this.onBack(); // Return to main menu after successful login
    } catch (error) {
      this.showError(error.message || 'Login failed. Please try again.');
    }
  }
  
  async handleRegister(username, email, password) {
    if (!username || !email || !password) {
      this.showError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }
    
    try {
      this.showError(''); // Clear previous errors
      await signUp({ email, password, username });
      this.showError('Registration successful! Please check your email to confirm your account.');
      // Optionally switch to login mode
      setTimeout(() => this.switchMode('login'), 2000);
    } catch (error) {
      this.showError(error.message || 'Registration failed. Please try again.');
    }
  }
  
  showError(message) {
    this.errorMessage.textContent = message;
  }
  
  createBackButton() {
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Menu';
    backButton.className = 'back-button';
    backButton.addEventListener('click', () => {
      this.onBack();
    });
    this.panelContainer.appendChild(backButton);
  }
  
  show() {
    this.isVisible = true;
    this.panelContainer.style.display = 'flex';
  }
  
  hide() {
    this.isVisible = false;
    this.panelContainer.style.display = 'none';
  }
} 