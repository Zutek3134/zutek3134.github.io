function showSnackbar(message) {
    const snackbar = document.createElement("div");
    snackbar.id = "snackbar";
    snackbar.textContent = message;
    document.getElementById("snackbarHolder").append(snackbar);

    snackbar.classList.add("show");
    setTimeout(() => {
        snackbar.remove();
    }, 2900);
}
window.showSnackbar = showSnackbar;

function showMessage(message) {
    showSnackbar(message);
}
window.showMessage = showMessage;

const snackbarHolder = document.createElement("div");
snackbarHolder.id = "snackbarHolder";

document.addEventListener('DOMContentLoaded', function () {
    document.body.append(snackbarHolder);
    document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<link href='/js/snackbar/stylesheet.css' rel='stylesheet'></link>");
});