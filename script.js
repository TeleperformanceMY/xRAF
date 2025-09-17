/* script.js — xRAF (safe + T&C payout tables injected) */
document.addEventListener('DOMContentLoaded', function () {
  var elements = {
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

  var currentLanguage = 'en';
  var currentLocation = '';
  var jobData = [];

  /* ---------- Utilities ---------- */
  function getTranslations() {
    return (typeof window !== 'undefined' && window.translations) ? window.translations : null;
  }
  function t(key, fallback) {
    var packs = getTranslations();
    var pack = packs ? (packs[currentLanguage] || packs.en) : null;
    if (pack && pack[key]) return pack[key];
    return (typeof fallback === 'string') ? fallback : key;
  }
  function formatMoney(amount) {
    var n = Math.floor(Number(amount) || 0);
    return 'RM' + n.toLocaleString('en-US');
  }
  function unique(arr) {
    var seen = {}; var out = [];
    for (var i = 0; i < arr.length; i++) {
      var v = arr[i];
      if (v && !seen[v]) { seen[v] = 1; out.push(v); }
    }
    return out;
  }

  /* ---------- Phone hint under input ---------- */
  var phoneHint = document.createElement('div');
  phoneHint.className = 'phone-hint mt-1 small text-muted';
  if (elements.phoneNumber && elements.phoneNumber.parentNode) {
    elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);
  }

  /* ---------- Hero counter visual pulse ---------- */
  function startMainCountdown() {
    function pulse() {
      if (!elements.mainCountdownAmount) return;
      elements.mainCountdownAmount.classList.add('pulse');
      setTimeout(function () { elements.mainCountdownAmount.classList.remove('pulse'); }, 800);
      setTimeout(pulse, 8000);
    }
    setTimeout(pulse, 5000);
  }

  /* ---------- Welcome popup (30k -> 20k) ---------- */
  function showWelcomePopup() {
    var popup = document.createElement('div');
    popup.className = 'welcome-popup';

    var logo = document.createElement('img');
    logo.src = 'TPLogo11.png';
    logo.alt = 'Teleperformance Logo';
    logo.className = 'welcome-logo';

    var box = document.createElement('div');
    box.className = 'welcome-countdown-container';

    var ttl = document.createElement('div');
    ttl.className = 'welcome-countdown-title';
    ttl.textContent = t('welcomeTotalRewards', 'Total Rewards Available');

    var money = document.createElement('div');
    money.className = 'welcome-money-countdown';
    money.id = 'welcomeMoneyCountdown';
    money.textContent = 'RM30,000';

    var hurry = document.createElement('div');
    hurry.className = 'welcome-hurry-message';
    hurry.textContent = t('hurry1', 'Hurry! The rewards are disappearing fast! 🚀');

    box.appendChild(ttl); box.appendChild(money); box.appendChild(hurry);

    var msgsWrap = document.createElement('div');
    msgsWrap.className = 'welcome-message-container';
    var packs = getTranslations() || {};
    var welcomeMessages = [
      (packs.en && packs.en.welcomeMessage) || 'Welcome!',
      (packs.ja && packs.ja.welcomeMessage) || 'ようこそ！',
      (packs.ko && packs.ko.welcomeMessage) || '환영합니다!',
      (packs['zh-CN'] && packs['zh-CN'].welcomeMessage) || '欢迎！',
      (packs['zh-HK'] && packs['zh-HK'].welcomeMessage) || '歡迎！'
    ];
    for (var i = 0; i < welcomeMessages.length; i++) {
      var line = document.createElement('div');
      line.className = 'welcome-message-line';
      line.textContent = welcomeMessages[i];
      line.style.animationDelay = (i * 0.3) + 's';
      msgsWrap.appendChild(line);
    }

    popup.appendChild(logo);
    popup.appendChild(box);
    popup.appendChild(msgsWrap);
    document.body.appendChild(popup);

    var startAmount = 30000, endAmount = 20000, duration = 3000, start = Date.now();
    (function tick() {
      var p = Math.min((Date.now() - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = startAmount - (startAmount - endAmount) * eased;
      money.textContent = formatMoney(val);
      money.classList.add('pumping');
      setTimeout(function () { money.classList.remove('pumping'); }, 500);

      if (Math.random() < 0.02) {
        var opts = [
          t('hurry1', "Hurry! The rewards are disappearing fast! 🚀"),
          t('hurry2', "Don't wait - the amount is dropping! ⏳"),
          t('hurry3', "Limited rewards available! 💰"),
          t('hurry4', "Join now before it's too late! 🔥"),
          t('hurry5', "Others are claiming their rewards - don't miss out! 👥")
        ];
        hurry.textContent = opts[Math.floor(Math.random() * opts.length)];
      }
      if (p < 1) requestAnimationFrame(tick);
      else {
        var finalMsgs = [
          t('final1', "Last chance to claim your rewards!"),
          t('final2', "Time's almost up! Don't miss out!"),
          t('final3', "Final amounts remaining - act now!"),
          t('final4', "Rewards are going fast - join today!")
        ];
        hurry.textContent = finalMsgs[Math.floor(Math.random() * finalMsgs.length)];
      }
    })();

    setTimeout(function () {
      popup.classList.add('hidden');
      setTimeout(function () { popup.remove(); startMainCountdown(); }, 1000);
    }, 5000);
  }

  /* ---------- Load job data ---------- */
  function loadJobData() {
    fetch('data.json')
      .then(function (r) { if (!r.ok) throw new Error('Network response was not ok'); return r.json(); })
      .then(function (data) { jobData = data || []; populateJobDropdowns(); })
      .catch(function (err) { console.error('Error loading job data:', err); alert(t('loadError', 'Failed to load jobs. Please try again.')); });
  }

  function populateJobDropdowns() {
    if (!elements.jobLangSelect || !elements.locationSelect) return;
    var langs = unique(jobData.map(function (j) { return j.Language; }));
    var locs  = unique(jobData.map(function (j) { return j.Location; }));

    elements.jobLangSelect.innerHTML = '';
    addOption(elements.jobLangSelect, '', t('selectOption', 'Select an option'), true, true);
    for (var i = 0; i < langs.length; i++) addOption(elements.jobLangSelect, langs[i], langs[i]);

    elements.locationSelect.innerHTML = '';
    addOption(elements.locationSelect, '', t('selectOption', 'Select an option'), true, true);
    for (var k = 0; k < locs.length; k++) addOption(elements.locationSelect, locs[k], locs[k]);
  }

  function addOption(select, value, text, disabled, selected) {
    var o = document.createElement('option');
    o.value = value; o.textContent = text;
    if (disabled) o.disabled = true;
    if (selected) o.selected = true;
    select.appendChild(o);
  }

  /* ---------- T&C payout tables injection ---------- */
  function payoutTableHTML(lang) {
    // Read translations safely
    function TT(key, fallback) { return t(key, fallback); }
    var strings = {
      sectionTitle: TT('tncPayoutTitle', 'Referral Bonus Structure'),
      standardHeader: TT('tncStandardHeader', 'Standard Roles'),
      interpHeader: TT('tncInterpreterHeader', 'Interpreter (Work From Home)'),
      colStage: TT('tncColStage', 'Stage'),
      colCondition: TT('tncColCondition', 'Condition'),
      colAmount: TT('tncColAmount', 'Amount'),
      total: TT('tncTotal', 'Total'),
      // Standard (keep old info)
      stA1Stage: TT('tncStA1Stage', 'Assessment Passed'),
      stA1Cond:  TT('tncStA1Cond', 'Candidate passes the AI assessment'),
      stA1Amt:   TT('tncStA1Amt', 'RM50'),
      stA2Stage: TT('tncStA2Stage', 'Probation Completed (90 days)'),
      stA2Cond:  TT('tncStA2Cond', 'Candidate completes 90-day probation'),
      stA2Amt:   TT('tncStA2Amt', 'RM750'),
      stTotalAmt:TT('tncStTotalAmt', 'RM800'),
      // Interpreter WFH (new)
      inA1Stage: TT('tncInA1Stage', 'First Day of Work'),
      inA1Cond:  TT('tncInA1Cond', 'Candidate joins and completes Day 1'),
      inA1Amt:   TT('tncInA1Amt', 'RM2,000'),
      inA2Stage: TT('tncInA2Stage', 'After 90 Days'),
      inA2Cond:  TT('tncInA2Cond', 'Candidate completes 90 days of service'),
      inA2Amt:   TT('tncInA2Amt', 'RM3,000'),
      inTotalAmt:TT('tncInTotalAmt', 'RM5,000'),
      note:      TT('tncPayoutNote', 'All other xRAF terms remain unchanged. Interpreter (WFH) follows the special RM5,000 structure.')
    };

    return '' +
      '<div id="tnc-payout-table-wrapper" class="mt-3">' +
      '  <h6 class="tnc-payout-title">' + strings.sectionTitle + '</h6>' +
      '  <div class="table-responsive mb-3">' +
      '    <table class="table tnc-table">' +
      '      <caption class="tnc-caption">' + strings.standardHeader + '</caption>' +
      '      <thead>' +
      '        <tr>' +
      '          <th scope="col">' + strings.colStage + '</th>' +
      '          <th scope="col">' + strings.colCondition + '</th>' +
      '          <th scope="col" class="text-end">' + strings.colAmount + '</th>' +
      '        </tr>' +
      '      </thead>' +
      '      <tbody>' +
      '        <tr>' +
      '          <td>' + strings.stA1Stage + '</td>' +
      '          <td>' + strings.stA1Cond + '</td>' +
      '          <td class="text-end"><strong>' + strings.stA1Amt + '</strong></td>' +
      '        </tr>' +
      '        <tr>' +
      '          <td>' + strings.stA2Stage + '</td>' +
      '          <td>' + strings.stA2Cond + '</td>' +
      '          <td class="text-end"><strong>' + strings.stA2Amt + '</strong></td>' +
      '        </tr>' +
      '        <tr class="tnc-total-row">' +
      '          <td colspan="2"><strong>' + strings.total + '</strong></td>' +
      '          <td class="text-end"><strong>' + strings.stTotalAmt + '</strong></td>' +
      '        </tr>' +
      '      </tbody>' +
      '    </table>' +
      '  </div>' +

      '  <div class="table-responsive">' +
      '    <table class="table tnc-table">' +
      '      <caption class="tnc-caption">' + strings.interpHeader + '</caption>' +
      '      <thead>' +
      '        <tr>' +
      '          <th scope="col">' + strings.colStage + '</th>' +
      '          <th scope="col">' + strings.colCondition + '</th>' +
      '          <th scope="col" class="text-end">' + strings.colAmount + '</th>' +
      '        </tr>' +
      '      </thead>' +
      '      <tbody>' +
      '        <tr>' +
      '          <td>' + strings.inA1Stage + '</td>' +
      '          <td>' + strings.inA1Cond + '</td>' +
      '          <td class="text-end"><strong>' + strings.inA1Amt + '</strong></td>' +
      '        </tr>' +
      '        <tr>' +
      '          <td>' + strings.inA2Stage + '</td>' +
      '          <td>' + strings.inA2Cond + '</td>' +
      '          <td class="text-end"><strong>' + strings.inA2Amt + '</strong></td>' +
      '        </tr>' +
      '        <tr class="tnc-total-row">' +
      '          <td colspan="2"><strong>' + strings.total + '</strong></td>' +
      '          <td class="text-end"><strong>' + strings.inTotalAmt + '</strong></td>' +
      '        </tr>' +
      '      </tbody>' +
      '    </table>' +
      '  </div>' +

      '  <p class="small text-muted mt-2 mb-0">' + strings.note + '</p>' +
      '</div>';
  }

  function injectPayoutTables() {
    if (!elements.termsContent) return;

    // base T&C from translations (keep your existing content)
    var packs = getTranslations();
    var base = '';
    if (packs) {
      var langPack = packs[currentLanguage] || packs.en;
      base = (langPack && langPack.termsContent) ? langPack.termsContent : '';
    } else {
      base = elements.termsContent.innerHTML || '';
    }

    elements.termsContent.innerHTML = base;
    var old = elements.termsContent.querySelector('#tnc-payout-table-wrapper');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    elements.termsContent.insertAdjacentHTML('beforeend', payoutTableHTML(currentLanguage));
  }

  /* ---------- Translated text + inputs ---------- */
  function updatePageContent() {
    var packs = getTranslations();
    var translation = packs ? (packs[currentLanguage] || packs.en || {}) : {};

    var els = document.querySelectorAll('[data-translate]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; var key = el.getAttribute('data-translate');
      if (translation[key]) {
        if (el.tagName === 'INPUT' && el.type === 'button') el.value = translation[key];
        else el.textContent = translation[key];
      }
    }
    var placeholders = document.querySelectorAll('[data-translate-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var elp = placeholders[j]; var k = elp.getAttribute('data-translate-placeholder');
      if (translation[k]) elp.placeholder = translation[k];
    }

    if (elements.termsContent) elements.termsContent.innerHTML = translation.termsContent || elements.termsContent.innerHTML || '';
    phoneHint.textContent = translation.phoneHint || 'Use your TnG-registered number if applicable.';

    populateJobDropdowns();

    // ensure payout tables present (e.g., language switch)
    injectPayoutTables();
  }

  function changeLanguage() {
    currentLanguage = elements.pageLangSelect ? elements.pageLangSelect.value : 'en';
    updatePageContent();
  }

  /* ---------- Validation ---------- */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm() {
    var ok = true;

    if (!elements.fullName || !elements.phoneNumber || !elements.email || !elements.jobLangSelect || !elements.locationSelect || !elements.consentCheckbox || !elements.nextBtn) return false;

    if (!elements.fullName.value.trim()) { elements.fullName.classList.add('is-invalid'); ok = false; } else { elements.fullName.classList.remove('is-invalid'); }
    if (!elements.phoneNumber.value.trim() || elements.phoneNumber.value.trim().length < 8) { elements.phoneNumber.classList.add('is-invalid'); ok = false; } else { elements.phoneNumber.classList.remove('is-invalid'); }
    if (!validateEmail(elements.email.value)) { elements.email.classList.add('is-invalid'); ok = false; } else { elements.email.classList.remove('is-invalid'); }
    if (!elements.jobLangSelect.value) { elements.jobLangSelect.classList.add('is-invalid'); ok = false; } else { elements.jobLangSelect.classList.remove('is-invalid'); }
    if (!elements.locationSelect.value) { elements.locationSelect.classList.add('is-invalid'); ok = false; } else { elements.locationSelect.classList.remove('is-invalid'); }
    if (!elements.consentCheckbox.checked) { elements.consentCheckbox.classList.add('is-invalid'); ok = false; } else { elements.consentCheckbox.classList.remove('is-invalid'); }

    elements.nextBtn.disabled = !ok;
    return ok;
  }

  /* ---------- Referral generation ---------- */
  function generateReferral() {
    if (!validateForm()) return false;

    var name = elements.fullName.value.trim().replace(/\s+/g, '+');
    var phone = encodeURIComponent(elements.phoneNumber.value.trim());
    var email = encodeURIComponent(elements.email.value.trim());
    var jobLanguage = elements.jobLangSelect.value;
    var location = elements.locationSelect.value;

    var lname = location || '';
    var lcase = lname.toLowerCase();
    currentLocation = lcase.indexOf('malaysia') !== -1 ? 'malaysia' : (lcase.indexOf('thailand') !== -1 ? 'thailand' : 'global');

    var job = null;
    for (var i = 0; i < jobData.length; i++) {
      var it = jobData[i];
      if (it && it.Language === jobLanguage && it.Location === location) { job = it; break; }
    }

    if (job) {
      var link = job['Evergreen link'] || '';
      var baseUrl = link.split('?')[0] || '';
      if (!baseUrl) { alert(t('noJobError', 'No application link found for this selection.')); return false; }
      var referralUrl = baseUrl + '?iis=xRAF&iisn=' + name + '%7C' + phone + '%7C' + email;

      if (elements.referralLink) elements.referralLink.value = referralUrl;
      generateQRCode(referralUrl);
      updateSocialLinks();
      return true;
    }

    alert(t('noJobError', 'No matching job found for this selection.'));
    return false;
  }

  function generateQRCode(url) {
    if (!elements.qrCodeCanvas || typeof QRCode === 'undefined' || !QRCode.toCanvas) return;
    QRCode.toCanvas(elements.qrCodeCanvas, url, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } },
      function (error) { if (error) console.error('QR Code generation error:', error); }
    );
  }

  /* ---------- Social links + share ---------- */
  function updateSocialLinks() {
    if (!elements.locationSocialLinks) return;

    elements.locationSocialLinks.innerHTML = '';
    var container = document.createElement('div');
    container.className = 'social-media-container';

    var cfg = (typeof window !== 'undefined' && window.locationSocialLinks) ? window.locationSocialLinks : {};
    var sections = [
      { title: t('tpGlobal', 'TP Global'), links: cfg.global || [] },
      { title: t('followMalaysia', 'TP Malaysia'), links: cfg.malaysia || [] },
      { title: t('followThailand', 'TP Thailand'), links: cfg.thailand || [] }
    ];

    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var sectionDiv = document.createElement('div');
      sectionDiv.className = 'social-media-section';

      var title = document.createElement('h6');
      title.textContent = s.title;
      title.className = 'social-media-title';
      sectionDiv.appendChild(title);

      var linksDiv = document.createElement('div');
      linksDiv.className = 'social-media-links';

      for (var k = 0; k < s.links.length; k++) {
        var link = s.links[k];
        var a = document.createElement('a');
        a.href = link.url || '#';
        a.className = 'social-icon ' + (link.icon || '');
        a.target = '_blank';
        a.innerHTML = '<i class="fab fa-' + (link.icon || 'link') + '"></i>';
        a.title = link.name || '';
        linksDiv.appendChild(a);
      }

      sectionDiv.appendChild(linksDiv);
      container.appendChild(sectionDiv);
    }

    elements.locationSocialLinks.appendChild(container);
    updateShareButtons();
  }

  function updateShareButtons() {
    var link = (elements.referralLink && elements.referralLink.value) ? elements.referralLink.value : '';
    var shareUrl = encodeURIComponent(link);
    var shareText = t('shareMessage', 'Apply with my TP referral: ');
    var encodedShareText = encodeURIComponent(shareText);

    if (elements.shareWhatsapp) elements.shareWhatsapp.onclick = function () {
      window.open('https://wa.me/?text=' + encodedShareText + shareUrl, '_blank');
    };
    if (elements.shareLine) elements.shareLine.onclick = function () {
      window.open('https://social-plugins.line.me/lineit/share?url=' + encodedShareText + shareUrl, '_blank');
    };
    if (elements.shareFacebook) elements.shareFacebook.onclick = function () {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, '_blank');
    };
  }
  // expose for analytics wrapper in index.html
  window.updateShareButtons = updateShareButtons;

  /* ---------- Clipboard copy ---------- */
  function copyToClipboard() {
    var text = (elements.referralLink && elements.referralLink.value) ? elements.referralLink.value : '';
    function showOK() {
      if (!elements.copyBtn) return;
      var original = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML = '<i class="fas fa-check"></i> ' + t('copiedText', 'Copied!');
      setTimeout(function () { elements.copyBtn.innerHTML = original; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showOK).catch(function () {
        try {
          elements.referralLink.select();
          document.execCommand('copy');
          showOK();
        } catch (e) { console.warn('Clipboard copy failed', e); }
      });
    } else {
      try {
        elements.referralLink.select();
        document.execCommand('copy');
        showOK();
      } catch (e) { console.warn('Clipboard copy failed', e); }
    }
  }

  /* ---------- Step navigation ---------- */
  function showStep2() {
    if (generateReferral()) {
      if (elements.step1) elements.step1.style.display = 'none';
      if (elements.step2) elements.step2.style.display = 'block';
      window.scrollTo(0, 0);
    }
  }
  function showStep1() {
    if (elements.step2) elements.step2.style.display = 'none';
    if (elements.step1) elements.step1.style.display = 'block';
  }

  /* ---------- Event listeners ---------- */
  function setupEventListeners() {
    if (elements.pageLangSelect) elements.pageLangSelect.addEventListener('change', changeLanguage);

    if (elements.fullName) elements.fullName.addEventListener('input', validateForm);
    if (elements.phoneNumber) {
      elements.phoneNumber.addEventListener('input', function () {
        this.value = this.value.replace(/[^\d]/g, '');
        phoneHint.style.display = this.value.length > 0 ? 'block' : 'none';
        validateForm();
      });
    }
    if (elements.email) elements.email.addEventListener('input', validateForm);
    if (elements.jobLangSelect) elements.jobLangSelect.addEventListener('change', validateForm);
    if (elements.locationSelect) elements.locationSelect.addEventListener('change', validateForm);
    if (elements.consentCheckbox) elements.consentCheckbox.addEventListener('change', validateForm);

    if (elements.nextBtn) elements.nextBtn.addEventListener('click', showStep2);
    if (elements.backBtn) elements.backBtn.addEventListener('click', showStep1);
    if (elements.copyBtn) elements.copyBtn.addEventListener('click', copyToClipboard);

    // Open T&C modal (Bootstrap handles data attributes; we also inject tables on show)
    var termsTrigger = document.querySelector('[data-bs-target="#termsModal"]');
    if (termsTrigger) {
      termsTrigger.addEventListener('click', function (e) {
        // Let bootstrap open the modal; ensure tables are current
        injectPayoutTables();
      });
    }

    // If Bootstrap is present, listen for shown event to re-inject (handles language changes)
    if (elements.termsModal && window.bootstrap && bootstrap.Modal) {
      elements.termsModal.addEventListener('shown.bs.modal', function () { injectPayoutTables(); });
    }
  }

  /* ---------- Init ---------- */
  function init() {
    showWelcomePopup();
    loadJobData();
    setupEventListeners();
    updatePageContent();

    var yr = document.getElementById('current-year');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  init();
});
