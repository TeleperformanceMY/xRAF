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

    // Main page countdown configuration
    const mainCountdownConfig = {
        startAmount: 20000,
        endAmount: 18000,
        duration: 30000, // 30 seconds for subtle countdown
        updateInterval: 2000 // Update every 2 seconds
    };

    // Create phone hint element
    const phoneHint = document.createElement('div');
    phoneHint.className = 'phone-hint mt-1 small text-muted';
    elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);

    function formatMoney(amount) {
        return 'RM' + Math.floor(amount).toLocaleString('en-US');
    }

    function animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const difference = currentValue - newValue;
        const steps = 8;
        const stepValue = difference / steps;
        let currentStep = 0;
        
        function animate() {
            if (currentStep < steps) {
                const intermediateValue = currentValue - (stepValue * currentStep);
                element.textContent = formatMoney(intermediateValue);
                currentStep++;
                setTimeout(animate, 50);
            } else {
                element.textContent = formatMoney(newValue);
            }
        }
        
        animate();
    }

    function startMainCountdown() {
        let currentAmount = mainCountdownConfig.startAmount;
        const decreasePerUpdate = (mainCountdownConfig.startAmount - mainCountdownConfig.endAmount) / 
                                 (mainCountdownConfig.duration / mainCountdownConfig.updateInterval);
        
        function updateMainCountdown() {
            if (currentAmount > mainCountdownConfig.endAmount) {
                const previousAmount = currentAmount;
                currentAmount -= decreasePerUpdate;
                if (currentAmount < mainCountdownConfig.endAmount) {
                    currentAmount = mainCountdownConfig.endAmount;
                }
                
                // Enhanced update animation with number rolling
                elements.mainCountdownAmount.classList.add('update-flash');
                
                setTimeout(() => {
                    // Use rolling animation for number change
                    animateNumberChange(elements.mainCountdownAmount, currentAmount);
                    elements.mainCountdownAmount.classList.remove('update-flash');
                    elements.mainCountdownAmount.classList.add('pulse');
                    
                    setTimeout(() => {
                        elements.mainCountdownAmount.classList.remove('pulse');
                    }, 800);
                }, 200);
                
                setTimeout(updateMainCountdown, mainCountdownConfig.updateInterval);
            } else {
                // Final animation when countdown reaches minimum
                elements.mainCountdownAmount.classList.add('pulse');
                setTimeout(() => {
                    elements.mainCountdownAmount.classList.remove('pulse');
                }, 800);
            }
        }
        
        // Start the countdown after a short delay
        setTimeout(updateMainCountdown, 3000);
    }

    function showWelcomePopup() {
        const popup = document.createElement('div');
        popup.className = 'welcome-popup';
        
        // Logo section
        const logo = document.createElement('img');
        logo.src = 'TPLogo11.png';
        logo.alt = 'Teleperformance Logo';
        logo.className = 'welcome-logo';
        
        // Welcome title
        const welcomeTitle = document.createElement('h1');
        welcomeTitle.className = 'welcome-title';
        welcomeTitle.textContent = 'Welcome to TP External Refer A Friend Program';
        
        // Create money countdown container
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'welcome-countdown-container';
        
        const countdownTitle = document.createElement('div');
        countdownTitle.className = 'welcome-countdown-title';
        countdownTitle.textContent = 'Total Rewards Available';
        
        const moneyCountdown = document.createElement('div');
        moneyCountdown.className = 'welcome-money-countdown';
        moneyCountdown.id = 'welcomeMoneyCountdown';
        moneyCountdown.textContent = 'RM20,000';
        
        const hurryMessage = document.createElement('div');
        hurryMessage.className = 'welcome-hurry-message';
        hurryMessage.textContent = 'Hurry! The rewards are disappearing fast! 🚀';
        
        countdownContainer.appendChild(countdownTitle);
        countdownContainer.appendChild(moneyCountdown);
        countdownContainer.appendChild(hurryMessage);
        
        popup.appendChild(logo);
        popup.appendChild(welcomeTitle);
        popup.appendChild(countdownContainer);
        document.body.appendChild(popup);
        
        // Start the countdown animation
        const moneyElement = document.getElementById('welcomeMoneyCountdown');
        const startAmount = 20000;
        const endAmount = 20000; // Keep it at 20000
        
        // Just show the amount without animation since it's the same
        moneyElement.textContent = formatMoney(startAmount);
        
        // Add some visual effects
        moneyElement.classList.add('pumping');
        setTimeout(() => {
            moneyElement.classList.remove('pumping');
        }, 500);
        
        // Hide after 4 seconds
        setTimeout(() => {
            popup.classList.add('hidden');
            // Remove after animation completes and start main countdown
            setTimeout(() => {
                popup.remove();
                startMainCountdown();
            }, 1000);
        }, 4000);
    }

    function init() {
        showWelcomePopup();
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
