document.querySelectorAll("textarea").forEach(function (textarea) {
    textarea.style.height = textarea.scrollHeight + "px";
    textarea.style.overflowY = "hidden";

    textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });
});

function copyToClipboard() {
    navigator.clipboard
        .writeText(document.getElementById("output").textContent)
        .then(() => {
            showMessage("複製成功");
        })
        .catch(() => {
            showMessage("發生了未知的問題");
        });
}

function replaceNewLine(element) {
    element.value = element.value.replace(/\n/g, '');
}