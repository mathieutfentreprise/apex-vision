/* =========================================================
   Apex Vision — Form handler (Web3Forms) — bilingue FR/EN
   Used by demande-rapide-* and demande-detaillee-*
   ========================================================= */
(function () {
    'use strict';

    const WEB3FORMS_KEY = '330dcdcd-f708-42e7-b432-b56f23bff746';
    const ENDPOINT = 'https://api.web3forms.com/submit';

    const STRINGS = {
        fr: {
            sending: 'Envoi en cours…',
            requestReceived: 'Demande reçue',
            successTitle: 'Merci!',
            successMessage: "Votre demande a bien été enregistrée. Une soumission gratuite et personnalisée vous sera transmise dans les meilleurs délais.",
            backToHome: "Retour à l'accueil",
            errorGeneric: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
            errorNetwork: "Erreur réseau. Veuillez vérifier votre connexion et réessayer.",
            subjectPrefix: 'Apex Vision — Nouvelle demande',
            typeRapide: 'rapide',
            typeDetaillee: 'détaillée'
        },
        en: {
            sending: 'Sending…',
            requestReceived: 'Request received',
            successTitle: 'Thank you!',
            successMessage: 'Your request has been successfully recorded. A free, personalized quote will be sent to you shortly.',
            backToHome: 'Back to home',
            errorGeneric: 'An error occurred while sending. Please try again.',
            errorNetwork: 'Network error. Please check your connection and try again.',
            subjectPrefix: 'Apex Vision — New request',
            typeRapide: 'quick',
            typeDetaillee: 'detailed'
        }
    };

    function getLang() {
        const params = new URLSearchParams(window.location.search);
        const url = (params.get('lang') || '').toLowerCase();
        const stored = (localStorage.getItem('apex-lang') || '').toLowerCase();
        const lang = (url === 'en' || (!url && stored === 'en')) ? 'en' : 'fr';
        return lang;
    }

    function t() { return STRINGS[getLang()]; }

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        document.querySelectorAll('form.apex-form').forEach(initForm);
    });

    function initForm(form) {
        setupConditionals(form);
        setupSubmit(form);
    }

    function setupConditionals(form) {
        const select = form.querySelector('#service');
        const conditionals = form.querySelectorAll('.form-conditional');
        if (!select || !conditionals.length) return;

        function update() {
            const value = select.value;
            conditionals.forEach(fs => {
                const services = (fs.dataset.service || '').split(' ');
                fs.classList.toggle('is-active', services.includes(value));
            });
        }
        select.addEventListener('change', update);
        update();
    }

    function setupSubmit(form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const labels = t();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.classList.add('is-loading');
            submitBtn.innerHTML = '<span>' + labels.sending + '</span>';

            removeError(form);

            const formType = (form.dataset.formType || 'demande');
            const formTypeLabel = formType === 'rapide' ? labels.typeRapide : labels.typeDetaillee;

            const formData = new FormData(form);
            formData.append('access_key', WEB3FORMS_KEY);
            formData.append('subject', labels.subjectPrefix + ' ' + formTypeLabel);
            formData.append('from_name', 'Site Web Apex Vision Sécurité');
            if (!formData.has('botcheck')) formData.append('botcheck', '');

            try {
                const response = await fetch(ENDPOINT, { method: 'POST', body: formData });
                const data = await response.json().catch(() => ({}));

                if (response.ok && data && data.success) {
                    showSuccess(form);
                } else {
                    showError(form, (data && data.message) ? data.message : labels.errorGeneric);
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('is-loading');
                    submitBtn.innerHTML = originalContent;
                }
            } catch (err) {
                showError(form, labels.errorNetwork);
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                submitBtn.innerHTML = originalContent;
            }
        });
    }

    function showSuccess(form) {
        const labels = t();
        const lang = getLang();
        let returnUrl = form.dataset.returnUrl || 'index.html';
        if (lang === 'en') {
            // Preserve language across navigation
            returnUrl += (returnUrl.includes('?') ? '&' : '?') + 'lang=en';
        }

        const card = document.createElement('div');
        card.className = 'form-success';
        card.setAttribute('role', 'status');
        card.setAttribute('aria-live', 'polite');
        card.innerHTML =
            '<div class="form-success-icon" aria-hidden="true">' +
                '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle class="success-ring" cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.5"/>' +
                    '<path class="success-check" d="M20 33 L28 41 L44 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
                '</svg>' +
            '</div>' +
            '<span class="form-success-eyebrow">' + labels.requestReceived + '</span>' +
            '<h2 class="form-success-title">' + labels.successTitle + '</h2>' +
            '<p class="form-success-msg">' + labels.successMessage + '</p>' +
            '<a href="' + returnUrl + '" class="btn btn-primary">' +
                '<span>' + labels.backToHome + '</span>' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>' +
            '</a>';

        form.replaceWith(card);
        const sw = document.querySelector('.form-switch');
        if (sw) sw.style.display = 'none';
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(form, message) {
        removeError(form);
        const banner = document.createElement('div');
        banner.className = 'form-error-banner';
        banner.setAttribute('role', 'alert');
        banner.innerHTML = '<span class="error-mark" aria-hidden="true">!</span><span class="error-msg">' + message + '</span>';
        form.insertBefore(banner, form.firstChild);
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function removeError(form) {
        const existing = form.querySelector('.form-error-banner');
        if (existing) existing.remove();
    }
})();
