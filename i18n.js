/* =========================================================
   Apex Vision — minimal i18n (FR default / EN via ?lang=en)
   Reads URL param, persists in localStorage, swaps marked
   elements via data-en="..." attributes.
   ========================================================= */
(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const stored = (localStorage.getItem('apex-lang') || '').toLowerCase();
    const urlLang = (params.get('lang') || '').toLowerCase();

    // Priority: explicit URL param > stored choice > default FR
    let lang;
    if (urlLang === 'en' || urlLang === 'fr') {
        lang = urlLang;
    } else if (stored === 'en' || stored === 'fr') {
        lang = stored;
    } else {
        lang = 'fr';
    }

    localStorage.setItem('apex-lang', lang);
    document.documentElement.lang = lang === 'en' ? 'en' : 'fr';

    function apply() {
        if (lang === 'en') {
            // innerHTML text
            document.querySelectorAll('[data-en]').forEach(el => {
                if (el.tagName === 'TITLE') {
                    document.title = el.dataset.en;
                } else if (el.tagName === 'META') {
                    el.content = el.dataset.en;
                } else {
                    el.innerHTML = el.dataset.en;
                }
            });
            // Common attributes
            document.querySelectorAll('[data-en-placeholder]').forEach(el => {
                el.placeholder = el.dataset.enPlaceholder;
            });
            document.querySelectorAll('[data-en-alt]').forEach(el => {
                el.alt = el.dataset.enAlt;
            });
            document.querySelectorAll('[data-en-title]').forEach(el => {
                el.title = el.dataset.enTitle;
            });
            document.querySelectorAll('[data-en-aria-label]').forEach(el => {
                el.setAttribute('aria-label', el.dataset.enAriaLabel);
            });
        }

        // Update lang switcher (active state + href — both languages are explicit)
        document.querySelectorAll('.lang-switch a').forEach(a => {
            const code = (a.dataset.lang || a.innerText).trim().toLowerCase();
            a.classList.toggle('lang-active', code === lang);
            const url = new URL(window.location.href);
            url.searchParams.set('lang', code);
            a.href = url.pathname + url.search;
        });
    }

    if (document.readyState !== 'loading') apply();
    else document.addEventListener('DOMContentLoaded', apply);
})();
