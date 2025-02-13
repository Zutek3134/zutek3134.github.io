function tabSelect(id, button) {
    const container = button.closest('[data-tab-category]');
    const tabBar = container.querySelector('.tab-nav-inner');
    const underline = tabBar.querySelector('.tab-underline');

    container.querySelectorAll('[data-tab-id]').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab-id') === id);
    });

    const buttons = tabBar.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const buttonRect = button.getBoundingClientRect();
    const tabBarRect = tabBar.getBoundingClientRect();
    const scrollOffset = tabBar.scrollLeft;

    underline.style.width = `${buttonRect.width}px`;
    underline.style.transform = `translateX(${buttonRect.left - tabBarRect.left + scrollOffset}px)`;
}

function initTabs(tabNav) {
    const tabNavInner = tabNav.querySelector('.tab-nav-inner');
    const underline = tabNavInner.querySelector('.tab-underline');
    const activeButton = tabNav.querySelector('.tab-button.active');
    const activeTab = tabNav.querySelector('[data-tab-id].active');
    const firstButton = tabNav.querySelector('.tab-button');
    const firstTab = tabNav.querySelector('[data-tab-id]');

    const buttonToActivate = activeButton || firstButton;
    const tabToActivate = activeTab || firstTab;

    if (buttonToActivate && tabToActivate) {
        buttonToActivate.classList.add('active');
        tabToActivate.classList.add('active');

        const buttonRect = buttonToActivate.getBoundingClientRect();
        const navInnerRect = tabNavInner.getBoundingClientRect();
        underline.style.width = `${buttonRect.width}px`;
        underline.style.transform = `translateX(${buttonRect.left - navInnerRect.left}px)`;
    }
}

document.querySelectorAll('[data-tab-category]').forEach(initTabs);

document.querySelectorAll('[data-tab-id]').forEach(tab => {
    const observer = new MutationObserver(() => {
        if (tab.classList.contains('active')) {
            tab.querySelectorAll('[data-tab-category]').forEach(initTabs);
        }
    });
    observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
});
