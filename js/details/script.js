enhanceDetails();

function enhanceDetails() {
    const details = document.querySelectorAll("details");

    details.forEach((detail, d) => {
        const processed = detail.classList.contains('details');
        const initialized = detail.classList.contains('details-init');
        if (processed) return false;

        const outer = document.createElement("div");
        outer.classList.add("details-content");
        const inner = document.createElement("div");
        inner.classList.add("details-content-inner");

        const children = [...detail.children];
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.nodeName.toLowerCase() !== "summary") inner.append(child);
        }
        outer.append(inner);
        detail.append(outer);

        const summary = detail.querySelector("summary");
        const detailsTitleContent = summary.innerHTML;
        summary.innerHTML = "";

        if (!detail.classList.contains('details-no-icon')) {
            const detailsIcon = document.createElement("div");
            detailsIcon.classList.add('details-icon');
            summary.append(detailsIcon);
        }

        const detailsTitle = document.createElement("p");
        detailsTitle.classList.add('details-title');
        detailsTitle.innerHTML = detailsTitleContent;
        summary.append(detailsTitle);

        const marker = document.createElement("div");
        marker.classList.add('summary-marker');
        summary.append(marker);

        summary.classList.add("summary");

        let expanded = detail.hasAttribute("open");

        if (expanded) {
            detail.classList.add("expanded");
            summary.classList.add("summary-expanded");
        }

        const style = window.getComputedStyle(outer);
        const delay = parseFloat(style.transitionDelay);
        const duration = parseFloat(style.transitionDuration) + delay;

        summary.addEventListener("click", (e) => {
            e.preventDefault();
            const current = e.currentTarget;
            const detail = current.closest("details");
            expanded = detail.hasAttribute("open");

            if (!initialized) detail.classList.remove('details-init');

            if (expanded) {
                detail.classList.remove("expanded");

                setTimeout(() => {
                    detail.open = false;
                }, duration * 1000);
            }
            else if (!expanded) {
                detail.open = true;
                timeout = setTimeout(() => {
                    detail.classList.add("expanded");
                    detail.classList.remove("collapsed");
                }, 10);
            }
        });

        detail.classList.add("details", "details-init");
    });
}