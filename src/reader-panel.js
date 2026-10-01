(function () {
  'use strict';
  var source = document.getElementById('reader-contents');
  var contents = source ? JSON.parse(source.textContent) : {};
  var registry = new Map();
  function pageURL(value, base) { var url = new URL(value, base || document.baseURI); url.hash = ''; url.search = ''; return url.href; }
  Object.keys(contents).forEach(function (key) { registry.set(pageURL(key), contents[key]); });
  var dialog = document.createElement('dialog');
  dialog.id = 'reader-panel'; dialog.className = 'reader-panel';
  dialog.setAttribute('aria-labelledby', 'rp-title');
  dialog.innerHTML = '<div class="rp-shade" aria-hidden="true"></div><section class="rp-sheet"><header class="rp-header"><h2 id="rp-title" class="rp-title"></h2><button type="button" class="rp-close" aria-label="关闭资料阅读">×</button><div class="rp-tools"><button type="button" class="rp-back" hidden>← 上一份资料</button><button type="button" class="rp-toc-toggle" aria-expanded="false" hidden>文档目录</button></div></header><div id="rp-scroll" tabindex="-1"></div></section>';
  document.body.appendChild(dialog);
  var scroll = dialog.querySelector('#rp-scroll'), title = dialog.querySelector('.rp-title');
  var back = dialog.querySelector('.rp-back'), tocButton = dialog.querySelector('.rp-toc-toggle');
  var stack = [], current = null, revision = 0, origin = null;
  function plainClick(event) { return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey; }
  function prepareLinks(root) {
    root.querySelectorAll('a[href]').forEach(function (link) {
      try {
        if (!link.hasAttribute('download') && registry.has(pageURL(link.href))) {
          link.removeAttribute('target'); link.setAttribute('aria-haspopup', 'dialog'); link.setAttribute('aria-controls', dialog.id);
        }
      } catch (_) { /* A malformed or non-document URL keeps its native behavior. */ }
    });
  }
  function pauseDocument(node) { if (node) node.querySelectorAll('audio,video').forEach(function (media) { media.pause(); }); }
  function lock(opener) {
    var shell = document.querySelector('.app-shell');
    origin = {x: window.scrollX, y: window.scrollY, width: document.documentElement.clientWidth,
      scrollbar: window.innerWidth - document.documentElement.clientWidth, opener: opener || document.activeElement,
      style: document.body.getAttribute('style'), shell: shell, inert: shell ? shell.inert : false};
    // Keep the original content width when the viewport scrollbar disappears.
    document.body.style.position = 'fixed'; document.body.style.top = -origin.y + 'px';
    document.body.style.left = -origin.x + 'px'; document.body.style.width = origin.width + 'px';
    document.body.style.overflow = 'hidden'; document.body.classList.add('reader-panel-open');
    document.documentElement.classList.add('reader-panel-open');
    if (shell) shell.inert = true;
    dialog.showModal();
  }
  function close(options) {
    if (!dialog.open) return;
    revision++; pauseDocument(current && current.node); stack.forEach(function (entry) { pauseDocument(entry.node); });
    dialog.close(); scroll.replaceChildren(); current = null; stack = [];
    document.body.classList.remove('reader-panel-open'); document.documentElement.classList.remove('reader-panel-open');
    var previous = origin; origin = null;
    if (previous.style === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', previous.style);
    if (previous.shell) previous.shell.inert = previous.inert;
    window.scrollTo({left: previous.x, top: previous.y, behavior: 'instant'});
    if (!(options && options.focus === false) && previous.opener && previous.opener.isConnected) previous.opener.focus({preventScroll: true});
  }
  function snapshot() {
    if (!current) return;
    current.y = scroll.scrollTop; current.x = scroll.scrollLeft;
    current.focus = current.node.contains(document.activeElement) ? document.activeElement : null;
    pauseDocument(current.node);
  }
  function decoded(hash) { try { return decodeURIComponent(hash.replace(/^#/, '')); } catch (_) { return ''; } }
  function findTarget(hash) {
    var identifier = decoded(hash);
    return identifier && current ? Array.from(current.node.querySelectorAll('[data-reader-id]')).find(function (node) { return node.dataset.readerId === identifier; }) : null;
  }
  async function settle(ticket) {
    await document.fonts.ready;
    await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });
    return dialog.open && revision === ticket;
  }
  async function locate(hash) {
    var target = findTarget(hash);
    if (!target) return false;
    var ticket = ++revision;
    var directory = target.closest('.rp-directory'); if (directory) directory.open = true;
    target.querySelectorAll('details').forEach(function (detail) { detail.open = true; });
    if (!(await settle(ticket))) return false;
    current.node.querySelectorAll('.reader-target').forEach(function (node) { node.classList.remove('reader-target'); });
    target.classList.add('reader-target'); target.setAttribute('tabindex', '-1');
    var rect = target.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
    scroll.scrollTo({top: scroll.scrollTop + rect.top - viewport.top - 18, behavior: 'instant'});
    target.focus({preventScroll: true}); syncDirectory(); return true;
  }
  function syncDirectory() { var directory = current && current.node.querySelector('.rp-directory'); tocButton.setAttribute('aria-expanded', String(!!directory && directory.open)); }
  function materialize(entry, url, ticket) {
    var node = document.createElement('article'); node.className = 'rp-document data-reader ' + (entry.kind === 'data' ? 'full-record-reader' : 'file-reader');
    var template = document.createElement('template'); template.innerHTML = entry.html;
    template.content.querySelectorAll('script,iframe,object,embed,base,link,meta,style,form').forEach(function (element) { element.remove(); });
    template.content.querySelectorAll('*').forEach(function (element) {
      Array.from(element.attributes).forEach(function (attribute) { if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name); });
      ['href', 'src', 'poster'].forEach(function (attribute) {
        if (!element.hasAttribute(attribute)) return;
        try { var absolute = new URL(element.getAttribute(attribute), url); if (!['file:', 'http:', 'https:', 'mailto:'].includes(absolute.protocol)) element.removeAttribute(attribute); else element.setAttribute(attribute, absolute.href); }
        catch (_) { element.removeAttribute(attribute); }
      });
      if (element.hasAttribute('srcset')) element.removeAttribute('srcset');
    });
    node.appendChild(template.content);
    // Namespaced IDs prevent chapter IDs from competing with the page behind it.
    var identifiers = new Map();
    node.querySelectorAll('[id]').forEach(function (element, index) { var original = element.id; element.dataset.readerId = original; element.id = 'rp-' + ticket + '-' + index; identifiers.set(original, element.id); });
    node.querySelectorAll('*').forEach(function (element) {
      ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'headers'].forEach(function (attribute) {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, element.getAttribute(attribute).split(/\s+/).map(function (id) { return identifiers.get(id) || id; }).join(' '));
      });
    });
    var index = node.querySelector('.reader-index');
    if (index) {
      var directory = document.createElement('details'); directory.className = 'rp-directory';
      directory.innerHTML = '<summary>文档目录</summary>'; index.replaceWith(directory); directory.appendChild(index);
      directory.addEventListener('toggle', syncDirectory);
    }
    node.querySelectorAll('a[href]').forEach(function (link) {
      if (/^https?:/.test(link.href) && new URL(link.href).origin !== location.origin) { link.classList.add('rp-external'); link.title = '外部网站'; link.setAttribute('aria-label', link.textContent + '（外部网站）'); if (link.target === '_blank') link.rel = 'noopener noreferrer'; }
    });
    prepareLinks(node); return node;
  }
  async function display(url, entry, saved) {
    var ticket = ++revision;
    title.textContent = entry.title || '资料阅读'; title.title = title.textContent;
    back.hidden = !stack.length;
    var node;
    if (saved) node = saved.node;
    else if (typeof entry.html !== 'string' || !entry.html.trim()) {
      node = document.createElement('div'); node.className = 'rp-error'; node.setAttribute('role', 'alert');
      node.innerHTML = '<p>这份资料暂时无法读取。请重试，或关闭后更新看板。</p><button type="button" class="rp-retry">重试</button>';
      node.querySelector('button').addEventListener('click', function () { display(url, entry); });
    } else node = materialize(entry, url, ticket);
    current = saved || {url: pageURL(url), entry: entry, node: node, y: 0, x: 0};
    scroll.replaceChildren(node); tocButton.hidden = !node.querySelector('.rp-directory'); syncDirectory();
    scroll.scrollTo({top: 0, left: 0, behavior: 'instant'});
    dialog.querySelector('.rp-close').focus({preventScroll: true});
    if (saved) {
      if (await settle(ticket)) { scroll.scrollTo({top: saved.y, left: saved.x, behavior: 'instant'}); if (saved.focus && saved.focus.isConnected) saved.focus.focus({preventScroll: true}); }
    } else {
      var hash = new URL(url, document.baseURI).hash;
      if (hash && !(await locate(hash)) && revision === ticket) {
        var note = document.createElement('p'); note.className = 'rp-location-note'; note.textContent = '未找到此条目，可通过文档目录查阅。'; node.prepend(note);
      }
    }
  }
  function open(value, opener) {
    var url; try { url = new URL(value, document.baseURI); } catch (_) { return false; }
    var entry = registry.get(pageURL(url)); if (!entry) return false;
    var nested = dialog.open && opener && dialog.contains(opener);
    if (nested && current && current.url === pageURL(url)) { locate(url.hash); return true; }
    if (!dialog.open) lock(opener);
    else snapshot();
    if (nested && current) stack.push(current); else { stack.forEach(function (item) { pauseDocument(item.node); }); stack = []; }
    display(url.href, entry); return true;
  }
  back.addEventListener('click', function () { if (!stack.length) return; snapshot(); var previous = stack.pop(); display(previous.url, previous.entry, previous); });
  dialog.querySelector('.rp-close').addEventListener('click', function () { close(); });
  dialog.querySelector('.rp-shade').addEventListener('click', function () { close(); });
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var stops = Array.from(dialog.querySelectorAll('button,a[href],summary,[tabindex],audio[controls],video[controls]')).filter(function (element) {
      return element.tabIndex >= 0 && !element.disabled && element.getClientRects().length > 0;
    });
    if (!stops.length) { event.preventDefault(); return; }
    var first = stops[0], last = stops[stops.length - 1];
    if ((!event.shiftKey && document.activeElement === last) || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus({preventScroll: true});
    }
  });
  tocButton.addEventListener('click', function () {
    var directory = current && current.node.querySelector('.rp-directory'); if (!directory) return;
    directory.open = !directory.open; syncDirectory();
    if (directory.open) { scroll.scrollTo({top: scroll.scrollTop + directory.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 18, behavior: 'instant'}); directory.querySelector('summary').focus({preventScroll: true}); }
  });
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || !plainClick(event)) return;
    var link = event.target.closest('a[href]'); if (!link || link.hasAttribute('download')) return;
    if (dialog.open && dialog.contains(link) && current && pageURL(link.href) === current.url) { event.preventDefault(); locate(new URL(link.href).hash); return; }
    if (open(link.href, link)) event.preventDefault();
  }, true);
  window.addEventListener('pagehide', function () { close({focus: false}); });
  window.addEventListener('resize', function () { if (origin) document.body.style.width = (window.innerWidth - origin.scrollbar) + 'px'; });
  window.GeziReaderPanel = {open: open, close: close, isOpen: function () { return dialog.open; }, prepareLinks: prepareLinks,
    beforeNavigate: function () { close({focus: false}); }, contents: contents};
})();
