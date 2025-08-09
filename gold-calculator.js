// Gold Calculator JavaScript

// Current gold rates (in INR per gram)
const goldRates = {
    '24k': 7200,
    '22k': 6600,
    '18k': 5400,
    '14k': 4200,
    '10k': 3000,
    'silver': 85
};

// Purity percentages
const purityPercentages = {
    '24k': 0.999,
    '22k': 0.916,
    '18k': 0.750,
    '14k': 0.583,
    '10k': 0.417
};

// DOM Elements
const calculatorForm = document.getElementById('goldCalculatorForm');
const resultsSection = document.getElementById('calculationResults');
const totalValueElement = document.getElementById('totalValue');
const resultWeightElement = document.getElementById('resultWeight');
const resultCaratElement = document.getElementById('resultCarat');
const resultRateElement = document.getElementById('resultRate');

// Form validation patterns
const validationPatterns = {
    name: /^[a-zA-Z\s.]{2,50}$/,
    phone: /^[0-9]{10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    weight: /^[0-9]+(\.[0-9]+)?$/
};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    updateGoldRatesDisplay();
    addFormValidation();
    createGoldParticles();
});

function initializeCalculator() {
    // Add event listeners
    calculatorForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = calculatorForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidation);
    });
    
    // Add phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', formatPhoneNumber);
    
    // Add weight input formatting
    const weightInput = document.getElementById('goldWeight');
    weightInput.addEventListener('input', formatWeightInput);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (validateForm()) {
        calculateGoldValue();
        showResults();
    }
}

function validateForm() {
    let isValid = true;
    const formData = new FormData(calculatorForm);
    
    // Validate each field
    const fields = ['fullName', 'phone', 'email', 'city', 'goldWeight', 'goldCarat'];
    
    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const value = formData.get(fieldName);
        
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing validation classes
    field.classList.remove('is-valid', 'is-invalid');
    
    // Remove existing feedback
    const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    } else if (value) {
        // Validate based on field type
        switch (fieldName) {
            case 'fullName':
                if (!validationPatterns.name.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid name (2-50 characters, letters only).';
                }
                break;
            case 'phone':
                if (!validationPatterns.phone.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 10-digit phone number.';
                }
                break;
            case 'email':
                if (!validationPatterns.email.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
            case 'goldWeight':
                if (!validationPatterns.weight.test(value) || parseFloat(value) <= 0) {
                    isValid = false;
                    errorMessage = 'Please enter a valid weight (greater than 0).';
                }
                break;
        }
    }
    
    // Apply validation styling
    if (isValid) {
        field.classList.add('is-valid');
    } else {
        field.classList.add('is-invalid');
        
        // Add error message
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = errorMessage;
        field.parentNode.appendChild(feedback);
    }
    
    return isValid;
}

function clearValidation(e) {
    const field = e.target;
    field.classList.remove('is-valid', 'is-invalid');
    
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.remove();
    }
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    e.target.value = value;
}

function formatWeightInput(e) {
    let value = e.target.value;
    // Allow only numbers and one decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    e.target.value = value;
}

function calculateGoldValue() {
    const formData = new FormData(calculatorForm);
    const weight = parseFloat(formData.get('goldWeight'));
    const carat = formData.get('goldCarat');
    
    // Get the rate for the selected carat
    const ratePerGram = goldRates[carat];
    
    // Calculate total value
    const totalValue = weight * ratePerGram;
    
    // Update result elements
    totalValueElement.textContent = Math.round(totalValue).toLocaleString('en-IN');
    resultWeightElement.textContent = weight;
    resultCaratElement.textContent = carat.toUpperCase();
    resultRateElement.textContent = ratePerGram.toLocaleString('en-IN');
    
    // Store calculation data for potential use
    window.lastCalculation = {
        weight: weight,
        carat: carat,
        rate: ratePerGram,
        total: totalValue,
        customerData: {
            name: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            city: formData.get('city')
        }
    };
}

function showResults() {
    // Add loading animation
    const submitButton = calculatorForm.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    setTimeout(() => {
        // Remove loading animation
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        
        // Show results with animation
        resultsSection.style.display = 'block';
        resultsSection.classList.add('success-animation');
        
        // Scroll to results
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Trigger confetti effect
        createConfetti();
        
    }, 1500);
}

function updateGoldRatesDisplay() {
    // Update rate displays
    document.getElementById('rate24k').textContent = goldRates['24k'].toLocaleString('en-IN');
    document.getElementById('rate22k').textContent = goldRates['22k'].toLocaleString('en-IN');
    document.getElementById('rate18k').textContent = goldRates['18k'].toLocaleString('en-IN');
    document.getElementById('rateSilver').textContent = goldRates['silver'].toLocaleString('en-IN');
}

function addFormValidation() {
    // Add Bootstrap validation classes
    calculatorForm.classList.add('needs-validation');
    
    // Prevent form submission if invalid
    calculatorForm.addEventListener('submit', function(e) {
        if (!calculatorForm.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
        }
        calculatorForm.classList.add('was-validated');
    });
}

function createGoldParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'gold-particles';
    document.body.appendChild(particleContainer);
    
    // Create floating gold particles
    setInterval(() => {
        if (Math.random() < 0.3) {
            const particle = document.createElement('div');
            particle.className = 'gold-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            particleContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 8000);
        }
    }, 2000);
}

function createConfetti() {
    // Simple confetti effect
    const colors = ['#ffc107', '#ffeb3b', '#ff9800', '#f57c00'];
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear forwards`;
        
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 4000);
}

// Add confetti animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Rate update simulation (in real application, this would fetch from API)
function simulateRateUpdates() {
    setInterval(() => {
        // Simulate small rate fluctuations
        Object.keys(goldRates).forEach(carat => {
            const baseRate = goldRates[carat];
            const fluctuation = (Math.random() - 0.5) * 20; // ±10 rupees
            goldRates[carat] = Math.round(baseRate + fluctuation);
        });
        
        updateGoldRatesDisplay();
    }, 30000); // Update every 30 seconds
}

// Initialize rate updates
simulateRateUpdates();

// Export functions for potential external use
window.GoldCalculator = {
    calculateValue: calculateGoldValue,
    updateRates: updateGoldRatesDisplay,
    getCurrentRates: () => ({ ...goldRates }),
    getLastCalculation: () => window.lastCalculation
};