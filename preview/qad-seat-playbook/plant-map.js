(function () {
  var stack = document.querySelector('[data-plant-map]');
  if (!stack) return;
  var hots = stack.querySelectorAll('.hot');
  hots.forEach(function (h) {
    function on() {
      stack.classList.add('is-hot');
      h.classList.add('is-on');
    }
    function off() {
      h.classList.remove('is-on');
      if (!stack.querySelector('.hot.is-on')) stack.classList.remove('is-hot');
    }
    h.addEventListener('pointerenter', on);
    h.addEventListener('pointerleave', off);
    h.addEventListener('focus', on);
    h.addEventListener('blur', off);
  });
})();
