// image-loader.js - Handles dynamic loading and generation of story images

class StoryImageLoader {
    constructor(storyId) {
        this.storyId = storyId;
        this.imageCache = new Map();
        this.defaultImagePath = '/api/placeholder';
        this.imagePath = `/images/stories/${storyId}/`;
        this.currentScene = null;
        
        // For generating starfield backgrounds when images aren't available
        this.nightSkyColors = [
            "#0a0a2a", // Deep night blue
            "#0e1a40", // Dark blue
            "#0f0f3d", // Midnight blue
            "#16162b", // Deep space
            "#1a1a35"  // Dark indigo
        ];
    }

    // Preload common images for faster transitions
    async preloadCommonImages(chapters) {
        const imagesToPreload = [];
        
        // Get the first few chapters to preload their images
        const chapterIds = Object.keys(chapters).slice(0, 3);
        
        for (const id of chapterIds) {
            const chapter = chapters[id];
            if (chapter.image) {
                imagesToPreload.push(this.loadImage(chapter.image));
            }
        }
        
        // Wait for all preloads to complete
        await Promise.all(imagesToPreload);
        console.log('Preloaded common story images');
    }

    // Load a specific image and cache it
    async loadImage(imageName) {
        // Check if already cached
        if (this.imageCache.has(imageName)) {
            return this.imageCache.get(imageName);
        }
        
        // Try to load the image
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.imageCache.set(imageName, img);
                resolve(img);
            };
            
            img.onerror = () => {
                // If image fails to load, create a generated placeholder
                console.warn(`Failed to load image: ${imageName}`);
                const generatedImage = this.generateSpaceImage(imageName);
                this.imageCache.set(imageName, generatedImage);
                resolve(generatedImage);
            };
            
            // Set the source to try loading
            img.src = this.imagePath + imageName;
        });
    }

    // Generate a space-themed placeholder image with the nightsky theme
    generateSpaceImage(imageName) {
        // Create a canvas element to generate the image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Select a random background color from nightsky palette
        const bgColor = this.nightSkyColors[Math.floor(Math.random() * this.nightSkyColors.length)];
        
        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        const starCount = Math.floor(Math.random() * 200) + 100; // 100-300 stars
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.8 + 0.2;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        }
        
        // Add some distant nebula/galaxy effects
        this.drawNebula(ctx, canvas.width, canvas.height);
        
        // Add title text
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(this.formatImageName(imageName), canvas.width / 2, canvas.height / 2);
        
        // Create an image from the canvas
        const img = new Image();
        img.src = canvas.toDataURL('image/png');
        return img;
    }
    
    // Draw nebula effects in the background
    drawNebula(ctx, width, height) {
        // Choose some colors for nebula
        const nebulaColors = [
            'rgba(75, 0, 130, 0.15)',  // Indigo
            'rgba(138, 43, 226, 0.1)', // Blue-violet
            'rgba(65, 105, 225, 0.1)', // Royal blue
            'rgba(0, 191, 255, 0.1)',  // Deep sky blue
            'rgba(220, 20, 60, 0.08)'  // Crimson
        ];
        
        // Draw 2-4 nebula cloud effects
        const nebulaCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < nebulaCount; i++) {
            const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 150 + 100;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Format image filename to a display title
    formatImageName(filename) {
        // Remove extension and replace dashes with spaces
        const name = filename.replace(/\.[^/.]+$/, "").replace(/-/g, " ");
        
        // Capitalize first letter of each word
        return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Get image for a specific chapter
    async getChapterImage(chapter) {
        if (chapter.image) {
            try {
                // Try to load the specified image
                const image = await this.loadImage(chapter.image);
                return image.src;
            } catch (error) {
                console.error('Error loading chapter image:', error);
                // Fall back to generated image on error
                return this.getGeneratedImageUrl(chapter.title);
            }
        } else {
            // If no image specified, generate one based on chapter title
            return this.getGeneratedImageUrl(chapter.title);
        }
    }
    
    // Get URL for a generated image based on text
    getGeneratedImageUrl(text) {
        const encodedText = encodeURIComponent(text);
        return `${this.defaultImagePath}/800/400?text=${encodedText}`;
    }
    
    // Apply a transition effect to the current chapter image
    applyImageTransition(imageElement, newSrc) {
        // Add transitioning class for CSS animation
        imageElement.closest('.chapter-image').classList.add('transitioning');
        
        // After short delay, update the image and remove transition class
        setTimeout(() => {
            imageElement.src = newSrc;
            
            // When the new image is loaded, remove transition class
            imageElement.onload = () => {
                setTimeout(() => {
                    imageElement.closest('.chapter-image').classList.remove('transitioning');
                }, 50);
            };
        }, 300);
    }
    
    // Create a star overlay effect for the chapter image
    createStarOverlay(container) {
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'star-overlay';
        
        // Add random stars
        const starCount = Math.floor(Math.random() * 30) + 20; // 20-50 stars
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'floating-star';
            
            // Random size between 1-3px
            const size = Math.random() * 2 + 1;
            
            // Random position
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            
            // Random opacity
            const opacity = Math.random() * 0.7 + 0.3;
            
            // Random animation duration
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 3;
            
            // Set styles
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${top}%`;
            star.style.left = `${left}%`;
            star.style.opacity = opacity;
            star.style.animation = `twinkle ${duration}s infinite`;
            star.style.animationDelay = `${delay}s`;
            
            overlay.appendChild(star);
        }
        
        // Add overlay to container
        container.appendChild(overlay);
    }
}