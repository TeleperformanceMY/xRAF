document.addEventListener('DOMContentLoaded', function() {
    // Enhanced Countdown Implementation
    const welcomePopup = document.getElementById('welcomePopup');
    const mainContent = document.getElementById('mainContent');
    const countdownNumber = document.getElementById('countdownNumber');
    const progressBarFill = document.getElementById('progressBarFill');
    const motivationalMessage = document.getElementById('motivationalMessage');
    const celebrationContainer = document.getElementById('celebrationContainer');
    const finalCountdownAmount = document.getElementById('finalCountdownAmount');
    
    // Main elements
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
        termsContent: document.getElementById('termsContent')
    };

    let currentLanguage = 'en';
    let currentLocation = '';
    let jobData = [];

    // Countdown configuration
    const startAmount = 30000;
    const endAmount = 20000;
    const countdownDuration = 4000; // 4 seconds
    const totalDuration = 6000; // 6 seconds total including celebration
    
    // Motivational messages
    const motivationalMessages = [
        "Hurry! The rewards are disappearing fast! 🚀",
        "Don't wait - the amount is dropping! ⏳",
        "Limited rewards available! 💰",
        "Join now before it's too late! 🔥",
        "Others are claiming their rewards - don't miss out! 👥",
        "Last chance to claim your rewards! ✨",
        "Time's almost up! Don't miss out! ⚡",
        "Final amounts remaining - act now! 🎯"
    ];
    
    let currentAmount = startAmount;
    let startTime = Date.now();
    let messageIndex = 0;

    // Create phone hint element
    const phoneHint = document.createElement('div');
    phoneHint.className = 'phone-hint mt-1 small text-muted';
    elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);

    function formatMoney(amount) {
        return 'RM' + Math.floor(amount).toLocaleString('en-US');
    }
    
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            celebrationContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }
    }
    
    function updateCountdown() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / countdownDuration, 1);
        
        // Smooth easing function
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        // Update amount
        currentAmount = startAmount - (startAmount - endAmount) * easedProgress;
        countdownNumber.textContent = formatMoney(currentAmount);
        
        // Update progress bar
        progressBarFill.style.width = (progress * 100) + '%';
        
        // Add pulsing effect
        countdownNumber.classList.add('pulsing');
        setTimeout(() => {
            countdownNumber.classList.remove('pulsing');
        }, 600);
        
        // Update motivational message periodically
        if (elapsed % 800 < 50) { // Change message every ~800ms
            messageIndex = (messageIndex + 1) % motivationalMessages.length;
            motivationalMessage.textContent = motivationalMessages[messageIndex];
            motivationalMessage.style.animation = 'none';
            motivationalMessage.offsetHeight; // Trigger reflow
            motivationalMessage.style.animation = 'fadeInMessage 0.5s ease-out forwards';
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCountdown);
        } else {
            // Countdown complete - start celebration
            setTimeout(() => {
                createConfetti();
                motivationalMessage.textContent = "🎉 Congratulations! Join now to claim your rewards! 🎉";
                motivationalMessage.style.animation = 'none';
                motivationalMessage.offsetHeight;
                motivationalMessage.style.animation = 'fadeInMessage 0.5s ease-out forwards';
            }, 500);
            
            // Hide countdown and show main content
            setTimeout(() => {
                welcomePopup.classList.add('hidden');
                setTimeout(() => {
                    welcomePopup.style.display = 'none';
                    mainContent.classList.add('show');
                    // Show final countdown amount under logo
                    finalCountdownAmount.style.display = 'block';
                }, 1000);
            }, totalDuration - countdownDuration);
        }
    }

    function init() {
        // Start countdown animation
        updateCountdown();
        loadJobData();
        setupEventListeners();
        updatePageContent();
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }

    function loadJobData() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                jobData = data;
                populateJobDropdowns();
            })
            .catch(error => {
                console.error('Error loading job data:', error);
                alert(translations[currentLanguage].loadError);
            });
    }

    function populateJobDropdowns() {
        const languages = [...new Set(jobData.map(job => job.Language))];
        const locations = [...new Set(jobData.map(job => job.Location))];

        elements.jobLangSelect.innerHTML = '';
        addOption(elements.jobLangSelect, '', translations[currentLanguage].selectOption, true, true);
        languages.forEach(lang => {
            addOption(elements.jobLangSelect, lang, lang);
        });

        elements.locationSelect.innerHTML = '';
        addOption(elements.locationSelect, '', translations[currentLanguage].selectOption, true, true);
        locations.forEach(loc => {
            addOption(elements.locationSelect, loc, loc);
        });
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
        const translation = translations[currentLanguage] || translations.en;
        
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
            elements.termsContent.innerHTML = translation.termsContent;
        }
        
        // Update phone hint message
        phoneHint.textContent = translation.phoneHint;
        
        populateJobDropdowns();
    }

    function changeLanguage() {
        currentLanguage = elements.pageLangSelect.value;
        updatePageContent();
    }

    // Phone number validation - only allow numbers
    elements.phoneNumber.addEventListener('input', function() {
        // Remove any non-digit characters
        this.value = this.value.replace(/[^\d]/g, '');
        
        // Show TnG hint when user starts typing
        if (this.value.length > 0) {
            phoneHint.style.display = 'block';
        } else {
            phoneHint.style.display = 'none';
        }
        
        validateForm();
    });

    function validatePhoneNumber(phone) {
        const regex = /^\+601\d{8,9}$/;
        return regex.test(phone);
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

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
            item => item.Language === jobLanguage && 
                   item.Location === location
        );
        
        if (job) {
            const baseUrl = job['Evergreen link'].split('?')[0];
            const referralUrl = `${baseUrl}?iis=xRAF&iisn=${name}%7C${phone}%7C${email}`;
            
            elements.referralLink.value = referralUrl;
            generateQRCode(referralUrl);
            updateSocialLinks();
            return true;
        }
        
        alert(translations[currentLanguage].noJobError);
        return false;
    }

    function generateQRCode(url) {
        QRCode.toCanvas(elements.qrCodeCanvas, url, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function(error) {
            if (error) console.error('QR Code generation error:', error);
        });
    }

    function updateSocialLinks() {
        elements.locationSocialLinks.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'social-media-container';

        // Always show all social media sections regardless of location
        const sections = [
            { title: translations[currentLanguage].tpGlobal || 'TP Global', links: locationSocialLinks.global },
            { title: translations[currentLanguage].followMalaysia || 'TP Malaysia', links: locationSocialLinks.malaysia },
            { title: translations[currentLanguage].followThailand || 'TP Thailand', links: locationSocialLinks.thailand }
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
        updateShareButtons();
    }

    function updateShareButtons() {
        const shareUrl = encodeURIComponent(elements.referralLink.value);
        const shareText = translations[currentLanguage]?.shareMessage || translations.en.shareMessage;
        const encodedShareText = encodeURIComponent(shareText);
        
        elements.shareWhatsapp.onclick = () => {
            window.open(`https://wa.me/?text=${encodedShareText}${shareUrl}`, '_blank');
        };
        
        elements.shareLine.onclick = () => {
            window.open(`https://social-plugins.line.me/lineit/share?url=${encodedShareText}${shareUrl}`, '_blank');
        };
        
        elements.shareFacebook.onclick = () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
        };
    }

    function copyToClipboard() {
        elements.referralLink.select();
        document.execCommand('copy');
        
        const originalText = elements.copyBtn.innerHTML;
        elements.copyBtn.innerHTML = `<i class="fas fa-check"></i> ${translations[currentLanguage]?.copiedText || 'Copied!'}`;
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

    document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
        
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
        
        const termsModal = new bootstrap.Modal(elements.termsModal);
        document.querySelector('[data-bs-target="#termsModal"]').addEventListener('click', function(e) {
            e.preventDefault();
            termsModal.show();
        });
    }

    init();
});
