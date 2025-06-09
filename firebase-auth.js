// Fixed Firebase Authentication Functions
import { app } from './firebase-config.js';

export class FirebaseAuthManager {
  constructor() {
    this.auth = window.firebaseAuth;
    this.db = window.firebaseDb;
    this.utils = window.firebaseUtils;
    this.currentUser = null;
    
    // Listen for auth state changes
    this.utils.onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.updateUI(user);
    });
  }

  // Sign up new user
  async signUp(username, email, password) {
    try {
      // Create user account
      const userCredential = await this.utils.createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update user profile with username
      await this.utils.updateProfile(user, {
        displayName: username
      });

      // Store additional user data in Firestore
      await this.utils.setDoc(this.utils.doc(this.db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        readingProgress: {}
      });

      // Wait a moment for profile update to propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true, user: user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await this.utils.signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore to ensure we have the username
      const userDoc = await this.utils.getDoc(this.utils.doc(this.db, 'users', user.uid));
      const userData = userDoc.data();
      
      // If displayName is not set but we have username in Firestore, update it
      if (!user.displayName && userData?.username) {
        await this.utils.updateProfile(user, {
          displayName: userData.username
        });
      }
      
      return { success: true, user: user, userData: userData };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await this.utils.signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update reading progress in Firebase
  async updateReadingProgress(storyId, progress) {
    if (!this.currentUser) return;
    
    try {
      const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
      const userDoc = await this.utils.getDoc(userRef);
      const userData = userDoc.data() || {};
      
      const updatedProgress = {
        ...userData.readingProgress,
        [storyId]: progress
      };
      
      await this.utils.setDoc(userRef, {
        ...userData,
        readingProgress: updatedProgress
      }, { merge: true });
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  }

  // Get reading progress from Firebase
  async getReadingProgress() {
    if (!this.currentUser) return {};
    
    try {
      const userDoc = await this.utils.getDoc(this.utils.doc(this.db, 'users', this.currentUser.uid));
      const userData = userDoc.data();
      return userData?.readingProgress || {};
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return {};
    }
  }

  // Update UI based on auth state
  async updateUI(user) {
    const loginBtn = document.querySelector(".login-btn");
    const accountWrapper = document.querySelector(".account-wrapper");
    const accountName = document.getElementById("account-name");
    const accountMenu = document.querySelector(".account-menu");

    if (user) {
      // User is signed in - get username properly
      let username = user.displayName;
      
      // If no displayName, try to get username from Firestore
      if (!username) {
        try {
          const userDoc = await this.utils.getDoc(this.utils.doc(this.db, 'users', user.uid));
          const userData = userDoc.data();
          username = userData?.username || user.email.split('@')[0];
        } catch (error) {
          console.error('Error getting username:', error);
          username = user.email.split('@')[0];
        }
      }
      
      if (loginBtn) loginBtn.style.display = "none";
      if (accountWrapper) accountWrapper.classList.remove("hidden");
      if (accountName) accountName.textContent = username;
      
      // Sync reading progress
      this.syncReadingProgress();
    } else {
      // User is not signed in
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (accountWrapper) accountWrapper.classList.add("hidden");
      if (accountMenu) accountMenu.classList.add("hidden");
      
      // Clear any stored auth data
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
    }
  }

  // Sync reading progress between localStorage and Firebase
  async syncReadingProgress() {
    try {
      // Get progress from localStorage
      const localProgress = JSON.parse(localStorage.getItem("progress") || "{}");
      
      // Get progress from Firebase
      const firebaseProgress = await this.getReadingProgress();
      
      // Merge progress (Firebase takes precedence for conflicts)
      const mergedProgress = { ...localProgress, ...firebaseProgress };
      
      // Update localStorage
      localStorage.setItem("progress", JSON.stringify(mergedProgress));
      
      // Update Firebase if there were local changes
      if (Object.keys(localProgress).length > 0) {
        const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
        const userDoc = await this.utils.getDoc(userRef);
        const userData = userDoc.data() || {};
        
        await this.utils.setDoc(userRef, {
          ...userData,
          readingProgress: mergedProgress
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error syncing reading progress:', error);
    }
  }

  // Convert Firebase error codes to user-friendly messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  // Check if user is currently signed in
  isSignedIn() {
    return !!this.currentUser;
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(notification);
  }
  
  // Set notification style based on type
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
  }, 3000);
}

// Setup account menu functionality
function setupAccountMenu() {
  const accountWrapper = document.querySelector('.account-wrapper');
  const accountMenu = document.querySelector('.account-menu');
  const signOutBtn = document.querySelector('.sign-out-btn');
  
  if (!accountWrapper || !accountMenu) return;
  
  // Toggle account menu on click
  accountWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    accountMenu.classList.toggle('hidden');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', () => {
    if (accountMenu && !accountMenu.classList.contains('hidden')) {
      accountMenu.classList.add('hidden');
    }
  });
  
  // Sign out button handler
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Show loading state
        const originalText = signOutBtn.textContent;
        signOutBtn.textContent = 'Signing out...';
        signOutBtn.disabled = true;
        
        const result = await window.authManager.signOut();
        
        if (result.success) {
          // Hide the menu
          accountMenu.classList.add('hidden');
          
          // Clear any local storage if needed
          localStorage.removeItem('username');
          localStorage.removeItem('isAuthenticated');
          
          // Show success message
          showNotification('Signed out successfully', 'success');
        } else {
          showNotification('Error signing out. Please try again.', 'error');
        }
        
        // Reset button state
        signOutBtn.textContent = originalText;
        signOutBtn.disabled = false;
        
      } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out. Please try again.', 'error');
        
        // Reset button state
        signOutBtn.textContent = 'Sign Out';
        signOutBtn.disabled = false;
      }
    });
  }
}

// Fixed login modal setup function
function setupLoginModal() {
  const loginBtn = document.querySelector('.login-btn');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal-close');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const modalForms = document.querySelectorAll('.modal-form');
  
  if (!loginBtn || !modalOverlay) return;
  
  // Login button click handler
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      modalOverlay.classList.add('active');
    });
  }
  
  // Modal close handlers
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }
  
  // Close modal when clicking outside
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
  
  // Tab switching
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      modalTabs.forEach(t => t.classList.remove('active'));
      modalForms.forEach(f => f.classList.remove('active'));
      
      tab.classList.add('active');
      const targetForm = document.querySelector(`.${tabName}-form`);
      if (targetForm) {
        targetForm.classList.add('active');
      }
    });
  });
  
  // Sign-in form submission
  const signinForm = document.getElementById('signin-form');
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('signin-email');
      const passwordInput = document.getElementById('signin-password');
      const submitBtn = signinForm.querySelector('button[type="submit"]');
      
      if (!emailInput || !passwordInput) {
        console.error('Sign-in form elements not found');
        return;
      }
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Basic validation
      if (!email || !password) {
        showNotification('Please fill out all fields', 'warning');
        return;
      }
      
      // Show loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;
      
      try {
        const result = await window.authManager.signIn(email, password);
        
        if (result.success) {
          // Success - modal will close and UI will update automatically
          modalOverlay.classList.remove('active');
          emailInput.value = '';
          passwordInput.value = '';
          
          // Show success message
          showNotification('Welcome back!', 'success');
        } else {
          // Show error
          showNotification(result.error, 'error');
          passwordInput.value = '';
        }
      } catch (error) {
        console.error('Sign in error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Sign-up form submission
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('signup-username');
      const emailInput = document.getElementById('signup-email');
      const passwordInput = document.getElementById('signup-password');
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      
      if (!usernameInput || !emailInput || !passwordInput) {
        console.error('Sign-up form elements not found');
        return;
      }
      
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Basic validation
      if (!username || !email || !password) {
        showNotification('Please fill out all fields', 'warning');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
      }
      
      // Password validation
      if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'warning');
        return;
      }
      
      // Show loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;
      
      try {
        const result = await window.authManager.signUp(username, email, password);
        
        if (result.success) {
          // Success - modal will close and UI will update automatically
          modalOverlay.classList.remove('active');
          usernameInput.value = '';
          emailInput.value = '';
          passwordInput.value = '';
          
          // Show success message
          showNotification('Account created successfully! Welcome to Talevo!', 'success');
        } else {
          // Show error
          showNotification(result.error, 'error');
        }
      } catch (error) {
        console.error('Sign up error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Initialize Firebase Auth Manager
window.authManager = new FirebaseAuthManager();

// Make showNotification available globally
window.showNotification = showNotification;

// Export the setup functions
window.setupLoginModal = setupLoginModal;
window.setupAccountMenu = setupAccountMenu;

// Initialize both when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupLoginModal();
  setupAccountMenu();
});