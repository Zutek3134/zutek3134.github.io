const modalClose = document.getElementsByClassName("close")[0];
const modal = document.querySelector(".modal");
modal.style.display = "block";

modalClose.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}