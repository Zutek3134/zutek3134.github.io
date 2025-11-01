const PageLoader = {
    config: {
        includesPath: '/includes/',
        colourSchemeStorageKey: 'preferredColourScheme',
        websiteName: "Zutek’s Secret Warehouse"
    },

    init() {
        this.currentScript = document.querySelector('script[src="/includes/includes.js"]');
        this.navFullHeight = 96;
        this.footerFullHeight = 208;
        this.initLazyLoading();
        this.loadContents();
    },

    async loadHTML(id, file) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const data = await response.text();

            const element = document.getElementById(id);
            if (element) {
                element.innerHTML += data;

                if (id === 'nav-placeholder') this.navScript();
                else if (id === 'footer-placeholder') this.footerScript();
            }
        } catch (error) {
            console.error('Load HTML error:', error);
        }
    },

    loadContents() {
        this.loadHTML('nav-placeholder', `${this.config.includesPath}nav.html`);
        this.loadHTML('footer-placeholder', `${this.config.includesPath}footer.html`);
    },

    async navScript() {
        try {
            const data = await this.fetchJson(`${this.config.includesPath}includes.json`);

            this.displayLanguage(data, 'footer', 'footerTitle-');
            this.setupNavTitle();
            this.setupScrollHandlers();
            this.setupColourScheme();
            await this.setupLanguageSwitch();

            const nav = document.querySelector('#nav-placeholder');
            document.getElementById('navQrCode')
                .classList.toggle('display-none', !nav?.hasAttribute('data-qr'));

            const observer = new ResizeObserver(entries => {
                this.navFullHeight = entries[0].contentRect.height;
                this.setCssVariable('--nav-height', this.navFullHeight + 'px');
                observer.disconnect();
            });
            observer.observe(nav);
        } catch (error) {
            console.error('Nav script error:', error);
        }
    },

    determineCurrentLang() {
        let lang = document.documentElement.lang || 'en';
        return lang === 'zh' ? 'zh-tw' : lang === 'vi' ? 'en' : lang;
    },

    async fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        return response.json();
    },

    displayLanguage(data, type, prefix) {
        const thisPageURL = location.pathname.replace('index.html', '');
        const elements = document.querySelector(type)?.querySelectorAll('a');
        if (!elements) return;

        const currentLang = this.determineCurrentLang();

        elements.forEach(element => {
            const idname = element.id.replace(prefix, '');
            if (!data[idname]) return;

            element.textContent = data[idname][currentLang];

            let href = data[idname].absoUrl ? '' :
                (currentLang === 'zh-tw' ? '/zh-tw' : '');
            href += data[idname].href;

            if (href === thisPageURL) {
                element.classList.add('disabled');
            } else {
                element.href = href;
            }

            if (href.startsWith('https')) {
                element.target = '_blank';
            }
        });
    },

    setupNavTitle() {
        const navTitle = document.getElementById('navTitle');
        const pageTitle = document.querySelector("h1");
        if (!navTitle || !pageTitle) return;

        const pageTitleText = pageTitle.innerHTML;
        const pageTitleOverride = navTitle.title || '';
        this.pageTitleScrollOffset = pageTitle.offsetTop;
        this.isPageTitleActive = false;

        navTitle.innerHTML = pageTitleOverride || this.config.websiteName;
    },

    setupScrollHandlers() {
        const navScrollTop = document.getElementById("navScrollTop");
        if (navScrollTop) {
            navScrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    },

    handleScroll() {
        const currentScrollPos = window.scrollY;
        const navTitle = document.getElementById('navTitle');
        const navScrollTop = document.getElementById("navScrollTop");
        if (!navTitle || !navScrollTop) return;

        const pageTitleOverride = navTitle.title || '';
        if (pageTitleOverride) return;

        if (currentScrollPos > this.pageTitleScrollOffset && !this.isPageTitleActive) {
            navScrollTop.classList.remove('display-none');
            this.switchNavTitle(navTitle, document.querySelector("h1").innerHTML, true);
        } else if (currentScrollPos <= this.pageTitleScrollOffset && this.isPageTitleActive) {
            navScrollTop.classList.add('display-none');
            this.switchNavTitle(navTitle, this.config.websiteName, false);
        }
    },

    switchNavTitle(element, text, state) {
        element.style.opacity = 0;
        setTimeout(() => {
            element.innerHTML = text;
            element.style.opacity = 1;
            this.isPageTitleActive = state;
        }, 200);
    },

    setupColourScheme() {
        const navModeSwitch = document.getElementById("navModeSwitch");
        if (!navModeSwitch) return;

        this.restoreColourSchemePreference();
        navModeSwitch.addEventListener("click", () => this.toggleColourScheme());
    },

    getSystemColourScheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },

    restoreColourSchemePreference() {
        const scheme = localStorage.getItem(this.config.colourSchemeStorageKey) ||
            this.getSystemColourScheme();
        document.documentElement.setAttribute("data-colour-scheme", scheme);
    },

    toggleColourScheme() {
        const currentScheme = document.documentElement.getAttribute("data-colour-scheme");
        const newScheme = currentScheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-colour-scheme", newScheme);
        localStorage.setItem(this.config.colourSchemeStorageKey, newScheme);
    },

    async setupLanguageSwitch() {
        try {
            const data = await this.fetchJson(`${this.config.includesPath}pages.json`);
            const langDir = '/zh-tw';
            const languageSwitch = document.getElementById('navLangSwitch');
            if (!languageSwitch) return;

            const currentPath = location.pathname.replace('index.html', '').replace('.html', '');
            const newPath = currentPath.includes(langDir) ?
                currentPath.replace(langDir, '') :
                `${langDir}${currentPath}`;

            languageSwitch.style.display = data[currentPath] ? 'inline-flex' : 'none';
            if (data[currentPath]) languageSwitch.href = newPath;
        } catch (error) {
            console.error('Language switch error:', error);
        }
    },

    footerScript() {
        const footer = document.querySelector('#footer-placeholder');
        if (!footer) return;

        const observer = new ResizeObserver(entries => {
            this.footerFullHeight = entries[0].contentRect.height;
            this.setCssVariable('--footer-height', this.footerFullHeight + 'px');
            observer.disconnect();
        });
        observer.observe(footer);

        if (this.currentScript?.hasAttribute('data-comments')) {
            this.loadCommentScript();
        }

        this.bulkLoadLazyImg();
    },

    loadCommentScript() {
        const supportedLangs = [
            "ar", "be", "bg", "ca", "cs", "da", "de", "en", "eo", "es",
            "eu", "fa", "fr", "gr", "hbs", "he", "hu", "id", "it", "ja",
            "kh", "ko", "nl", "pl", "pt", "ro", "ru", "th", "tr", "vi",
            "uk", "uz", "zh-CN", "zh-TW", "zh-HK"
        ];

        let userLang = navigator.language || navigator.userLanguage;
        userLang = supportedLangs.includes(userLang) ? userLang : "en";

        const scriptInfo = {
            "src": "https://giscus.app/client.js",
            "data-repo": "Zutek3134/zutek3134.github.io",
            "data-repo-id": "R_kgDOJClm4g",
            "data-category": "Website Comments",
            "data-category-id": "DIC_kwDOJClm4s4Cm-YH",
            "data-mapping": "pathname",
            "data-strict": "1",
            "data-reactions-enabled": "1",
            "data-emit-metadata": "0",
            "data-input-position": "top",
            "data-theme": "preferred_color_scheme",
            "data-lang": userLang,
            "data-loading": "lazy",
            "crossorigin": "anonymous",
            "async": "true"
        };

        const newScript = document.createElement('script');
        Object.entries(scriptInfo).forEach(([key, value]) => {
            newScript.setAttribute(key, value);
        });

        newScript.onload = () => console.log('Comment section loaded successfully.');
        newScript.onerror = () => console.error('Error loading comment section');

        const footerHolder = document.querySelector('footer');
        if (footerHolder) {
            const commentSectionHolder = document.createElement('div');
            commentSectionHolder.classList.add('footer', 'bordered-bottom');
            commentSectionHolder.innerHTML = `
                <div class="container pad-0">
                    <details class="alert-chat mar-0">
                        <summary>留言區</summary>
                        <div class="giscus"></div>
                    </details>
                </div>`;
            footerHolder.insertBefore(commentSectionHolder, footerHolder.lastElementChild);
        }

        document.body.append(newScript);
        this.loadDetailsScript();
    },

    loadDetailsScript() {
        const detailsScriptSrc = '/js/details/script.js';
        this.loadScript(detailsScriptSrc, enhanceDetails);
    },

    loadScript(src, callback = (() => { }), async = true, defer = false) {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer;

        script.onload = () => {
            script.dataset.loaded = 'true';
            callback();
        };

        script.onerror = (err) => {
            console.error(`Error loading script: ${src}`, err);
        };

        document.head.appendChild(script);
    },

    initLazyLoading() {
        if (!("IntersectionObserver" in window)) {
            this.advancedLazyLoading = false;
            return;
        }

        this.advancedLazyLoading = true;
        this.lazyImageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            const newImg = new Image();
                            newImg.onerror = function () {
                                if (img.parentElement.classList.contains('clickable-image'))
                                    img.parentElement.parentElement.remove();
                                else
                                    img.parentElement.remove();
                            }
                            newImg.onload = function () {
                                img.src = img.dataset.src;

                                setTimeout(() => {
                                    img.parentElement.classList.add('loaded');
                                    img.removeAttribute("data-src");
                                }, 300);
                            };
                            newImg.src = img.dataset.src;
                            this.lazyImageObserver.unobserve(img);
                        }
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px 100px 0px" }
        );
    },

    bulkLoadLazyImg() {
        const lazyImages = document.querySelectorAll(".lazy-image-container img");
        lazyImages.forEach(img => this.loadLazyImg(img));
    },

    loadLazyImg(img) {
        if (this.advancedLazyLoading) {
            this.lazyImageObserver.observe(img);
        } else {
            if (img.dataset.src) {
                img.src = img.dataset.src;

                setTimeout(() => {
                    img.parentElement.classList.add('loaded');
                    img.removeAttribute("data-src");
                }, 300);
            }
        }
    },

    setCssVariable(name, value) {
        document.documentElement.style.setProperty(name, value);
    },

    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
};

window.loadScript = (...args) => PageLoader.loadScript(...args);
window.randomInRange = (...args) => PageLoader.randomInRange(...args);
window.setCssVariable = (...args) => PageLoader.setCssVariable(...args);
window.loadLazyImg = (...args) => PageLoader.loadLazyImg(...args);
window.bulkLoadLazyImg = (...args) => PageLoader.bulkLoadLazyImg(...args);

document.addEventListener('DOMContentLoaded', () => PageLoader.init());