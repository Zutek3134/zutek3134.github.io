function closeModal() {
    const modal = document.querySelector('.modal-active');
    modalControl(modal, false);
}

window.onclick = function (event) {
    const modal = document.querySelector('.modal-active');
    if (event.target == modal) {
        modalControl(modal, false);
    }
}

function openModal(id) {
    const modal = document.querySelector('#modal-' + id);
    modalControl(modal, true);
}

window.openModal = openModal;

function modalControl(modal, on) {
    if (!modal) return;

    modal.querySelector(".content").classList.toggle('show', on);
    modal.classList.toggle('transparentBg', !on);

    setTimeout(function () {
        if (!on) {
            const callbackName = modal.getAttribute('data-onclose');
            if (callbackName && typeof window[callbackName] === 'function') {
                window[callbackName]();
            }
        }

        modal.classList.toggle('modal-active', on);
        document.body.style.overflow = on ? 'hidden' : 'auto';
    }, on ? 0 : 400);

    modal.querySelector('.body').scrollTop = 0;
}

document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<link href='/js/modal/stylesheet.css' rel='stylesheet'></link>");