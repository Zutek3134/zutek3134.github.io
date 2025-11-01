function smartResizeTextarea() {
    document.querySelectorAll("textarea:not([data-setup=true])").forEach(textarea => {
        textarea.dataset.setup = true;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = "hidden";

        textarea.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = `${this.scrollHeight}px`;
        });
    });
}
window.smartResizeTextarea = smartResizeTextarea;

smartResizeTextarea();

function copyToClipboard() {
    const outputElement = document.getElementById("output");
    if (!outputElement) {
        showMessage("未找到输出内容元素");
        return;
    }

    navigator.clipboard
        .writeText(outputElement.textContent)
        .then(() => showMessage("複製成功"))
        .catch(() => showMessage("發生了未知的問題"));
}
window.copyToClipboard = copyToClipboard;

function replaceNewLine(element) {
    if (!element || typeof element.value === "undefined") {
        return;
    }
    element.value = element.value.replace(/\n/g, "");
}