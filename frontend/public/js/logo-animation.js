document.addEventListener('DOMContentLoaded', function() {
    const staticLogo = document.querySelector('.static-logo');
    const staticLogo2 = document.querySelector('.static-logo-2');
    if (staticLogo && staticLogo2) {
        staticLogo.addEventListener('click', function() {
            staticLogo.classList.add('fade-out');
            staticLogo2.classList.add('visible');
        });
        staticLogo2.addEventListener('click', function() {
            staticLogo2.classList.remove('visible');
            staticLogo.classList.remove('fade-out');
        });
    }
});