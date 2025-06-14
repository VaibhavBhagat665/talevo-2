
document.addEventListener("DOMContentLoaded", function() {

  const storyData = [
    {
      title: "Space Explorer",
      description: "Navigate the unknown cosmos and discover alien civilizations.",
      genre: "Sci-Fi",
      rating: 4.8,
      image: "stories/space-explorer-cover.png",
      featured: true,
      trending: false,
      id: "space-explorer"
    },
    {
      title: "Midnight Chronicles",
      description: "Supernatural mysteries await in this thrilling adventure.",
      genre: "Mystery",
      rating: 4.6,
      image: "stories/midnight-chronicles-cover.png",
      featured: true,
      trending: false,
      id: "midnight-chronicles"
    },
    {
      title: "Digital Dreamscape",
      description: "Enter a virtual world where reality and fantasy blur.",
      genre: "Cyberpunk",
      rating: 4.9,
      image: "stories/digital-dreamscape-cover.png",
      featured: true,
      trending: false,
      id: "digital-dreamscape"
    },
    {
      title: "Last Kingdom",
      description: "A medieval fantasy where your choices determine the fate of kingdoms.",
      genre: "Fantasy",
      rating: 4.7,
      image: "stories/last-kingdom-cover.png",
      featured: true,
      trending: true,
      id: "last-kingdom"
    },
    {
      title: "Ghost Town",
      description: "Explore an abandoned town with a dark past and supernatural presence.",
      genre: "Horror",
      rating: 4.5,
      image: "stories/ghost-town-cover.png",
      featured: false,
      trending: true,
      id: "ghost-town"
    },
    {
      title: "Ocean Depths",
      description: "Dive into the mysteries of the deep sea and uncover ancient secrets.",
      genre: "Adventure",
      rating: 4.4,
      image: "stories/ocean-depths-cover.png",
      featured: false,
      trending: true,
      id: "ocean-depths"
    },
    {
      title: "Time Travelers",
      description: "Navigate through different time periods and change the course of history.",
      genre: "Sci-Fi",
      rating: 4.7,
      image: "stories/time-travelers-cover.png",
      featured: false,
      trending: true,
      id: "time-travelers"
    },
    {
      title: "Desert Mirage",
      description: "Journey through a mystical desert where nothing is as it seems.",
      genre: "Fantasy",
      rating: 4.3,
      image: "stories/desert-mirage-cover.png",
      featured: true,
      trending: false,
      id: "desert-mirage"
    },
    {
      title: "Forgotten Realms",
      description: "Embark on an epic quest to restore balance to forgotten magical realms.",
      genre: "Fantasy",
      rating: 4.6,
      image: "stories/forgotten-realms-cover.png",
      featured: true,
      trending: false,
      id: "forgotten-realms"
    },
    {
      title: "Heart's Desire",
      description: "A romantic journey through life's ups and downs with meaningful choices.",
      genre: "Romance",
      rating: 4.5,
      image: "stories/hearts-desire-cover.png",
      featured: false,
      trending: false,
      id: "hearts-desire"
    },
    {
      title: "Detective's Puzzle",
      description: "Solve complex mysteries as a detective in a crime-filled city.",
      genre: "Mystery",
      rating: 4.8,
      image: "stories/detectives-puzzle-cover.png",
      featured: false,
      trending: false,
      id: "detectives-puzzle"
    },
    {
      title: "The Enchanted Forest",
      description: "A mystical journey through a forest where magic is real and creatures of legend roam free.",
      genre: "Fantasy",
      rating: 4.8,
      image: "stories/enchanted-forest-cover.png",
      featured: false,
      trending: false,
      id: "enchanted-forest"
    },
    {
      title: "Haunted Mansion",
      description: "Survive a night in a haunted mansion filled with spirits and secrets.",
      genre: "Horror",
      rating: 4.7,
      image: "stories/haunted-mansion-cover.png",
      featured: false,
      trending: false,
      id: "haunted-mansion"
    }
  ];

  function ensureElementExists(selector, parentSelector, className, defaultHTML = '') {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('div');
      element.className = className || '';
      element.innerHTML = defaultHTML;
      const parent = document.querySelector(parentSelector);
      if (parent) {
        parent.appendChild(element);
      }
    }
    return element;
  }

  const noResults = ensureElementExists('.no-results', 'main', 'no-results', 
    '<div class="container"><p>No stories found matching your criteria.</p></div>');
  noResults.style.display = 'none';

  function getValidImageUrl(story) {
  if (!story || !story.title) {
    return `https://via.placeholder.com/320x180?text=Story`;
  }
  
  // Convert the story title to a URL-friendly format
  // Replace spaces with hyphens and remove special characters
  const formattedTitle = story.id;       // Trim hyphens from end
  
  // Return the URL in the desired format: stories/(storyname)-cover.png
  return `stories/${formattedTitle}-cover.png`;
}
let currentHeroIndex = 0;

  function setupHeroSection() {
    const heroBackground = document.querySelector('.hero-background');
    const heroTitle = document.querySelector('.hero-story-title');
    const heroDesc = document.querySelector('.hero-story-desc');
    const genreSpan = document.querySelector('.genre span');
    const ratingSpan = document.querySelector('.rating span');
    
    if (!heroBackground || !heroTitle || !heroDesc) return;
    
    const heroStories = [
      {
        title: 'Ghost Town',
      desc: 'Explore an abandoned town shrouded in a dark past, where a lingering supernatural presence haunts every corner.',
      genre: 'Horror',
      rating: '4.5',
      background: 'url(https://iili.io/3QNuZWx.png)'
      },
      {
        title: 'Space Explorer',
        desc: 'Navigate the unknown cosmos and discover alien civilizations. Make choices that will determine the fate of humanity\'s first deep space mission.',
        genre: 'Sci-Fi',
        rating: '4.8',
        background: 'url(https://iili.io/3QjTChl.png)'
      },
      {
        title: 'The Enchanted Forest',
        desc: 'A mystical journey through a forest where magic is real and creatures of legend roam free. Your choices will shape the destiny of this magical realm.',
        genre: 'Fantasy',
        rating: '4.7',
        background: 'url(https://iili.io/3QX415P.png)'
      },
      {
        title: 'Midnight Chronicles',
        desc: 'A small town is shaken by a series of strange disappearances. As a detective, your choices will lead you closer to the truth or deeper into danger.',
        genre: 'Mystery',
        rating: '4.6',
        background: 'url(https://iili.io/3QjTfpf.png)'
      }
    ];
    
    let currentHeroIndex = 0;
    
   function updateHeroSection(index, direction = 'right') {
  const story = heroStories[index];
  const heroContent = document.querySelector('.hero-content-inner');
  const heroBackground = document.querySelector('.hero-background');
  const heroTitle = document.querySelector('.hero-story-title');
  const heroDesc = document.querySelector('.hero-story-desc');
  const genreSpan = document.querySelector('.genre span');
  const ratingSpan = document.querySelector('.rating span');

  if (!heroContent || !story) return;

  // Clear previous animation classes
  heroContent.classList.remove('animate__slideInRight', 'animate__slideInLeft', 'animate__fadeOut');

  // Animate out
  heroContent.classList.add('animate__animated', 'animate__fadeOut');

  // After fade out completes, update content and slide in
  setTimeout(() => {
    // Update content
    if (heroBackground) heroBackground.style.backgroundImage = story.background;
    if (heroTitle) heroTitle.textContent = story.title;
    if (heroDesc) heroDesc.textContent = story.desc;
    if (genreSpan) genreSpan.textContent = story.genre;
    if (ratingSpan) ratingSpan.textContent = story.rating;

    // Switch animation classes
    heroContent.classList.remove('animate__fadeOut');
    heroContent.classList.add(`animate__${direction === 'left' ? 'slideInLeft' : 'slideInRight'}`);

    // Update indicators
    const indicators = document.querySelectorAll('.slide-indicators .indicator');
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
  }, 300); // Make sure this matches fadeOut animation duration
}


    
    updateHeroSection(currentHeroIndex);
    const readBtn = document.querySelector('.read-btn');
if (readBtn) {
  readBtn.addEventListener('click', () => {
    const story = heroStories[currentHeroIndex];
    if (story && story.title) {
      const matchingStory = storyData.find(s => s.title === story.title);
      if (matchingStory) {
        window.location.href = `stories/${matchingStory.id}.html`;
      } else {
        alert("Story not found.");
      }
    }
  });
}

    const slideIndicators = document.querySelector('.slide-indicators');
    if (slideIndicators) {
      slideIndicators.innerHTML = '';
      heroStories.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => {
          currentHeroIndex = index;
          updateHeroSection(currentHeroIndex);
        });
        slideIndicators.appendChild(indicator);
      });
    }
    
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    let heroAutoSlideTimeout;
const SLIDE_INTERVAL = 7000;

function resetHeroAutoSlide() {
  clearTimeout(heroAutoSlideTimeout);
  heroAutoSlideTimeout = setTimeout(() => {
    currentHeroIndex = (currentHeroIndex + 1) % heroStories.length;
    updateHeroSection(currentHeroIndex, 'right');
    resetHeroAutoSlide(); // 🌀 restart loop
  }, SLIDE_INTERVAL);
}
    
    prevBtn.addEventListener('click', () => {
      resetHeroAutoSlide();
  currentHeroIndex = (currentHeroIndex - 1 + heroStories.length) % heroStories.length;
  updateHeroSection(currentHeroIndex, 'left');
});

    slideIndicators.addEventListener('click', () => {
      resetHeroAutoSlide();
});

nextBtn.addEventListener('click', () => {
  resetHeroAutoSlide();
  currentHeroIndex = (currentHeroIndex + 1) % heroStories.length;
  updateHeroSection(currentHeroIndex, 'right');
});
    resetHeroAutoSlide();
    // Swipe functionality for hero carousel (mobile)
let startX = 0;
    if (window.innerWidth <= 576) {
const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });

  hero.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    if (Math.abs(diffX) > 50) {
      resetHeroAutoSlide();
      if (diffX > 0) {
        currentHeroIndex = (currentHeroIndex - 1 + heroStories.length) % heroStories.length;
        updateHeroSection(currentHeroIndex, 'left');
      } else {
        currentHeroIndex = (currentHeroIndex + 1) % heroStories.length;
        updateHeroSection(currentHeroIndex, 'right');
      }
    }
  });
}
    }

  }
  
  function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card animate__animated animate__fadeIn';
    card.setAttribute('data-id', story.id);
    card.setAttribute('data-genre', story.genre.toLowerCase());
    
    card.innerHTML = `
      <div class="story-card-img-container">
        <img src="${story.image || `https://via.placeholder.com/320x180?text=${encodeURIComponent(story.title)}`}" 
             alt="${story.title}" class="story-card-img">
      </div>
      <div class="story-card-content">
        <h3 class="story-card-title">${story.title}</h3>
        <p class="story-card-desc">${story.description}</p>
        <div class="story-card-meta">
          <span class="genre">${story.genre}</span>
          <div class="rating">
            <i class="fas fa-star"></i>
            <span>${story.rating}</span>
          </div>
        </div>
      </div>
    `;

    
    // Add click event to redirect
    card.addEventListener('click', () => {
      window.location.href = `stories/${story.id}.html`;
    });
    
    return card;
  }

  

  function setupStoryCardHoverEffects() {
    // Target all story cards (existing and dynamically created ones)
    const storyCards = document.querySelectorAll('.story-card');
    
    storyCards.forEach(card => {
      // Remove any existing event listeners to prevent duplicates
      card.removeEventListener('mouseenter', handleCardEnter);
      card.removeEventListener('mouseleave', handleCardLeave);
      
      // Add the new event listeners
      card.addEventListener('mouseenter', handleCardEnter);
      card.addEventListener('mouseleave', handleCardLeave);
      
      // Make sure card has the necessary structure for our effect
      prepareCardStructure(card);
    });
  }
  
  // Function to prepare card structure for the hover effect
  function prepareCardStructure(card) {
    // Mark card as prepared to avoid duplicate setup
    if (card._structurePrepared) return;
    card._structurePrepared = true;
    
    // Get card elements
    const imgContainer = card.querySelector('.story-card-img-container');
    const img = card.querySelector('.story-card-img');
    const content = card.querySelector('.story-card-content');
    
    if (!imgContainer || !img || !content) return;
    
    // Store original content for later
    card._originalHTML = card.innerHTML;
    
    // Create a clone of the image to use as full-size background
    const fullImg = img.cloneNode(true);
    fullImg.className = 'story-card-full-img';
    
    // Create text overlay container
    const overlayContent = document.createElement('div');
    overlayContent.className = 'story-card-overlay-content';
    
    // Move content elements to the overlay
    const title = content.querySelector('.story-card-title');
    const desc = content.querySelector('.story-card-desc');
    const meta = content.querySelector('.story-card-meta');
    
    if (title) {
      const overlayTitle = title.cloneNode(true);
      overlayTitle.className = 'story-card-overlay-title';
      overlayContent.appendChild(overlayTitle);
    }
    
    if (desc) {
      const overlayDesc = desc.cloneNode(true);
      overlayDesc.className = 'story-card-overlay-desc';
      overlayContent.appendChild(overlayDesc);
    }
    
    if (meta) {
      const overlayMeta = meta.cloneNode(true);
      overlayMeta.className = 'story-card-overlay-meta';
      overlayContent.appendChild(overlayMeta);
    }
    
    // Create read button
    const readBtn = document.createElement('button');
    readBtn.className = 'read-now-btn';
    readBtn.textContent = 'Read Now';
    overlayContent.appendChild(readBtn);
    
    // Create overlay container that will hold both the full image and text
    const overlay = document.createElement('div');
    overlay.className = 'story-card-hover-overlay';
    overlay.appendChild(fullImg);
    overlay.appendChild(overlayContent);
    
    // Add overlay to card
    card.appendChild(overlay);
    
    // Add click event to button
    readBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const storyId = card.getAttribute('data-id');
      if (storyId) {
        window.location.href = `stories/${storyId}.html`;
      }
    });
  }
  

  // Handler for mouseenter event
  function handleCardEnter(e) {
    const card = e.currentTarget;
    
    // Add hover class
    card.classList.add('card-hover');
    
    // Get hover overlay
    const overlay = card.querySelector('.story-card-hover-overlay');
    if (overlay) {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translateY(0)';
    }
    
    // Get overlay content for animation
    const overlayContent = card.querySelector('.story-card-overlay-content');
    if (overlayContent) {
      // Delay content animation for a better effect
      setTimeout(() => {
        overlayContent.style.opacity = '1';
        overlayContent.style.transform = 'translateY(0)';
      }, 150);
    }
    
    // Add subtle card animation
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
  }
  
  // Handler for mouseleave event
  function handleCardLeave(e) {
    const card = e.currentTarget;
    
    // Remove hover class
    card.classList.remove('card-hover');
    
    // Reset overlay
    const overlay = card.querySelector('.story-card-hover-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transform = 'translateY(100%)';
    }
    
    // Reset overlay content
    const overlayContent = card.querySelector('.story-card-overlay-content');
    if (overlayContent) {
      overlayContent.style.opacity = '0';
      overlayContent.style.transform = 'translateY(20px)';
    }
    
    // Reset card animation
    card.style.transform = '';
    card.style.boxShadow = '';
  }
  
  // Add CSS to head for hover effects
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .story-card {
      position: relative;
      transition: all 0.4s ease;
      overflow: hidden;
      border-radius: 8px;
    }
    
    .story-card-img-container {
      position: relative;
      overflow: hidden;
      transition: all 0.4s ease;
      z-index: 1;
    }
    
    .story-card-hover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      z-index: 5;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .story-card-full-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.5s ease;
      transform: scale(1.1);
    }
    
    .story-card-overlay-content {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 20px 15px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%);
      color: white;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.4s ease 0.1s;
      z-index: 6;
    }
    
    .story-card-overlay-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 8px;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    .story-card-overlay-desc {
      font-size: 0.9rem;
      margin-bottom: 12px;
      color: rgba(255,255,255,0.9);
      max-height: 80px;
      overflow: hidden;
    }
    
    .story-card-overlay-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.8);
    }
    
    .story-card-overlay-meta .genre {
      color: #ffcc00;
      font-weight: 500;
    }
    
    .story-card-overlay-meta .rating {
      display: flex;
      align-items: center;
    }
    
    .story-card-overlay-meta .rating i {
      color: #ffcc00;
      margin-right: 4px;
    }
    
    .read-now-btn {
      background-color: #ffcc00;
      color: #333;
      border: none;
      border-radius: 20px;
      padding: 8px 15px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      align-self: flex-end;
      margin-left: auto;
      transition: all 0.3s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    
    .read-now-btn:hover {
      background-color: #ffdd33;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    /* Dark mode adjustments */
    .dark-theme .story-card-overlay-content {
      background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.2) 100%);
    }
    
    /* Make sure the original card content stays visible until hover */
    .card-hover .story-card-content {
      opacity: 0;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Initial setup for existing cards
  setupStoryCardHoverEffects();
  
  // Setup a mutation observer to watch for dynamically added story cards
  const observeTarget = document.querySelector('main');
  if (observeTarget) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          setupStoryCardHoverEffects();
        }
      });
    });
    
    // Start observing
    observer.observe(observeTarget, { childList: true, subtree: true });
  }
  
  // Update any existing story creation functions to integrate with hover effects
  const originalCreateStoryCard = window.createStoryCard;
  if (typeof originalCreateStoryCard === 'function') {
    window.createStoryCard = function(story) {
      const card = originalCreateStoryCard(story);
      
      // Prepare the card structure for hover effect
      prepareCardStructure(card);
      
      // Add event listeners
      card.addEventListener('mouseenter', handleCardEnter);
      card.addEventListener('mouseleave', handleCardLeave);
      card._hoverEventsAttached = true;
      
      return card;
    };
  }

  

  function setupMutationObserver() {
    const observeTarget = document.querySelector('main');
    if (observeTarget && !window._cardObserver) {
      const observer = new MutationObserver(function(mutations) {
        let shouldSetupCards = false;
        
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
            shouldSetupCards = true;
          }
        });
        
        if (shouldSetupCards) {
          setupStoryCardHoverEffects();
        }
      });
      
      observer.observe(observeTarget, { childList: true, subtree: true });
      window._cardObserver = observer;
    }
  }

  function setupFeaturedCarousel() {
    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) return;
    
    carouselContainer.innerHTML = '';
    
    const featuredStories = storyData.filter(story => story.featured);
    
    featuredStories.forEach(story => {
      const card = createStoryCard(story);
      if (card) carouselContainer.appendChild(card);
    });

    const carouselButtons = document.querySelector('.carousel-buttons');
    if (!carouselButtons) return;
    
    let prevBtn = document.querySelector('.prev-btn');
    if (!prevBtn) {
      prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-btn prev-btn';
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      carouselButtons.appendChild(prevBtn);
    }
    
    let nextBtn = document.querySelector('.next-btn');
    if (!nextBtn) {
      nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-btn next-btn';
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      carouselButtons.appendChild(nextBtn);
    }
    
    let carouselPosition = 0;
    const cardWidth = 325;
    const visibleCards = Math.floor(carouselContainer.offsetWidth / cardWidth) || 3;

    function updateCarouselPosition() {
      const translateX = -carouselPosition * cardWidth;
      carouselContainer.style.transform = `translateX(${translateX}px)`;
      
      if (carouselPosition <= 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove('disabled');
      }
      
      const maxPosition = Math.max(0, carouselContainer.children.length - visibleCards);
      if (carouselPosition >= maxPosition) {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled');
      }
    }
    
    updateCarouselPosition();

    prevBtn.addEventListener('click', () => {
      if (carouselPosition > 0) {
        carouselPosition--;
        updateCarouselPosition();
      }
    });

    nextBtn.addEventListener('click', () => {
      const maxPosition = Math.max(0, carouselContainer.children.length - visibleCards);
      if (carouselPosition < maxPosition) {
        carouselPosition++;
        updateCarouselPosition();
      }
    });
    
    window.addEventListener('resize', () => {
      const newVisibleCards = Math.floor(carouselContainer.offsetWidth / cardWidth) || 3;
      const maxPosition = Math.max(0, carouselContainer.children.length - newVisibleCards);
      
      carouselPosition = Math.min(carouselPosition, maxPosition);
      updateCarouselPosition();
    });
  }

  function showToast(message) {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Auto-remove after animation
  setTimeout(() => {
    toast.remove();
  }, 3500);
}


//   function setupAddToLibraryButtons() {
//   const buttons = document.querySelectorAll('.add-btn');
//   buttons.forEach(btn => {
//     btn.addEventListener('click', (e) => {
//       e.stopPropagation();
//       const card = btn.closest('.story-card') || document.querySelector('.hero');
//       const id = card?.getAttribute('data-id') || storyData[currentHeroIndex].id;
//       let library = JSON.parse(localStorage.getItem('library') || '[]');
//       if (!library.includes(id)) {
//         library.push(id);
//         localStorage.setItem('library', JSON.stringify(library));
//         showToast("Story added to your library!");

//       }
//     });
//   });
// }


  function setupTrendingSection() {
    const trendingContainer = document.querySelector('.trending-scroll');
    if (!trendingContainer) return;
    
    trendingContainer.innerHTML = '';
    
    const trendingStories = storyData.filter(story => story.trending);
    
    if (trendingStories.length === 0) return;
    
    trendingStories.forEach(story => {
      const card = createStoryCard(story);
      if (card) trendingContainer.appendChild(card);
    });
    
    trendingStories.forEach(story => {
      const card = createStoryCard(story);
      if (card) trendingContainer.appendChild(card);
    });

    const containerWidth = trendingContainer.scrollWidth / 2;
    const animationID = 'trending-scroll-animation';
    
    const existingStyle = document.getElementById(animationID);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = animationID;
    style.innerHTML = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${containerWidth}px); }
      }
      .trending-scroll {
        animation: scroll 40s linear infinite;
        width: max-content;
      }
    `;
    document.head.appendChild(style);
    
    trendingContainer.addEventListener('mouseenter', () => {
      trendingContainer.style.animationPlayState = 'paused';
    });
    
    trendingContainer.addEventListener('mouseleave', () => {
      trendingContainer.style.animationPlayState = 'running';
    });
  }

  
  function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // Check if theme preference exists in localStorage
    const isDarkMode = localStorage.getItem('darkTheme') === 'true';
    
    if (isDarkMode) {
      body.classList.add('dark-theme');
      if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        
        if (icon) {
          if (body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkTheme', 'true');
          } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkTheme', 'false');
          }
        }
      });
    }
    const prefersDark = localStorage.getItem('darkTheme');
if (prefersDark === null) {
  localStorage.setItem('darkTheme', 'true');
  document.body.classList.add('dark-theme');
  if (icon) {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

  }

// function setupLoginModal() {
//   const loginBtn = document.querySelector('.login-btn');
//   const modalOverlay = document.querySelector('.modal-overlay');
//   const modalClose = document.querySelector('.modal-close');
//   const modalTabs = document.querySelectorAll('.modal-tab');
//   const modalForms = document.querySelectorAll('.modal-form');
  
//   if (!loginBtn || !modalOverlay) return;
  
//   // Login button click handler
//   if (loginBtn) {
//     loginBtn.addEventListener('click', () => {
//       modalOverlay.classList.add('active');
//     });
//   }
  
//   // Modal close handlers
//   if (modalClose) {
//     modalClose.addEventListener('click', () => {
//       modalOverlay.classList.remove('active');
//     });
//   }
  
//   // Close modal when clicking outside
//   modalOverlay.addEventListener('click', (e) => {
//     if (e.target === modalOverlay) {
//       modalOverlay.classList.remove('active');
//     }
//   });
  
//   // Tab switching
//   modalTabs.forEach(tab => {
//     tab.addEventListener('click', () => {
//       const tabName = tab.getAttribute('data-tab');
      
//       modalTabs.forEach(t => t.classList.remove('active'));
//       modalForms.forEach(f => f.classList.remove('active'));
      
//       tab.classList.add('active');
//       const targetForm = document.querySelector(`.${tabName}-form`);
//       if (targetForm) {
//         targetForm.classList.add('active');
//       }
//     });
//   });
  
//   // Sign-in form submission
//   const signinForm = document.getElementById('signin-form');
//   if (signinForm) {
//     signinForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
      
//       const emailInput = document.getElementById('signin-email');
//       const passwordInput = document.getElementById('signin-password');
//       const submitBtn = signinForm.querySelector('button[type="submit"]');
      
//       if (!emailInput || !passwordInput) {
//         console.error('Sign-in form elements not found');
//         return;
//       }
      
//       const email = emailInput.value.trim();
//       const password = passwordInput.value;
      
//       // Basic validation
//       if (!email || !password) {
//         showNotification('Please fill out all fields', 'warning');
//         return;
//       }
      
//       // Show loading state
//       const originalText = submitBtn.textContent;
//       submitBtn.textContent = 'Signing in...';
//       submitBtn.disabled = true;
      
//       try {
//         const result = await window.authManager.signIn(email, password);
        
//         if (result.success) {
//           // Success - modal will close and UI will update automatically
//           modalOverlay.classList.remove('active');
//           emailInput.value = '';
//           passwordInput.value = '';
          
//           // Show success message
//           showNotification('Welcome back!', 'success');
//         } else {
//           // Show error
//           showNotification(result.error, 'error');
//           passwordInput.value = '';
//         }
//       } catch (error) {
//         console.error('Sign in error:', error);
//         showNotification('An error occurred. Please try again.', 'error');
//       } finally {
//         // Reset button state
//         submitBtn.textContent = originalText;
//         submitBtn.disabled = false;
//       }
//     });
//   }
  
//   // Sign-up form submission
//   const signupForm = document.getElementById('signup-form');
//   if (signupForm) {
//     signupForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
      
//       const usernameInput = document.getElementById('signup-username');
//       const emailInput = document.getElementById('signup-email');
//       const passwordInput = document.getElementById('signup-password');
//       const submitBtn = signupForm.querySelector('button[type="submit"]');
      
//       if (!usernameInput || !emailInput || !passwordInput) {
//         console.error('Sign-up form elements not found');
//         return;
//       }
      
//       const username = usernameInput.value.trim();
//       const email = emailInput.value.trim();
//       const password = passwordInput.value;
      
//       // Basic validation
//       if (!username || !email || !password) {
//         showNotification('Please fill out all fields', 'warning');
//         return;
//       }
      
//       // Email validation
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         showNotification('Please enter a valid email address', 'warning');
//         return;
//       }
      
//       // Password validation
//       if (password.length < 6) {
//         showNotification('Password must be at least 6 characters long', 'warning');
//         return;
//       }
      
//       // Show loading state
//       const originalText = submitBtn.textContent;
//       submitBtn.textContent = 'Creating account...';
//       submitBtn.disabled = true;
      
//       try {
//         const result = await window.authManager.signUp(username, email, password);
        
//         if (result.success) {
//           // Success - modal will close and UI will update automatically
//           modalOverlay.classList.remove('active');
//           usernameInput.value = '';
//           emailInput.value = '';
//           passwordInput.value = '';
          
//           // Show success message
//           showNotification('Account created successfully! Welcome to Talevo!', 'success');
//         } else {
//           // Show error
//           showNotification(result.error, 'error');
//         }
//       } catch (error) {
//         console.error('Sign up error:', error);
//         showNotification('An error occurred. Please try again.', 'error');
//       } finally {
//         // Reset button state
//         submitBtn.textContent = originalText;
//         submitBtn.disabled = false;
//       }
//     });
//   }
// }

// Helper function to check password
// function checkPassword(email, password) {
//     // Get all registered users
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
//     return users.some(user => user.email === email && user.password === password);
// }

// // Helper function to get stored username for an email
// function getStoredUsername(email) {
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
//     const user = users.find(user => user.email === email);
//     return user ? user.username : email.split('@')[0]; // Fallback to email prefix
// }

// // Helper function to check if email is already registered
// function isEmailRegistered(email) {
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
//     return users.some(user => user.email === email);
// }

// // Helper function to store user data
// function storeUserData(username, email, password) {
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
//     // Add new user
//     users.push({
//         username: username,
//         email: email,
//         password: password, // In production, this should be hashed
//         registeredDate: new Date().toISOString()
//     });
    
//     // Store updated users array
//     localStorage.setItem('registeredUsers', JSON.stringify(users));
// }


// Updated displayWelcomeUsername function with better integration
// function displayWelcomeUsername() {
//     const username = localStorage.getItem("username");
//     const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
//     const loginBtn = document.querySelector(".login-btn");
//     const accountWrapper = document.querySelector(".account-wrapper");
//     const accountMenu = document.querySelector(".account-menu");
//     const accountName = document.getElementById("account-name");
    
//     if (username && isAuthenticated) {
//         // User is signed in
//         if (loginBtn) loginBtn.style.display = "none";
//         if (accountWrapper) accountWrapper.classList.remove("hidden");
//         if (accountName) accountName.textContent = username;
//     } else {
//         // User is not signed in - ensure everything is hidden
//         if (loginBtn) loginBtn.style.display = "inline-block";
//         if (accountWrapper) accountWrapper.classList.add("hidden");
//         if (accountMenu) accountMenu.classList.add("hidden");
//     }
// }

// Initialize everything when DOM is loaded
 
    
    // Account toggle functionality - only add if element exists
    
    
    // Close dropdown on outside click
   

    
    // Sign out functionality
    
  // Enhanced JS Features for Talevo

// Smooth scroll to section
const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// Instant search with dropdown results
const searchInput = document.querySelector(".search-input");
const searchResults = document.getElementById("search-results");
searchResults.classList.remove("hidden");
searchResults.style.display = "none";
searchResults.style.position = "absolute";
searchResults.style.top = "100%";
searchResults.style.left = "0";
searchResults.style.zIndex = "10";
searchResults.style.backgroundColor = "var(--card-bg)";
searchResults.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
searchResults.style.width = "100%";
searchResults.style.borderRadius = "8px";

function createMiniCard(story) {
  const card = document.createElement("div");
  card.className = "story-card mini";
  card.style.display = "flex";
  card.style.gap = "12px";
  card.style.padding = "10px";
  card.style.cursor = "pointer";
  card.style.borderBottom = "1px solid #eee";
  card.innerHTML = `
  <img src="${story.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
  <div style="flex: 1">
    <strong style="color: var(--text);">${story.title}</strong>
    <p style="margin: 0; font-size: 12px; color: var(--text); opacity: 0.7;">
      ${story.genre} - ${story.rating}⭐
    </p>
  </div>
`;
  card.addEventListener("click", () => {
    window.location.href = `stories/${story.id}.html`;
  });
  return card;
}




// Category filter with toggleable story grid
const categoryCards = document.querySelectorAll(".category-card");
const categoriesSection = document.getElementById("categories");

categoryCards.forEach(card => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;
    const filtered = storyData.filter(s => s.genre.toLowerCase() === category);

    // Remove existing result div if any
    const existing = document.querySelector(".category-results");
    if (existing) existing.remove();

    // Create new result div
    const container = document.createElement("div");
    container.className = "category-results container";
    container.style.marginTop = "30px";

    const title = document.createElement("h3");
    title.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Stories`;
    container.appendChild(title);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    grid.style.gap = "20px";
    filtered.forEach(story => grid.appendChild(createStoryCard(story)));
    container.appendChild(grid);

    const backBtn = document.createElement("button");
    backBtn.textContent = "← Back to all categories";
    backBtn.className = "btn btn-outline";
    backBtn.style.marginTop = "20px";
    backBtn.addEventListener("click", () => {
      container.remove();
      window.scrollTo({ top: categoriesSection.offsetTop - 100, behavior: 'smooth' });
    });
    container.appendChild(backBtn);

    categoriesSection.insertAdjacentElement("afterend", container);
    window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
  });
});
function setupSmoothScroll() {
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Enhanced search functionality with rectangular results, cross button, and history
function setupSearchDropdown() {
  const input = document.querySelector(".search-input");
  const results = document.getElementById("search-results");
  const searchContainer = document.querySelector(".search-container") || input.parentNode;
  
  if (!input || !results) return;

  // Style the results container
  results.style.display = "none";
  results.style.position = "absolute";
  results.style.top = "100%";
  results.style.left = "0";
  results.style.right = "0";
  results.style.zIndex = "100";
  results.style.backgroundColor = "var(--card-bg, white)";
  results.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  results.style.borderRadius = "8px";
  results.style.marginTop = "5px";
  results.style.maxHeight = "400px";
  results.style.overflowY = "auto";
  results.style.border = "1px solid #ddd";

  // Position the container as relative to contain the absolute results
  searchContainer.style.position = "relative";
  
  const historyKey = 'searchHistory';

  // Create clear button (X) for the input
  const clearBtn = document.createElement("span");
  clearBtn.innerHTML = "×";
  clearBtn.className = "search-clear-btn";
  clearBtn.style.position = "absolute";
  clearBtn.style.right = "10px";
  clearBtn.style.top = "50%";
  clearBtn.style.transform = "translateY(-50%)";
  clearBtn.style.cursor = "pointer";
  clearBtn.style.color = "#666";
  clearBtn.style.fontSize = "22px";
  clearBtn.style.fontWeight = "bold";
  clearBtn.style.padding = "0 8px";
  clearBtn.style.display = "none";
  clearBtn.style.zIndex = "5";
  
  // Only append if it doesn't already exist
  if (!searchContainer.querySelector(".search-clear-btn")) {
    searchContainer.appendChild(clearBtn);
  }

  function saveSearch(term) {
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    // Don't add duplicates, move to top if exists
    const existingIndex = history.indexOf(term);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift(term);
    if (history.length > 10) history.pop();
    localStorage.setItem(historyKey, JSON.stringify(history));
  }

  function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    results.innerHTML = '';
    
    if (history.length === 0) {
      results.style.display = "none";
      return;
    }
    
    const historyHeader = document.createElement('div');
    historyHeader.textContent = 'Recent Searches';
    historyHeader.style.padding = '10px 15px';
    historyHeader.style.fontWeight = 'bold';
    historyHeader.style.borderBottom = '1px solid #eee';
    historyHeader.style.backgroundColor = 'var(--light-accent, #f7f7f7)';
    results.appendChild(historyHeader);
    
    history.forEach(term => {
      const item = document.createElement('div');
      item.className = 'search-history-item';
      item.style.padding = '12px 15px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #eee';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      
      const termText = document.createElement('span');
      termText.textContent = term;
      termText.style.overflow = 'hidden';
      termText.style.textOverflow = 'ellipsis';
      termText.style.whiteSpace = 'nowrap';
      item.appendChild(termText);
      
      // History item delete button
      const deleteBtn = document.createElement('span');
      deleteBtn.innerHTML = '×';
      deleteBtn.style.marginLeft = '10px';
      deleteBtn.style.color = '#999';
      deleteBtn.style.fontSize = '18px';
      deleteBtn.style.fontWeight = 'bold';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.padding = '0 5px';
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let history = JSON.parse(localStorage.getItem(historyKey)) || [];
        const index = history.indexOf(term);
        if (index > -1) {
          history.splice(index, 1);
          localStorage.setItem(historyKey, JSON.stringify(history));
          item.remove();
          if (history.length === 0) {
            results.style.display = "none";
          }
        }
      });
      
      item.appendChild(deleteBtn);
      
      item.addEventListener('click', () => {
        input.value = term;
        performSearch(term);
      });
      
      results.appendChild(item);
    });
    
    results.style.display = 'block';
  }

  function performSearch(query) {
    results.innerHTML = "";
    if (!query || query.length < 2) {
      results.style.display = "none";
      return;
    }
    
    query = query.toLowerCase().trim();
    const matches = storyData.filter(story => 
      story.title.toLowerCase().includes(query) || 
      story.genre.toLowerCase().includes(query) ||
      story.description.toLowerCase().includes(query)
    );
    
    if (matches.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "search-no-results";
      noResults.textContent = "No results found";
      noResults.style.padding = "15px";
      noResults.style.textAlign = "center";
      noResults.style.color = "#666";
      results.appendChild(noResults);
    } else {
      const resultsHeader = document.createElement('div');
      resultsHeader.textContent = `Search Results (${matches.length})`;
      resultsHeader.style.padding = '10px 15px';
      resultsHeader.style.fontWeight = 'bold';
      resultsHeader.style.borderBottom = '1px solid #eee';
      resultsHeader.style.backgroundColor = 'var(--light-accent, #f7f7f7)';
      results.appendChild(resultsHeader);
      
      matches.forEach(story => {
        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";
        resultItem.style.display = "flex";
        resultItem.style.padding = "10px 15px";
        resultItem.style.borderBottom = "1px solid #eee";
        resultItem.style.cursor = "pointer";
        resultItem.style.transition = "background-color 0.2s";
        
        // Hover effect
        resultItem.addEventListener("mouseenter", () => {
          resultItem.style.backgroundColor = "var(--hover-bg, #f5f5f5)";
        });
        
        resultItem.addEventListener("mouseleave", () => {
          resultItem.style.backgroundColor = "";
        });
        
        // Image container
        const imgContainer = document.createElement("div");
        imgContainer.style.width = "60px";
        imgContainer.style.height = "60px";
        imgContainer.style.flexShrink = "0";
        imgContainer.style.marginRight = "12px";
        imgContainer.style.borderRadius = "4px";
        imgContainer.style.overflow = "hidden";
        
        const img = document.createElement("img");
        img.src = story.image || `https://via.placeholder.com/60x60?text=${encodeURIComponent(story.title)}`;
        img.alt = story.title;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        
        imgContainer.appendChild(img);
        resultItem.appendChild(imgContainer);
        
        // Content container
        const content = document.createElement("div");
        content.style.flex = "1";
        content.style.minWidth = "0"; // Allows text truncation
        
        const title = document.createElement("div");
        title.textContent = story.title;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "4px";
        title.style.overflow = "hidden";
        title.style.textOverflow = "ellipsis";
        title.style.whiteSpace = "nowrap";
        
        const meta = document.createElement("div");
        meta.style.display = "flex";
        meta.style.alignItems = "center";
        meta.style.fontSize = "12px";
        meta.style.color = "var(--text-light, #666)";
        
        const genre = document.createElement("span");
        genre.textContent = story.genre;
        genre.style.marginRight = "12px";
        
        const rating = document.createElement("span");
        rating.innerHTML = `<i class="fas fa-star" style="color: #ffcc00; margin-right: 4px;"></i>${story.rating}`;
        
        meta.appendChild(genre);
        meta.appendChild(rating);
        
        content.appendChild(title);
        content.appendChild(meta);
        resultItem.appendChild(content);
        
        resultItem.addEventListener("click", () => {
          saveSearch(query);
          window.location.href = `stories/${story.id}.html`;
        });
        
        results.appendChild(resultItem);
      });
    }
    
    results.style.display = "block";
  }

  // Show clear button when input has content
  function toggleClearButton() {
    if (input.value.length > 0) {
      clearBtn.style.display = "block";
    } else {
      clearBtn.style.display = "none";
    }
  }

  // Clear search input and results
  clearBtn.addEventListener("click", () => {
    input.value = "";
    results.innerHTML = "";
    results.style.display = "none";
    clearBtn.style.display = "none";
    input.focus();
  });

  // Focus event - show history if empty
  input.addEventListener("focus", () => {
    toggleClearButton();
    if (input.value.trim().length < 2) {
      loadSearchHistory();
    } else {
      performSearch(input.value);
    }
  });

  // Input event - search as user types
  input.addEventListener("input", () => {
    toggleClearButton();
    const val = input.value.trim();
    if (val.length < 2) {
      if (val.length === 0) {
        loadSearchHistory();
      } else {
        results.style.display = "none";
      }
    } else {
      performSearch(val);
    }
  });

  // Handle clicks outside to close results
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      results.style.display = "none";
    }
  });

  // Initial setup
  toggleClearButton();
}





function setupCategoryFilter() {
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      const filtered = storyData.filter(s => s.genre.toLowerCase() === category);
      document.querySelector(".category-results")?.remove();

      const container = document.createElement("div");
      container.className = "category-results container";
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
      grid.style.gap = "20px";
      filtered.forEach(story => grid.appendChild(createStoryCard(story)));
      container.appendChild(grid);

      const backBtn = document.createElement("button");
      backBtn.className = "btn btn-outline";
      backBtn.textContent = "← Back to all categories";
      backBtn.style.marginTop = "20px";
      backBtn.onclick = () => container.remove();
      container.appendChild(backBtn);

      document.getElementById("categories").insertAdjacentElement("afterend", container);
      window.scrollTo({ top: container.offsetTop - 100, behavior: "smooth" });
    });
  });
}
// function setupLoginModal() {
//     const loginBtn = document.querySelector('.login-btn');
//     const modalOverlay = document.querySelector('.modal-overlay');
//     const modalClose = document.querySelector('.modal-close');
//     const modalTabs = document.querySelectorAll('.modal-tab');
//     const modalForms = document.querySelectorAll('.modal-form');
    
//     if (!loginBtn || !modalOverlay) return;
    
//     // Check if user is logged in - Initialize display
//     displayWelcomeUsername();
    
//     // Login button click handler
//     if (loginBtn) {
//         loginBtn.addEventListener('click', () => {
//             modalOverlay.classList.add('active');
//         });
//     }
    
//     // Modal close handlers
//     if (modalClose) {
//         modalClose.addEventListener('click', () => {
//             modalOverlay.classList.remove('active');
//         });
//     }
    
//     // Close modal when clicking outside
//     modalOverlay.addEventListener('click', (e) => {
//         if (e.target === modalOverlay) {
//             modalOverlay.classList.remove('active');
//         }
//     });
    
//     // Tab switching
//     modalTabs.forEach(tab => {
//         tab.addEventListener('click', () => {
//             const tabName = tab.getAttribute('data-tab');
            
//             modalTabs.forEach(t => t.classList.remove('active'));
//             modalForms.forEach(f => f.classList.remove('active'));
            
//             tab.classList.add('active');
//             const targetForm = document.querySelector(`.${tabName}-form`);
//             if (targetForm) {
//                 targetForm.classList.add('active');
//             }
//         });
//     });
    
//     // Sign-in form submission
//     const signinForm = document.getElementById('signin-form');
//     if (signinForm) {
//         signinForm.addEventListener('submit', (e) => {
//             e.preventDefault();
            
//             // Get form elements
//             const emailInput = document.getElementById('signin-email');
//             const passwordInput = document.getElementById('signin-password');
            
//             if (!emailInput || !passwordInput) {
//                 console.error('Sign-in form elements not found');
//                 return;
//             }
            
//             const email = emailInput.value.trim();
//             const password = passwordInput.value;
            
//             // Basic validation
//             if (!email || !password) {
//                 alert('Please fill out all fields');
//                 return;
//             }
            
//             // Check credentials
//             if (!checkPassword(email, password)) {
//                 alert('Incorrect email or password. Please try again.');
//                 passwordInput.value = ''; // Clear the password field
//                 return;
//             }
            
//             // Get the stored username for this email
//             const storedUsername = getStoredUsername(email);
            
//             // Store user data and authentication state
//             localStorage.setItem('username', storedUsername);
//             localStorage.setItem('userEmail', email);
//             localStorage.setItem('isAuthenticated', 'true');
            
//             // Update UI
//             displayWelcomeUsername();
//             modalOverlay.classList.remove('active');
            
//             // Clear form
//             emailInput.value = '';
//             passwordInput.value = '';
//         });
//     }
    
//     // Sign-up form submission
//     const signupForm = document.getElementById('signup-form');
//     if (signupForm) {
//         signupForm.addEventListener('submit', (e) => {
//             e.preventDefault();
            
//             // Get form elements
//             const usernameInput = document.getElementById('signup-username');
//             const emailInput = document.getElementById('signup-email');
//             const passwordInput = document.getElementById('signup-password');
            
//             if (!usernameInput || !emailInput || !passwordInput) {
//                 console.error('Sign-up form elements not found');
//                 return;
//             }
            
//             const username = usernameInput.value.trim();
//             const email = emailInput.value.trim();
//             const password = passwordInput.value;
            
//             // Basic validation
//             if (!username || !email || !password) {
//                 alert('Please fill out all fields');
//                 return;
//             }
            
//             // Email validation
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             if (!emailRegex.test(email)) {
//                 alert('Please enter a valid email address');
//                 return;
//             }
            
//             // Password validation
//             if (password.length < 6) {
//                 alert('Password must be at least 6 characters long');
//                 return;
//             }
            
//             // Check if email already exists
//             if (isEmailRegistered(email)) {
//                 alert('An account with this email already exists. Please sign in instead.');
//                 return;
//             }
            
//             // Store user data
//             storeUserData(username, email, password);
            
//             // Set as authenticated
//             localStorage.setItem('username', username);
//             localStorage.setItem('userEmail', email);
//             localStorage.setItem('isAuthenticated', 'true');
            
//             // Update UI
//             displayWelcomeUsername();
//             modalOverlay.classList.remove('active');
            
//             // Clear form
//             usernameInput.value = '';
//             emailInput.value = '';
//             passwordInput.value = '';
            
//             alert('Sign up successful! Welcome to Talevo!');
//         });
//     }
// }

// // Helper function to check password
// function checkPassword(email, password) {
//     // Get all registered users
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
//     return users.some(user => user.email === email && user.password === password);
// }

// // Helper function to get stored username for an email
// function getStoredUsername(email) {
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
//     const user = users.find(user => user.email === email);
//     return user ? user.username : email.split('@')[0]; // Fallback to email prefix
// }

// // Helper function to check if email is already registered
// function isEmailRegistered(email) {
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
//     return users.some(user => user.email === email);
// }

// // Helper function to store user data
// function storeUserData(username, email, password) {
//     const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
//     // Add new user
//     users.push({
//         username: username,
//         email: email,
//         password: password, // In production, this should be hashed
//         registeredDate: new Date().toISOString()
//     });
    
//     // Store updated users array
//     localStorage.setItem('registeredUsers', JSON.stringify(users));
// }

// // Updated displayWelcomeUsername function with better integration
// function displayWelcomeUsername() {
//     const username = localStorage.getItem("username");
//     const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
//     const loginBtn = document.querySelector(".login-btn");
//     const accountWrapper = document.querySelector(".account-wrapper");
//     const accountName = document.getElementById("account-name");
//     const accountMenu = document.querySelector(".account-menu");

//     if (isAuthenticated && username) {
//         if (loginBtn) loginBtn.style.display = "none";
//         if (accountWrapper) accountWrapper.classList.remove("hidden");
//         if (accountName) accountName.textContent = username;
//     } else {
//         if (loginBtn) loginBtn.style.display = "inline-block";
//         if (accountWrapper) accountWrapper.classList.add("hidden");
//         if (accountMenu) accountMenu.classList.add("hidden");
//     }
// }


// Separate function to setup account toggle
// function setupAccountToggle() {
//     const accountToggle = document.getElementById("accountToggle");
//     if (!accountToggle) return;
    
//     // Remove existing listeners to prevent duplicates
//     const newToggle = accountToggle.cloneNode(true);
//     accountToggle.parentNode.replaceChild(newToggle, accountToggle);
    
//     // Add fresh event listener
//     newToggle.addEventListener("click", (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         const menu = document.querySelector(".account-menu");
//         const button = document.querySelector(".account-button");
//         if (menu) menu.classList.toggle("hidden");
//         if (button) button.classList.toggle("active");
//     });
// }

// Setup sign out functionality


// Global click handler for closing dropdown
function setupGlobalClickHandler() {
    document.addEventListener("click", function (e) {
        const toggle = document.getElementById("accountToggle");
        const menu = document.querySelector(".account-menu");
        
        if (toggle && menu && !menu.classList.contains("hidden")) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add("hidden");
                toggle.classList.remove("active");
            }
        }
    });
}

// Initialize everything when DOM is loaded


  // Add this function to your document.addEventListener("DOMContentLoaded", function() { ... }) block
function fixSearchFunctionality() {
  // First, ensure the search container exists and has proper structure
  const searchContainer = document.querySelector('.search-container');
  if (!searchContainer) {
    console.error('Search container not found');
    return;
  }
  
  // Get or create the search input
  let searchInput = searchContainer.querySelector('.search-input');
  if (!searchInput) {
    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search stories...';
    searchContainer.appendChild(searchInput);
  }
  
  // Create or get the search results container
  let searchResults = document.getElementById('search-results');
  if (!searchResults) {
    searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
  }
  
  // Style the results container properly with theme variables
  searchResults.style.display = "none";
  searchResults.style.position = "absolute";
  searchResults.style.top = "100%";
  searchResults.style.left = "0";
  searchResults.style.right = "0";
  searchResults.style.zIndex = "100";
  searchResults.style.backgroundColor = "var(--card-bg)";
  searchResults.style.color = "var(--text)";
  searchResults.style.boxShadow = "0 4px 12px var(--shadow-color, rgba(0,0,0,0.15))";
  searchResults.style.borderRadius = "8px";
  searchResults.style.marginTop = "5px";
  searchResults.style.maxHeight = "400px";
  searchResults.style.overflowY = "auto";
  searchResults.style.border = "1px solid var(--border-color, #ddd)";
  
  // Make sure search container has relative positioning
  searchContainer.style.position = "relative";
  
  // Create clear button with theme variables
  let clearBtn = searchContainer.querySelector('.search-clear-btn');
  if (!clearBtn) {
    clearBtn = document.createElement("span");
    clearBtn.innerHTML = "×";
    clearBtn.className = "search-clear-btn";
    clearBtn.style.position = "absolute";
    clearBtn.style.right = "10px";
    clearBtn.style.top = "50%";
    clearBtn.style.transform = "translateY(-50%)";
    clearBtn.style.cursor = "pointer";
    clearBtn.style.color = "var(--text-muted, #666)";
    clearBtn.style.fontSize = "22px";
    clearBtn.style.fontWeight = "bold";
    clearBtn.style.padding = "0 8px";
    clearBtn.style.display = "none";
    clearBtn.style.zIndex = "5";
    searchContainer.appendChild(clearBtn);
  }
  
  const historyKey = 'searchHistory';
  
  // Helper function to get proper hover background color
  function getHoverBg() {
    // Check if we're in dark theme by looking at computed styles
    const computedStyle = getComputedStyle(document.documentElement);
    const cardBg = computedStyle.getPropertyValue('--card-bg').trim();
    
    // If card background is dark (likely dark theme), return a lighter shade
    // If card background is light (likely light theme), return a darker shade
    if (cardBg && (cardBg.includes('rgb') || cardBg.includes('#'))) {
      // For dark theme, we want rgba(255,255,255,0.1) for a subtle lighter effect
      // For light theme, we want rgba(0,0,0,0.05) for a subtle darker effect
      const isDarkTheme = document.documentElement.classList.contains('dark-theme') || 
                         document.body.classList.contains('dark-theme') ||
                         cardBg.includes('33') || cardBg.includes('44') || cardBg.includes('55'); // common dark values
      
      return isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    }
    
    // Fallback to CSS variable with better defaults
    return 'var(--search-hover-bg, rgba(255, 255, 255, 0.1))';
  }
  
  // Save search term to history
  function saveSearch(term) {
    if (!term || term.trim().length < 2) return;
    
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    const existingIndex = history.indexOf(term);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift(term);
    if (history.length > 10) history.pop();
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
  
  // Load and display search history with proper theme support
  function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    searchResults.innerHTML = '';
    
    if (history.length === 0) {
      searchResults.style.display = "none";
      return;
    }
    
    const historyHeader = document.createElement('div');
    historyHeader.textContent = 'Recent Searches';
    historyHeader.style.padding = '10px 15px';
    historyHeader.style.fontWeight = 'bold';
    historyHeader.style.borderBottom = '1px solid var(--border-color, #eee)';
    historyHeader.style.backgroundColor = 'var(--card-bg)';
    historyHeader.style.color = 'var(--text)';
    searchResults.appendChild(historyHeader);
    
    history.forEach(term => {
      const item = document.createElement('div');
      item.className = 'search-history-item';
      item.style.padding = '12px 15px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid var(--border-color, #eee)';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.color = 'var(--text)';
      item.style.transition = 'background-color 0.2s ease';
      
      const termText = document.createElement('span');
      termText.textContent = term;
      termText.style.overflow = 'hidden';
      termText.style.textOverflow = 'ellipsis';
      termText.style.whiteSpace = 'nowrap';
      item.appendChild(termText);
      
      // History item delete button with theme variables
      const deleteBtn = document.createElement('span');
      deleteBtn.innerHTML = '×';
      deleteBtn.style.marginLeft = '10px';
      deleteBtn.style.color = 'var(--text-muted, #999)';
      deleteBtn.style.fontSize = '18px';
      deleteBtn.style.fontWeight = 'bold';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.padding = '0 5px';
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let history = JSON.parse(localStorage.getItem(historyKey)) || [];
        const index = history.indexOf(term);
        if (index > -1) {
          history.splice(index, 1);
          localStorage.setItem(historyKey, JSON.stringify(history));
          item.remove();
          if (history.length === 0) {
            searchResults.style.display = "none";
          }
        }
      });
      
      item.appendChild(deleteBtn);
      
      item.addEventListener('click', () => {
        searchInput.value = term;
        performSearch(term);
      });
      
      // Add hover effect with proper theme-aware background
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = getHoverBg();
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = '';
      });
      
      searchResults.appendChild(item);
    });
    
    searchResults.style.display = 'block';
  }
  
  // Perform search and display results with proper theme support
  function performSearch(query) {
    searchResults.innerHTML = "";
    if (!query || query.length < 2) {
      searchResults.style.display = "none";
      return;
    }
    
    query = query.toLowerCase().trim();
    const matches = storyData.filter(story => 
      story.title.toLowerCase().includes(query) || 
      story.genre.toLowerCase().includes(query) ||
      story.description.toLowerCase().includes(query)
    );
    
    console.log("Search query:", query);
    console.log("Matches found:", matches.length, matches);
    
    if (matches.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "search-no-results";
      noResults.textContent = "No results found";
      noResults.style.padding = "15px";
      noResults.style.textAlign = "center";
      noResults.style.color = "var(--text-muted, #666)";
      searchResults.appendChild(noResults);
    } else {
      const resultsHeader = document.createElement('div');
      resultsHeader.textContent = `Search Results (${matches.length})`;
      resultsHeader.style.padding = '10px 15px';
      resultsHeader.style.fontWeight = 'bold';
      resultsHeader.style.borderBottom = '1px solid var(--border-color, #eee)';
      resultsHeader.style.backgroundColor = 'var(--card-bg)';
      resultsHeader.style.color = 'var(--text)';
      searchResults.appendChild(resultsHeader);
      
      matches.forEach(story => {
        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";
        resultItem.style.display = "flex";
        resultItem.style.padding = "10px 15px";
        resultItem.style.borderBottom = "1px solid var(--border-color, #eee)";
        resultItem.style.cursor = "pointer";
        resultItem.style.transition = "background-color 0.2s ease";
        resultItem.style.color = 'var(--text)';
        
        // Hover effect with proper theme-aware background
        resultItem.addEventListener("mouseenter", () => {
          resultItem.style.backgroundColor = getHoverBg();
        });
        
        resultItem.addEventListener("mouseleave", () => {
          resultItem.style.backgroundColor = "";
        });
        
        // Image container
        const imgContainer = document.createElement("div");
        imgContainer.style.width = "60px";
        imgContainer.style.height = "60px";
        imgContainer.style.flexShrink = "0";
        imgContainer.style.marginRight = "12px";
        imgContainer.style.borderRadius = "4px";
        imgContainer.style.overflow = "hidden";
        
        const img = document.createElement("img");
        img.src = getValidImageUrl(story);
        img.alt = story.title;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        
        imgContainer.appendChild(img);
        resultItem.appendChild(imgContainer);
        
        // Content container
        const content = document.createElement("div");
        content.style.flex = "1";
        content.style.minWidth = "0"; // Allows text truncation
        
        const title = document.createElement("div");
        title.textContent = story.title;
        title.style.fontWeight = "bold";
        title.style.marginBottom = "4px";
        title.style.overflow = "hidden";
        title.style.textOverflow = "ellipsis";
        title.style.whiteSpace = "nowrap";
        title.style.color = 'var(--text)';
        
        const meta = document.createElement("div");
        meta.style.display = "flex";
        meta.style.alignItems = "center";
        meta.style.fontSize = "12px";
        meta.style.color = "var(--text-muted, #666)";
        
        const genre = document.createElement("span");
        genre.textContent = story.genre;
        genre.style.marginRight = "12px";
        
        const rating = document.createElement("span");
        rating.innerHTML = `<i class="fas fa-star" style="color: var(--star-color, #ffcc00); margin-right: 4px;"></i>${story.rating}`;
        
        meta.appendChild(genre);
        meta.appendChild(rating);
        
        content.appendChild(title);
        content.appendChild(meta);
        resultItem.appendChild(content);
        
        resultItem.addEventListener("click", () => {
          saveSearch(query);
          window.location.href = `stories/${story.id}.html`;
        });
        
        searchResults.appendChild(resultItem);
      });
    }
    
    searchResults.style.display = "block";
  }
  
  // Show clear button when input has content
  function toggleClearButton() {
    if (searchInput.value.length > 0) {
      clearBtn.style.display = "block";
    } else {
      clearBtn.style.display = "none";
    }
  }
  
  // Clear search input and results
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchResults.style.display = "none";
    clearBtn.style.display = "none";
    searchInput.focus();
  });
  
  // Focus event - show history if empty
  searchInput.addEventListener("focus", () => {
    toggleClearButton();
    if (searchInput.value.trim().length < 2) {
      loadSearchHistory();
    } else {
      performSearch(searchInput.value);
    }
  });
  
  // Input event - search as user types
  searchInput.addEventListener("input", () => {
    toggleClearButton();
    const val = searchInput.value.trim();
    if (val.length < 2) {
      if (val.length === 0) {
        loadSearchHistory();
      } else {
        searchResults.style.display = "none";
      }
    } else {
      performSearch(val);
    }
  });
  
  // Handle clicks outside to close results
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });
  
  // Initial setup
  toggleClearButton();
  
  console.log('Search functionality initialized with proper theme support');
}

function showContinueReadingSection() {
  const progress = JSON.parse(localStorage.getItem("progress") || "{}");
  const section = document.createElement("section");
  section.className = "featured container";
  section.innerHTML = `<h2 class="section-title">Continue Reading</h2>`;

  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
  container.style.gap = "20px";
  section.appendChild(container);

  Object.keys(progress).forEach(storyId => {
    const story = storyData.find(s => s.id === storyId);
    if (!story) return;

    const { chapter, total, title } = progress[storyId];
    const percent = Math.min(100, Math.round((chapter / total) * 100));

    const card = document.createElement("div");
    card.className = "story-card";
    card.style.padding = "0";
    card.style.cursor = "default";

    card.innerHTML = `
      <img src="${story.image}" class="story-card-img" style="height: 180px; object-fit: cover; width: 100%; border-radius: 12px 12px 0 0;">
      <div class="story-card-content" style="padding: 15px;">
        <h3 class="story-card-title">${story.title}</h3>
        <p class="story-card-desc">${story.description}</p>
        <div class="progress-bar" style="background: #eee; border-radius: 6px; overflow: hidden; margin: 10px 0;">
          <div style="height: 8px; width: ${percent}%; background: var(--primary); transition: width 0.3s;"></div>
        </div>
        <p style="font-size: 0.85rem; opacity: 0.8;">Chapter ${chapter} of ${total}${title ? `: ${title}` : ''}</p>
        <button class="btn continue-btn" style="margin-top: 10px;" data-id="${story.id}" data-chapter="${chapter}">
          Continue
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  const featured = document.querySelector('#featured');
  if (container.children.length > 0 && featured) {
    featured.parentNode.insertBefore(section, featured);
  }

  // Handle continue buttons
  document.querySelectorAll(".continue-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const chapter = btn.dataset.chapter;
      window.location.href = `stories/${id}.html?chapter=${chapter}`;
    });
  });
}




  function init() {
    // displayWelcomeUsername(); // Commented out because the function is not defined
    fixSearchFunctionality();
    setupHeroSection();
    setupFeaturedCarousel();
    setupTrendingSection();
    setupThemeToggle();
    // setupLoginModal();
    setupStoryCardHoverEffects();
    setupMutationObserver();
  
    setupSmoothScroll();
    setupGlobalClickHandler();
    setupCategoryFilter();
    // <- use only this
    showContinueReadingSection()
}


  init();
});
