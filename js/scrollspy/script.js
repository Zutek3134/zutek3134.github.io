document.addEventListener('DOMContentLoaded', function () {
    const navbarLinks = document.querySelectorAll('.ssp-navbar a');
    const sections = document.querySelectorAll('section');

    function updateActiveLink() {
        let fromTop = window.scrollY + 10;

        navbarLinks.forEach(link => {
            let section = document.querySelector(link.getAttribute('href'));

            if (
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    navbarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetSection = document.querySelector(this.getAttribute('href'));
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
        });
    });

    window.addEventListener('scroll', updateActiveLink);
});