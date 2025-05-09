// Admin Login Functionality
document.addEventListener('DOMContentLoaded', function () {
    const adminButton = document.getElementById('admin-login-button');
    const modal = document.getElementById('admin-login-modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const loginForm = document.getElementById('admin-login-form');

    // Open modal
    adminButton.onclick = function () {
        modal.style.display = "block";
    }

    // Close modal when clicking the X
    closeBtn.onclick = function () {
        modal.style.display = "none";
    }

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Handle form submission
    loginForm.onsubmit = function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!username || !password) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }

        // Here you would typically make an API call to verify credentials
        // For demo purposes, we'll use a simple check
        if (username === 'admin' && password === 'password') {
            // Set authentication flag
            sessionStorage.setItem('adminAuthenticated', 'true');
            // Redirect to admin dashboard
            window.location.href = 'admin/dashboard.html';
        } else {
            alert('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
        }
    }
});

const API_BASE = 'http://localhost:5000';

// Function to load and display banners
async function loadBanners() {
    try {
        const response = await fetch(`${API_BASE}/api/banners`);
        const data = await response.json();

        // Update banner images in the grid
        const bannerGrid = document.querySelector('.banner-grid');
        if (!bannerGrid) return;

        // Get all banner containers
        const banners = bannerGrid.querySelectorAll('.banner');

        if (data.banners && data.banners.length > 0) {
            data.banners.forEach((url, index) => {
                if (index < banners.length) {
                    const img = banners[index].querySelector('img');
                    if (img) {
                        // Create new image object to handle loading
                        const newImg = new Image();
                        newImg.onload = function() {
                            img.src = this.src;
                        };
                        newImg.onerror = function() {
                            console.error(`Failed to load image: ${url}`);
                            img.src = 'https://i.postimg.cc/vTW9F8fC/platzhalter.png'; // Fallback image
                        };
                        newImg.src = API_BASE + url;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading banners:', error);
    }
}

// Load banners when the page loads
document.addEventListener('DOMContentLoaded', loadBanners);

// Refresh banners periodically
setInterval(loadBanners, 30000); // Refresh every 30 seconds