document.addEventListener('DOMContentLoaded', function() {
    const staticLogo = document.querySelector('.static-logo');
    const animatedLogo = document.querySelector('.animated-logo');
    let isAnimating = false;
    // Duration of the GIF in ms (adjust to actual GIF length)
    const GIF_DURATION = 2000;

    // Ensure initial state
    if (staticLogo && animatedLogo) {
        staticLogo.style.opacity = '1';
        staticLogo.style.display = 'block';
        staticLogo.classList.remove('fade-out');
        staticLogo.style.pointerEvents = 'auto';

        animatedLogo.style.opacity = '0';
        animatedLogo.style.display = 'none';
        animatedLogo.classList.remove('visible');

        staticLogo.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            staticLogo.classList.add('fade-out');
            animatedLogo.classList.add('visible');
            // Reset GIF
            const src = animatedLogo.src;
            animatedLogo.style.display = 'none';
            animatedLogo.offsetHeight;
            animatedLogo.src = '';
            animatedLogo.src = src;
            animatedLogo.style.display = 'block';
            setTimeout(function() {
                animatedLogo.classList.add('visible');
                isAnimating = false;
            }, GIF_DURATION);
        });
    }
});