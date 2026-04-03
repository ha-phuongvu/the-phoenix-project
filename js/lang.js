/* ===================================
   Language Switcher (EN / VI)
   Reads data-en and data-vi attributes
   =================================== */

(function () {
  'use strict';

  var currentLang = 'en';

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // Update all elements with data-en / data-vi
    var els = document.querySelectorAll('[data-' + lang + ']');
    els.forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text !== null) {
        el.innerHTML = text;
      }
    });

    // Update toggle buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update page indicator (trigger flipbook's updateUI)
    var indicator = document.getElementById('pageIndicator');
    if (indicator && window.updateBookUI) {
      window.updateBookUI();
    }
  }

  // Bind toggle buttons
  document.getElementById('langToggle').addEventListener('click', function (e) {
    var btn = e.target.closest('.lang-btn');
    if (!btn) return;
    var lang = btn.getAttribute('data-lang');
    if (lang && lang !== currentLang) {
      applyLang(lang);
    }
  });

  // Expose for flipbook to call
  window.switchLang = applyLang;
})();
