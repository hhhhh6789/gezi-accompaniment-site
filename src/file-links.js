(function () {
  'use strict';
  window.GeziFiles = {
    rewrite: function (root, mapping) {
      var lookup = new Map(), readers = new Set();
      function pageURL(value) {
        var url = new URL(value, document.baseURI);
        url.hash = '';
        url.search = '';
        return url.href;
      }
      Object.keys(mapping || {}).forEach(function (url) {
        lookup.set(pageURL(url), mapping[url]);
        readers.add(pageURL(mapping[url]));
      });
      root.querySelectorAll('a[href]').forEach(function (link) {
        if (link.hasAttribute('download')) return;
        var original = new URL(link.getAttribute('href'), document.baseURI);
        var reader = lookup.get(pageURL(original.href));
        var destination = original;
        if (reader) {
          destination = new URL(reader, document.baseURI);
          if (original.hash) destination.hash = original.hash;
          link.setAttribute('href', destination.href);
          link.removeAttribute('download');
        }
        if (readers.has(pageURL(destination.href))) link.removeAttribute('target');
      });
    }
  };
})();
