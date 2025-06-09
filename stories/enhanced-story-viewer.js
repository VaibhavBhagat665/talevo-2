// enhanced-story-viewer.js - Improved story viewer with dynamic images
// hello
class EnhancedStoryViewer {
    constructor(storyId) {
        this.storyId = storyId;
        this.currentChapterId = null;
        this.storyData = null;
        this.userChoices = [];
        this.userProgress = {
            lastChapter: null,
            choices: [],
            readTime: 0
        };
        
        // DOM elements
        this.storyContainer = document.querySelector('.story-content');
        this.progressBar = document.querySelector('.progress');
        this.chapterCounter = document.querySelector('.stat-item:first-child span');
        this.pathCounter = document.querySelector('.stat-item:last-child span');
        this.readTimeElement = document.querySelector('.stat-item:nth-child(2) span');
        
        // Initialize the image loader
        this.imageLoader = new StoryImageLoader(storyId);
        
        // Reading timer
        this.readingTimer = null;
        this.readTimeSeconds = 0;
        
        // Animation frame ID for star animations
        this.animationFrameId = null;
    }

    async loadStory() {
        try {
            // Load previously saved progress if any
            this.loadProgress();
            
            // Fetch story data from the JSON file
            const response = await fetch(`/stories/${this.storyId}.json`);
            if (!response.ok) {
                throw new Error('Story not found');
            }
            
            this.storyData = await response.json();
            
            // Set the story title
            document.querySelector('.story-title').textContent = this.storyData.title;
            
            // Preload common images
            await this.imageLoader.preloadCommonImages(this.storyData.chapters);
            
            // Start from the last read chapter or the beginning
            const startChapter = this.userProgress.lastChapter || this.storyData.startingChapterId;
            
            // Navigate to the starting chapter
            await this.navigateToChapter(startChapter);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start reading timer
            this.startReadingTimer();
            
            return true;
        } catch (error) {
            console.error('Error loading story:', error);
            this.showErrorMessage('Could not load the story. Please try again later.');
            return false;
        }
    }
    
    setupEventListeners() {
        // Setup bookmark button
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
            // Check if story is already bookmarked
            const bookmarks = this.getBookmarks();
            const isBookmarked = bookmarks.includes(this.storyId);
            
            if (isBookmarked) {
                const icon = bookmarkBtn.querySelector('i');
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            
            bookmarkBtn.addEventListener('click', () => {
                this.toggleBookmark();
            });
        }
        
        // Setup share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareStory();
            });
        }
        
        // Setup settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Setup back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // If there's history, go back to previous chapter
                if (this.userChoices.length > 1) {
                    // Remove the current chapter
                    this.userChoices.pop();
                    // Go to the previous chapter
                    const previousChapter = this.userChoices.pop();
                    this.navigateToChapter(previousChapter);
                } else {
                    // Otherwise go back to home page
                    window.location.href = 'index.html';
                }
            });
        }
    }
    
    async navigateToChapter(chapterId) {
        if (!this.storyData.chapters[chapterId]) {
            console.error(`Chapter ${chapterId} not found`);
            return;
        }
        
        // Save current chapter id
        this.currentChapterId = chapterId;
        
        // Update user progress
        this.userProgress.lastChapter = chapterId;
        if (!this.userChoices.includes(chapterId)) {
            this.userChoices.push(chapterId);
            this.userProgress.choices.push(chapterId);
        }
        
        // Save progress to localStorage
        this.saveProgress();
        
        // Get chapter data
        const chapter = this.storyData.chapters[chapterId];
        
        // Create chapter HTML
        const chapterHTML = await this.createChapterHTML(chapter);
        
        // Update content
        this.storyContainer.innerHTML = chapterHTML;
        
        // Update UI elements
        this.updateStats();
        this.updateProgress();
        
        // Setup choice buttons for new chapter
        this.setupChoiceButtons();
        
        // Load the chapter image
        const imageElement = document.querySelector('.chapter-image img');
        if (imageElement) {
            const imageSrc = await this.imageLoader.getChapterImage(chapter);
            this.imageLoader.applyImageTransition(imageElement, imageSrc);
            
            // Add star overlay to the image container
            const imageContainer = document.querySelector('.chapter-image');
            this.imageLoader.createStarOverlay(imageContainer);
        }
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Animate text appearance
        this.animateTextAppearance();
    }
    
    async createChapterHTML(chapter) {
        // First, let's escape any HTML in the chapter content
        const sanitizeHTML = (str) => {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        };
        
        // Get chapter text and split into paragraphs
        const text = chapter.text || '';
        const paragraphs = text.split('\n\n')
            .filter(p => p.trim().length > 0)
            .map(p => `<p>${sanitizeHTML(p)}</p>`)
            .join('');
        
        // Check if this is an ending
        const isEnding = !chapter.choices || chapter.choices.length === 0;
        
        // Create choices HTML if applicable
        let choicesHTML = '';
        if (!isEnding && chapter.choices && chapter.choices.length > 0) {
            const options = chapter.choices.map(choice => `
                <button class="choice-btn" data-next="${choice.nextChapter}">
                    ${sanitizeHTML(choice.text)}
                </button>
            `).join('');
            
            choicesHTML = `
                <div class="story-choices">
                    <h3>${chapter.choicePrompt || 'What will you do?'}</h3>
                    <div class="choice-options">
                        ${options}
                    </div>
                </div>
            `;
        }
        
        // If it's an ending, add ending content
        let endingHTML = '';
        if (isEnding) {
            endingHTML = `
                <div class="story-ending">
                    <div class="ending-badge">${chapter.endingType || 'Ending'}</div>
                    <h3>${chapter.endingTitle || 'The End'}</h3>
                    <p>${chapter.endingText || 'Your journey has come to an end.'}</p>
                    <div class="ending-actions">
                        <button class="btn btn-primary restart-btn">Start Over</button>
                        <button class="btn btn-secondary share-ending-btn">Share Ending</button>
                    </div>
                </div>
            `;
        }
        
        // Create full chapter HTML
        return `
            <div class="story-chapter" id="chapter-${chapter.id}">
                <div class="chapter-image">
                    <img src="/images/stories/${this.storyId}/${chapter.image || 'default.png'}" alt="${sanitizeHTML(chapter.title)}">
                </div>
                <h2 class="chapter-title">${sanitizeHTML(chapter.title)}</h2>
                <div class="chapter-text">
                    ${paragraphs}
                </div>
                ${choicesHTML}
                ${endingHTML}
            </div>
        `;
    }
    
    setupChoiceButtons() {
        const choiceButtons = document.querySelectorAll('.choice-btn');
        choiceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const nextChapterId = button.getAttribute('data-next');
                if (nextChapterId) {
                    this.navigateToChapter(nextChapterId);
                }
            });
        });
        
        // Setup ending buttons if they exist
        const restartBtn = document.querySelector('.restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartStory();
            });
        }
        
        const shareEndingBtn = document.querySelector('.share-ending-btn');
        if (shareEndingBtn) {
            shareEndingBtn.addEventListener('click', () => {
                this.shareEnding();
            });
        }
    }
    
    updateStats() {
        // Update the chapter counter
        if (this.chapterCounter) {
            const totalChapters = Object.keys(this.storyData.chapters).length;
            const currentChapterIndex = this.userChoices.length;
            this.chapterCounter.textContent = `Chapter ${currentChapterIndex}/${totalChapters}`;
        }
        
        // Update the path counter
        if (this.pathCounter) {
            const currentChapter = this.storyData.chapters[this.currentChapterId];
            const pathCount = currentChapter.choices ? currentChapter.choices.length : 0;
            this.pathCounter.textContent = pathCount > 0 ? `${pathCount} paths available` : 'Final chapter';
        }
        
        // Update the read time
        if (this.readTimeElement) {
            const minutes = Math.floor(this.readTimeSeconds / 60);
            this.readTimeElement.textContent = `${minutes} min read`;
        }
    }
    
    updateProgress() {
        if (!this.progressBar) return;
        
        // Calculate progress based on how many choices made vs total chapters
        const totalChapters = Object.keys(this.storyData.chapters).length;
        const currentChapterIndex = this.userChoices.length;
        
        // Calculate percentage (cap at 100%)
        const progressPercentage = Math.min((currentChapterIndex / totalChapters) * 100, 100);
        
        // Update progress bar
        this.progressBar.style.width = `${progressPercentage}%`;
    }
    
    animateTextAppearance() {
        const paragraphs = document.querySelectorAll('.chapter-text p');
        
        paragraphs.forEach((p, index) => {
            p.style.opacity = '0';
            p.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                p.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }
    
    startReadingTimer() {
        // Initialize with saved time
        this.readTimeSeconds = this.userProgress.readTime || 0;
        
        // Update initially
        this.updateReadTime();
        
        // Clear any existing timer
        if (this.readingTimer) {
            clearInterval(this.readingTimer);
        }
        
        // Start a new timer
        this.readingTimer = setInterval(() => {
            this.readTimeSeconds++;
            this.userProgress.readTime = this.readTimeSeconds;
            this.saveProgress();
            this.updateReadTime();
        }, 1000);
    }
    
    updateReadTime() {
        if (!this.readTimeElement) return;
        
        const minutes = Math.floor(this.readTimeSeconds / 60);
        this.readTimeElement.textContent = `${minutes} min read`;
    }
    
    restartStory() {
        // Clear choices and progress
        this.userChoices = [];
        this.userProgress = {
            lastChapter: null,
            choices: [],
            readTime: 0
        };
        
        // Save empty progress
        this.saveProgress();
        
        // Navigate to start
        this.navigateToChapter(this.storyData.startingChapterId);
    }
    
    toggleBookmark() {
        const bookmarks = this.getBookmarks();
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        
        if (!bookmarkBtn) return;
        
        const icon = bookmarkBtn.querySelector('i');
        const isCurrentlyBookmarked = bookmarks.includes(this.storyId);
        
        if (isCurrentlyBookmarked) {
            // Remove bookmark
            const updatedBookmarks = bookmarks.filter(id => id !== this.storyId);
            localStorage.setItem('storyverse_bookmarks', JSON.stringify(updatedBookmarks));
            
            // Update icon
            icon.classList.remove('fas');
            icon.classList.add('far');
            
            // Show notification
            this.showNotification('Story removed from bookmarks');
        } else {
            // Add bookmark
            bookmarks.push(this.storyId);
            localStorage.setItem('storyverse_bookmarks', JSON.stringify(bookmarks));
            
            // Update icon
            icon.classList.remove('far');
            icon.classList.add('fas');
            
            // Show notification
            this.showNotification('Story saved to bookmarks');
        }
    }
    
    getBookmarks() {
        const bookmarksJSON = localStorage.getItem('storyverse_bookmarks');
        return bookmarksJSON ? JSON.parse(bookmarksJSON) : [];
    }
    
    shareStory() {
        if (navigator.share) {
            navigator.share({
                title: this.storyData.title,
                text: 'Check out this interactive story on StoryVerse!',
                url: window.location.href
            }).catch(err => {
                console.error('Share failed:', err);
                this.showNotification('Could not share story');
            });
        } else {
            // Fallback - copy URL to clipboard
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.value = window.location.href;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            this.showNotification('Story link copied to clipboard!');
        }
    }
    
    shareEnding() {
        const ending = this.storyData.chapters[this.currentChapterId];
        
        if (navigator.share) {
            navigator.share({
                title: `I reached the "${ending.endingTitle}" ending in ${this.storyData.title}!`,
                text: `I reached an ending in this interactive story. ${ending.endingText}`,
                url: window.location.href
            }).catch(err => {
                console.error('Share failed:', err);
                this.showNotification('Could not share ending');
            });
        } else {
            // Fallback - copy message to clipboard
            const message = `I reached the "${ending.endingTitle}" ending in ${this.storyData.title}! Check it out: ${window.location.href}`;
            
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.value = message;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            this.showNotification('Ending details copied to clipboard!');
        }
    }
    
    showSettings() {
        // Create modal for settings
        const settingsHTML = `
            <div class="modal" id="settingsModal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Story Settings</h2>
                    <div class="settings-options">
                        <div class="setting-item">
                            <label for="textSizeSlider">Text Size</label>
                            <input type="range" id="textSizeSlider" min="80" max="120" value="100">
                        </div>
                        <div class="setting-item">
                            <label for="animationToggle">Animations</label>
                            <label class="switch">
                                <input type="checkbox" id="animationToggle" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label for="soundToggle">Sound Effects</label>
                            <label class="switch">
                                <input type="checkbox" id="soundToggle">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div class="setting-actions">
                        <button class="btn btn-danger" id="resetProgressBtn">Reset Progress</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = settingsHTML;
        document.body.appendChild(modalContainer.firstChild);
        
        // Show modal
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'block';
        
        // Setup close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Setup text size slider
        const textSizeSlider = document.getElementById('textSizeSlider');
        textSizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            document.querySelector('.chapter-text').style.fontSize = `${size}%`;
            localStorage.setItem('storyverse_textSize', size);
        });
        
        // Initialize text size slider from saved preference
        const savedTextSize = localStorage.getItem('storyverse_textSize');
        if (savedTextSize) {
            textSizeSlider.value = savedTextSize;
            document.querySelector('.chapter-text').style.fontSize = `${savedTextSize}%`;
        }
        
        // Setup animation toggle
        const animationToggle = document.getElementById('animationToggle');
        animationToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('storyverse_animations', enabled);
            
            if (!enabled) {
                document.querySelectorAll('.star-overlay').forEach(overlay => {
                    overlay.style.display = 'none';
                });
            } else {
                document.querySelectorAll('.star-overlay').forEach(overlay => {
                    overlay.style.display = 'block';
                });
            }
        });
        
        // Initialize animation toggle from saved preference
        const savedAnimations = localStorage.getItem('storyverse_animations');
        if (savedAnimations !== null) {
            const enabled = savedAnimations === 'true';
            animationToggle.checked = enabled;
            
            if (!enabled) {
                document.querySelectorAll('.star-overlay').forEach(overlay => {
                    overlay.style.display = 'none';
                });
            }
        }
        
        // Setup reset progress button
        const resetBtn = document.getElementById('resetProgressBtn');
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your progress for this story?')) {
                this.restartStory();
                document.body.removeChild(modal);
            }
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    saveProgress() {
        localStorage.setItem(`storyverse_progress_${this.storyId}`, JSON.stringify(this.userProgress));
    }
    
    loadProgress() {
        const savedProgress = localStorage.getItem(`storyverse_progress_${this.storyId}`);
        if (savedProgress) {
            this.userProgress = JSON.parse(savedProgress);
            this.readTimeSeconds = this.userProgress.readTime || 0;
        }
    }
    
    showErrorMessage(message) {
        // Create error message element
        this.storyContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Oops!</h3>
                <p>${message}</p>
                <button class="btn btn-primary" id="retryBtn">Try Again</button>
            </div>
        `;
        
        // Setup retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadStory();
            });
        }
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '8px';
        notification.style.backgroundColor = document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff';
        notification.style.color = document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#1e293b';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        
        // Add to the DOM
        document.body.appendChild(notification);
        
        // Show and hide with animation
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}
