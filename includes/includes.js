function loadHTML(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML += data;
            if (id === 'nav-placeholder') navScript();
            else if (id === 'footer-placeholder') footerScript();
        })
        .catch(error => console.error(error));
}

loadHTML('nav-placeholder', '/includes/nav.html');
loadHTML('footer-placeholder', '/includes/footer.html');

let navFullHeight = 96;
let footerFullHeight = 208;

function navScript() {
    let currentLang = document.documentElement.lang || 'en';
    currentLang = currentLang === 'zh' ? 'zh-tw' : currentLang === 'vi' ? 'en' : currentLang;
    fetch('/includes/includes.json')
        .then(response => response.json())
        .then(data => {
            // displayLanguage(data, '#navPanel', 'navTitle-');
            displayLanguage(data, 'footer', 'footerTitle-');
        })
        .catch(error => console.error('Error loading language data:', error));

    function displayLanguage(data, type, prefix) {
        const thisPageURL = location.pathname.replace('index.html', '');
        const elements = document.querySelector(type).querySelectorAll('a');

        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            const idname = element.id.replace(prefix, '');

            if (!data.hasOwnProperty(idname))
                continue;

            element.textContent = data[idname][currentLang];

            let href = !data[idname]['absoUrl'] ? (currentLang === 'zh-tw' ? '/zh-tw' : '') : '';

            href += data[idname]['href'];

            if (href === thisPageURL)
                element.classList.add('disabled');
            else
                element.href = href;

            if (href.startsWith('https')) {
                element.setAttribute('target', '_blank');
            }
        }
    }

    document.getElementById('mainMenuIcon').href += currentLang === 'zh-tw' ? 'zh-tw/' : '';

    // var prevScrollpos = window.scrollY;

    const navScrollTop = document.getElementById("navScrollTop");
    navScrollTop.onclick = function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    const nav = document.querySelector('#nav-placeholder');
    // const navPanel = document.getElementById('navPanel');
    // navPanel.style.maxHeight = navPanel.scrollHeight + 'px';
    navFullHeight = nav.offsetHeight;

    const navTitle = document.getElementById('navTitle');
    const pageTitle = document.querySelector("h1");
    const pageTitleText = pageTitle.innerHTML;
    const pageTitleTextOverride = nav.title || '';
    const pageTitleitleScrollOffset = pageTitle.offsetTop;
    const websiteName = "Zutek’s Secret Warehouse";
    navTitle.innerHTML = pageTitleTextOverride ? pageTitleTextOverride : websiteName;

    document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');

    let isPageTitleActive = false;

    window.onscroll = function () {
        var currentScrollPos = window.scrollY;
        // if (prevScrollpos > currentScrollPos || (window.innerHeight + window.scrollY) >= document.body.offsetHeight - footerFullHeight) {
        //     navPanel.style.maxHeight = navPanel.scrollHeight + 'px';
        //     document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
        // } else {
        //     navPanel.style.maxHeight = 0;
        //     document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
        // }
        // prevScrollpos = currentScrollPos;

        if (!pageTitleTextOverride) {
            if (currentScrollPos > pageTitleitleScrollOffset && !isPageTitleActive) {
                navScrollTop.classList.remove('display-none');
                navTitle.style.opacity = 0;
                setTimeout(() => {
                    navTitle.innerHTML = pageTitleText;
                    navTitle.style.opacity = 1;
                }, 200);
                isPageTitleActive = true;
            } else if (currentScrollPos <= pageTitleitleScrollOffset && isPageTitleActive) {
                navScrollTop.classList.add('display-none');
                navTitle.style.opacity = 0;
                setTimeout(() => {
                    navTitle.textContent = websiteName;
                    navTitle.style.opacity = 1;
                }, 200);
                isPageTitleActive = false;
            }
        }
    }

    const colourSchemeStorageItemName = "preferredColourScheme";
    const navModeSwitch = document.getElementById("navModeSwitch");

    if (navModeSwitch) {
        restoreColourSchemePreference();
        navModeSwitch.addEventListener("click", toggleColourScheme);
    }

    function getSystemColourScheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function restoreColourSchemePreference() {
        let colourScheme = localStorage.getItem(colourSchemeStorageItemName);
        if (!colourScheme) {
            colourScheme = getSystemColourScheme();
        }
        document.documentElement.setAttribute("data-colour-scheme", colourScheme);
    }

    function toggleColourScheme() {
        const currentScheme = document.documentElement.getAttribute("data-colour-scheme");
        const newScheme = currentScheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-colour-scheme", newScheme);
        localStorage.setItem(colourSchemeStorageItemName, newScheme);
    }

    fetch('/includes/pages.json')
        .then(response => response.json())
        .then(data => {
            const langDir = '/zh-tw';
            const languageSwitch = document.getElementById('navLangSwitch');
            const currentPath = location.pathname.replace('index.html', '').replace('.html', '');
            const newPath = currentPath.includes(langDir) ? currentPath.replace(langDir, '') : `${langDir}${currentPath}`;

            if (data[currentPath]) {
                languageSwitch.style.display = 'inline-flex';
                languageSwitch.href = newPath;
            } else {
                languageSwitch.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading pages.json:', error);
        });
}

function footerScript() {
    const footer = document.querySelector('#footer-placeholder');

    document.documentElement.style.setProperty('--footer-height', footer.offsetHeight + 'px');
    footerFullHeight = footer.offsetHeight;

    const main = document.querySelector('main');

    if (!main)
        return;
}