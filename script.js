// Custom JavaScript for SRISTAR GOLD COMPANY

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links (only applies to in-page anchors)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only prevent default and smooth scroll if it's an in-page anchor
            if (this.pathname === window.location.pathname) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Get the height of the fixed navbar
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;

                    // Calculate the scroll position, accounting for the navbar
                    const offsetTop = targetElement.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close the navbar toggler on small screens after clicking a link
                    const navbarToggler = document.querySelector('.navbar-toggler');
                    const navbarCollapse = document.querySelector('#navbarNav');
                    if (navbarToggler && navbarCollapse.classList.contains('show')) {
                        navbarToggler.click(); // Simulate a click to close the navbar
                    }
                }
            }
        });
    });

    // Add active class to navbar links based on current page and scroll position
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // Function to set active link based on current page URL
    function setActiveNavLinkByUrl() {
        const currentPath = window.location.pathname.split('/').pop(); // Get current file name (e.g., "index.html")

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href').split('/').pop();

            if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Function to set active link based on scroll position (for homepage sections)
    function activateNavLinkOnScroll() {
        // Only run this for the homepage
        if (window.location.pathname.split('/').pop() === 'index.html' || window.location.pathname.split('/').pop() === '') {
            const sections = document.querySelectorAll('section, header'); // Include header for the home section
            let currentSectionId = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                // Adjust scroll position to account for navbar height
                const scrollYAdjusted = window.scrollY + document.querySelector('.navbar').offsetHeight + 1;

                if (scrollYAdjusted >= sectionTop && scrollYAdjusted < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                // Only modify active class for in-page links on the homepage
                if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(currentSectionId)) {
                        link.classList.add('active');
                    }
                }
            });
        }
    }

    // Initial calls
    setActiveNavLinkByUrl(); // Set active link for the current page
    activateNavLinkOnScroll(); // Set active link for homepage sections on load

    // Event listeners
    window.addEventListener('scroll', activateNavLinkOnScroll); // Update active link on scroll for homepage

    // Spotlight effect for cards
    function initSpotlightEffect() {
        const spotlightCards = document.querySelectorAll('.card-spotlight, .testimonial-spotlight');
        
        spotlightCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
            });
        });
    }

    // Floating dock effect initialization
    function initFloatingDockEffect() {
        const dockItems = document.querySelectorAll('.floating-dock-item');
        
        dockItems.forEach(item => {
            // Add smooth hover animations
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-8px) scale(1.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Initialize effects
    initSpotlightEffect();
    initFloatingDockEffect();
    
    // Initialize gold price ticker
    initGoldPriceTicker();
    
    // Initialize Get In Touch Modal
    initGetInTouchModal();
});

// Live Gold Price Functionality
function initGoldPriceTicker() {
    const OUNCE_TO_GRAM = 31.1034768;
    const USD_TO_INR_FALLBACK = 83.0; // Used if FX API fails

    // Helper to format INR values with Indian locale grouping
    const toINR = (n) => Number(n).toLocaleString('en-IN');

    // Fetch live USD->INR rate (more robust, with multiple fallbacks)
    async function fetchUsdToInr() {
        // 1) Primary: jsDelivr currency API (fast, CORS-friendly)
        try {
            const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', { cache: 'no-store' });
            const json = await res.json();
            if (json && json.usd && json.usd.inr) return Number(json.usd.inr);
        } catch (e) {}
        // 2) Secondary: exchangerate.host
        try {
            const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR', { cache: 'no-store' });
            const json = await res.json();
            if (json && json.rates && json.rates.INR) return Number(json.rates.INR);
        } catch (e) {}
        console.warn('FX rate fetch failed, using fallback');
        return USD_TO_INR_FALLBACK;
    }

    // Primary: GoldAPI (if you configure a key). Returns INR directly.
    async function fetchFromGoldApi() {
        const apiKey = window.GOLD_API_KEY || '';
        if (!apiKey) throw new Error('GoldAPI key not configured');
        const res = await fetch('https://www.goldapi.io/api/XAU/INR', {
            headers: { 'x-access-token': apiKey }
        });
        if (!res.ok) throw new Error('GoldAPI request failed');
        const data = await res.json();
        // Prefer direct 24k per gram if available; otherwise derive from per ounce
        const priceGram24k = data.price_gram_24k || (data.price ? (data.price / OUNCE_TO_GRAM) : null);
        if (!priceGram24k) throw new Error('GoldAPI response missing price');
        return {
            gold24k: Math.round(priceGram24k),
            silver: null,
            source: 'GoldAPI'
        };
    }

    // New Provider: GoldPrice.org (USD/oz) + live FX to INR
    async function fetchFromGoldPriceOrg() {
        const usdToInr = await fetchUsdToInr();
        const r = await fetch('https://data-asg.goldprice.org/dbXau.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('goldprice.org request failed');
        const d = await r.json();
        // Typical shape: { items: [ { xauPrice: <usd_per_oz>, ... } ] }
        const usdPerOz = d && Array.isArray(d.items) && d.items[0] && (d.items[0].xauPrice || d.items[0].price) ? (d.items[0].xauPrice || d.items[0].price) : null;
        if (!usdPerOz) throw new Error('goldprice.org price missing');
        const inrPerGram24k = (Number(usdPerOz) / OUNCE_TO_GRAM) * usdToInr;
        // Try to fetch silver as well (optional)
        let silverInrPerGram = null;
        try {
            const rs = await fetch('https://data-asg.goldprice.org/dbXag.json', { cache: 'no-store' });
            if (rs.ok) {
                const ds = await rs.json();
                const usdPerOzAg = ds && Array.isArray(ds.items) && ds.items[0] && (ds.items[0].xagPrice || ds.items[0].price) ? (ds.items[0].xagPrice || ds.items[0].price) : null;
                if (usdPerOzAg) silverInrPerGram = (Number(usdPerOzAg) / OUNCE_TO_GRAM) * usdToInr;
            }
        } catch {}
        return {
            gold24k: Math.round(inrPerGram24k),
            silver: silverInrPerGram ? Math.round(silverInrPerGram) : null,
            source: 'GoldPrice.org'
        };
    }

    // Secondary: Metals.live (USD/oz) + live FX to INR (more robust parsing)
    async function fetchFromMetalsLive() {
        const usdToInr = await fetchUsdToInr();

        // Gold
        const rg = await fetch('https://api.metals.live/v1/spot/gold', { cache: 'no-store' });
        if (!rg.ok) throw new Error('metals.live gold request failed');
        const dg = await rg.json();

        let usdPerOzGold = null;
        if (Array.isArray(dg) && dg.length > 0) {
            // Pick the last numeric or price-like value
            for (let i = dg.length - 1; i >= 0; i--) {
                const entry = dg[i];
                if (typeof entry === 'number') { usdPerOzGold = entry; break; }
                if (entry && typeof entry === 'object') {
                    usdPerOzGold = entry.price || entry.ask || entry.bid || entry.gold || entry.xau || null;
                    if (usdPerOzGold) break;
                }
            }
        }
        if (!usdPerOzGold) throw new Error('metals.live gold price not found');

        const inrPerGram24k = (Number(usdPerOzGold) / OUNCE_TO_GRAM) * usdToInr;

        // Silver (optional)
        let silverInrPerGram = null;
        try {
            const rs = await fetch('https://api.metals.live/v1/spot/silver', { cache: 'no-store' });
            if (rs.ok) {
                const ds = await rs.json();
                let usdPerOzSilver = null;
                if (Array.isArray(ds) && ds.length > 0) {
                    for (let i = ds.length - 1; i >= 0; i--) {
                        const e = ds[i];
                        if (typeof e === 'number') { usdPerOzSilver = e; break; }
                        if (e && typeof e === 'object') {
                            usdPerOzSilver = e.price || e.ask || e.bid || e.silver || e.xag || null;
                            if (usdPerOzSilver) break;
                        }
                    }
                }
                if (usdPerOzSilver) silverInrPerGram = (Number(usdPerOzSilver) / OUNCE_TO_GRAM) * usdToInr;
            }
        } catch (e) {
            console.warn('metals.live silver fetch failed:', e);
        }

        return {
            gold24k: Math.round(inrPerGram24k),
            silver: silverInrPerGram ? Math.round(silverInrPerGram) : null,
            source: 'Metals.live'
        };
    }

    // Sanity check to avoid displaying absurd values (network/data glitches)
    function isReasonableInrPerGram(value) {
        const v = Number(value);
        return v > 4000 && v < 100000; // rough guardrails
    }

    // Update price display and animate
    function updatePriceDisplay(gold24k, gold22k, gold18k, silver) {
        const gold24kElement = document.getElementById('gold-24k-price');
        const gold22kElement = document.getElementById('gold-22k-price');
        const gold18kElement = document.getElementById('gold-18k-price');
        const silverElement = document.getElementById('silver-price');
        const lastUpdatedElement = document.getElementById('last-updated');

        if (gold24kElement) gold24kElement.textContent = toINR(gold24k);
        if (gold22kElement) gold22kElement.textContent = toINR(gold22k);
        if (gold18kElement) gold18kElement.textContent = toINR(gold18k);
        if (silverElement && silver != null) silverElement.textContent = toINR(silver);

        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleString('en-IN', {
                hour: '2-digit', minute: '2-digit', hour12: true,
                day: '2-digit', month: 'short'
            });
        }

        // Add CSS class for animation (defined in gold-price-ticker.css)
        document.querySelectorAll('.price-value').forEach(el => {
            el.classList.add('updating');
            setTimeout(() => el.classList.remove('updating'), 600);
        });
    }

    // Fallback prices when API is not available
    function setFallbackPrices() {
        // Conservative placeholders
        const gold24k = 7250;
        const gold22k = Math.round(gold24k * 0.916);
        const gold18k = Math.round(gold24k * 0.75);
        const silver = 126;
        updatePriceDisplay(gold24k, gold22k, gold18k, silver);
    }

    // Try multiple sources in order
    async function fetchPricesWithFallback() {
        // Show loading shimmer text while updating
        ['gold-24k-price','gold-22k-price','gold-18k-price','silver-price'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '126';
        });

        try {
            // 1) GoldAPI (if configured)
            const primary = await fetchFromGoldApi().catch(() => null);
            if (primary && isReasonableInrPerGram(primary.gold24k)) {
                const gold24k = primary.gold24k;
                const gold22k = Math.round(gold24k * 0.916);
                const gold18k = Math.round(gold24k * 0.75);
                updatePriceDisplay(gold24k, gold22k, gold18k, primary.silver);
                return;
            }

            // 2) GoldPrice.org (new API)
            const gp = await fetchFromGoldPriceOrg().catch(() => null);
            if (gp && isReasonableInrPerGram(gp.gold24k)) {
                const gold24k = gp.gold24k;
                const gold22k = Math.round(gold24k * 0.916);
                const gold18k = Math.round(gold24k * 0.75);
                updatePriceDisplay(gold24k, gold22k, gold18k, gp.silver);
                return;
            }

            // 3) Metals.live
            const ml = await fetchFromMetalsLive().catch(() => null);
            if (ml && isReasonableInrPerGram(ml.gold24k)) {
                const gold24k = ml.gold24k;
                const gold22k = Math.round(gold24k * 0.916);
                const gold18k = Math.round(gold24k * 0.75);
                updatePriceDisplay(gold24k, gold22k, gold18k, ml.silver);
                return;
            }

            // 4) Static values
            setFallbackPrices();
        } catch (e) {
            console.error('Price fetch failed:', e);
            setFallbackPrices();
        }
    }

    // Initial load
    fetchPricesWithFallback();

    // Update prices every 5 minutes
    setInterval(fetchPricesWithFallback, 5 * 60 * 1000);

    // Update time every minute (keeps the time fresh even if prices same)
    setInterval(() => {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement && lastUpdatedElement.textContent !== '--') {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleString('en-IN', {
                hour: '2-digit', minute: '2-digit', hour12: true,
                day: '2-digit', month: 'short'
            });
        }
    }, 60000);
}

// Get In Touch Modal Functionality
function initGetInTouchModal() {
    // Show modal when page loads (after a small delay)
    setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('getInTouchModal'));
        modal.show();
    }, 1000); // Show after 1 second
    
    // Handle input restrictions and validation
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('customerEmail');
    const phoneInput = document.getElementById('customerPhone');
    const otpInput = document.getElementById('customerOtp');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    
    // Name input - only letters, spaces, and periods
    nameInput.addEventListener('input', function(e) {
        let value = e.target.value;
        // Remove any character that is not a letter, space, or period
        value = value.replace(/[^A-Za-z\s\.]/g, '');
        e.target.value = value;
    });
    
    // Phone input - only numbers, max 10 digits
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value;
        // Remove any non-numeric character
        value = value.replace(/[^0-9]/g, '');
        // Limit to 10 digits
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });
    
    // Email input - validate Gmail format in real-time
    emailInput.addEventListener('input', function(e) {
        const value = e.target.value;
        const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        
        if (value && !gmailPattern.test(value)) {
            e.target.setCustomValidity('Please enter a valid Gmail address (example@gmail.com)');
        } else {
            e.target.setCustomValidity('');
        }
    });
    
    // OTP input - only numbers, max 6 digits
    otpInput.addEventListener('input', function(e) {
        let value = e.target.value;
        // Remove any non-numeric character
        value = value.replace(/[^0-9]/g, '');
        // Limit to 6 digits
        if (value.length > 6) {
            value = value.slice(0, 6);
        }
        e.target.value = value;
    });
    
    sendOtpBtn.addEventListener('click', function() {
        const phoneNumber = phoneInput.value.trim();
        
        if (phoneNumber.length === 10 && /^\d+$/.test(phoneNumber)) {
            // Simulate OTP sending
            sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Sending...';
            sendOtpBtn.disabled = true;
            
            setTimeout(() => {
                sendOtpBtn.innerHTML = '<i class="fas fa-check me-1"></i>OTP Sent';
                sendOtpBtn.classList.remove('btn-outline-primary');
                sendOtpBtn.classList.add('btn-success');
                otpInput.disabled = false;
                otpInput.focus();
                
                // Show success message
                showNotification('OTP sent successfully to ' + phoneNumber, 'success');
                
                // Reset button after 30 seconds
                setTimeout(() => {
                    sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Resend OTP';
                    sendOtpBtn.classList.remove('btn-success');
                    sendOtpBtn.classList.add('btn-outline-primary');
                    sendOtpBtn.disabled = false;
                }, 30000);
            }, 2000);
        } else {
            showNotification('Please enter a valid 10-digit phone number', 'error');
        }
    });
    
    // Handle form submission
    const form = document.getElementById('getInTouchForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        if (validateForm(data)) {
            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Hide modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('getInTouchModal'));
                modal.hide();
                
                // Show success message
                showNotification('Thank you! We will contact you soon with the best offers.', 'success');
                
                // Reset form
                form.reset();
                otpInput.disabled = true;
                sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Send OTP';
                sendOtpBtn.classList.remove('btn-success');
                sendOtpBtn.classList.add('btn-outline-primary');
                sendOtpBtn.disabled = false;
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
    
    // Handle state-city dependency
    const stateSelect = document.getElementById('customerState');
    const citySelect = document.getElementById('customerCity');
    
    const cityOptions = {
        'karnataka': [
            { value: 'bangalore', text: 'Bangalore' },
            { value: 'mysore', text: 'Mysore' },
            { value: 'mangalore', text: 'Mangalore' }
        ],
        'tamil-nadu': [
            { value: 'chennai', text: 'Chennai' },
            { value: 'coimbatore', text: 'Coimbatore' },
            { value: 'madurai', text: 'Madurai' }
        ],
        'andhra-pradesh': [
            { value: 'hyderabad', text: 'Hyderabad' },
            { value: 'vijayawada', text: 'Vijayawada' },
            { value: 'visakhapatnam', text: 'Visakhapatnam' }
        ]
    };
    
    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        citySelect.innerHTML = '<option value="">Choose City...</option>';
        
        if (selectedState && cityOptions[selectedState]) {
            cityOptions[selectedState].forEach(city => {
                const option = document.createElement('option');
                option.value = city.value;
                option.textContent = city.text;
                citySelect.appendChild(option);
            });
        }
    });
}

// Form validation function
function validateForm(data) {
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'customerState', 'customerCity', 'goldPurity', 'goldWeight'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field.replace('customer', '').replace(/([A-Z])/g, ' $1').toLowerCase()} field`, 'error');
            return false;
        }
    }
    
    // Validate name (only letters, spaces, and periods)
    const nameRegex = /^[A-Za-z\s\.]+$/;
    if (!nameRegex.test(data.customerName)) {
        showNotification('Name should contain only letters, spaces, and periods', 'error');
        return false;
    }
    
    // Validate email (must be Gmail)
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(data.customerEmail)) {
        showNotification('Please enter a valid Gmail address (example@gmail.com)', 'error');
        return false;
    }
    
    // Validate phone
    if (data.customerPhone.length !== 10 || !/^\d+$/.test(data.customerPhone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    // Validate OTP (if OTP input is enabled)
    const otpInput = document.getElementById('customerOtp');
    if (!otpInput.disabled && (!data.customerOtp || data.customerOtp.length !== 6)) {
        showNotification('Please enter the 6-digit OTP', 'error');
        return false;
    }
    
    // Validate gold weight
    if (parseFloat(data.goldWeight) <= 0) {
        showNotification('Please enter a valid gold weight', 'error');
        return false;
    }
    
    return true;
}

// Notification function
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
