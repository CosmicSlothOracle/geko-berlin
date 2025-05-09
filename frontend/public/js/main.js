// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        if (mainNav && mainNav.classList.contains('active') &&
            !e.target.closest('.main-nav') && !e.target.closest('.hamburger')) {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });
});

// Enhanced Modal Functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'block';
    // Trigger reflow
    modal.offsetHeight;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300); // Match transition duration
}

// Admin Login Functionality with enhanced UX
document.addEventListener('DOMContentLoaded', function() {
    const adminButton = document.getElementById('admin-login-button');
    const adminModal = document.getElementById('admin-login-modal');
    const closeBtn = adminModal?.querySelector('.close');
    const loginForm = document.getElementById('admin-login-form');

    if (adminButton && adminModal) {
        adminButton.addEventListener('click', () => showModal('admin-login-modal'));
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => hideModal('admin-login-modal'));
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target.id);
        }
    });

    // Enhanced form submission with loading state
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            try {
                submitBtn.classList.add('btn--loading');
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (username === 'admin' && password === 'password') {
                    hideModal('admin-login-modal');
                    // Redirect or show success message
                } else {
                    throw new Error('Invalid credentials');
                }
            } catch (error) {
                alert(error.message || 'Login failed');
            } finally {
                submitBtn.classList.remove('btn--loading');
            }
        });
    }
});

// Slideshow functionality
function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => {
            slide.style.opacity = '0';
            slide.classList.remove('active');
        });

        setTimeout(() => {
            slides[index].classList.add('active');
            slides[index].style.opacity = '1';
        }, 50);
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Initial state
    if (slides.length) {
        showSlide(currentSlide);
        setInterval(nextSlide, 5000);
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
});