// Library.js - Enhanced Firebase Library Management with Real-time Sync
import { app } from './firebase-config.js';

class LibraryManager {
  constructor() {
    this.auth = window.firebaseAuth;
    this.db = window.firebaseDb;
    this.utils = window.firebaseUtils;
    this.currentUser = null;
    this.userLibrary = [];
    this.isLoading = true;
    this.authInitialized = false;
    
    // Initialize when auth state changes
    this.utils.onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.authInitialized = true;
      this.handleAuthStateChange(user);
    });

    // Load saved theme
    this.loadSavedTheme();
  }

  // Load saved theme from localStorage
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      const themeToggle = document.querySelector('.theme-toggle i');
      if (themeToggle) {
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
      }
    }
  }

  // Handle authentication state changes
  async handleAuthStateChange(user) {
    console.log('Auth state changed:', user ? 'signed in' : 'signed out');
    
    if (user) {
      // User is signed in - load their library
      console.log('User signed in, loading library...');
      await this.updateUserInfo(user);
      await this.loadUserLibrary();
      this.updateLibraryUI();
    } else {
      // User is not signed in - redirect to home
      console.log('User not signed in, redirecting...');
      this.redirectToHome();
    }
  }

  // Update user information in the UI
  async updateUserInfo(user) {
    console.log('Updating user info for:', user.email);
    
    const libraryUsername = document.getElementById('library-username');
    const usernameDisplay = document.getElementById('username-display');
    const accountName = document.getElementById('account-name');
    
    let username = user.displayName;
    
    // If no displayName, get from Firestore
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
    
    console.log('Username resolved to:', username);
    
    // Update UI elements
    if (libraryUsername) libraryUsername.textContent = username + "'s";
    if (usernameDisplay) usernameDisplay.textContent = `Welcome, ${username}!`;
    if (accountName) accountName.textContent = username;
    
    // Show account UI, hide login button
    const loginBtn = document.querySelector('.login-btn');
    const accountWrapper = document.querySelector('.account-wrapper');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (accountWrapper) accountWrapper.classList.remove('hidden');
  }

  // Load user's library from Firebase and localStorage
  async loadUserLibrary() {
    if (!this.currentUser) {
      console.log('No current user, empty library');
      this.userLibrary = [];
      this.isLoading = false;
      return;
    }
    
    console.log('Loading library for user:', this.currentUser.uid);
    this.isLoading = true;
    this.showLoadingState();
    
    try {
      // Get library from Firebase
      const userDoc = await this.utils.getDoc(this.utils.doc(this.db, 'users', this.currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firebaseLibrary = userData?.library || [];
        console.log('Firebase library loaded:', firebaseLibrary.length, 'stories');
        
        // Get library from localStorage for offline support
        const localLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
        console.log('Local library found:', localLibrary.length, 'stories');
        
        // Merge libraries (Firebase takes precedence)
        this.userLibrary = this.mergeLibraries(firebaseLibrary, localLibrary);
        
        // Update localStorage
        localStorage.setItem('userLibrary', JSON.stringify(this.userLibrary));
        
        console.log('Final merged library:', this.userLibrary.length, 'stories');
      } else {
        console.log('User document does not exist, creating empty library');
        this.userLibrary = [];
        
        // Create user document with empty library
        await this.utils.setDoc(this.utils.doc(this.db, 'users', this.currentUser.uid), {
          library: [],
          readingProgress: {},
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
      
    } catch (error) {
      console.error('Error loading user library:', error);
      // Fallback to localStorage
      this.userLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
      this.showNotification('Failed to sync with server. Showing offline library.', 'warning');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
      console.log('Library loading complete');
    }
  }

  // Merge Firebase and local libraries
  mergeLibraries(firebaseLibrary, localLibrary) {
    const merged = [...firebaseLibrary];
    
    // Add local stories that aren't in Firebase
    localLibrary.forEach(localStory => {
      const existsInFirebase = merged.some(fbStory => fbStory.id === localStory.id);
      if (!existsInFirebase) {
        merged.push(localStory);
      }
    });
    
    // Sort by date added (newest first)
    return merged.sort((a, b) => {
      const dateA = new Date(a.addedAt || 0);
      const dateB = new Date(b.addedAt || 0);
      return dateB - dateA;
    });
  }

  // Remove story from library
  async removeFromLibrary(storyId) {
    if (!this.currentUser) {
      this.showNotification('Please sign in to manage your library', 'warning');
      return;
    }
    
    console.log('Removing story from library:', storyId);
    
    try {
      // Show loading state on the remove button
      const removeBtn = document.querySelector(`[data-story-id="${storyId}"] .remove-btn`);
      if (removeBtn) {
        const originalHTML = removeBtn.innerHTML;
        removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        removeBtn.disabled = true;
      }
      
      // Remove from local array
      this.userLibrary = this.userLibrary.filter(story => story.id !== storyId);
      
      // Update localStorage immediately
      localStorage.setItem('userLibrary', JSON.stringify(this.userLibrary));
      
      // Remove from DOM immediately for better UX
      const storyCard = document.querySelector(`[data-story-id="${storyId}"]`);
      if (storyCard) {
        storyCard.style.transition = 'all 0.3s ease';
        storyCard.style.transform = 'scale(0.8)';
        storyCard.style.opacity = '0';
        setTimeout(() => {
          if (storyCard.parentNode) {
            storyCard.remove();
          }
          this.updateLibraryStats();
          this.checkEmptyState();
        }, 300);
      }
      
      // Update Firebase in background
      const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
      const userDoc = await this.utils.getDoc(userRef);
      const userData = userDoc.data() || {};
      
      await this.utils.setDoc(userRef, {
        ...userData,
        library: this.userLibrary
      }, { merge: true });
      
      this.showNotification('Story removed from library', 'success');
      console.log('Story removed successfully');
      
    } catch (error) {
      console.error('Error removing from library:', error);
      this.showNotification('Failed to remove story. Please try again.', 'error');
      
      // Reload library on error
      await this.loadUserLibrary();
      this.updateLibraryUI();
    }
  }

  // Update the entire library UI
  updateLibraryUI() {
    console.log('Updating library UI with', this.userLibrary.length, 'stories');
    this.updateLibraryStats();
    this.renderLibraryStories();
    this.checkEmptyState();
    this.setupSearchFunctionality();
  }

  // Update library statistics
  updateLibraryStats() {
    const totalStoriesElement = document.getElementById('total-stories');
    if (totalStoriesElement) {
      totalStoriesElement.textContent = this.userLibrary.length;
    }
  }

  // Render library stories in the grid
  renderLibraryStories() {
    const storiesGrid = document.getElementById('stories-grid');
    if (!storiesGrid) {
      console.error('Stories grid element not found');
      return;
    }
    
    console.log('Rendering', this.userLibrary.length, 'stories');
    
    // Clear existing content
    storiesGrid.innerHTML = '';
    
    if (this.userLibrary.length === 0) {
      this.showEmptyState();
      return;
    }
    
    // Create story cards
    this.userLibrary.forEach(story => {
      const storyCard = this.createLibraryStoryCard(story);
      storiesGrid.appendChild(storyCard);
    });
    
    // Show the grid
    storiesGrid.classList.remove('hidden');
    this.hideEmptyState();
  }

  // Create a story card for the library
  createLibraryStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card library-story-card';
    card.setAttribute('data-story-id', story.id);
    
    // Format the date added
    const dateAdded = story.addedAt ? 
      new Date(story.addedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown date';
    
    card.innerHTML = `
      <div class="story-image-container">
        <img src="${story.image || 'https://via.placeholder.com/300x200?text=Story'}" 
             alt="${story.title}" class="story-image" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x200?text=Story'">
        <div class="story-overlay">
          <button class="btn read-story-btn" onclick="readStory('${story.id}')">
            <i class="fas fa-book-open"></i> Continue Reading
          </button>
        </div>
      </div>
      
      <div class="story-content">
        <div class="story-header">
          <h3 class="story-title">${story.title || 'Untitled Story'}</h3>
          <button class="remove-btn" onclick="libraryManager.removeFromLibrary('${story.id}')" 
                  title="Remove from library">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        
        <p class="story-author">by ${story.author || 'Unknown Author'}</p>
        <p class="story-description">${story.description || 'No description available.'}</p>
        
        <div class="story-meta">
          <div class="story-genre">
            <i class="fas fa-tag"></i>
            <span>${story.genre || 'General'}</span>
          </div>
          <div class="story-rating">
            <i class="fas fa-star"></i>
            <span>${story.rating || 'N/A'}</span>
          </div>
        </div>
        
        <div class="story-date">
          <i class="fas fa-calendar-plus"></i>
          <span>Added on ${dateAdded}</span>
        </div>
      </div>
    `;
    
    return card;
  }

  // Show/hide empty state
  showEmptyState() {
    console.log('Showing empty state');
    const emptyState = document.getElementById('empty-state');
    const storiesGrid = document.getElementById('stories-grid');
    
    if (emptyState) emptyState.classList.remove('hidden');
    if (storiesGrid) storiesGrid.classList.add('hidden');
  }

  hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.classList.add('hidden');
  }

  checkEmptyState() {
    if (this.userLibrary.length === 0) {
      this.showEmptyState();
    } else {
      this.hideEmptyState();
    }
  }

  // Show/hide loading state
  showLoadingState() {
    console.log('Showing loading state');
    const loadingState = document.getElementById('loading-state');
    const storiesGrid = document.getElementById('stories-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (loadingState) loadingState.classList.remove('hidden');
    if (storiesGrid) storiesGrid.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
  }

  hideLoadingState() {
    console.log('Hiding loading state');
    const loadingState = document.getElementById('loading-state');
    if (loadingState) loadingState.classList.add('hidden');
  }

  // Setup search functionality for the library
  setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    // Update placeholder for library search
    searchInput.placeholder = 'Search your library...';
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchLibrary(e.target.value.trim());
      }, 300);
    });
  }

  // Search through user's library
  searchLibrary(query) {
    const storyCards = document.querySelectorAll('.library-story-card');
    
    if (!query) {
      // Show all stories
      storyCards.forEach(card => {
        card.style.display = 'block';
      });
      this.checkEmptyState();
      return;
    }
    
    const searchTerms = query.toLowerCase().split(' ');
    let visibleCount = 0;
    
    storyCards.forEach(card => {
      const title = card.querySelector('.story-title')?.textContent.toLowerCase() || '';
      const author = card.querySelector('.story-author')?.textContent.toLowerCase() || '';
      const description = card.querySelector('.story-description')?.textContent.toLowerCase() || '';
      const genre = card.querySelector('.story-genre span')?.textContent.toLowerCase() || '';
      
      const searchText = `${title} ${author} ${description} ${genre}`;
      
      const matches = searchTerms.every(term => searchText.includes(term));
      
      if (matches) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/hide empty state based on search results
    if (visibleCount === 0 && this.userLibrary.length > 0) {
      const emptyState = document.getElementById('empty-state');
      if (emptyState) {
        const emptyContent = emptyState.querySelector('.empty-state-content');
        emptyContent.innerHTML = `
          <i class="fas fa-search empty-icon"></i>
          <h3>No stories found</h3>
          <p>Try adjusting your search terms.</p>
          <button class="btn clear-search-btn" onclick="clearLibrarySearch()">
            <i class="fas fa-times"></i> Clear Search
          </button>
        `;
        emptyState.classList.remove('hidden');
      }
      const storiesGrid = document.getElementById('stories-grid');
      if (storiesGrid) storiesGrid.classList.add('hidden');
    } else if (visibleCount > 0) {
      this.hideEmptyState();
      const storiesGrid = document.getElementById('stories-grid');
      if (storiesGrid) storiesGrid.classList.remove('hidden');
    }
  }

  // Redirect to home if not signed in
  redirectToHome() {
    if (window.location.pathname.includes('library.html')) {
      this.showNotification('Please sign in to view your library', 'warning');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    }
  }

  // Utility function to show notifications
  showNotification(message, type = 'info') {
    // Reuse the notification system from firebase-auth.js
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback if notification function isn't available
      console.log(`${type.toUpperCase()}: ${message}`);
      
      // Create a simple notification if the main one isn't available
      let notification = document.getElementById('simple-notification');
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'simple-notification';
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
          background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        `;
        document.body.appendChild(notification);
      }
      
      notification.textContent = message;
      notification.style.transform = 'translateX(0)';
      
      setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
      }, 3000);
    }
  }

  // Get user library (for external access)
  getUserLibrary() {
    return this.userLibrary;
  }

  // Check if story is in library (for external access)
  isInLibrary(storyId) {
    return this.userLibrary.some(story => story.id === storyId);
  }
}

// Global functions for HTML onclick handlers
window.readStory = function(storyId) {
  // Navigate to story reading page
  console.log('Reading story:', storyId);
  window.location.href = `story.html?id=${storyId}`;
};

window.clearLibrarySearch = function() {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.value = '';
    libraryManager.searchLibrary('');
  }
};

// Initialize Library Manager
const libraryManager = new LibraryManager();

// Make library manager available globally
window.libraryManager = libraryManager;

// Setup theme toggle and other UI interactions
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up library page');
  
  // Theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const icon = themeToggle.querySelector('i');
      if (document.body.classList.contains('dark-theme')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
      } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Setup account menu functionality (reuse from firebase-auth.js logic)
  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.querySelector('.account-menu');
  const signOutLink = document.getElementById('signout-link');
  
  if (accountToggle && accountMenu) {
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
  }
  
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
        
        // Use the auth manager from firebase-auth.js if available
        if (window.authManager && window.authManager.signOut) {
          const result = await window.authManager.signOut();
          
          if (result.success) {
            // Hide the menu immediately
            accountMenu.classList.add('hidden');
            const arrow = accountToggle.querySelector('.dropdown-arrow');
            if (arrow) {
              arrow.style.transform = 'rotate(0deg)';
            }
            
            // Show success message and redirect
            libraryManager.showNotification('Signed out successfully', 'success');
            
            // UI will be updated automatically by the auth state change listener
          } else {
            libraryManager.showNotification('Error signing out. Please try again.', 'error');
            // Reset link state
            signOutLink.innerHTML = originalHTML;
            signOutLink.style.pointerEvents = 'auto';
          }
        } else {
          // Fallback if auth manager not available
          await window.firebaseAuth.signOut();
          libraryManager.showNotification('Signed out successfully', 'success');
        }
        
      } catch (error) {
        console.error('Sign out error:', error);
        libraryManager.showNotification('Error signing out. Please try again.', 'error');
        
        // Reset link state
        signOutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
        signOutLink.style.pointerEvents = 'auto';
      }
    });
  }
});

export { LibraryManager };
