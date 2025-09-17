// script.js
document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        pageLangSelect: document.getElementById('page-lang-select'),
        fullName: document.getElementById('full-name'),
        phoneNumber: document.getElementById('phone-number'),
        email: document.getElementById('email'),
        jobLangSelect: document.getElementById('job-lang-select'),
        locationSelect: document.getElementById('location-select'),
        consentCheckbox: document.getElementById('consent-checkbox'),
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        nextBtn: document.getElementById('next-btn'),
        backBtn: document.getElementById('back-btn'),
        referralLink: document.getElementById('referral-link'),
        copyBtn: document.getElementById('copy-btn'),
        qrCodeCanvas: document.getElementById('qr-code-canvas'),
        shareWhatsapp: document.getElementById('share-whatsapp'),
        shareLine: document.getElementById('share-line'),
        shareFacebook: document.getElementById('share-facebook'),
        locationSocialLinks: document.getElementById('location-social-links'),
        termsModal: document.getElementById('termsModal'),
        termsContent: document.getElementById('termsContent'),
        mainCountdownAmount: document.getElementById('mainCountdownAmount')
    };

    let currentLanguage = 'en';
    let currentLocation = '';
    let jobData = [];

    // Create phone hint element under phone input
    const phoneHint = document.createElement('div');
    phoneHint.className = 'phone-hint mt-1 small text-muted';
    elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);

    // Helpers
    function t(key, fallback = '') {
        const pack = (window.translations && (translations[currentLanguage] || translations.en)) || {};
        return pack[key] || fallback || key;
    }

    function formatMoney(amount) {
        return 'RM' + Math.floor(amount).toLocaleString('en-US');
    }

    // Visual pulse effect only (no changing amount)
    function startMainCountdown() {
        function addVisualEffects() {
            if (!elements.mainCountdownAmount) return;
            elements.mainCountdownAmount.classList.add('pulse');
            setTimeout(() => elements.mainCountdownAmount.classList.remove('pulse'), 800);
            setTimeout(addVisualEffects, 8000);
        }
        setTimeout(addVisualEffects, 5000);
    }

    // Welcome popup with 30k -> 20k animated drop
    function showWelcomePopup() {
        const popup = document.createElement('div');
        popup.className = 'welcome-popup';

        const logo = document.createElement('img');
        logo.src = 'TPLogo11.png';
        logo.alt = 'Teleperformance Logo';
        logo.className = 'welcome-logo';

        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'welcome-countdown-container';

        const countdownTitle = document.createElement('div');
        countdownTitle.className = 'welcome-countdown-title';
        countdownTitle.textContent = t('welcomeTotalRewards', 'Total Rewards Available');

        const moneyCountdown = document.createElement('div');
        moneyCountdown.className = 'welcome-money-countdown';
        moneyCountdown.id = 'welcomeMoneyCountdown';
        moneyCountdown.textContent = 'RM30,000';

        const hurryMessage = document.createElement('div');
        hurryMessage.className = 'welcome-hurry-message';
        hurryMessage.textContent = t('hurry1', 'Hurry! The rewards are disappearing fast! 🚀');

        countdownContainer.appendChild(countdownTitle);
        countdownContainer.appendChild(moneyCountdown);
        countdownContainer.appendChild(hurryMessage);

        const messageContainer = document.createElement('div');
        messageContainer.className = 'welcome-message-container';

        const welcomeMessages = [
            translations?.en?.welcomeMessage || 'Welcome!',
            translations?.ja?.welcomeMessage || 'ようこそ！',
            translations?.ko?.welcomeMessage || '환영합니다!',
            translations?.['zh-CN']?.welcomeMessage || '欢迎！',
            translations?.['zh-HK']?.welcomeMessage || '歡迎！'
        ];

        welcomeMessages.forEach((msg, index) => {
            const message = document.createElement('div');
            message.className = 'welcome-message-line';
            message.textContent = msg;
            message.style.animationDelay = `${index * 0.3}s`;
            messageContainer.appendChild(message);
        });

        popup.appendChild(logo);
        popup.appendChild(countdownContainer);
        popup.appendChild(messageContainer);
        document.body.appendChild(popup);

        const startAmount = 30000;
        const endAmount = 20000;
        const duration = 3000; // 3s
        const startTime = Date.now();

        function updateCountdown() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentAmount = startAmount - (startAmount - endAmount) * easedProgress;

            moneyCountdown.textContent = formatMoney(currentAmount);
            moneyCountdown.classList.add('pumping');
            setTimeout(() => moneyCountdown.classList.remove('pumping'), 500);

            if (Math.random() < 0.02) {
                const hurryMessages = [
                    t('hurry1', "Hurry! The rewards are disappearing fast! 🚀"),
                    t('hurry2', "Don't wait - the amount is dropping! ⏳"),
                    t('hurry3', "Limited rewards available! 💰"),
                    t('hurry4', "Join now before it's too late! 🔥"),
                    t('hurry5', "Others are claiming their rewards - don't miss out! 👥")
                ];
                hurryMessage.textContent = hurryMessages[Math.floor(Math.random() * hurryMessages.length)];
            }

            if (progress < 1) {
                requestAnimationFrame(updateCountdown);
            } else {
                const finals = [
                    t('final1', "Last chance to claim your rewards!"),
                    t('final2', "Time's almost up! Don't miss out!"),
                    t('final3', "Final amounts remaining - act now!"),
                    t('final4', "Rewards are going fast - join today!")
                ];
                hurryMessage.textContent = finals[Math.floor(Math.random() * finals.length)];
            }
        }

        updateCountdown();

        // Hide after 5 seconds
        setTimeout(() => {
            popup.classList.add('hidden');
            setTimeout(() => {
                popup.remove();
                startMainCountdown();
            }, 1000);
        }, 5000);
    }

    function init() {
        showWelcomePopup();
        loadJobData();
        setupEventListeners();
        updatePageContent();
        const yearEl = document.getElementById('current-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    function loadJobData() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                jobData = data || [];
                populateJobDropdowns();
            })
            .catch(error => {
                console.error('Error loading job data:', error);
                alert(t('loadError', 'Failed to load jobs. Please try again.'));
            });
    }

    function populateJobDropdowns() {
        const langs = [...new Set(jobData.map(job => job.Language).filter(Boolean))];
        const locs = [...new Set(jobData.map(job => job.Location).filter(Boolean))];

        elements.jobLangSelect.innerHTML = '';
        addOption(elements.jobLangSelect, '', t('selectOption', 'Select an option'), true, true);
        langs.forEach(lang => addOption(elements.jobLangSelect, lang, lang));

        elements.locationSelect.innerHTML = '';
        addOption(elements.locationSelect, '', t('selectOption', 'Select an option'), true, true);
        locs.forEach(loc => addOption(elements.locationSelect, loc, loc));
    }

    function addOption(select, value, text, disabled = false, selected = false) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        option.disabled = disabled;
        option.selected = selected;
        select.appendChild(option);
    }

    function updatePageContent() {
        const translation = (window.translations && (translations[currentLanguage] || translations.en)) || {};

        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translation[key]) {
                if (el.tagName === 'INPUT' && el.type === 'button') {
                    el.value = translation[key];
                } else {
                    el.textContent = translation[key];
                }
            }
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translation[key]) el.placeholder = translation[key];
        });

        if (elements.termsContent) {
            // Base T&C content (tables are appended by tnc-payouts.js)
            elements.termsContent.innerHTML = translation.termsContent || '';
        }

        // Update phone hint text
        phoneHint.textContent = translation.phoneHint || 'Use your TnG-registered number if applicable.';

        // Rebuild dropdowns
        populateJobDropdowns();
    }

    function changeLanguage() {
        currentLanguage = elements.pageLangSelect.value;
        updatePageContent();
        // tnc-payouts.js listens to language changes and re-injects tables
    }

    // Phone number: digits only + hint visibility
    elements.phoneNumber.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d]/g, '');
        phoneHint.style.display = this.value.length > 0 ? 'block' : 'none';
        validateForm();
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateForm() {
        let isValid = true;

        if (!elements.fullName.value.trim()) {
            elements.fullName.classList.add('is-invalid');
            isValid = false;
        } else {
            elements.fullName.classList.remove('is-invalid');
        }

        if (!elements.phoneNumber.value.trim() || elements.phoneNumber.value.trim().length < 8) {
            elements.phoneNumber.classList.add('is-invalid');
            isValid = false;
        } else {
            elements.phoneNumber.classList.remove('is-invalid');
        }

        if (!validateEmail(elements.email.value)) {
            elements.email.classList.add('is-invalid');
            isValid = false;
        } else {
            elements.email.classList.remove('is-invalid');
        }

        if (!elements.jobLangSelect.value) {
            elements.jobLangSelect.classList.add('is-invalid');
            isValid = false;
        } else {
            elements.jobLangSelect.classList.remove('is-invalid');
        }

        if (!elements.locationSelect.value) {
            elements.locationSelect.classList.add('is-invalid');
            isValid = false;
        } else {
            elements.locationSelect.classList.remove('is-invalid');
        }

        if (!elements.consentCheckbox.checked) {
            elements.consentCheckbox.classList.add('is-invalid');
            isValid = false;
        } else {
            elements.consentCheckbox.classList.remove('is-invalid');
        }

        elements.nextBtn.disabled = !isValid;
        return isValid;
    }

    function generateReferral() {
        if (!validateForm()) return false;

        const name = elements.fullName.value.trim().replace(/\s+/g, '+');
        const phone = encodeURIComponent(elements.phoneNumber.value.trim());
        const email = encodeURIComponent(elements.email.value.trim());
        const jobLanguage = elements.jobLangSelect.value;
        const location = elements.locationSelect.value;

        currentLocation = location.toLowerCase().includes('malaysia') ? 'malaysia' :
                          location.toLowerCase().includes('thailand') ? 'thailand' : 'global';

        const job = jobData.find(
            item => item.Language === jobLanguage && item.Location === location
        );

        if (job) {
            const baseUrl = (job['Evergreen link'] || '').split('?')[0];
            if (!baseUrl) {
                alert(t('noJobError', 'No application link found for this selection.'));
                return false;
            }
            const referralUrl = `${baseUrl}?iis=xRAF&iisn=${name}%7C${phone}%7C${email}`;

            elements.referralLink.value = referralUrl;
            generateQRCode(referralUrl);
            updateSocialLinks();
            return true;
        }

        alert(t('noJobError', 'No matching job found for this selection.'));
        return false;
    }

    function generateQRCode(url) {
        if (!elements.qrCodeCanvas) return;
        QRCode.toCanvas(elements.qrCodeCanvas, url, {
            width: 200,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        }, function(error) {
            if (error) console.error('QR Code generation error:', error);
        });
    }

    function updateSocialLinks() {
        if (!elements.locationSocialLinks) return;
        elements.locationSocialLinks.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'social-media-container';

        // Always show all sections; fall back to empty arrays if not defined
        const linksCfg = window.locationSocialLinks || {};
        const sections = [
            { title: t('tpGlobal', 'TP Global'), links: linksCfg.global || [] },
            { title: t('followMalaysia', 'TP Malaysia'), links: linksCfg.malaysia || [] },
            { title: t('followThailand', 'TP Thailand'), links: linksCfg.thailand || [] }
        ];

        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'social-media-section';

            const title = document.createElement('h6');
            title.textContent = section.title;
            title.className = 'social-media-title';
            sectionDiv.appendChild(title);

            const linksDiv = document.createElement('div');
            linksDiv.className = 'social-media-links';

            section.links.forEach(link => {
                const anchor = document.createElement('a');
                anchor.href = link.url;
                anchor.className = `social-icon ${link.icon}`;
                anchor.target = "_blank";
                anchor.innerHTML = `<i class="fab fa-${link.icon}"></i>`;
                anchor.title = link.name;
                linksDiv.appendChild(anchor);
            });

            sectionDiv.appendChild(linksDiv);
            container.appendChild(sectionDiv);
        });

        elements.locationSocialLinks.appendChild(container);
        updateShareButtons(); // also exposes for analytics wrapper
    }

    function updateShareButtons() {
        const link = elements.referralLink?.value || '';
        const shareUrl = encodeURIComponent(link);
        const shareText = t('shareMessage', 'Apply with my TP referral: ');
        const encodedShareText = encodeURIComponent(shareText);

        if (elements.shareWhatsapp) {
            elements.shareWhatsapp.onclick = () =>
                window.open(`https://wa.me/?text=${encodedShareText}${shareUrl}`, '_blank');
        }
        if (elements.shareLine) {
            elements.shareLine.onclick = () =>
                window.open(`https://social-plugins.line.me/lineit/share?url=${encodedShareText}${shareUrl}`, '_blank');
        }
        if (elements.shareFacebook) {
            elements.shareFacebook.onclick = () =>
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
        }
    }
    // expose for analytics override
    window.updateShareButtons = updateShareButtons;

    function copyToClipboard() {
        elements.referralLink.select();
        document.execCommand('copy');
        const originalText = elements.copyBtn.innerHTML;
        elements.copyBtn.innerHTML = `<i class="fas fa-check"></i> ${t('copiedText', 'Copied!')}`;
        setTimeout(() => {
            elements.copyBtn.innerHTML = originalText;
        }, 2000);
    }

    function showStep2() {
        if (generateReferral()) {
            elements.step1.style.display = 'none';
            elements.step2.style.display = 'block';
            window.scrollTo(0, 0);
        }
    }

    function showStep1() {
        elements.step2.style.display = 'none';
        elements.step1.style.display = 'block';
    }

    function setupEventListeners() {
        elements.pageLangSelect.addEventListener('change', changeLanguage);

        elements.fullName.addEventListener('input', validateForm);
        elements.phoneNumber.addEventListener('input', validateForm);
        elements.email.addEventListener('input', validateForm);
        elements.jobLangSelect.addEventListener('change', validateForm);
        elements.locationSelect.addEventListener('change', validateForm);
        elements.consentCheckbox.addEventListener('change', validateForm);

        elements.nextBtn.addEventListener('click', showStep2);
        elements.backBtn.addEventListener('click', showStep1);

        elements.copyBtn.addEventListener('click', copyToClipboard);

        // Bootstrap modal hook (optional; data-bs-* already handles toggle)
        const termsModalInstance = elements.termsModal ? new bootstrap.Modal(elements.termsModal) : null;
        const termsLink = document.querySelector('[data-bs-target="#termsModal"]');
        if (termsLink && termsModalInstance) {
            termsLink.addEventListener('click', function(e) {
                e.preventDefault();
                // base T&C is already set in updatePageContent; tnc-payouts.js will append tables
                termsModalInstance.show();
            });
        }
    }

    init();
});
