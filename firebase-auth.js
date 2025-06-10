// Enhanced Firebase Authentication Functions with Library Support
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
        readingProgress: {},
        library: [] // Initialize empty library
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
      
      // Sync library after successful login
      await this.syncLibrary();
      
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

  // FIXED: Add story to user's library with proper button state management
  async addToLibrary(storyData, buttonElement = null) {
    if (!this.currentUser) {
      showNotification('Please sign in to add stories to your library', 'warning');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
      const userDoc = await this.utils.getDoc(userRef);
      const userData = userDoc.data() || {};
      
      // Get current library or initialize empty array
      const currentLibrary = userData.library || [];
      
      // Check if story is already in library
      const existingStory = currentLibrary.find(story => story.id === storyData.id);
      if (existingStory) {
        // Story already exists - redirect to library
        showNotification('Story is already in your library', 'info');
        setTimeout(() => {
          window.location.href = 'library.html';
        }, 1000);
        return { success: false, error: 'Story already in library', inLibrary: true };
      }
      
      // Add timestamp to story data
      const storyWithTimestamp = {
        ...storyData,
        addedAt: new Date().toISOString()
      };
      
      // Add story to library
      const updatedLibrary = [...currentLibrary, storyWithTimestamp];
      
      // Update Firestore
      await this.utils.setDoc(userRef, {
        ...userData,
        library: updatedLibrary
      }, { merge: true });
      
      // Update localStorage for immediate sync
      localStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));
      
      showNotification('Story added to your library!', 'success');
      return { success: true, library: updatedLibrary };
      
    } catch (error) {
      console.error('Error adding to library:', error);
      showNotification('Failed to add story to library', 'error');
      return { success: false, error: error.message };
    }
  }

  // Remove story from user's library
  async removeFromLibrary(storyId) {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
      const userDoc = await this.utils.getDoc(userRef);
      const userData = userDoc.data() || {};
      
      // Get current library
      const currentLibrary = userData.library || [];
      
      // Remove story from library
      const updatedLibrary = currentLibrary.filter(story => story.id !== storyId);
      
      // Update Firestore
      await this.utils.setDoc(userRef, {
        ...userData,
        library: updatedLibrary
      }, { merge: true });
      
      // Update localStorage
      localStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));
      
      return { success: true, library: updatedLibrary };
      
    } catch (error) {
      console.error('Error removing from library:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's library
  async getUserLibrary() {
    if (!this.currentUser) {
      return [];
    }
    
    try {
      const userDoc = await this.utils.getDoc(this.utils.doc(this.db, 'users', this.currentUser.uid));
      const userData = userDoc.data();
      return userData?.library || [];
    } catch (error) {
      console.error('Error getting user library:', error);
      return [];
    }
  }

  // Check if story is in user's library
  async isInLibrary(storyId) {
    if (!this.currentUser) {
      return false;
    }
    
    try {
      const library = await this.getUserLibrary();
      return library.some(story => story.id === storyId);
    } catch (error) {
      console.error('Error checking library:', error);
      return false;
    }
  }

  // Sync library between localStorage and Firebase
  async syncLibrary() {
    if (!this.currentUser) return;
    
    try {
      // Get library from localStorage
      const localLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
      
      // Get library from Firebase
      const firebaseLibrary = await this.getUserLibrary();
      
      // Merge libraries (Firebase takes precedence, but we keep local additions)
      const mergedLibrary = [...firebaseLibrary];
      
      // Add any local stories that aren't in Firebase
      localLibrary.forEach(localStory => {
        const existsInFirebase = mergedLibrary.some(fbStory => fbStory.id === localStory.id);
        if (!existsInFirebase) {
          mergedLibrary.push(localStory);
        }
      });
      
      // Update localStorage
      localStorage.setItem('userLibrary', JSON.stringify(mergedLibrary));
      
      // Update Firebase if there were local additions
      if (mergedLibrary.length > firebaseLibrary.length) {
        const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
        const userDoc = await this.utils.getDoc(userRef);
        const userData = userDoc.data() || {};
        
        await this.utils.setDoc(userRef, {
          ...userData,
          library: mergedLibrary
        }, { merge: true });
      }
      
    } catch (error) {
      console.error('Error syncing library:', error);
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
    const usernameDisplay = document.getElementById("username-display");

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
      
      // Show account UI, hide login button
      if (loginBtn) loginBtn.style.display = "none";
      if (accountWrapper) accountWrapper.classList.remove("hidden");
      if (accountName) accountName.textContent = username;
      if (usernameDisplay) usernameDisplay.textContent = `Welcome, ${username}!`;
      
      // Sync reading progress and library
      this.syncReadingProgress();
      this.syncLibrary();
    } else {
      // User is not signed in - reset UI
      if (loginBtn) {
        loginBtn.style.display = "inline-block";
      }
      if (accountWrapper) {
        accountWrapper.classList.add("hidden");
      }
      if (accountMenu) {
        accountMenu.classList.add("hidden");
      }
      if (usernameDisplay) {
        usernameDisplay.textContent = "Welcome!";
      }
      
      // Clear any stored auth data
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userLibrary');
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

// FIXED: Enhanced utility function to create story data object
function createStoryData(storyElement) {
  // Extract story data from the story card element
  const title = storyElement.querySelector('.story-title')?.textContent?.trim() || '';
  const author = storyElement.querySelector('.story-author')?.textContent?.replace('by ', '').trim() || 'Unknown Author';
  const description = storyElement.querySelector('.story-description')?.textContent?.trim() || 'No description available.';
  const genre = storyElement.querySelector('.story-genre')?.textContent?.trim() || 'General';
  const rating = storyElement.querySelector('.story-rating')?.textContent?.trim() || 'N/A';
  const image = storyElement.querySelector('.story-image')?.src || 'https://via.placeholder.com/300x200?text=Story';
  
  // Create a unique ID based on title
  const storyId = storyElement.getAttribute('data-story-id') || 
                  title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  return {
    id: storyId,
    title: title,
    author: author,
    description: description,
    genre: genre,
    rating: rating,
    image: image
  };
}

// FIXED: Function to setup "Add to Library" buttons with proper state management
function setupLibraryButtons() {
  // Setup for existing story cards
  document.querySelectorAll('.add-btn, .add-to-library-btn').forEach(button => {
    // Remove existing listeners to prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!window.authManager.isSignedIn()) {
        showNotification('Please sign in to add stories to your library', 'warning');
        // Trigger login modal
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) loginBtn.click();
        return;
      }
      
      // Find the story card element
      const storyCard = newButton.closest('.story-card, .hero-content');
      if (!storyCard) {
        showNotification('Could not find story information', 'error');
        return;
      }
      
      // Extract story data
      const storyData = createStoryData(storyCard);
      
      // Show loading state
      const originalHTML = newButton.innerHTML;
      const originalClass = newButton.className;
      newButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      newButton.disabled = true;
      newButton.style.pointerEvents = 'none';
      
      try {
        const result = await window.authManager.addToLibrary(storyData, newButton);
        
        if (result.success) {
          // Success - show "Added to Library" and change functionality
          newButton.innerHTML = '<i class="fas fa-check"></i> Added to Library';
          newButton.classList.add('added');
          newButton.disabled = false;
          newButton.style.pointerEvents = 'auto';
          
          // Change click behavior to redirect to library
          setTimeout(() => {
            newButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = 'library.html';
            };
          }, 100);
          
        } else if (result.inLibrary) {
          // Already in library - change to "View in Library"
          newButton.innerHTML = '<i class="fas fa-book-open"></i> View in Library';
          newButton.classList.add('in-library');
          newButton.disabled = false;
          newButton.style.pointerEvents = 'auto';
          newButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = 'library.html';
          };
          
        } else {
          // Error occurred
          newButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to add';
          newButton.classList.add('error');
          
          // Reset after 3 seconds
          setTimeout(() => {
            newButton.innerHTML = originalHTML;
            newButton.className = originalClass;
            newButton.disabled = false;
            newButton.style.pointerEvents = 'auto';
          }, 3000);
        }
        
      } catch (error) {
        console.error('Error adding to library:', error);
        showNotification('Failed to add story to library', 'error');
        
        // Show error state
        newButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
        newButton.classList.add('error');
        
        // Reset after 3 seconds
        setTimeout(() => {
          newButton.innerHTML = originalHTML;
          newButton.className = originalClass;
          newButton.disabled = false;
          newButton.style.pointerEvents = 'auto';
        }, 3000);
      }
    });
  });
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
  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.querySelector('.account-menu');
  const signOutLink = document.getElementById('signout-link');
  
  if (!accountToggle || !accountMenu) {
    return;
  }
  
  // Toggle account menu on click
  accountToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    accountMenu.classList.toggle('hidden');
    
    // Rotate the dropdown arrow
    const arrow = accountToggle.querySelector('.dropdown-arrow');
    if (arrow) {
      arrow.style.transform = accountMenu.classList.contains('hidden') 
        ? 'rotate(0deg)' 
        : 'rotate(180deg)';
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!accountToggle.contains(e.target) && !accountMenu.contains(e.target)) {
      if (!accountMenu.classList.contains('hidden')) {
        accountMenu.classList.add('hidden');
        const arrow = accountToggle.querySelector('.dropdown-arrow');
        if (arrow) {
          arrow.style.transform = 'rotate(0deg)';
        }
      }
    }
  });
  
  // Sign out link handler
  if (signOutLink) {
    signOutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Show loading state
        const originalHTML = signOutLink.innerHTML;
        signOutLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing out...';
        signOutLink.style.pointerEvents = 'none';
        
        const result = await window.authManager.signOut();
        
        if (result.success) {
          // Hide the menu immediately
          accountMenu.classList.add('hidden');
          const arrow = accountToggle.querySelector('.dropdown-arrow');
          if (arrow) {
            arrow.style.transform = 'rotate(0deg)';
          }
          
          // Show success message
          showNotification('Signed out successfully', 'success');
          
          // UI will be updated automatically by the auth state change listener
        } else {
          showNotification('Error signing out. Please try again.', 'error');
          // Reset link state
          signOutLink.innerHTML = originalHTML;
          signOutLink.style.pointerEvents = 'auto';
        }
        
      } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out. Please try again.', 'error');
        
        // Reset link state
        signOutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
        signOutLink.style.pointerEvents = 'auto';
      }
    });
  }
}

// Login modal setup function
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

// Make functions available globally
window.showNotification = showNotification;
window.createStoryData = createStoryData;
window.setupLibraryButtons = setupLibraryButtons;

// Export the setup functions
window.setupLoginModal = setupLoginModal;
window.setupAccountMenu = setupAccountMenu;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupLoginModal();
  setupAccountMenu();
  setupLibraryButtons();
  
  // Re-setup library buttons when new content is loaded dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        setupLibraryButtons();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
