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