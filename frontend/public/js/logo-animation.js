document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo');
    let isAnimating = false;

    if (logo) {
        logo.addEventListener('click', function() {
            if (!isAnimating) {
                // Start animation
                this.classList.add('animated');
                isAnimating = true;
            } else {
                // Stop animation
                this.classList.remove('animated');
                isAnimating = false;
            }
        });
    }
});