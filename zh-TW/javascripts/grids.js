function convertMarkdownToHTML(markdownText) {
    const lines = markdownText.split('\n');
    let htmlOutput = '<div class="grid-container">';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('- ![img]')) {
            const imgSrc = line.match(/\(.*\)/)[0].replace('(', '').replace(')', '');
            const title = lines[i].split('Title')[1].trim();
            const description = lines[i + 1].trim();

            htmlOutput += `<div class="grid-item"><img src="${imgSrc}" alt="Image"><h3>${title}</h3><p>${description}</p></div>`;

            // Skip the lines that were used for this grid item
            i += 1;
        }
    }

    htmlOutput += '</div>';
    return htmlOutput;
}

const markdownInput = document.getElementById('grids');
const markdownText = markdownInput.innerHTML;
const markdownOutput = document.getElementById('grids');
const htmlOutput = convertMarkdownToHTML(markdownText);
markdownOutput.innerHTML = htmlOutput;