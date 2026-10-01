(function () {
  'use strict';
  async function locate() {
    document.querySelectorAll('.reader-target').forEach(function (node) { node.classList.remove('reader-target'); });
    var error = document.getElementById('reader-error');
    error.hidden = true;
    if (!location.hash) return;
    var identifier;
    try { identifier = decodeURIComponent(location.hash.slice(1)); } catch (_) { identifier = ''; }
    var target = document.getElementById(identifier);
    if (!target) {
      error.hidden = false;
      error.textContent = '未找到此条目，请通过目录查阅完整记录。';
      error.focus();
      return;
    }
    target.querySelectorAll('details').forEach(function (detail) { detail.open = true; });
    await document.fonts.ready;
    // A second frame allows font shaping and expanded record metadata to settle.
    await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });
    if (location.hash.slice(1) !== identifier) return;
    target.classList.add('reader-target');
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
    target.scrollIntoView({block: 'start', behavior: 'instant'});
  }
  window.addEventListener('hashchange', locate);
  window.addEventListener('pageshow', locate);
  locate();
})();
