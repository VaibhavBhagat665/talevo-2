// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize application elements
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize modals
    initModals();
    
    // Initialize auth tabs if they exist
    initAuthTabs();
    
    // Initialize story interactions
    initStoryInteractions();
    
    // Animation on scroll
    initializeScrollAnimations();
}

// Theme handling
function initThemeToggle() {
    // Set initial theme based on user preference or saved setting
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode !== null) {
        // Use saved setting if available
        const isDarkMode = savedDarkMode === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('light-mode', !isDarkMode);
    } else if (!prefersDarkMode) {
        // Use system preference as fallback
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
    
    // Add event listener to theme switch button
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('click', toggleTheme);
        updateThemeIcon(); // Set initial icon state
    }
}

function toggleTheme() {
    const body = document.body;
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }
    
    // Save preference to localStorage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#theme-switch i');
    if (!themeIcon) return;
    
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// Modal handling
function initModals() {
    // Login modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    
    if (loginBtn && loginModal) {
        const closeBtn = loginModal.querySelector('.close');
        
        loginBtn.addEventListener('click', function() {
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        closeBtn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Close when clicking outside the modal
        window.addEventListener('click', function(event) {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Auth tab handling
function initAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    if (authTabs.length > 0 && authForms.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and forms
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                // Add active class to the clicked tab
                this.classList.add('active');
                
                // Show corresponding form
                const formId = this.getAttribute('data-tab') + '-form';
                document.getElementById(formId).classList.add('active');
            });
        });
    }
}

// Story interactions
function initStoryInteractions() {
    // Set up "Start Reading" button
    const startReadingBtn = document.querySelector('.cta-button');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', function () {
            const featuredSection = document.querySelector('.featured-stories');
            if (featuredSection) {
                featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }


    // Make story cards clickable
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        card.addEventListener('click', function() {
            const storyTitle = this.querySelector('h3').textContent.trim();
            // Convert the title to a kebab-case filename
            const storyId = storyTitle.toLowerCase().replace(/\s+/g, '-');
            
            // Navigate to the story page
            window.location.href = `stories/${storyId}.html`;
        });
    });
    
    // Story Choice Buttons - if we're on a story page
    initStoryChoiceButtons();
}

function initStoryChoiceButtons() {
    const choiceButtons = document.querySelectorAll('.choice-btn');
    if (choiceButtons.length > 0) {
        choiceButtons.forEach(button => {
            button.addEventListener('click', function() {
                const nextChapter = this.getAttribute('data-next');
                
                // Hide current chapter
                const currentChapter = document.querySelector('.story-chapter:not(.hidden)');
                if (currentChapter) {
                    currentChapter.classList.add('hidden');
                
                    // Show next chapter
                    const nextChapterElement = document.getElementById(nextChapter);
                    if (nextChapterElement) {
                        nextChapterElement.classList.remove('hidden');
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                        
                        // Update stats
                        updateStoryStats();
                    }
                }
            });
        });
    }
}

// Update story statistics
function updateStoryStats() {
    const chapters = document.querySelectorAll('.story-chapter');
    const visibleChapterIndex = Array.from(chapters).findIndex(chapter => !chapter.classList.contains('hidden'));
    
    if (visibleChapterIndex !== -1) {
        // Update chapter counter
        const chapterCounter = document.getElementById('chapter-counter');
        if (chapterCounter) {
            chapterCounter.textContent = `Chapter ${visibleChapterIndex + 1}/${chapters.length}`;
        }
        
        // Update paths available
        const pathsAvailable = document.getElementById('paths-available');
        const currentChapter = chapters[visibleChapterIndex];
        const choiceOptions = currentChapter.querySelectorAll('.choice-btn');
        
        if (pathsAvailable && choiceOptions.length) {
            pathsAvailable.textContent = `${choiceOptions.length} paths available`;
        } else if (pathsAvailable) {
            pathsAvailable.textContent = 'Final chapter';
        }
    }
}

// Animations
function initializeScrollAnimations() {
    // Only for devices that can handle it
    if (window.innerWidth >= 768) {
        const storyCards = document.querySelectorAll('.story-card');
        
        // Simple appearance animation on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        // Set initial styles and observe
        storyCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.transitionDelay = `${index * 0.1}s`;
            
            observer.observe(card);
        });
    }
}

// Helper functions
function showNotification(message) {
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
// Story navigation: Next / Prev / Start Over / Map
document.addEventListener('DOMContentLoaded', function () {
    const chapters = Array.from(document.querySelectorAll('.story-chapter'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const mapBtn = document.getElementById('mapBtn');
    const restartBtns = document.querySelectorAll('.restart-btn');

    function getCurrentChapterIndex() {
        return chapters.findIndex(ch => !ch.classList.contains('hidden'));
    }

    function showChapter(index) {
        chapters.forEach(ch => ch.classList.add('hidden'));
        chapters[index].classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            let index = getCurrentChapterIndex();
            if (index < chapters.length - 1) {
                showChapter(index + 1);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            let index = getCurrentChapterIndex();
            if (index > 0) {
                showChapter(index - 1);
            }
        });
    }

    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            const mapChapter = document.getElementById('chapter-4h');
            if (mapChapter) {
                chapters.forEach(ch => ch.classList.add('hidden'));
                mapChapter.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    restartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showChapter(0); // Go to chapter-1
        });
    });
});

function handleSignup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    // Save to localStorage
    localStorage.setItem(`user_${username}`, password);
    alert("Account created! You can now sign in.");
}

function handleSignin() {
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    const savedPassword = localStorage.getItem(`user_${username}`);

    if (savedPassword === password) {
        alert("Login successful!");
        // Redirect to homepage or dashboard
        window.location.href = "index.html";
    } else {
        alert("Invalid username or password.");
    }
}

// Check if user is already logged in
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const welcomeUser = document.getElementById("welcomeUser");
    const userNameSpan = document.getElementById("userName");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        welcomeUser.classList.remove("hidden");
        userNameSpan.textContent = user.name;
        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
    } else {
        welcomeUser.classList.add("hidden");
        userNameSpan.textContent = "";
        loginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Initialize application elements
    initializeApp();
    
    // Check login status
    checkLoginStatus();

    // Sign Up
    const createAccountBtn = document.getElementById("createAccountBtn");
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", function() {
            const name = document.getElementById("new-name").value.trim();
            const email = document.getElementById("new-email").value.trim();
            const password = document.getElementById("new-password").value.trim();

            if (!name || !email || !password) {
                showNotification("Please fill out all fields.");
                return;
            }

            // Save to localStorage
            localStorage.setItem(`user_${email}`, JSON.stringify({ name, password }));
            showNotification("Account created! You can now sign in.");
            
            // Switch to login tab
            const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
            if (loginTab) {
                loginTab.click();
            }
        });
    }

    // Sign In
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const signinButton = loginForm.querySelector('.btn');
        if (signinButton) {
            signinButton.addEventListener('click', function() {
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value.trim();

                if (!email || !password) {
                    showNotification("Please enter both email and password.");
                    return;
                }

                const userData = localStorage.getItem(`user_${email}`);
                if (!userData) {
                    showNotification("No account found with this email.");
                    return;
                }

                const parsed = JSON.parse(userData);
                if (parsed.password === password) {
                    localStorage.setItem("loggedInUser", JSON.stringify({ name: parsed.name, email }));
                    showNotification(`Welcome back, ${parsed.name}!`);
                    document.getElementById('loginModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                    checkLoginStatus();
                } else {
                    showNotification("Incorrect password.");
                }
            });
        }
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("loggedInUser");
            showNotification("You have been signed out.");
            checkLoginStatus();
        });
    }
});

// window.addEventListener('load', () => {
//   const ghostTheme = document.querySelector('.ghost-theme');
//   if (ghostTheme) {
//     ghostTheme.style.backgroundImage = "url('26922.webp')";
//   }
// });


let storyHistory = [];
let currentChapter = document.querySelector('.story-chapter:not(.hidden)');
let cameFromPrev = false; // Track if user clicked 'Prev'

// CHOICE CLICK
document.querySelectorAll('.choice-btn').forEach(button => {
  button.addEventListener('click', () => {
    if (currentChapter) {
      storyHistory.push(currentChapter.id);
    }
    const nextId = button.getAttribute('data-next');
    const next = document.getElementById(nextId);
    if (next) {
      document.querySelectorAll('.story-chapter').forEach(c => c.classList.add('hidden'));
      next.classList.remove('hidden');
      currentChapter = next;
      cameFromPrev = false;
      updateNavButtons();
    }
  });
});

// PREV BUTTON
document.getElementById('prev-btn')?.addEventListener('click', () => {
  const prevId = storyHistory.pop();
  const prev = document.getElementById(prevId);
  if (prev) {
    document.querySelectorAll('.story-chapter').forEach(c => c.classList.add('hidden'));
    prev.classList.remove('hidden');
    currentChapter = prev;
    cameFromPrev = true;
    updateNavButtons();
  }
});

// NEXT BUTTON (only after Prev clicked)
document.getElementById('next-btn')?.addEventListener('click', () => {
  const firstChoice = currentChapter?.querySelector('.choice-btn');
  if (firstChoice) {
    firstChoice.click();
  }
});

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
document.addEventListener('keydown', function(e) {
    // F12 - Developer Tools
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+I - Developer Tools
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+J - Console
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+U - View Source
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+C - Element Inspector
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+A - Select All (optional)
    if (e.ctrlKey && e.keyCode === 65) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+S - Save Page (optional)
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+P - Print (optional)
    if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
    }
});

// Disable text selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// Disable drag and drop
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

// Clear console periodically
setInterval(function() {
    console.clear();
}, 1000);

// Detect if developer tools are open
let devtools = {
    open: false,
    orientation: null
};

const threshold = 160;

setInterval(function() {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
            devtools.open = true;
            // Redirect or show warning when dev tools detected
            document.body.innerHTML = '<h1>Access Denied</h1><p>Developer tools are not allowed on this page.</p>';
            // Or redirect: window.location.href = 'about:blank';
        }
    } else {
        devtools.open = false;
    }
}, 500);

// Disable common inspect shortcuts on mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

// Disable zoom
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

// Disable pinch zoom on mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    let now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Additional CSS to disable text selection and other interactions
const style = document.createElement('style');
style.innerHTML = `
    * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
`;
document.head.appendChild(style);

// Disable image dragging
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    });
});

// Override console methods
(function() {
    try {
        const devtools = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            clear: console.clear
        };
        
        Object.keys(devtools).forEach(key => {
            console[key] = function() {};
        });
    } catch(e) {}
})();

// Detect debugging attempts
(function() {
    let start = Date.now();
    debugger;
    if (Date.now() - start > 100) {
        document.body.innerHTML = '<h1>Debugging Detected</h1>';
    }
})();



// CONTROLS WHEN NAV BUTTONS SHOW
function updateNavButtons() {
  const isFirst = currentChapter?.id === 'chapter-1';
  const isEnding = currentChapter?.classList.contains('story-ending');

  const showPrev = storyHistory.length > 0;
  const showNext = cameFromPrev && !isEnding;

  document.getElementById('prev-btn')?.classList.toggle('hidden', !showPrev);
  document.getElementById('next-btn')?.classList.toggle('hidden', !showNext);
}

// Call this on each story page when the user reads/interacts
function saveProgress(storyId, chapterNumber, totalChapters = 5, chapterTitle = "") {
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  progress[storyId] = {
    chapter: chapterNumber,
    title: chapterTitle,
    total: totalChapters
  };
  localStorage.setItem('progress', JSON.stringify(progress));
}

const chapterTitle = chapters[index]?.querySelector('.chapter-title')?.textContent || "";
saveProgress(storyId, index + 1, chapters.length, chapterTitle);

const urlParams = new URLSearchParams(window.location.search);
  const chapterParam = parseInt(urlParams.get("chapter"));

  if (!isNaN(chapterParam)) {
    const chapters = Array.from(document.querySelectorAll('.story-chapter'));
    if (chapters[chapterParam - 1]) {
      chapters.forEach(c => c.classList.add('hidden'));
      chapters[chapterParam - 1].classList.remove('hidden');
    }
  }



// document.addEventListener('DOMContentLoaded', function () {
//   if (window.innerWidth <= 600) {
//     // ✨ Story Header - tighter, floating style
//     const storyHeader = document.querySelector('.story-header');
//     if (storyHeader) {
//       Object.assign(storyHeader.style, {
//         width: '85%',
//         maxWidth: '85%',
//         margin: '0 auto 1rem',
//         padding: '0.8rem',
//         borderRadius: '8px',
//         display: 'flex',
//         flexDirection: 'column',
//         textAlign: 'center',
//         boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
//       });
//     }

//     // 🧠 Story Title - cleaner and smaller
//     const storyTitle = document.querySelector('.story-title');
//     if (storyTitle) {
//       Object.assign(storyTitle.style, {
//         width: '100%',
//         fontSize: '1.3rem',
//         textAlign: 'center'
//       });
//     }

//     // 📖 Story Chapter - almost full width
//     const storyChapter = document.querySelector('.story-chapter');
//     if (storyChapter) {
//       Object.assign(storyChapter.style, {
//         width: '95%',
//         maxWidth: '95%',
//         margin: '1rem auto',
//         padding: '1.5rem 1rem',
//         borderRadius: '0',
//         position: 'relative',
//         left: '0',
//         right: '0'
//       });
//     }

//     // 📛 Chapter Title
//     const chapterTitle = document.querySelector('.chapter-title');
//     if (chapterTitle) {
//       Object.assign(chapterTitle.style, {
//         fontSize: '1.6rem',
//         textAlign: 'center',
//         width: '100%'
//       });
//     }

//     // 📄 Chapter Text Paragraphs
//     const chapterText = document.querySelector('.chapter-text');
//     if (chapterText) {
//       chapterText.style.width = '100%';
//       const paragraphs = chapterText.querySelectorAll('p');
//       paragraphs.forEach(p => {
//         Object.assign(p.style, {
//           width: '100%',
//           maxWidth: 'none',
//           paddingLeft: '0',
//           paddingRight: '0'
//         });
//       });
//     }

//     // 🔘 Navigation Buttons
//     const navButtons = document.querySelector('.nav-buttons');
//     if (navButtons) {
//       Object.assign(navButtons.style, {
//         width: '100%',
//         margin: '1rem 0',
//         padding: '0',
//         justifyContent: 'space-between'
//       });

//       const prevBtn = document.getElementById('prev-btn');
//       const nextBtn = document.getElementById('next-btn');
//       if (prevBtn) prevBtn.style.width = '45%';
//       if (nextBtn) nextBtn.style.width = '45%';
//     }
//   }
// });
