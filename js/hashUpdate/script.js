const sections = document.querySelectorAll("section[id]");
let topOffset = document.documentElement.style.getPropertyValue('--nav-height').replace('px', '');
let curId = "";
let lastScrollY = window.scrollY;

document.addEventListener("scroll", () => {
    if (topOffset < 1)
        topOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 0;

    let scrollDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;

    let visibleSections = Array.from(sections).filter(section => {
        let rect = section.getBoundingClientRect();
        return rect.bottom > topOffset && rect.top < window.innerHeight;
    });

    if (visibleSections.length === 0) return;

    let target = visibleSections.find(section => {
        let rect = section.getBoundingClientRect();
        let mid = window.innerHeight / 2;
        return rect.top <= mid && rect.bottom >= mid ||
            rect.top <= topOffset + mid && rect.bottom >= topOffset + mid;
    });

    if (!target) target = scrollDown ? visibleSections[0] : visibleSections[visibleSections.length - 1];

    if (location.hash !== "#" + target.id) {
        history.replaceState(null, "", "#" + target.id);
    }
});