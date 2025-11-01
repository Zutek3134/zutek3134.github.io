(function () {
    const DEBOUNCE_DELAY = 200;
    const HEIGHT_LIMIT_REM = 20;
    const STYLE_ID = 'autocomplete-styles';

    function applyReplacements(str, replaceConfig) {
        if (!replaceConfig) return str;
        let result = str;

        if (Array.isArray(replaceConfig.stringReplace)) {
            replaceConfig.stringReplace.forEach(({ from, to }) => {
                const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                result = result.replace(new RegExp(escapedFrom, 'g'), to);
            });
        }

        if (typeof replaceConfig.exactReplace === 'object' && replaceConfig.exactReplace !== null) {
            if (Object.prototype.hasOwnProperty.call(replaceConfig.exactReplace, result)) {
                result = replaceConfig.exactReplace[result];
            }
        }

        return result;
    }

    function hideSuggestions(suggestionsBox) {
        suggestionsBox.style.opacity = '0';
        suggestionsBox.style.height = '0';

        setTimeout(() => {
            suggestionsBox.style.display = 'none';
        }, 300);
    }

    function forceReflow(el) {
        return el.offsetHeight;
    }

    function showSuggestions(suggestionsBox, heightLimit) {
        suggestionsBox.style.display = 'block';
        suggestionsBox.scrollTop = 0;

        forceReflow(suggestionsBox);
        const newHeight = Math.min(suggestionsBox.scrollHeight, heightLimit);

        forceReflow(suggestionsBox);
        void suggestionsBox.offsetWidth;
        suggestionsBox.style.opacity = '1';
        suggestionsBox.style.height = `${newHeight}px`;
    }

    function initAutocomplete(inputElement, normalizedSuggestions, replaceConfig) {
        if (!(inputElement instanceof HTMLInputElement)) return;

        const suggestionsBox = document.createElement('div');
        suggestionsBox.classList.add('autocomplete-suggestions');
        inputElement.parentNode.appendChild(suggestionsBox);

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const heightLimit = HEIGHT_LIMIT_REM * rootFontSize;

        let currentQuery = '';
        let debounceTimer = null;

        suggestionsBox.addEventListener('click', (e) => {
            const target = e.target.closest('div');
            if (target) {
                inputElement.value = target.textContent;
                inputElement.focus();
                hideSuggestions(suggestionsBox);
            }
        });

        inputElement.addEventListener('input', () => {
            const rawQuery = inputElement.value.trim();
            const processedQuery = applyReplacements(rawQuery, replaceConfig).toLowerCase();

            if (processedQuery === currentQuery) return;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentQuery = processedQuery;
                suggestionsBox.innerHTML = '';

                if (processedQuery) {
                    const filtered = normalizedSuggestions.filter(item =>
                        item.processedLower.includes(processedQuery)
                    );

                    if (filtered.length) {
                        const fragment = document.createDocumentFragment();
                        filtered.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = item.processedValue;
                            fragment.appendChild(div);
                        });
                        suggestionsBox.appendChild(fragment);
                        showSuggestions(suggestionsBox, heightLimit);
                    } else {
                        hideSuggestions(suggestionsBox);
                    }
                } else {
                    hideSuggestions(suggestionsBox);
                }
            }, DEBOUNCE_DELAY);
        });

        document.addEventListener('click', (e) => {
            if (!inputElement.contains(e.target) && !suggestionsBox.contains(e.target)) {
                hideSuggestions(suggestionsBox);
            }
        });

        inputElement.addEventListener('blur', () => {
            setTimeout(() => hideSuggestions(suggestionsBox), 200);
        });
    }

    function addAutocompleteStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .autocomplete-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                height: 0;
                opacity: 0;
                overflow-y: auto;
                border-radius: var(--gap-half);
                margin-top: 10px;
                background-color: rgba(var(--card-bg-rgb), 0.7);
                -webkit-backdrop-filter: blur(var(--gap-half));
                backdrop-filter: blur(var(--gap-half));
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
                z-index: 10;
                display: none;
                transition: opacity 0.15s ease-in-out, height 0.3s ease-in-out;
            }

            .autocomplete-suggestions div {
                padding: 1em 0.75em;
                cursor: pointer;
            }

            .autocomplete-suggestions div:not(:last-child) {
                border-bottom: 1px dashed var(--border);
            }

            .autocomplete-suggestions div:hover {
                background-color: var(--secondary);
                color: var(--bg);
            }
        `;
        document.head.appendChild(style);
    }

    function setupAutocomplete(inputElement, suggestions, replaceConfig = {}) {
        if (!(inputElement instanceof HTMLInputElement) || !Array.isArray(suggestions)) return;

        const safeReplaceConfig = {
            stringReplace: Array.isArray(replaceConfig.stringReplace) ? replaceConfig.stringReplace : [],
            exactReplace: typeof replaceConfig.exactReplace === 'object' && replaceConfig.exactReplace !== null
                ? replaceConfig.exactReplace
                : {}
        };

        const normalizedSuggestions = suggestions.map(item => {
            const processedValue = applyReplacements(item, safeReplaceConfig);
            return {
                processedValue: processedValue,
                processedLower: processedValue.toLowerCase()
            };
        });

        initAutocomplete(inputElement, normalizedSuggestions, safeReplaceConfig);
    }

    window.setupAutocomplete = setupAutocomplete;
    addAutocompleteStyles();
})();