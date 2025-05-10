document.addEventListener('DOMContentLoaded', function() {
    const staticLogo = document.querySelector('.static-logo');
    const staticLogo2 = document.querySelector('.static-logo-2');
    let isAnimating = false;

    if (staticLogo && staticLogo2) {
        staticLogo2.style.display = 'none';
        staticLogo2.classList.remove('visible');
        staticLogo.style.opacity = 1;
        staticLogo2.style.opacity = 0;

        staticLogo.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            staticLogo.classList.add('fade-out');
            setTimeout(function() {
                staticLogo.style.display = 'none';
                staticLogo2.style.display = 'block';
                setTimeout(function() {
                    staticLogo2.classList.add('visible');
                    isAnimating = false;
                }, 10);
            }, 700); // match CSS transition
        });

        staticLogo2.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            staticLogo2.classList.remove('visible');
            setTimeout(function() {
                staticLogo2.style.display = 'none';
                staticLogo.style.display = 'block';
                setTimeout(function() {
                    staticLogo.classList.remove('fade-out');
                    isAnimating = false;
                }, 10);
            }, 700); // match CSS transition
        });
    }
});