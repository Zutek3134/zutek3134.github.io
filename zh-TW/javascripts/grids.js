function convertMarkdownToHTML(markdownText) {
    const lines = markdownText.split('\n');
    let htmlOutput = '<div class="grid-container">';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('- ')) {
            htmlOutput += `<div class="grid-item">`;
            const imgSrc = lines[i].replace('-', '').trim();
            if (imgSrc.length > 1) htmlOutput += `<img src="` + imgSrc + `" alt="">`;
            htmlOutput += `<h3>` + lines[i + 1].trim() + `</h3>`;
            const description = !lines[i + 2].startsWith('- ') ? `<p>` + lines[i + 2].trim() + `</p>` : ``;
            htmlOutput += description + `</div>`;

            // Skip the lines that were used for this grid item
            i += 1;
        }
    }

    htmlOutput += '</div>';
    return htmlOutput;
}

const markdownInput = document.getElementById('myGrids');
if (markdownInput != null) {
    const markdownText = markdownInput.innerHTML;
    const markdownOutput = document.getElementById('myGrids');
    const htmlOutput = convertMarkdownToHTML(markdownText);
    markdownOutput.innerHTML = htmlOutput;
}