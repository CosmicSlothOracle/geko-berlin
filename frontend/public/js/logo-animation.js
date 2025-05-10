document.addEventListener('DOMContentLoaded', function() {
    const staticLogo = document.querySelector('.static-logo');
    const animatedLogo = document.querySelector('.animated-logo');
    const staticLogo2 = document.querySelector('.static-logo-2');
    let isAnimating = false;
    // Duration of the GIF in ms (adjust to actual GIF length)
    const GIF_DURATION = 2000;

    if (staticLogo && animatedLogo && staticLogo2) {
        staticLogo2.style.display = 'none';
        staticLogo2.classList.remove('visible');
        staticLogo.addEventListener('click', function() {
            if (isAnimating) return;
            isAnimating = true;
            // Fade out static logo
            staticLogo.classList.add('fade-out');
            // Show and fade in animated logo
            animatedLogo.classList.add('visible');
            // Reset GIF by re-assigning src
            const src = animatedLogo.src;
            animatedLogo.style.display = 'none';
            animatedLogo.offsetHeight; // force reflow
            animatedLogo.src = '';
            animatedLogo.src = src;
            animatedLogo.style.display = 'block';
            // After GIF duration, show static logo 2 with fade-in
            setTimeout(function() {
                animatedLogo.classList.remove('visible');
                animatedLogo.style.display = 'none';
                staticLogo2.style.display = 'block';
                setTimeout(function() {
                    staticLogo2.classList.add('visible');
                    isAnimating = false;
                }, 10); // allow display:block to apply before opacity
            }, GIF_DURATION);
        });
    }
});