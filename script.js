// script.js (drop-in)
// - Keeps your original behavior
// - Appends 2 payout tables into T&C: Standard + Interpreter (WFH)
// - Works even if translations/locationSocialLinks are missing at first
// - Exposes window.updateShareButtons for analytics override in index.html

document.addEventListener('DOMContentLoaded', function() {
  // ---- Elements ----
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

  // ---- Utilities / Safe getters ----
  function getTranslationsPack(lang) {
    try {
      if (typeof window.translations === 'object' && window.translations) {
        return window.translations[lang] || window.translations.en || {};
      }
    } catch (e) {}
    return {};
  }
  function t(key, fallback) {
    var pack = getTranslationsPack(currentLanguage);
    if (pack && pack[key]) return pack[key];
    return (typeof fallback === 'string') ? fallback : key;
  }
  function getSocialLinks() {
    try {
      if (typeof window.locationSocialLinks === 'object' && window.locationSocialLinks) {
        return window.locationSocialLinks;
      }
    } catch(e) {}
    return { global: [], malaysia: [], thailand: [] };
  }
  function formatMoney(amount) {
    return 'RM' + Math.floor(amount).toLocaleString('en-US');
  }

  // ---- Phone hint under phone input ----
  var phoneHint = document.createElement('div');
  phoneHint.className = 'phone-hint mt-1 small text-muted';
  if (elements.phoneNumber && elements.phoneNumber.parentNode) {
    elements.phoneNumber.parentNode.insertBefore(phoneHint, elements.phoneNumber.nextSibling);
  }

  // ---- Main page subtle pulse ----
  function startMainCountdown() {
    function addVisualEffects() {
      if (!elements.mainCountdownAmount) return;
      elements.mainCountdownAmount.classList.add('pulse');
      setTimeout(function(){ elements.mainCountdownAmount.classList.remove('pulse'); }, 800);
      setTimeout(addVisualEffects, 8000);
    }
    setTimeout(addVisualEffects, 5000);
  }

  // ---- Welcome popup (30k -> 20k) ----
  function showWelcomePopup() {
    try {
      var popup = document.createElement('div');
      popup.className = 'welcome-popup';

      var logo = document.createElement('img');
      logo.src = 'TPLogo11.png';
      logo.alt = 'Teleperformance Logo';
      logo.className = 'welcome-logo';

      var container = document.createElement('div');
      container.className = 'welcome-countdown-container';

      var title = document.createElement('div');
      title.className = 'welcome-countdown-title';
      title.textContent = t('welcomeTotalRewards','Total Rewards Available');

      var amount = document.createElement('div');
      amount.className = 'welcome-money-countdown';
      amount.id = 'welcomeMoneyCountdown';
      amount.textContent = 'RM30,000';

      var hurry = document.createElement('div');
      hurry.className = 'welcome-hurry-message';
      hurry.textContent = t('hurry1','Hurry! The rewards are disappearing fast! 🚀');

      container.appendChild(title);
      container.appendChild(amount);
      container.appendChild(hurry);

      var messages = document.createElement('div');
      messages.className = 'welcome-message-container';

      var msgs = [];
      var packs = (typeof window.translations === 'object') ? window.translations : null;
      msgs.push((packs && packs.en && packs.en.welcomeMessage) ? packs.en.welcomeMessage : 'Welcome!');
      msgs.push((packs && packs.ja && packs.ja.welcomeMessage) ? packs.ja.welcomeMessage : 'ようこそ！');
      msgs.push((packs && packs.ko && packs.ko.welcomeMessage) ? packs.ko.welcomeMessage : '환영합니다!');
      msgs.push((packs && packs['zh-CN'] && packs['zh-CN'].welcomeMessage) ? packs['zh-CN'].welcomeMessage : '欢迎！');
      msgs.push((packs && packs['zh-HK'] && packs['zh-HK'].welcomeMessage) ? packs['zh-HK'].welcomeMessage : '歡迎！');

      for (var i=0;i<msgs.length;i++){
        var line = document.createElement('div');
        line.className = 'welcome-message-line';
        line.textContent = msgs[i];
        line.style.animationDelay = (i*0.3)+'s';
        messages.appendChild(line);
      }

      popup.appendChild(logo);
      popup.appendChild(container);
      popup.appendChild(messages);
      document.body.appendChild(popup);

      var startAmount = 30000, endAmount = 20000, duration = 3000, start = Date.now();
      (function tick(){
        var p = Math.min((Date.now() - start)/duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = startAmount - (startAmount - endAmount) * eased;
        amount.textContent = formatMoney(val);
        amount.classList.add('pumping');
        setTimeout(function(){ amount.classList.remove('pumping'); }, 500);

        if (Math.random() < 0.02) {
          var arr = [
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
          var finals = [t('final1',"Last chance to claim your rewards!"),
                        t('final2',"Time's almost up! Don't miss out!"),
                        t('final3',"Final amounts remaining - act now!"),
                        t('final4',"Rewards are going fast - join today!")];
          hurry.textContent = finals[Math.floor(Math.random()*finals.length)];
        }
      })();

      setTimeout(function(){
        popup.classList.add('hidden');
        setTimeout(function(){ popup.remove(); startMainCountdown(); }, 1000);
      }, 5000);
    } catch(e) {
      // If anything fails, just start main pulse
      startMainCountdown();
    }
  }

  // ---- Data loading ----
  function loadJobData() {
    fetch('data.json')
      .then(function(r){ if(!r.ok) throw new Error('Network response was not ok'); return r.json(); })
      .then(function(data){ jobData = data || []; populateJobDropdowns(); })
      .catch(function(err){
        console.error('Error loading job data:', err);
        alert(t('loadError','Failed to load jobs. Please try again.'));
      });
  }

  function unique(arr) {
    var out = [];
    for (var i=0;i<arr.length;i++){
      var v = arr[i];
      if (out.indexOf(v)===-1) out.push(v);
    }
    return out;
  }

  function populateJobDropdowns() {
    if (!elements.jobLangSelect || !elements.locationSelect) return;
    var languages = unique(jobData.map(function(j){ return j.Language; }).filter(Boolean));
    var locations = unique(jobData.map(function(j){ return j.Location; }).filter(Boolean));

    elements.jobLangSelect.innerHTML = '';
    addOption(elements.jobLangSelect, '', t('selectOption','Select an option'), true, true);
    languages.forEach(function(lang){ addOption(elements.jobLangSelect, lang, lang); });

    elements.locationSelect.innerHTML = '';
    addOption(elements.locationSelect, '', t('selectOption','Select an option'), true, true);
    locations.forEach(function(loc){ addOption(elements.locationSelect, loc, loc); });
  }

  function addOption(select, value, text, disabled, selected) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    option.disabled = !!disabled;
    option.selected = !!selected;
    select.appendChild(option);
  }

  // ---- T&C payout tables injection ----
  function payoutStrings(lang){
    var p = getTranslationsPack(lang);
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
      stA1Cond:  p.tncStA1Cond  || 'Candidate passes the AI assessment',
      stA1Amt:   p.tncStA1Amt   || 'RM50',
      stA2Stage: p.tncStA2Stage || 'Probation Completed (90 days)',
      stA2Cond:  p.tncStA2Cond  || 'Candidate completes 90-day probation period',
      stA2Amt:   p.tncStA2Amt   || 'RM750',
      stTotalAmt:p.tncStTotalAmt|| 'RM800',
      // Interpreter WFH
      inA1Stage: p.tncInA1Stage || 'First Day of Work',
      inA1Cond:  p.tncInA1Cond  || 'Candidate joins and completes Day 1',
      inA1Amt:   p.tncInA1Amt   || 'RM2,000',
      inA2Stage: p.tncInA2Stage || 'After 90 Days',
      inA2Cond:  p.tncInA2Cond  || 'Candidate completes 90 days of service',
      inA2Amt:   p.tncInA2Amt   || 'RM3,000',
      inTotalAmt:p.tncInTotalAmt|| 'RM5,000',
      note:      p.tncPayoutNote|| 'All other xRAF terms remain unchanged. Interpreter (WFH) follows the special RM5,000 structure.'
    };
  }

  function buildPayoutTableHTML(){
    var s = payoutStrings(currentLanguage);
    return '' +
    '<div id="tnc-payout-table-wrapper" class="mt-3">' +
      '<h6 class="tnc-payout-title">'+s.sectionTitle+'</h6>' +

      '<div class="table-responsive mb-3">' +
        '<table class="table tnc-table">' +
          '<caption class="tnc-caption">'+s.standardHeader+'</caption>' +
          '<thead>' +
            '<tr>' +
              '<th scope="col">'+s.colStage+'</th>' +
              '<th scope="col">'+s.colCondition+'</th>' +
              '<th scope="col" class="text-end">'+s.colAmount+'</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr>' +
              '<td>'+s.stA1Stage+'</td>' +
              '<td>'+s.stA1Cond+'</td>' +
              '<td class="text-end"><strong>'+s.stA1Amt+'</strong></td>' +
            '</tr>' +
            '<tr>' +
              '<td>'+s.stA2Stage+'</td>' +
              '<td>'+s.stA2Cond+'</td>' +
              '<td class="text-end"><strong>'+s.stA2Amt+'</strong></td>' +
            '</tr>' +
            '<tr class="tnc-total-row">' +
              '<td colspan="2"><strong>'+s.total+'</strong></td>' +
              '<td class="text-end"><strong>'+s.stTotalAmt+'</strong></td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +

      '<div class="table-responsive">' +
        '<table class="table tnc-table">' +
          '<caption class="tnc-caption">'+s.interpHeader+'</caption>' +
          '<thead>' +
            '<tr>' +
              '<th scope="col">'+s.colStage+'</th>' +
              '<th scope="col">'+s.colCondition+'</th>' +
              '<th scope="col" class="text-end">'+s.colAmount+'</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr>' +
              '<td>'+s.inA1Stage+'</td>' +
              '<td>'+s.inA1Cond+'</td>' +
              '<td class="text-end"><strong>'+s.inA1Amt+'</strong></td>' +
            '</tr>' +
            '<tr>' +
              '<td>'+s.inA2Stage+'</td>' +
              '<td>'+s.inA2Cond+'</td>' +
              '<td class="text-end"><strong>'+s.inA2Amt+'</strong></td>' +
            '</tr>' +
            '<tr class="tnc-total-row">' +
              '<td colspan="2"><strong>'+s.total+'</strong></td>' +
              '<td class="text-end"><strong>'+s.inTotalAmt+'</strong></td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +

      '<p class="small text-muted mt-2 mb-0">'+s.note+'</p>' +
    '</div>';
  }

  function injectPayoutTablesIntoTnC() {
    try {
      if (!elements.termsContent) return;
      // Rebuild base T&C from translations to ensure we don't duplicate
      var base = getTranslationsPack(currentLanguage).termsContent;
      if (!base) {
        // fallback to current HTML (keeps any manually loaded content)
        base = elements.termsContent.innerHTML || '';
      }
      elements.termsContent.innerHTML = base;
      var existing = elements.termsContent.querySelector('#tnc-payout-table-wrapper');
      if (existing) existing.remove();
      elements.termsContent.insertAdjacentHTML('beforeend', buildPayoutTableHTML());
    } catch (e) {
      console.error('T&C payout table injection failed:', e);
    }
  }

  // ---- i18n + UI text updates ----
  function updatePageContent() {
    var pack = getTranslationsPack(currentLanguage);

    var transEls = document.querySelectorAll('[data-translate]');
    for (var i=0;i<transEls.length;i++){
      var el = transEls[i];
      var key = el.getAttribute('data-translate');
      if (pack[key]) {
        if (el.tagName === 'INPUT' && el.type === 'button') el.value = pack[key];
        else el.textContent = pack[key];
      }
    }
    var placeholderEls = document.querySelectorAll('[data-translate-placeholder]');
    for (var j=0;j<placeholderEls.length;j++){
      var pe = placeholderEls[j];
      var pkey = pe.getAttribute('data-translate-placeholder');
      if (pack[pkey]) pe.placeholder = pack[pkey];
    }

    if (elements.termsContent) {
      elements.termsContent.innerHTML = pack.termsContent || '';
    }

    // Phone hint
    phoneHint.textContent = pack.phoneHint || 'Use your TnG-registered number if applicable.';

    // Dropdowns
    populateJobDropdowns();

    // Ensure T&C tables reflect current language
    injectPayoutTablesIntoTnC();
  }

  function changeLanguage() {
    currentLanguage = elements.pageLangSelect ? elements.pageLangSelect.value : 'en';
    updatePageContent();
  }

  // ---- Validation ----
  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateForm() {
    var isValid = true;

    if (!elements.fullName.value.trim()) { elements.fullName.classList.add('is-invalid'); isValid = false; }
    else elements.fullName.classList.remove('is-invalid');

    if (!elements.phoneNumber.value.trim() || elements.phoneNumber.value.trim().length < 8) { elements.phoneNumber.classList.add('is-invalid'); isValid = false; }
    else elements.phoneNumber.classList.remove('is-invalid');

    if (!validateEmail(elements.email.value)) { elements.email.classList.add('is-invalid'); isValid = false; }
    else elements.email.classList.remove('is-invalid');

    if (!elements.jobLangSelect.value) { elements.jobLangSelect.classList.add('is-invalid'); isValid = false; }
    else elements.jobLangSelect.classList.remove('is-invalid');

    if (!elements.locationSelect.value) { elements.locationSelect.classList.add('is-invalid'); isValid = false; }
    else elements.locationSelect.classList.remove('is-invalid');

    if (!elements.consentCheckbox.checked) { elements.consentCheckbox.classList.add('is-invalid'); isValid = false; }
    else elements.consentCheckbox.classList.remove('is-invalid');

    elements.nextBtn.disabled = !isValid;
    return isValid;
  }

  // Digits only + hint
  if (elements.phoneNumber) {
    elements.phoneNumber.addEventListener('input', function() {
      this.value = this.value.replace(/[^\d]/g, '');
      phoneHint.style.display = this.value.length > 0 ? 'block' : 'none';
      validateForm();
    });
  }

  // ---- Referral generation ----
  function generateReferral() {
    if (!validateForm()) return false;

    var name = elements.fullName.value.trim().replace(/\s+/g, '+');
    var phone = encodeURIComponent(elements.phoneNumber.value.trim());
    var email = encodeURIComponent(elements.email.value.trim());
    var jobLanguage = elements.jobLangSelect.value;
    var location = elements.locationSelect.value;

    var locLower = location ? location.toLowerCase() : '';
    if (locLower.indexOf('malaysia') !== -1) currentLocation = 'malaysia';
    else if (locLower.indexOf('thailand') !== -1) currentLocation = 'thailand';
    else currentLocation = 'global';

    var job = null;
    for (var i=0;i<jobData.length;i++){
      var it = jobData[i];
      if (it.Language === jobLanguage && it.Location === location) { job = it; break; }
    }

    if (job) {
      var link = (job['Evergreen link'] || '');
      var baseUrl = link.split('?')[0] || '';
      if (!baseUrl) {
        alert(t('noJobError','No application link found for this selection.'));
        return false;
      }
      var referralUrl = baseUrl + '?iis=xRAF&iisn=' + name + '%7C' + phone + '%7C' + email;
      elements.referralLink.value = referralUrl;
      generateQRCode(referralUrl);
      updateSocialLinks();
      return true;
    }

    alert(t('noJobError','No matching job found for this selection.'));
    return false;
  }

  function generateQRCode(url) {
    try {
      if (!elements.qrCodeCanvas) return;
      QRCode.toCanvas(elements.qrCodeCanvas, url, {
        width: 200, margin: 2, color: { dark:'#000000', light:'#ffffff' }
      }, function(error){ if (error) console.error('QR Code generation error:', error); });
    } catch(e) {
      console.error('QRCode library missing?', e);
    }
  }

  function updateSocialLinks() {
    if (!elements.locationSocialLinks) return;
    elements.locationSocialLinks.innerHTML = '';

    var cfg = getSocialLinks();
    var container = document.createElement('div');
    container.className = 'social-media-container';

    var sections = [
      { title: t('tpGlobal','TP Global'), links: cfg.global || [] },
      { title: t('followMalaysia','TP Malaysia'), links: cfg.malaysia || [] },
      { title: t('followThailand','TP Thailand'), links: cfg.thailand || [] }
    ];

    for (var i=0;i<sections.length;i++){
      var section = sections[i];
      var sectionDiv = document.createElement('div');
      sectionDiv.className = 'social-media-section';

      var title = document.createElement('h6');
      title.textContent = section.title;
      title.className = 'social-media-title';
      sectionDiv.appendChild(title);

      var linksDiv = document.createElement('div');
      linksDiv.className = 'social-media-links';

      for (var j=0;j<section.links.length;j++){
        var link = section.links[j];
        var a = document.createElement('a');
        a.href = link.url;
        a.className = 'social-icon ' + link.icon;
        a.target = '_blank';
        a.innerHTML = '<i class="fab fa-' + link.icon + '"></i>';
        a.title = link.name;
        linksDiv.appendChild(a);
      }

      sectionDiv.appendChild(linksDiv);
      container.appendChild(sectionDiv);
    }

    elements.locationSocialLinks.appendChild(container);
    updateShareButtons();
  }

  function updateShareButtons() {
    var shareUrl = encodeURIComponent(elements.referralLink && elements.referralLink.value ? elements.referralLink.value : '');
    var shareText = t('shareMessage', 'Apply with my TP referral: ');
    var encodedShareText = encodeURIComponent(shareText);

    if (elements.shareWhatsapp) {
      elements.shareWhatsapp.onclick = function(){
        window.open('https://wa.me/?text=' + encodedShareText + shareUrl, '_blank');
      };
    }
    if (elements.shareLine) {
      elements.shareLine.onclick = function(){
        window.open('https://social-plugins.line.me/lineit/share?url=' + encodedShareText + shareUrl, '_blank');
      };
    }
    if (elements.shareFacebook) {
      elements.shareFacebook.onclick = function(){
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, '_blank');
      };
    }
  }
  // Expose for analytics override in index.html
  window.updateShareButtons = updateShareButtons;

  function copyToClipboard() {
    try {
      elements.referralLink.select();
      document.execCommand('copy');
      var originalText = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML = '<i class="fas fa-check"></i> ' + t('copiedText','Copied!');
      setTimeout(function(){ elements.copyBtn.innerHTML = originalText; }, 2000);
    } catch(e) {
      console.error('Copy failed:', e);
    }
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
    if (elements.pageLangSelect) elements.pageLangSelect.addEventListener('change', changeLanguage);

    if (elements.fullName) elements.fullName.addEventListener('input', validateForm);
    if (elements.phoneNumber) elements.phoneNumber.addEventListener('input', validateForm);
    if (elements.email) elements.email.addEventListener('input', validateForm);
    if (elements.jobLangSelect) elements.jobLangSelect.addEventListener('change', validateForm);
    if (elements.locationSelect) elements.locationSelect.addEventListener('change', validateForm);
    if (elements.consentCheckbox) elements.consentCheckbox.addEventListener('change', validateForm);

    if (elements.nextBtn) elements.nextBtn.addEventListener('click', showStep2);
    if (elements.backBtn) elements.backBtn.addEventListener('click', showStep1);
    if (elements.copyBtn) elements.copyBtn.addEventListener('click', copyToClipboard);

    // Ensure T&C tables are injected every time modal opens
    if (elements.termsModal) {
      elements.termsModal.addEventListener('shown.bs.modal', injectPayoutTablesIntoTnC);
    }
    // Also, the terms link via data-bs- attributes is fine; no need to programmatically open here.
  }

  function init() {
    showWelcomePopup();
    loadJobData();
    setupEventListeners();
    updatePageContent();
    var yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  init();
});
