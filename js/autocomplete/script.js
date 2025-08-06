(function () {
    // Function to initialize the autocomplete feature
    function initAutocomplete(inputElement, suggestions) {
        if (!inputElement) return;

        const suggestionsBox = document.createElement('div');
        suggestionsBox.classList.add('autocomplete-suggestions');
        inputElement.parentNode.appendChild(suggestionsBox);
        let currentQuery = '';
        let timer;
        const heightLimit = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize);

        // Event listener for input field
        inputElement.addEventListener('input', function () {
            const query = inputElement.value.toLowerCase();

            if (query === currentQuery)
                return;

            suggestionsBox.innerHTML = ''; // Clear previous suggestions
            currentQuery = query;

            if (query.length > 0) {
                const filteredSuggestions = suggestions.filter(item =>
                    item.toLowerCase().includes(query)
                );

                if (filteredSuggestions.length > 0) {
                    filteredSuggestions.forEach(item => {
                        const div = document.createElement('div');
                        div.textContent = item;
                        div.onclick = function () {
                            inputElement.value = item;
                            suggestionsBox.innerHTML = '';
                        };
                        suggestionsBox.appendChild(div);
                    });

                    suggestionsBox.style.display = 'block';
                    suggestionsBox.scrollTop = 0;
                    suggestionsBox.style.height = (suggestionsBox.scrollHeight > heightLimit ? heightLimit : suggestionsBox.scrollHeight) + 'px';
                    suggestionsBox.style.opacity = 1;
                } else {
                    suggestionsBox.style.height = 0;
                    suggestionsBox.style.opacity = 0;

                }
            } else {
                suggestionsBox.style.height = 0;
                suggestionsBox.style.opacity = 0;
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', function (event) {
            if (!event.target.closest(inputElement.parent)) {
                suggestionsBox.style.opacity = 0;
            }
        });
    }

    // Function to add the necessary styles dynamically
    function addAutocompleteStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .autocomplete-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                height: 0;
                opacity: 0;
                padding: var(--gap-quarter) 0;
                overflow-y: auto;
                border-radius: var(--gap-half);
                margin-top: 10px;
                background-color: rgba(var(--card-bg-rgb), 0.7);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
                z-index: 10;
                display: none;
                transition: opacity 0.15s ease-in-out, height 0.3s ease-in-out;
            }

            .autocomplete-suggestions div {
                padding: var(--gap-half);
                cursor: pointer;
            }

            .autocomplete-suggestions div:hover {
                background-color: var(--secondary);
                color: var(--bg);
            }
        `;
        document.head.appendChild(style);
    }

    // Function to initialize autocomplete on any input field
    function setupAutocomplete(inputElement, suggestions) {
        if (inputElement && Array.isArray(suggestions)) {
            initAutocomplete(inputElement, suggestions);
        }
    }

    // Expose the `setupAutocomplete` function globally
    window.setupAutocomplete = setupAutocomplete;

    // Add styles only once to the page
    if (!document.querySelector('.autocomplete-suggestions')) {
        addAutocompleteStyles();
    }
})();
