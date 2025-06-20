
import { app } from './firebase-config.js';

export class FirebaseAuthManager {
  constructor() {
    this.auth = window.firebaseAuth;
    this.db = window.firebaseDb;
    this.utils = window.firebaseUtils;
    this.currentUser = null;

    this.utils.onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.updateUI(user);
    });
  }

  async signUp(username, email, password) {
    try {

      const userCredential = await this.utils.createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      await this.utils.updateProfile(user, {
        displayName: username
      });

      await this.utils.setDoc(this.utils.doc(this.db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        readingProgress: {},
        library: [] // Initialize empty library
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true, user: user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await this.utils.signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      const userDoc = await this.utils.getDoc(this.utils.doc(this.db, 'users', user.uid));
      const userData = userDoc.data();

      if (!user.displayName && userData?.username) {
        await this.utils.updateProfile(user, {
          displayName: userData.username
        });
      }




      await this.syncLibrary();

      setTimeout(() => {
  this.updateAddToLibraryButtons();
}, 500);
      
      return { success: true, user: user, userData: userData };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  async signOut() {
    try {

      localStorage.removeItem('userLibrary');
      localStorage.removeItem('progress');
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
      
      await this.utils.signOut(this.auth);

      this.resetAllLibraryButtons();
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  resetAllLibraryButtons() {
  document.querySelectorAll('.add-btn, .add-to-library-btn').forEach(button => {

    button.innerHTML = '<i class="fas fa-plus"></i> Add to Library';
    button.className = button.className.replace(/\s*(added|in-library|error)\s*/g, ' ').trim();
    button.disabled = false;
    button.style.pointerEvents = 'auto';

    button.removeAttribute('data-library-setup');
  });

  setupLibraryButtons();
}

  async addToLibrary(storyData, buttonElement = null) {
    console.log('addToLibrary called with:', storyData);
console.log('Current user:', this.currentUser?.email);
console.log('Button element:', buttonElement);
  if (!this.currentUser) {
    showNotification('Please sign in to add stories to your library', 'warning');
    return { success: false, error: 'User not authenticated' };
  }

  if (!storyData.id || storyData.id.trim() === '') {
    console.warn('Story data missing ID, generating one...');

    let newId = '';
    if (storyData.title && storyData.title.trim() !== '') {
      newId = storyData.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    if (!newId || newId.length < 2) {
      newId = 'story-' + Date.now();
    }

    storyData.id = newId + '-' + Date.now();
    console.log('Generated new story ID:', storyData.id);
  }

  if (!storyData.id || typeof storyData.id !== 'string' || storyData.id.trim() === '') {
    storyData.id = 'story-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.log('Used fallback story ID:', storyData.id);
  }

  let originalHTML = '';
  let originalClass = '';
  
  if (buttonElement) {
    originalHTML = buttonElement.innerHTML;
    originalClass = buttonElement.className;

    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    buttonElement.disabled = true;
    buttonElement.style.pointerEvents = 'none';
  }
  
  try {
    const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
    const userDoc = await this.utils.getDoc(userRef);
    const userData = userDoc.data() || {};

    const currentLibrary = userData.library || [];

    const existingStory = currentLibrary.find(story => 
      story.id === storyData.id || 
      (story.title === storyData.title && story.author === storyData.author)
    );
    
    if (existingStory) {

      if (buttonElement) {
        buttonElement.innerHTML = '<i class="fas fa-book-open"></i> View in Library';
        buttonElement.classList.add('in-library');
        buttonElement.disabled = false;
        buttonElement.style.pointerEvents = 'auto';
        buttonElement.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = 'library.html';
        };
      }
      
      showNotification('Story is already in your library', 'info');
      setTimeout(() => {
        window.location.href = 'library.html';
      }, 1000);
      return { success: false, error: 'Story already in library', inLibrary: true };
    }

    const storyWithTimestamp = {
      id: storyData.id, // Ensure ID is always included
      title: storyData.title || 'Untitled Story',
      author: storyData.author || 'Unknown Author',
      description: storyData.description || 'No description available.',
      genre: storyData.genre || 'General',
      rating: storyData.rating || 'N/A',
      image: storyData.image || 'https://via.placeholder.com/300x200?text=Story',
      addedAt: new Date().toISOString()
    };

    if (!storyWithTimestamp.id || storyWithTimestamp.id.trim() === '') {
      throw new Error('Story ID validation failed');
    }
    
    console.log('Adding story to library with ID:', storyWithTimestamp.id);

    const updatedLibrary = [...currentLibrary, storyWithTimestamp];

    await this.utils.setDoc(userRef, {
      ...userData,
      library: updatedLibrary
    }, { merge: true });

    localStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));

    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-check"></i> Added to Library';
      buttonElement.classList.add('added');
      buttonElement.disabled = false;
      buttonElement.style.pointerEvents = 'auto';

      setTimeout(() => {
        buttonElement.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = 'library.html';
        };
      }, 100);
    }
    
    showNotification('Story added to your library!', 'success');
    console.log('Story successfully added to library');
    return { success: true, library: updatedLibrary };
    
  } catch (error) {
    console.error('Error adding to library:', error);

    if (buttonElement) {
      buttonElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to add';
      buttonElement.classList.add('error');

      setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.className = originalClass;
        buttonElement.disabled = false;
        buttonElement.style.pointerEvents = 'auto';
      }, 3000);
    }
    
    showNotification('Failed to add story to library', 'error');
    return { success: false, error: error.message };
  }
}

  async removeFromLibrary(storyId) {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const userRef = this.utils.doc(this.db, 'users', this.currentUser.uid);
      const userDoc = await this.utils.getDoc(userRef);
      const userData = userDoc.data() || {};

      const currentLibrary = userData.library || [];

      const updatedLibrary = currentLibrary.filter(story => story.id !== storyId);

      await this.utils.setDoc(userRef, {
        ...userData,
        library: updatedLibrary
      }, { merge: true });

      localStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));
      
      return { success: true, library: updatedLibrary };
      
    } catch (error) {
      console.error('Error removing from library:', error);
      return { success: false, error: error.message };
    }
  }

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

  async syncLibrary() {
    if (!this.currentUser) return;
    
    try {

      const firebaseLibrary = await this.getUserLibrary();

      localStorage.setItem('userLibrary', JSON.stringify(firebaseLibrary));
      
      console.log('Library synced for user:', this.currentUser.uid, 'Stories:', firebaseLibrary.length);
      
    } catch (error) {
      console.error('Error syncing library:', error);
    }
  }

  async updateAddToLibraryButtons() {
  if (!this.currentUser) return;
  
  try {
    const userLibrary = await this.getUserLibrary();
    const libraryIds = userLibrary.map(story => story.id);
    
    document.querySelectorAll('.add-btn, .add-to-library-btn').forEach(button => {
      const storyCard = button.closest('.story-card, .hero-content');
      if (storyCard) {
        const storyData = createStoryData(storyCard);
        
        if (libraryIds.includes(storyData.id)) {

          button.innerHTML = '<i class="fas fa-book-open"></i> View in Library';
          button.classList.add('in-library');
          button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = 'library.html';
          };
        } else {

          button.innerHTML = '<i class="fas fa-plus"></i> Add to Library';
          button.classList.remove('added', 'in-library', 'error');
          button.onclick = null; // Will be handled by event listener
        }
      }
    });
  } catch (error) {
    console.error('Error updating library button states:', error);
  }
}

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

  async updateUI(user) {
    const loginBtn = document.querySelector(".login-btn");
    const accountWrapper = document.querySelector(".account-wrapper");
    const accountName = document.getElementById("account-name");
    const accountMenu = document.querySelector(".account-menu");
    const usernameDisplay = document.getElementById("username-display");

    if (user) {

      let username = user.displayName;

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
      if (usernameDisplay) usernameDisplay.textContent = `Welcome, ${username}!`;

      this.syncReadingProgress();
      this.syncLibrary();

      setTimeout(() => {
        this.resetAllLibraryButtons();
      }, 500);
    } else {

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

      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userLibrary');
      localStorage.removeItem('progress');

      this.resetAllLibraryButtons();
    }
  }

  async syncReadingProgress() {
    if (!this.currentUser) return;
    
    try {

      const firebaseProgress = await this.getReadingProgress();

      localStorage.setItem("progress", JSON.stringify(firebaseProgress));
      
    } catch (error) {
      console.error('Error syncing reading progress:', error);
    }
  }

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

  isSignedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

function createStoryData(storyElement) {
  console.log('Creating story data for element:', storyElement);

  let title = '';
  let author = '';
  let description = '';
  let genre = '';
  let rating = '';
  let image = '';

  const titleSelectors = [
    '.story-title',
    '.hero-story-title', 
    '.story-card-title',
    'h1',
    'h2',
    'h3'
  ];
  
  for (const selector of titleSelectors) {
    const element = storyElement.querySelector(selector);
    if (element && element.textContent.trim()) {
      title = element.textContent.trim();
      break;
    }
  }

  const authorSelectors = [
    '.story-author',
    '.hero-story-author',
    '.story-card-author',
    '[data-author]'
  ];
  
  for (const selector of authorSelectors) {
    const element = storyElement.querySelector(selector);
    if (element && element.textContent.trim()) {
      author = element.textContent.replace('by ', '').trim();
      break;
    }
  }

  const descriptionSelectors = [
    '.story-description',
    '.hero-story-desc',
    '.story-card-desc',
    '.story-desc',
    'p'
  ];
  
  for (const selector of descriptionSelectors) {
    const element = storyElement.querySelector(selector);
    if (element && element.textContent.trim()) {
      description = element.textContent.trim();
      break;
    }
  }

  const genreSelectors = [
    '.story-genre',
    '.genre span',
    '.genre',
    '.story-card-meta .genre',
    '[data-genre]'
  ];
  
  for (const selector of genreSelectors) {
    const element = storyElement.querySelector(selector);
    if (element && element.textContent.trim()) {
      genre = element.textContent.trim();
      break;
    }
  }

  const ratingSelectors = [
    '.story-rating',
    '.rating span',
    '.rating',
    '.story-card-meta .rating span',
    '[data-rating]'
  ];
  
  for (const selector of ratingSelectors) {
    const element = storyElement.querySelector(selector);
    if (element && element.textContent.trim()) {
      rating = element.textContent.trim();
      break;
    }
  }

  const imageSelectors = [
    '.story-image',
    '.hero-image img',
    '.story-card-img',
    'img'
  ];
  
  for (const selector of imageSelectors) {
    const element = storyElement.querySelector(selector);
    if (element && element.src) {
      image = element.src;
      break;
    }
  }

  let storyId = storyElement.getAttribute('data-story-id');

  if (!storyId || storyId.trim() === '') {

    const readBtn = storyElement.querySelector('.read-story-btn, .continue-reading-btn, .read-btn');
    if (readBtn) {
      const href = readBtn.getAttribute('href');
      const onclick = readBtn.getAttribute('onclick');
      
      if (href && href.includes('id=')) {
        storyId = href.split('id=')[1].split('&')[0];
      } else if (onclick && onclick.includes("'")) {
        const matches = onclick.match(/'([^']+)'/);
        if (matches) {
          storyId = matches[1];
        }
      }
    }

    if (!storyId || storyId.trim() === '') {
      if (title && title.trim() !== '') {
        storyId = title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (storyId.length > 0) {
          storyId = storyId + '-' + Date.now();
        }
      }

      if (!storyId || storyId.length < 2) {
        storyId = 'story-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
    }
  }

  if (!storyId || storyId.trim() === '') {
    storyId = 'story-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  const storyData = {
    id: storyId,
    title: title || 'Untitled Story',
    author: author || 'Unknown Author',
    description: description || 'No description available.',
    genre: genre || 'General',
    rating: rating || 'N/A',
    image: image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(title || 'Story')}`
  };
  
  console.log('Generated story data:', storyData);
  
  return storyData;
}

function setupLibraryButtons() {

  document.querySelectorAll('.add-btn, .add-to-library-btn').forEach(button => {

    button.removeEventListener('click', handleLibraryClick);

    button.addEventListener('click', handleLibraryClick);
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!window.authManager.isSignedIn()) {
        showNotification('Please sign in to add stories to your library', 'warning');

        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) loginBtn.click();
        return;
      }

      const storyCard = button.closest('.story-card, .hero-content');
      if (!storyCard) {
        showNotification('Could not find story information', 'error');
        return;
      }

      const storyData = createStoryData(storyCard);

      await window.authManager.addToLibrary(storyData, button);
    });
  });
}

async function handleLibraryClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if (!window.authManager.isSignedIn()) {
    showNotification('Please sign in to add stories to your library', 'warning');

    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) loginBtn.click();
    return;
  }

  const storyCard = this.closest('.story-card, .hero-content');
  if (!storyCard) {
    showNotification('Could not find story information', 'error');
    return;
  }

  const storyData = createStoryData(storyCard);

  await window.authManager.addToLibrary(storyData, this);
}

function showNotification(message, type = 'info') {

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

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';

  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
  }, 3000);
}

function setupAccountMenu() {
  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.querySelector('.account-menu');
  const signOutLink = document.getElementById('signout-link');
  
  if (!accountToggle || !accountMenu) {
    return;
  }

  accountToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    accountMenu.classList.toggle('hidden');

    const arrow = accountToggle.querySelector('.dropdown-arrow');
    if (arrow) {
      arrow.style.transform = accountMenu.classList.contains('hidden') 
        ? 'rotate(0deg)' 
        : 'rotate(180deg)';
    }
  });

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

  if (signOutLink) {
    signOutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const originalHTML = signOutLink.innerHTML;
      const originalPointerEvents = signOutLink.style.pointerEvents;
      
      try {

        signOutLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing out...';
        signOutLink.style.pointerEvents = 'none';
        
        const result = await window.authManager.signOut();
        
        if (result.success) {

          accountMenu.classList.add('hidden');
          const arrow = accountToggle.querySelector('.dropdown-arrow');
          if (arrow) {
            arrow.style.transform = 'rotate(0deg)';
          }

          showNotification('Signed out successfully', 'success');

          signOutLink.innerHTML = originalHTML;
          signOutLink.style.pointerEvents = originalPointerEvents;

        } else {
          showNotification('Error signing out. Please try again.', 'error');

          signOutLink.innerHTML = originalHTML;
          signOutLink.style.pointerEvents = originalPointerEvents;
        }
        
      } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out. Please try again.', 'error');

        signOutLink.innerHTML = originalHTML;
        signOutLink.style.pointerEvents = originalPointerEvents;
      }
    });
  }
}

function setupLoginModal() {
  const loginBtn = document.querySelector('.login-btn');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal-close');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const modalForms = document.querySelectorAll('.modal-form');
  
  if (!loginBtn || !modalOverlay) return;

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      modalOverlay.classList.add('active');
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

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

      if (!email || !password) {
        showNotification('Please fill out all fields', 'warning');
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;
      
      try {
        const result = await window.authManager.signIn(email, password);
        
        if (result.success) {

          modalOverlay.classList.remove('active');
          emailInput.value = '';
          passwordInput.value = '';

          showNotification('Welcome back!', 'success');
        } else {

          showNotification(result.error, 'error');
          passwordInput.value = '';
        }
      } catch (error) {
        console.error('Sign in error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

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

      if (!username || !email || !password) {
        showNotification('Please fill out all fields', 'warning');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
      }

      if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'warning');
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;
      
      try {
        const result = await window.authManager.signUp(username, email, password);
        
        if (result.success) {

          modalOverlay.classList.remove('active');
          usernameInput.value = '';
          emailInput.value = '';
          passwordInput.value = '';

          showNotification('Account created successfully! Welcome to Talevo!', 'success');
        } else {

          showNotification(result.error, 'error');
        }
      } catch (error) {
        console.error('Sign up error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

window.authManager = new FirebaseAuthManager();

window.showNotification = showNotification;
window.createStoryData = createStoryData;
window.setupLibraryButtons = setupLibraryButtons;

window.setupLoginModal = setupLoginModal;
window.setupAccountMenu = setupAccountMenu;

document.addEventListener('DOMContentLoaded', () => {
  setupLoginModal();
  setupAccountMenu();
  setupLibraryButtons();

  const observer = new MutationObserver((mutations) => {
  let shouldResetup = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const hasLibraryButtons = node.querySelector && 
            node.querySelector('.add-btn, .add-to-library-btn');
          if (hasLibraryButtons || node.classList?.contains('add-btn') || 
              node.classList?.contains('add-to-library-btn')) {
            shouldResetup = true;
          }
        }
      });
    }
  });
  
  if (shouldResetup) {
    setTimeout(() => {
      setupLibraryButtons();
    }, 100);
  }
});

  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
