document.addEventListener('DOMContentLoaded', function () {
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
    mainCountdownAmount: document.getElementById('mainCountdownAmount'),
    payoutBox: document.getElementById('payout-box'),
    payoutStandard: document.getElementById('payout-standard'),
    payoutInterpreter: document.getElementById('payout-interpreter')
  };

  let currentLanguage = 'en';
  let currentLocation = '';
  let jobData = [];

  // Safer translation getter with fallback
  function t(key, fallback = '') {
    try {
      const pack = translations[currentLanguage] || translations.en || {};
      return (pack && pack[key]) || fallback || key;
    } catch {
      return fallback || key;
    }
  }

  // Main page countdown visual pulse only (kept as-is)
  function startMainCountdown() {
    function addVisualEffects() {
      elements.mainCountdownAmount.classList.add('pulse');
      setTimeout(() => elements.mainCountdownAmount.classList.remove('pulse'), 800);
      setTimeout(addVisualEffects, 8000);
    }
    setTimeout(addVisualEffects, 5000);
  }

  function formatMoney(amount) {
    return 'RM' + Math.floor(amount).toLocaleString('en-US');
  }

  // Welcome popup (unchanged behavior, text picked from translations where possible)
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
      (translations.en && translations.en.welcomeMessage) || 'Welcome!',
      (translations.ja && translations.ja.welcomeMessage) || 'ようこそ！',
      (translations.ko && translations.ko.welcomeMessage) || '환영합니다!',
      (translations['zh-CN'] && translations['zh-CN'].welcomeMessage) || '欢迎！',
      (translations['zh-HK'] && translations['zh-HK'].welcomeMessage) || '歡迎！'
    ];
    welcomeMessages.forEach((msg, index) => {
      const line = document.createElement('div');
      line.className = 'welcome-message-line';
      line.textContent = msg;
      line.style.animationDelay = `${index * 0.3}s`;
      messageContainer.appendChild(line);
    });

    popup.appendChild(logo);
    popup.appendChild(countdownContainer);
    popup.appendChild(messageContainer);
    document.body.appendChild(popup);

    const moneyElement = document.getElementById('welcomeMoneyCountdown');
    const startAmount = 30000, endAmount = 20000, duration = 3000;
    const startTime = Date.now();

    function updateCountdown() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startAmount - (startAmount - endAmount) * eased;
      moneyElement.textContent = formatMoney(current);
      moneyElement.classList.add('pumping');
      setTimeout(() => moneyElement.classList.remove('pumping'), 500);

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
      if (progress < 1) requestAnimationFrame(updateCountdown);
      else {
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

    setTimeout(() => {
      popup.classList.add('hidden');
      setTimeout(() => { popup.remove(); startMainCountdown(); }, 1000);
    }, 5000);
  }

  // Phone hint element (under phone field)
  const phoneHint = document.createElement('div');
  phoneHint.className = 'phone-hint mt-1 small text-muted';
  elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);

  // Load job data from data.json (you said JSON is already updated)
  function loadJobData() {
    fetch('data.json')
      .then(r => { if (!r.ok) throw new Error('Network response was not ok'); return r.json();})
      .then(data => { jobData = data; populateJobDropdowns(); updatePayoutPreview(); })
      .catch(err => { console.error('Error loading job data:', err); alert(t('loadError','Failed to load jobs. Please try again.')); });
  }

  function unique(arr) { return [...new Set(arr)]; }

  function populateJobDropdowns() {
    const languages = unique(jobData.map(j => j.Language).filter(Boolean));
    const locations = unique(jobData.map(j => j.Location).filter(Boolean));

    elements.jobLangSelect.innerHTML = '';
    addOption(elements.jobLangSelect, '', t('selectOption','Select an option'), true, true);
    languages.forEach(lang => addOption(elements.jobLangSelect, lang, lang));

    elements.locationSelect.innerHTML = '';
    addOption(elements.locationSelect, '', t('selectOption','Select an option'), true, true);
    locations.forEach(loc => addOption(elements.locationSelect, loc, loc));
  }

  function addOption(select, value, text, disabled=false, selected=false) {
    const option = document.createElement('option');
    option.value = value; option.textContent = text;
    option.disabled = disabled; option.selected = selected;
    select.appendChild(option);
  }

  function updatePageContent() {
    const pack = translations[currentLanguage] || translations.en || {};
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (pack[key]) {
        if (el.tagName === 'INPUT' && el.type === 'button') el.value = pack[key];
        else el.textContent = pack[key];
      }
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
      const key = el.getAttribute('data-translate-placeholder');
      if (pack[key]) el.placeholder = pack[key];
    });

    if (elements.termsContent) elements.termsContent.innerHTML = pack.termsContent || '';

    // Phone hint
    phoneHint.textContent = pack.phoneHint || 'Use your TnG-registered number if applicable.';
    populateJobDropdowns();
    updatePayoutPreview();
  }

  function changeLanguage() {
    currentLanguage = elements.pageLangSelect.value;
    updatePageContent();
  }

  // Validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateForm() {
    let ok = true;

    if (!elements.fullName.value.trim()) { elements.fullName.classList.add('is-invalid'); ok = false; }
    else elements.fullName.classList.remove('is-invalid');

    if (!elements.phoneNumber.value.trim() || elements.phoneNumber.value.trim().length < 8) { elements.phoneNumber.classList.add('is-invalid'); ok = false; }
    else elements.phoneNumber.classList.remove('is-invalid');

    if (!validateEmail(elements.email.value)) { elements.email.classList.add('is-invalid'); ok = false; }
    else elements.email.classList.remove('is-invalid');

    if (!elements.jobLangSelect.value) { elements.jobLangSelect.classList.add('is-invalid'); ok = false; }
    else elements.jobLangSelect.classList.remove('is-invalid');

    if (!elements.locationSelect.value) { elements.locationSelect.classList.add('is-invalid'); ok = false; }
    else elements.locationSelect.classList.remove('is-invalid');

    if (!elements.consentCheckbox.checked) { elements.consentCheckbox.classList.add('is-invalid'); ok = false; }
    else elements.consentCheckbox.classList.remove('is-invalid');

    elements.nextBtn.disabled = !ok;
    return ok;
  }

  // Only numbers in phone field + show hint
  elements.phoneNumber.addEventListener('input', function () {
    this.value = this.value.replace(/[^\d]/g, '');
    phoneHint.style.display = this.value.length > 0 ? 'block' : 'none';
    validateForm();
  });

  // === NEW: Interpreter (WFH) payout detection ===
  const PAYOUTS = {
    standard: { a1: 50, a2: 750, total: 800 },
    interpreterWFH: { a1: 2000, a2: 3000, total: 5000 }
  };

  function coalesceJobText(job, keys) {
    for (const k of keys) {
      if (job[k] && typeof job[k] === 'string') return job[k].toLowerCase();
    }
    return '';
  }

  function truthyFlag(job, keys) {
    for (const k of keys) {
      if (k in job) {
        const v = job[k];
        if (v === true || v === 'true' || v === 1 || v === '1' ) return true;
      }
    }
    return false;
  }

  function isInterpreterWFH(job) {
    // Robust across many possible JSON schemas (you said you already updated JSON)
    if (!job || typeof job !== 'object') return false;

    // Allow explicit flags if present
    if (truthyFlag(job, ['InterpreterWFH','Interpreter_WFH','isInterpreterWFH'])) return true;

    const title = coalesceJobText(job, ['Job Title','Title','Role','Position','Evergreen Job Title','Posting Title']);
    const category = coalesceJobText(job, ['Category','Function','Department','Family']);
    const mode = coalesceJobText(job, ['Work Mode','Work Arrangement','Work Type','Working Arrangement','Mode']);

    const text = [title, category, mode].join(' ');
    const isInterp = /\binterpre(t|ter|ting)\b/.test(text); // matches interpret/ interpreter
    const isWFH = /(work\s*from\s*home|wfh|remote)/.test(text);

    return isInterp && isWFH;
  }

  function findSelectedJob() {
    const lang = elements.jobLangSelect.value;
    const loc = elements.locationSelect.value;
    if (!lang || !loc) return null;
    return jobData.find(item => item.Language === lang && item.Location === loc) || null;
  }

  function updatePayoutPreview() {
    // Default to standard
    const job = findSelectedJob();
    const special = isInterpreterWFH(job);

    elements.payoutStandard.classList.toggle('active', !special);
    elements.payoutInterpreter.classList.toggle('active', !!special);

    // Also announce to screen readers
    if (elements.payoutBox) {
      elements.payoutBox.setAttribute('aria-label',
        special ? 'Interpreter (WFH) payout selected' : 'Standard payout selected'
      );
    }
  }
  // === /NEW ===

  function generateReferral() {
    if (!validateForm()) return false;

    const name = elements.fullName.value.trim().replace(/\s+/g, '+');
    const phone = encodeURIComponent(elements.phoneNumber.value.trim());
    const email = encodeURIComponent(elements.email.value.trim());
    const jobLanguage = elements.jobLangSelect.value;
    const location = elements.locationSelect.value;

    currentLocation = location.toLowerCase().includes('malaysia') ? 'malaysia' :
                      location.toLowerCase().includes('thailand') ? 'thailand' : 'global';

    const job = jobData.find(item => item.Language === jobLanguage && item.Location === location);

    if (job) {
      const baseUrl = (job['Evergreen link'] || '').split('?')[0];
      if (!baseUrl) {
        alert(t('noJobError','No application link found for this selection.'));
        return false;
      }

      const referralUrl = `${baseUrl}?iis=xRAF&iisn=${name}%7C${phone}%7C${email}`;
      elements.referralLink.value = referralUrl;
      generateQRCode(referralUrl);
      updateSocialLinks();
      updatePayoutPreview(); // keep preview synced
      return true;
    }

    alert(t('noJobError','No matching job found for this selection.'));
    return false;
  }

  function generateQRCode(url) {
    QRCode.toCanvas(elements.qrCodeCanvas, url, {
      width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' }
    }, function (error) {
      if (error) console.error('QR Code generation error:', error);
    });
  }

  function updateSocialLinks() {
    elements.locationSocialLinks.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'social-media-container';

    const sections = [
      { title: t('tpGlobal','TP Global'), links: (window.locationSocialLinks && window.locationSocialLinks.global) || [] },
      { title: t('followMalaysia','TP Malaysia'), links: (window.locationSocialLinks && window.locationSocialLinks.malaysia) || [] },
      { title: t('followThailand','TP Thailand'), links: (window.locationSocialLinks && window.locationSocialLinks.thailand) || [] }
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
        const a = document.createElement('a');
        a.href = link.url; a.className = `social-icon ${link.icon}`;
        a.target = "_blank";
        a.innerHTML = `<i class="fab fa-${link.icon}"></i>`;
        a.title = link.name;
        linksDiv.appendChild(a);
      });

      sectionDiv.appendChild(linksDiv);
      container.appendChild(sectionDiv);
    });

    elements.locationSocialLinks.appendChild(container);
    updateShareButtons();
  }

  function updateShareButtons() {
    const shareUrl = encodeURIComponent(elements.referralLink.value);
    const shareText = (translations[currentLanguage] && translations[currentLanguage].shareMessage) || (translations.en && translations.en.shareMessage) || 'Apply with my TP referral: ';
    const encodedShareText = encodeURIComponent(shareText);

    elements.shareWhatsapp.onclick = () => window.open(`https://wa.me/?text=${encodedShareText}${shareUrl}`, '_blank');
    elements.shareLine.onclick = () => window.open(`https://social-plugins.line.me/lineit/share?url=${encodedShareText}${shareUrl}`, '_blank');
    elements.shareFacebook.onclick = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
  }

  function copyToClipboard() {
    elements.referralLink.select();
    document.execCommand('copy');
    const original = elements.copyBtn.innerHTML;
    elements.copyBtn.innerHTML = `<i class="fas fa-check"></i> ${t('copiedText','Copied!')}`;
    setTimeout(() => { elements.copyBtn.innerHTML = original; }, 2000);
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

    // Update payout preview live on each selection change
    elements.jobLangSelect.addEventListener('change', function(){ validateForm(); updatePayoutPreview(); });
    elements.locationSelect.addEventListener('change', function(){ validateForm(); updatePayoutPreview(); });

    elements.consentCheckbox.addEventListener('change', validateForm);
    elements.nextBtn.addEventListener('click', showStep2);
    elements.backBtn.addEventListener('click', showStep1);
    elements.copyBtn.addEventListener('click', copyToClipboard);

    const termsModal = new bootstrap.Modal(elements.termsModal);
    document.querySelector('[data-bs-target="#termsModal"]').addEventListener('click', function (e) {
      e.preventDefault(); termsModal.show();
    });
  }

  function init() {
    showWelcomePopup();
    loadJobData();
    setupEventListeners();
    updatePageContent();
    document.getElementById('current-year').textContent = new Date().getFullYear();
  }

  init();
});
