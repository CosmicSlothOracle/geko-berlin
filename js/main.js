// Admin Login Funktionalität
document.addEventListener('DOMContentLoaded', function () {
    const adminButton = document.getElementById('admin-login-button');
    const adminModal = document.getElementById('admin-login-modal');
    const closeBtn = adminModal.querySelector('.close');
    const loginForm = document.getElementById('admin-login-form');

    // Modal öffnen
    adminButton.addEventListener('click', function () {
        adminModal.style.display = 'block';
    });

    // Modal schließen
    closeBtn.addEventListener('click', function () {
        adminModal.style.display = 'none';
    });

    // Modal schließen wenn außerhalb geklickt wird
    window.addEventListener('click', function (event) {
        if (event.target == adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // Login Formular absenden
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        // Hier können Sie die Login-Logik implementieren
        console.log('Login attempt:', username);

        // Beispiel für eine einfache Validierung
        if (username === 'admin' && password === 'password') {
            alert('Login erfolgreich!');
            adminModal.style.display = 'none';
            // Hier können Sie zur Admin-Seite weiterleiten
            // window.location.href = '/admin';
        } else {
            alert('Ungültige Anmeldedaten!');
        }
    });
});