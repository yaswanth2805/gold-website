// Animated Testimonials JavaScript
class AnimatedTestimonials {
    constructor() {
        this.currentIndex = 0;
        this.testimonials = document.querySelectorAll('.animated-testimonial');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.autoPlayInterval = null;
        this.autoPlayDuration = 5000; // 5 seconds
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (this.testimonials.length === 0) return;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start auto-play
        this.startAutoPlay();
        
        // Initialize first testimonial
        this.showTestimonial(0);
    }
    
    setupEventListeners() {
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!this.isTransitioning) {
                    this.goToTestimonial(index);
                }
            });
        });
        
        // Arrow navigation
        this.prevBtn?.addEventListener('click', () => {
            if (!this.isTransitioning) {
                this.previousTestimonial();
            }
        });
        
        this.nextBtn?.addEventListener('click', () => {
            if (!this.isTransitioning) {
                this.nextTestimonial();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isInViewport() && !this.isTransitioning) {
                if (e.key === 'ArrowLeft') {
                    this.previousTestimonial();
                } else if (e.key === 'ArrowRight') {
                    this.nextTestimonial();
                }
            }
        });
        
        // Pause auto-play on hover
        const container = document.querySelector('.animated-testimonials-container');
        container?.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });
        
        container?.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        const container = document.querySelector('.testimonials-wrapper');
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        container?.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        container?.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousTestimonial();
                } else {
                    this.nextTestimonial();
                }
            }
        });
    }
    
    showTestimonial(index, direction = 'next') {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Remove active class from current testimonial
        this.testimonials.forEach((testimonial, i) => {
            testimonial.classList.remove('active', 'prev', 'next');
            
            if (i === index) {
                testimonial.classList.add('active');
            } else if (i < index) {
                testimonial.classList.add('prev');
            } else {
                testimonial.classList.add('next');
            }
        });
        
        // Update dots
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        this.currentIndex = index;
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 800);
    }
    
    nextTestimonial() {
        const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.goToTestimonial(nextIndex, 'next');
    }
    
    previousTestimonial() {
        const prevIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.goToTestimonial(prevIndex, 'prev');
    }
    
    goToTestimonial(index, direction = 'next') {
        if (index === this.currentIndex) return;
        
        this.pauseAutoPlay();
        this.showTestimonial(index, direction);
        
        // Restart auto-play after a short delay
        setTimeout(() => {
            this.startAutoPlay();
        }, 1000);
    }
    
    startAutoPlay() {
        this.pauseAutoPlay(); // Clear any existing interval
        
        this.autoPlayInterval = setInterval(() => {
            this.nextTestimonial();
        }, this.autoPlayDuration);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    isInViewport() {
        const container = document.querySelector('.animated-testimonials-container');
        if (!container) return false;
        
        const rect = container.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Public methods for external control
    pause() {
        this.pauseAutoPlay();
    }
    
    play() {
        this.startAutoPlay();
    }
    
    goTo(index) {
        if (index >= 0 && index < this.testimonials.length) {
            this.goToTestimonial(index);
        }
    }
    
    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners if needed
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.animatedTestimonials = new AnimatedTestimonials();
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.animatedTestimonials) {
        if (document.hidden) {
            window.animatedTestimonials.pause();
        } else {
            window.animatedTestimonials.play();
        }
    }
});

// Intersection Observer for performance optimization
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (window.animatedTestimonials) {
                if (entry.isIntersecting) {
                    window.animatedTestimonials.play();
                } else {
                    window.animatedTestimonials.pause();
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.querySelector('.animated-testimonials-container');
        if (container) {
            observer.observe(container);
        }
    });
}