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
    mainCountdownAmount: document.getElementById('mainCountdownAmount')
  };

  let currentLanguage = 'en';
  let currentLocation = '';
  let jobData = [];

  // Expose sharing hook for analytics wrapper
  window.updateShareButtons = updateShareButtons;

  // Helpers
  function t(key, fallback = '') {
    try {
      const pack = translations[currentLanguage] || translations.en || {};
      return (pack && pack[key]) || fallback || key;
    } catch { return fallback || key; }
  }

  function formatMoney(amount) { return 'RM' + Math.floor(amount).toLocaleString('en-US'); }

  // Main page countdown visual pulse only
  function startMainCountdown() {
    function addVisualEffects() {
      elements.mainCountdownAmount.classList.add('pulse');
      setTimeout(() => elements.mainCountdownAmount.classList.remove('pulse'), 800);
      setTimeout(addVisualEffects, 8000);
    }
    setTimeout(addVisualEffects, 5000);
  }

  // Welcome popup
  function showWelcomePopup() {
    const popup = document.createElement('div');
    popup.className = 'welcome-popup';

    const logo = document.createElement('img');
    logo.src = 'TPLogo11.png';
    logo.alt = 'Teleperformance Logo';
    logo.className = 'welcome-logo';

    const container = document.createElement('div');
    container.className = 'welcome-countdown-container';

    const title = document.createElement('div');
    title.className = 'welcome-countdown-title';
    title.textContent = t('welcomeTotalRewards', 'Total Rewards Available');

    const amount = document.createElement('div');
    amount.className = 'welcome-money-countdown';
    amount.id = 'welcomeMoneyCountdown';
    amount.textContent = 'RM30,000';

    const hurry = document.createElement('div');
    hurry.className = 'welcome-hurry-message';
    hurry.textContent = t('hurry1', 'Hurry! The rewards are disappearing fast! 🚀');

    container.appendChild(title);
    container.appendChild(amount);
    container.appendChild(hurry);

    const messages = document.createElement('div');
    messages.className = 'welcome-message-container';
    [translations.en?.welcomeMessage || 'Welcome!',
     translations.ja?.welcomeMessage || 'ようこそ！',
     translations.ko?.welcomeMessage || '환영합니다!',
     translations['zh-CN']?.welcomeMessage || '欢迎！',
     translations['zh-HK']?.welcomeMessage || '歡迎！'
    ].forEach((msg, i) => {
      const line = document.createElement('div');
      line.className = 'welcome-message-line';
      line.textContent = msg;
      line.style.animationDelay = `${i * 0.3}s`;
      messages.appendChild(line);
    });

    popup.appendChild(logo);
    popup.appendChild(container);
    popup.appendChild(messages);
    document.body.appendChild(popup);

    const startAmount = 30000, endAmount = 20000, duration = 3000, start = Date.now();
    const amountEl = document.getElementById('welcomeMoneyCountdown');
    (function tick(){
      const p = Math.min((Date.now() - start)/duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      amountEl.textContent = formatMoney(startAmount - (startAmount - endAmount) * eased);
      amountEl.classList.add('pumping'); setTimeout(()=>amountEl.classList.remove('pumping'), 500);
      if (Math.random() < 0.02) {
        const arr = [
          t('hurry1',"Hurry! The rewards are disappearing fast! 🚀"),
          t('hurry2',"Don't wait - the amount is dropping! ⏳"),
          t('hurry3',"Limited rewards available! 💰"),
          t('hurry4',"Join now before it's too late! 🔥"),
          t('hurry5',"Others are claiming their rewards - don't miss out! 👥")
        ];
        hurry.textContent = arr[Math.floor(Math.random()*arr.length)];
      }
      if (p < 1) requestAnimationFrame(tick);
      else {
        const finals = [t('final1',"Last chance to claim your rewards!"), t('final2',"Time's almost up! Don't miss out!"),
                        t('final3',"Final amounts remaining - act now!"), t('final4',"Rewards are going fast - join today!")];
        hurry.textContent = finals[Math.floor(Math.random()*finals.length)];
      }
    })();

    setTimeout(()=>{ popup.classList.add('hidden'); setTimeout(()=>{ popup.remove(); startMainCountdown(); }, 1000); }, 5000);
  }

  // Phone hint under phone field
  const phoneHint = document.createElement('div');
  phoneHint.className = 'phone-hint mt-1 small text-muted';
  elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);

  // Load jobs (JSON already updated by you)
  function loadJobData() {
    fetch('data.json')
      .then(r => { if (!r.ok) throw new Error('Network response was not ok'); return r.json();})
      .then(data => { jobData = data; populateJobDropdowns(); })
      .catch(err => { console.error('Error loading job data:', err); alert(t('loadError','Failed to load jobs. Please try again.')); });
  }

  function unique(a){ return [...new Set(a)]; }

  function populateJobDropdowns() {
    const languages = unique(jobData.map(j=>j.Language).filter(Boolean));
    const locations = unique(jobData.map(j=>j.Location).filter(Boolean));

    elements.jobLangSelect.innerHTML = '';
    addOption(elements.jobLangSelect, '', t('selectOption','Select an option'), true, true);
    languages.forEach(lang => addOption(elements.jobLangSelect, lang, lang));

    elements.locationSelect.innerHTML = '';
    addOption(elements.locationSelect, '', t('selectOption','Select an option'), true, true);
    locations.forEach(loc => addOption(elements.locationSelect, loc, loc));
  }

  function addOption(select, value, text, disabled=false, selected=false){
    const o = document.createElement('option');
    o.value = value; o.textContent = text; o.disabled = disabled; o.selected = selected;
    select.appendChild(o);
  }

  // ===== T&C payout table injection =====
  function payoutStrings(lang){
    // Fallbacks in EN if your translations.js doesn’t define these keys
    const p = translations[lang] || {};
    return {
      sectionTitle: p.tncPayoutTitle || 'Referral Bonus Structure',
      standardHeader: p.tncStandardHeader || 'Standard Roles',
      interpHeader: p.tncInterpreterHeader || 'Interpreter (Work From Home)',
      colStage: p.tncColStage || 'Stage',
      colCondition: p.tncColCondition || 'Condition',
      colAmount: p.tncColAmount || 'Amount',
      total: p.tncTotal || 'Total',
      // Standard
      stA1Stage: p.tncStA1Stage || 'Assessment Passed',
      stA1Cond: p.tncStA1Cond || 'Candidate passes the AI assessment',
      stA1Amt:  p.tncStA1Amt  || 'RM50',
      stA2Stage: p.tncStA2Stage || 'Probation Completed (90 days)',
      stA2Cond: p.tncStA2Cond || 'Candidate completes 90-day probation period',
      stA2Amt:  p.tncStA2Amt  || 'RM750',
      stTotalAmt: p.tncStTotalAmt || 'RM800',
      // Interpreter WFH
      inA1Stage: p.tncInA1Stage || 'First Day of Work',
      inA1Cond: p.tncInA1Cond || 'Candidate joins and completes Day 1',
      inA1Amt:  p.tncInA1Amt  || 'RM2,000',
      inA2Stage: p.tncInA2Stage || 'After 90 Days',
      inA2Cond: p.tncInA2Cond || 'Candidate completes 90 days of service',
      inA2Amt:  p.tncInA2Amt  || 'RM3,000',
      inTotalAmt: p.tncInTotalAmt || 'RM5,000',
      note: p.tncPayoutNote || 'All other xRAF terms remain unchanged. Interpreter (WFH) follows the special RM5,000 structure.'
    };
  }

  function buildPayoutTableHTML(){
    const s = payoutStrings(currentLanguage);
    return `
      <div id="tnc-payout-table-wrapper" class="mt-3">
        <h6 class="tnc-payout-title">${s.sectionTitle}</h6>

        <div class="table-responsive mb-3">
          <table class="table tnc-table">
            <caption class="tnc-caption">${s.standardHeader}</caption>
            <thead>
              <tr>
                <th scope="col">${s.colStage}</th>
                <th scope="col">${s.colCondition}</th>
                <th scope="col" class="text-end">${s.colAmount}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${s.stA1Stage}</td>
                <td>${s.stA1Cond}</td>
                <td class="text-end"><strong>${s.stA1Amt}</strong></td>
              </tr>
              <tr>
                <td>${s.stA2Stage}</td>
                <td>${s.stA2Cond}</td>
                <td class="text-end"><strong>${s.stA2Amt}</strong></td>
              </tr>
              <tr class="tnc-total-row">
                <td colspan="2"><strong>${s.total}</strong></td>
                <td class="text-end"><strong>${s.stTotalAmt}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table tnc-table">
            <caption class="tnc-caption">${s.interpHeader}</caption>
            <thead>
              <tr>
                <th scope="col">${s.colStage}</th>
                <th scope="col">${s.colCondition}</th>
                <th scope="col" class="text-end">${s.colAmount}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${s.inA1Stage}</td>
                <td>${s.inA1Cond}</td>
                <td class="text-end"><strong>${s.inA1Amt}</strong></td>
              </tr>
              <tr>
                <td>${s.inA2Stage}</td>
                <td>${s.inA2Cond}</td>
                <td class="text-end"><strong>${s.inA2Amt}</strong></td>
              </tr>
              <tr class="tnc-total-row">
                <td colspan="2"><strong>${s.total}</strong></td>
                <td class="text-end"><strong>${s.inTotalAmt}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="small text-muted mt-2 mb-0">${s.note}</p>
      </div>`;
  }

  function injectPayoutTableIntoTnC() {
    if (!elements.termsContent) return;
    // Reset to translated base content
    elements.termsContent.innerHTML = (translations[currentLanguage]?.termsContent) || (translations.en?.termsContent) || '';
    // Remove old instance (if any) then append
    const old = elements.termsContent.querySelector('#tnc-payout-table-wrapper');
    if (old) old.remove();
    elements.termsContent.insertAdjacentHTML('beforeend', buildPayoutTableHTML());
  }
  // ===== /T&C payout table injection =====

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

    // Phone hint
    phoneHint.textContent = pack.phoneHint || 'Use your TnG-registered number if applicable.';

    // Inject T&C payout tables (after loading base terms)
    injectPayoutTableIntoTnC();

    // Rebuild dropdowns to reflect any localized labels you might add later
    populateJobDropdowns();
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

  // Phone input: digits only + hint toggle
  elements.phoneNumber.addEventListener('input', function () {
    this.value = this.value.replace(/[^\d]/g, '');
    phoneHint.style.display = this.value.length > 0 ? 'block' : 'none';
    validateForm();
  });

  function findSelectedJob() {
    const lang = elements.jobLangSelect.value;
    const loc = elements.locationSelect.value;
    if (!lang || !loc) return null;
    return jobData.find(item => item.Language === lang && item.Location === loc) || null;
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
      return true;
    }

    alert(t('noJobError','No matching job found for this selection.'));
    return false;
  }

  function generateQRCode(url) {
    QRCode.toCanvas(elements.qrCodeCanvas, url, { width: 200, margin: 2, color: { dark:'#000000', light:'#ffffff' } },
      function (error) { if (error) console.error('QR Code generation error:', error); }
    );
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
    const shareText = (translations[currentLanguage] && translations[currentLanguage].shareMessage)
                      || (translations.en && translations.en.shareMessage)
                      || 'Apply with my TP referral: ';
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
    elements.jobLangSelect.addEventListener('change', validateForm);
    elements.locationSelect.addEventListener('change', validateForm);
    elements.consentCheckbox.addEventListener('change', validateForm);

    elements.nextBtn.addEventListener('click', showStep2);
    elements.backBtn.addEventListener('click', showStep1);
    elements.copyBtn.addEventListener('click', copyToClipboard);

    const termsModal = new bootstrap.Modal(elements.termsModal);
    document.querySelector('[data-bs-target="#termsModal"]').addEventListener('click', function (e) {
      e.preventDefault();
      // Always rebuild in case language changed
      injectPayoutTableIntoTnC();
      termsModal.show();
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
