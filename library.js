// Library Page JavaScript - Talevo
// This handles all library-specific functionality

class LibraryManager {
  constructor() {
    this.currentUser = null;
    this.userLibrary = [];
    this.readingProgress = {};
    this.isLoading = true;
    
    // Wait for auth manager to be ready
    this.init();
  }

  async init() {
    // Wait for auth manager to be available
    while (!window.authManager) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Wait for auth state to be determined
    await new Promise(resolve => {
      const checkAuth = () => {
        if (window.authManager.currentUser !== undefined) {
          this.currentUser = window.authManager.currentUser;
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
    
    if (this.currentUser) {
      await this.loadLibraryData();
      this.renderLibrary();
    } else {
      // Redirect to home if not logged in
      window.location.href = 'index.html';
    }
  }

  async loadLibraryData() {
    try {
      // Load user library and reading progress
      this.userLibrary = await window.authManager.getUserLibrary();
      this.readingProgress = await window.authManager.getReadingProgress();
      
      // Update username display
      this.updateUsername();
      
    } catch (error) {
      console.error('Error loading library data:', error);
      this.showNotification('Error loading library data', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  updateUsername() {
    const usernameDisplay = document.getElementById('library-username');
    const accountName = document.getElementById('account-name');
    const headerUsername = document.getElementById('username-display');
    
    if (this.currentUser) {
      const username = this.currentUser.displayName || this.currentUser.email.split('@')[0];
      
      if (usernameDisplay) {
        usernameDisplay.textContent = `${username}'s Personal Collection`;
      }
      if (accountName) {
        accountName.textContent = username;
      }
      if (headerUsername) {
        headerUsername.textContent = `Welcome, ${username}!`;
      }
    }
  }

  renderLibrary() {
    const loadingEl = document.getElementById('library-loading');
    const emptyEl = document.getElementById('library-empty');
    const storiesEl = document.getElementById('library-stories');
    
    // Hide loading
    if (loadingEl) loadingEl.classList.add('hidden');
    
    if (this.userLibrary.length === 0) {
      // Show empty state
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (storiesEl) storiesEl.classList.add('hidden');
    } else {
      // Show stories
      if (emptyEl) emptyEl.classList.add('hidden');
      if (storiesEl) {
        storiesEl.classList.remove('hidden');
        this.renderStoryCards();
      }
    }
    
    // Update stats
    this.updateStats();
  }

  renderStoryCards() {
    const storiesContainer = document.getElementById('library-stories');
    if (!storiesContainer) return;
    
    storiesContainer.innerHTML = '';
    
    this.userLibrary.forEach(story => {
      const storyCard = this.createLibraryStoryCard(story);
      storiesContainer.appendChild(storyCard);
    });
  }

  createLibraryStoryCard(story) {
    const progress = this.readingProgress[story.id] || { currentChapter: 1, totalChapters: 10, percentage: 0 };
    const isInProgress = progress.percentage > 0 && progress.percentage < 100;
    const isCompleted = progress.percentage >= 100;
    
    const card = document.createElement('div');
    card.className = 'library-story-card';
    card.setAttribute('data-story-id', story.id);
    
    card.innerHTML = `
      <div class="library-story-image">
        <img src="${story.image || 'https://via.placeholder.com/300x400/4a5568/ffffff?text=Story'}" alt="${story.title}">
        <div class="story-status ${isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'not-started'}">
          <i class="fas ${isCompleted ? 'fa-check-circle' : isInProgress ? 'fa-play-circle' : 'fa-circle'}"></i>
        </div>
      </div>
      
      <div class="library-story-content">
        <div class="library-story-header">
          <h3 class="library-story-title">${story.title}</h3>
          <button class="remove-from-library-btn" data-story-id="${story.id}" title="Remove from library">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        
        <p class="library-story-author">${story.author}</p>
        <p class="library-story-genre">
          <i class="fas fa-tag"></i>
          ${story.genre}
        </p>
        
        <div class="library-story-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          <div class="progress-text">
            ${progress.percentage}% complete
            ${isInProgress ? `(Chapter ${progress.currentChapter}/${progress.totalChapters})` : ''}
          </div>
        </div>
        
        <div class="library-story-meta">
          <div class="added-date">
            <i class="fas fa-calendar-plus"></i>
            Added ${this.formatDate(story.addedAt)}
          </div>
          <div class="story-rating">
            <i class="fas fa-star"></i>
            ${story.rating}
          </div>
        </div>
        
        <div class="library-story-actions">
          <button class="btn continue-reading-btn" data-story-id="${story.id}">
            <i class="fas ${isInProgress ? 'fa-play' : 'fa-book-open'}"></i>
            ${isCompleted ? 'Read Again' : isInProgress ? 'Continue' : 'Start Reading'}
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupStoryCardEvents(card);
    
    return card;
  }

  setupStoryCardEvents(card) {
    const removeBtn = card.querySelector('.remove-from-library-btn');
    const continueBtn = card.querySelector('.continue-reading-btn');
    
    // Remove from library
    if (removeBtn) {
      removeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const storyId = removeBtn.getAttribute('data-story-id');
        await this.removeFromLibrary(storyId);
      });
    }
    
    // Continue reading / Start reading
    if (continueBtn) {
      continueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const storyId = continueBtn.getAttribute('data-story-id');
        // You can implement story reading logic here
        // For now, we'll show a notification
        this.showNotification('Story reading feature coming soon!', 'info');
      });
    }
  }

  async removeFromLibrary(storyId) {
    try {
      // Show confirmation
      if (!confirm('Are you sure you want to remove this story from your library?')) {
        return;
      }
      
      // Show loading state
      const card = document.querySelector(`[data-story-id="${storyId}"]`);
      if (card) {
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
      }
      
      // Remove from Firebase
      const result = await window.authManager.removeFromLibrary(storyId);
      
      if (result.success) {
        // Update local library
        this.userLibrary = this.userLibrary.filter(story => story.id !== storyId);
        
        // Remove card with animation
        if (card) {
          card.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => {
            card.remove();
            this.updateStats();
            
            // Check if library is now empty
            if (this.userLibrary.length === 0) {
              this.renderLibrary();
            }
          }, 300);
        }
        
        this.showNotification('Story removed from library', 'success');
      } else {
        // Reset card state on error
        if (card) {
          card.style.opacity = '1';
          card.style.pointerEvents = 'auto';
        }
      }
      
    } catch (error) {
      console.error('Error removing from library:', error);
      this.showNotification('Failed to remove story from library', 'error');
      
      // Reset card state
      const card = document.querySelector(`[data-story-id="${storyId}"]`);
      if (card) {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
      }
    }
  }

  updateStats() {
    const totalStories = this.userLibrary.length;
    let storiesInProgress = 0;
    let storiesCompleted = 0;
    
    this.userLibrary.forEach(story => {
      const progress = this.readingProgress[story.id] || { percentage: 0 };
      if (progress.percentage >= 100) {
        storiesCompleted++;
      } else if (progress.percentage > 0) {
        storiesInProgress++;
      }
    });
    
    // Update DOM
    const totalEl = document.getElementById('total-stories');
    const inProgressEl = document.getElementById('stories-in-progress');
    const completedEl = document.getElementById('stories-completed');
    
    if (totalEl) totalEl.textContent = totalStories;
    if (inProgressEl) inProgressEl.textContent = storiesInProgress;
    if (completedEl) completedEl.textContent = storiesCompleted;
  }

  formatDate(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }

  showNotification(message, type = 'info') {
    // Use the global notification function
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Theme toggle functionality (shared with main site)
function setupThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  const body = document.body;
  
  // Check for saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);
  
  if (themeToggle) {
    // Update icon based on current theme
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update icon
      if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  
  // Initialize library manager
  window.libraryManager = new LibraryManager();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }
  
  .library-story-card {
    transition: all 0.3s ease;
  }
  
  .library-story-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
`;
document.head.appendChild(style);
