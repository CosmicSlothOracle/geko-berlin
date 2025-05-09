// Admin Login Functionality
document.addEventListener('DOMContentLoaded', function () {
    const adminButton = document.getElementById('admin-login-button');
    const modal = document.getElementById('admin-login-modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const loginForm = document.getElementById('admin-login-form');

    // Open modal
    if (adminButton) {
        adminButton.onclick = function () {
            modal.style.display = "block";
        }
    }

    // Close modal when clicking the X
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = "none";
        }
    }

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Handle form submission
    if (loginForm) {
        loginForm.onsubmit = async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple validation
            if (!username || !password) {
                alert('Bitte füllen Sie alle Felder aus.');
                return;
            }

            try {
                const response = await fetch('https://kosge-backend.onrender.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    // Set authentication flag
                    sessionStorage.setItem('adminAuthenticated', 'true');
                    // Redirect to admin dashboard
                    window.location.href = 'admin/dashboard.html';
                } else {
                    alert('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        }
    }
});

// API Configuration
const API_BASE_URL = 'https://kosge-backend.onrender.com/api';

// Debug logging
function debugLog(...args) {
    console.log('[KOSGE Admin]', ...args);
}

// Function to load and display banners
async function loadBanners() {
    debugLog('Loading banners...');
    try {
        const response = await fetch(`${API_BASE_URL}/banners`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        debugLog('Received banners:', data);

        // Update banner images in the grid
        const bannerGrid = document.querySelector('.banner-grid');
        if (!bannerGrid) {
            debugLog('Banner grid not found');
            return;
        }

        // Get all banner containers
        const banners = bannerGrid.querySelectorAll('.banner');
        debugLog('Found banner containers:', banners.length);

        if (data.banners && data.banners.length > 0) {
            data.banners.forEach((url, index) => {
                if (index < banners.length) {
                    const img = banners[index].querySelector('img');
                    if (img) {
                        debugLog(`Loading banner ${index + 1}:`, url);
                        // Create new image object to handle loading
                        const newImg = new Image();
                        newImg.onload = function() {
                            img.src = this.src;
                            debugLog(`Banner ${index + 1} loaded successfully`);
                        };
                        newImg.onerror = function() {
                            console.error(`Failed to load image: ${url}`);
                            img.src = 'https://i.postimg.cc/vTW9F8fC/platzhalter.png'; // Fallback image
                            debugLog(`Using fallback image for banner ${index + 1}`);
                        };
                        newImg.src = API_BASE_URL + url;
                    }
                }
            });
        } else {
            debugLog('No banners received from API');
        }
    } catch (error) {
        console.error('Error loading banners:', error);
        debugLog('Error loading banners:', error);
    }
}

// Load banners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM Content Loaded');
    loadBanners();
});

// Refresh banners periodically
setInterval(loadBanners, 30000); // Refresh every 30 seconds