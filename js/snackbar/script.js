const snackbar = document.createElement('div');
snackbar.id = 'snackbar';
document.querySelector('main').appendChild(snackbar);

const message = document.getElementById('snackbar');

function showMessage(msg) {
    message.classList.add('show');
    message.innerHTML = msg;
    setTimeout(function () {
        message.className = message.classList.remove('show');
    }, 2900);
}