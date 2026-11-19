document.addEventListener('submit', event => {
  const message = event.target.dataset.confirm;
  if (message && !window.confirm(message)) event.preventDefault();
});

document.querySelectorAll('.flash-success').forEach(flash => {
  setTimeout(() => flash.classList.add('is-leaving'), 4000);
  flash.addEventListener('transitionend', () => flash.remove());
});
