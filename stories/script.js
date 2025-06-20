document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initThemeToggle();
    
    initModals();
    
    initAuthTabs();
    
    initStoryInteractions();
    
    initializeScrollAnimations();
}

function initThemeToggle() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedDarkMode !== null) {
        const isDarkMode = savedDarkMode === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('light-mode', !isDarkMode);
    } else if (!prefersDarkMode) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
    
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('click', toggleTheme);
        updateThemeIcon(); 
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

function initModals() {

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

        window.addEventListener('click', function(event) {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
}

function initAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    if (authTabs.length > 0 && authForms.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {

                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));

                this.classList.add('active');

                const formId = this.getAttribute('data-tab') + '-form';
                document.getElementById(formId).classList.add('active');
            });
        });
    }
}

function initStoryInteractions() {

    const startReadingBtn = document.querySelector('.cta-button');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', function () {
            const featuredSection = document.querySelector('.featured-stories');
            if (featuredSection) {
                featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        card.addEventListener('click', function() {
            const storyTitle = this.querySelector('h3').textContent.trim();

            const storyId = storyTitle.toLowerCase().replace(/\s+/g, '-');

            window.location.href = `stories/${storyId}.html`;
        });
    });

    initStoryChoiceButtons();
}

function initStoryChoiceButtons() {
    const choiceButtons = document.querySelectorAll('.choice-btn');
    if (choiceButtons.length > 0) {
        choiceButtons.forEach(button => {
            button.addEventListener('click', function() {
                const nextChapter = this.getAttribute('data-next');

                const currentChapter = document.querySelector('.story-chapter:not(.hidden)');
                if (currentChapter) {
                    currentChapter.classList.add('hidden');

                    const nextChapterElement = document.getElementById(nextChapter);
                    if (nextChapterElement) {
                        nextChapterElement.classList.remove('hidden');
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });

                        updateStoryStats();
                    }
                }
            });
        });
    }
}

function updateStoryStats() {
    const chapters = document.querySelectorAll('.story-chapter');
    const visibleChapterIndex = Array.from(chapters).findIndex(chapter => !chapter.classList.contains('hidden'));
    
    if (visibleChapterIndex !== -1) {

        const chapterCounter = document.getElementById('chapter-counter');
        if (chapterCounter) {
            chapterCounter.textContent = `Chapter ${visibleChapterIndex + 1}/${chapters.length}`;
        }

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

function initializeScrollAnimations() {

    if (window.innerWidth >= 768) {
        const storyCards = document.querySelectorAll('.story-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        storyCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.transitionDelay = `${index * 0.1}s`;
            
            observer.observe(card);
        });
    }
}

function showNotification(message) {

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

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

    document.body.appendChild(notification);

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

    localStorage.setItem(`user_${username}`, password);
    alert("Account created! You can now sign in.");
}

function handleSignin() {
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    const savedPassword = localStorage.getItem(`user_${username}`);

    if (savedPassword === password) {
        alert("Login successful!");

        window.location.href = "index.html";
    } else {
        alert("Invalid username or password.");
    }
}

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

    initializeApp();

    checkLoginStatus();

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

            localStorage.setItem(`user_${email}`, JSON.stringify({ name, password }));
            showNotification("Account created! You can now sign in.");

            const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
            if (loginTab) {
                loginTab.click();
            }
        });
    }

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

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("loggedInUser");
            showNotification("You have been signed out.");
            checkLoginStatus();
        });
    }
});








let storyHistory = [];
let currentChapter = document.querySelector('.story-chapter:not(.hidden)');
let cameFromPrev = false; // Track if user clicked 'Prev'

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

document.getElementById('next-btn')?.addEventListener('click', () => {
  const firstChoice = currentChapter?.querySelector('.choice-btn');
  if (firstChoice) {
    firstChoice.click();
  }
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('keydown', function(e) {

    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.keyCode === 65) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }

    if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

setInterval(function() {
    console.clear();
}, 1000);

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

            document.body.innerHTML = '<h1>Access Denied</h1><p>Developer tools are not allowed on this page.</p>';

        }
    } else {
        devtools.open = false;
    }
}, 500);

document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    let now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

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

document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    });
});

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

(function() {
    let start = Date.now();
    debugger;
    if (Date.now() - start > 100) {
        document.body.innerHTML = '<h1>Debugging Detected</h1>';
    }
})();

document.addEventListener('DOMContentLoaded', function() {

    const chapterImageDivs = document.querySelectorAll('div.chapter-image');
    
    chapterImageDivs.forEach(function(div) {

        const children = div.children;
        for (let i = 0; i < children.length; i++) {
            children[i].style.display = 'none';
        }




    });
});

function hideChapterImageContent() {
    const style = document.createElement('style');
    style.innerHTML = `
        div.chapter-image * {
            display: none !important;
        }
        
        /* Or hide the entire div */
        /* div.chapter-image {
            display: none !important;
        } */
        
        /* Or make content invisible but keep layout */
        /* div.chapter-image * {
            visibility: hidden !important;
        } */
    `;
    document.head.appendChild(style);
}

hideChapterImageContent();

function hideSpecificContent() {
    const chapterDivs = document.querySelectorAll('div.chapter-image');
    
    chapterDivs.forEach(function(div) {

        const images = div.querySelectorAll('img');
        images.forEach(img => img.style.display = 'none');

        const textNodes = div.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        textNodes.forEach(node => node.style.display = 'none');

        const links = div.querySelectorAll('a');
        links.forEach(link => link.style.display = 'none');
    });
}

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            const addedNodes = mutation.addedNodes;
            for (let i = 0; i < addedNodes.length; i++) {
                const node = addedNodes[i];
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('chapter-image') && node.tagName === 'DIV') {

                        const children = node.children;
                        for (let j = 0; j < children.length; j++) {
                            children[j].style.display = 'none';
                        }
                    }

                    const chapterDivs = node.querySelectorAll('div.chapter-image');
                    chapterDivs.forEach(function(div) {
                        const children = div.children;
                        for (let k = 0; k < children.length; k++) {
                            children[k].style.display = 'none';
                        }
                    });
                }
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

function updateNavButtons() {
  const isFirst = currentChapter?.id === 'chapter-1';
  const isEnding = currentChapter?.classList.contains('story-ending');

  const showPrev = storyHistory.length > 0;
  const showNext = cameFromPrev && !isEnding;

  document.getElementById('prev-btn')?.classList.toggle('hidden', !showPrev);
  document.getElementById('next-btn')?.classList.toggle('hidden', !showNext);
}

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















































































