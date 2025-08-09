// Dropdown Enhancement Script
// Ensures dropdowns work properly with both click and hover

document.addEventListener('DOMContentLoaded', function() {
    // Get all dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(function(toggle) {
        // Ensure the dropdown toggle has proper attributes
        if (!toggle.hasAttribute('data-bs-toggle')) {
            toggle.setAttribute('data-bs-toggle', 'dropdown');
        }
        
        // Add click event listener to ensure dropdown works
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the dropdown menu
            const dropdownMenu = this.nextElementSibling;
            
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                // Toggle the show class
                dropdownMenu.classList.toggle('show');
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(function(menu) {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                    }
                });
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(function(menu) {
                menu.classList.remove('show');
            });
        }
    });
    
    // Handle hover for desktop
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function(dropdown) {
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 991) { // Only on desktop
                const menu = this.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.add('show');
                }
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 991) { // Only on desktop
                const menu = this.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.remove('show');
                }
            }
        });
    });
});