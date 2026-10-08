/**
 * IT'S STREET COFFEE - LUXURY EDITORIAL ENGINE
 * Talegaon Dabhade & Pune Flagship
 * 10k-Websites Standard: Vanilla JS, 60fps Canvas Scrub, Web Audio Ambience
 */

(function () {
  'use strict';

  // --- 1. STATE & ASSET PRELOADING ---
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const heroContainer = document.querySelector('.hero-scroll-container');
  const progressRing = document.querySelector('.hero-progress-ring .ring-fill');
  const captionBands = document.querySelectorAll('.hero-caption-band');
  const siteNav = document.querySelector('.site-nav');

  const heroImageUrls = [
    'assets/hero-frames/step1-roast.jpg',
    'assets/hero-frames/step2-espresso.jpg',
    'assets/hero-frames/step3-latte.jpg'
  ];

  const heroImages = [];
  let imagesLoadedCount = 0;
  let isReadyToDraw = false;

  heroImageUrls.forEach((url, index) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imagesLoadedCount++;
      if (imagesLoadedCount === heroImageUrls.length) {
        isReadyToDraw = true;
        resizeCanvas();
        renderHeroCanvas();
      }
    };
    heroImages[index] = img;
  });

  // --- 2. CANVAS RESIZING WITH HIGH DPI ---
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.scale(dpr, dpr);
    if (isReadyToDraw) {
      renderHeroCanvas();
    }
  }

  window.addEventListener('resize', debounce(resizeCanvas, 100));

  // --- 3. SCROLL PROGRESS & CANVAS RENDERING ---
  let scrollProgress = 0;
  let currentRaf = null;

  function calculateScrollProgress() {
    if (!heroContainer) return 0;
    const rect = heroContainer.getBoundingClientRect();
    const scrollableDistance = heroContainer.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return 0;
    const currentScroll = -rect.top;
    const progress = Math.max(0, Math.min(1, currentScroll / scrollableDistance));
    return progress;
  }

  function drawCoverImage(img, alpha) {
    if (!ctx || !canvas || !img.complete) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;

    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = w;
      renderH = w / imgRatio;
      offsetX = 0;
      offsetY = (h - renderH) / 2;
    } else {
      renderH = h;
      renderW = h * imgRatio;
      offsetX = (w - renderW) / 2;
      offsetY = 0;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    ctx.restore();
  }

  function renderHeroCanvas() {
    if (!ctx || !canvas || !isReadyToDraw) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const p = scrollProgress;

    if (p <= 0.5) {
      // Transition from Image 0 to Image 1
      const factor = p / 0.5;
      const ease = easeInOutCubic(factor);
      drawCoverImage(heroImages[0], 1);
      drawCoverImage(heroImages[1], ease);
    } else {
      // Transition from Image 1 to Image 2
      const factor = (p - 0.5) / 0.5;
      const ease = easeInOutCubic(factor);
      drawCoverImage(heroImages[1], 1);
      drawCoverImage(heroImages[2], ease);
    }
  }

  function updateNarrativeBands(progress) {
    // Band 1: 0.00 to 0.22
    // Band 2: 0.25 to 0.52
    // Band 3: 0.55 to 0.80
    // Band 4: 0.82 to 1.00
    captionBands.forEach((band) => {
      const bandIndex = parseInt(band.getAttribute('data-band'), 10);
      let isActive = false;

      if (bandIndex === 1 && progress >= 0 && progress < 0.24) {
        isActive = true;
      } else if (bandIndex === 2 && progress >= 0.25 && progress < 0.52) {
        isActive = true;
      } else if (bandIndex === 3 && progress >= 0.53 && progress < 0.80) {
        isActive = true;
      } else if (bandIndex === 4 && progress >= 0.81) {
        isActive = true;
      }

      if (isActive) {
        band.classList.add('active');
      } else {
        band.classList.remove('active');
      }
    });

    // Update Progress Ring
    if (progressRing) {
      const circumference = 88; // 2 * pi * 14
      const offset = circumference - progress * circumference;
      progressRing.style.strokeDashoffset = offset;
    }
  }

  function onScroll() {
    scrollProgress = calculateScrollProgress();

    if (siteNav) {
      if (window.scrollY > 80) {
        siteNav.classList.add('scrolled');
      } else {
        siteNav.classList.remove('scrolled');
      }
    }

    if (!currentRaf) {
      currentRaf = requestAnimationFrame(() => {
        renderHeroCanvas();
        updateNarrativeBands(scrollProgress);
        currentRaf = null;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial trigger
  setTimeout(() => {
    resizeCanvas();
    onScroll();
  }, 100);

  // --- 4. WEB AUDIO AMBIENT COFFEE LOUNGE ---
  let audioCtx = null;
  let isAudioPlaying = false;
  let ambientNoiseNode = null;
  let loungeGainNode = null;
  let harmonicChords = [];

  const audioToggleBtn = document.getElementById('audioToggle');
  const equalizer = document.querySelector('.audio-equalizer');

  function initCoffeeLoungeAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();

    // 1. Warm Pink Ambient Texture (Gentle Cafe Acoustics)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to warm cafe low frequencies
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(450, audioCtx.currentTime);

    ambientNoiseNode = audioCtx.createGain();
    ambientNoiseNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(ambientNoiseNode);

    // 2. Warm Vinyl Lounge Chords (E Flat Major 7: Eb3, G3, Bb3, D4)
    const freqs = [155.56, 196.00, 233.08, 293.66];
    harmonicChords = freqs.map((freq) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      oscGain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(ambientNoiseNode);
      osc.start();
      return { osc, gain: oscGain };
    });

    loungeGainNode = audioCtx.createGain();
    loungeGainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    ambientNoiseNode.connect(loungeGainNode);
    loungeGainNode.connect(audioCtx.destination);
    whiteNoise.start();
  }

  function toggleAudio() {
    if (!audioCtx) {
      initCoffeeLoungeAudio();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      loungeGainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 1.2);
      isAudioPlaying = true;
      if (equalizer) equalizer.classList.add('playing');
      if (audioToggleBtn) {
        audioToggleBtn.querySelector('.audio-label').textContent = 'Lounge: On';
      }
    } else {
      loungeGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      isAudioPlaying = false;
      if (equalizer) equalizer.classList.remove('playing');
      if (audioToggleBtn) {
        audioToggleBtn.querySelector('.audio-label').textContent = 'Cafe Lounge';
      }
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleAudio);
  }

  // --- 5. INTERACTIVE MENU FILTERING ---
  const menuTabs = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  menuTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      menuTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      menuCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 6. INTERACTIVE TASTE PROFILE QUIZ ---
  const quizOptions = document.querySelectorAll('.quiz-option-btn');
  const quizResultBox = document.getElementById('quizResult');
  const userPreferences = {
    temp: 'cold',
    flavor: 'rich',
    sweetness: 'indulgent'
  };

  quizOptions.forEach((btn) => {
    btn.addEventListener('click', function () {
      const step = this.closest('.quiz-step');
      const siblings = step.querySelectorAll('.quiz-option-btn');
      siblings.forEach((s) => s.classList.remove('selected'));
      this.classList.add('selected');

      const prefType = this.getAttribute('data-type');
      const prefValue = this.getAttribute('data-val');
      userPreferences[prefType] = prefValue;

      evaluateTasteProfile();
    });
  });

  function evaluateTasteProfile() {
    let rec = {
      name: 'Signature Street Blast',
      desc: 'Double shot dark roast blended with rich chocolate brownie and velvety ice cream.',
      price: '₹139',
      image: 'assets/brand/coffee-cup.png',
      tag: 'Signature Indulgence'
    };

    if (userPreferences.temp === 'hot' && userPreferences.flavor === 'bold') {
      rec = {
        name: 'Classical Cappuccino',
        desc: 'Precision pulled 9-bar espresso layered with silky, steamed microfoam and dusted with cocoa.',
        price: '₹99',
        image: 'assets/drinks/cappuccino-art.jpg',
        tag: 'Artisan Classic'
      };
    } else if (userPreferences.temp === 'hot' && userPreferences.flavor === 'sweet') {
      rec = {
        name: 'Caramel Cappuccino',
        desc: 'Rich espresso folded with slow-cooked golden butter caramel and textured cream milk.',
        price: '₹119',
        image: 'assets/drinks/cappuccino-art.jpg',
        tag: 'Dessert Masterpiece'
      };
    } else if (userPreferences.flavor === 'fruity') {
      rec = {
        name: 'Alphonso Mango Smoothie',
        desc: 'Pure Ratnagiri Alphonso mango pulp blended with chilled cream and fresh milk.',
        price: '₹139',
        image: 'assets/drinks/alphonso-mango-smoothie.jpg',
        tag: 'Maharashtra Specialty'
      };
    } else if (userPreferences.flavor === 'crisp') {
      rec = {
        name: 'Fresh Mint Mojito',
        desc: 'Muddled fresh garden mint, zesty lime juice, cane nectar, and effervescent sparkling soda.',
        price: '₹119',
        image: 'assets/drinks/mint-mojito.jpg',
        tag: 'Chilled Revitalizer'
      };
    } else if (userPreferences.sweetness === 'bold') {
      rec = {
        name: 'Single Origin Espresso Shot',
        desc: 'Uncompromising 30ml pure extraction showcasing thick hazelnut crema and dark chocolate body.',
        price: '₹79',
        image: 'assets/drinks/espresso-shot.jpg',
        tag: 'Pure Origin'
      };
    }

    if (quizResultBox) {
      quizResultBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <img src="${rec.image}" alt="${rec.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-bright);">
          <div>
            <span class="mono-tag" style="margin-bottom: 0.35rem;">${rec.tag}</span>
            <h4 style="font-size: 1.35rem; color: var(--text-primary); margin-bottom: 0.25rem;">${rec.name}</h4>
            <p style="font-size: 0.88rem; color: var(--text-secondary); max-width: 420px;">${rec.desc}</p>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;">
          <span style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--color-crema);">${rec.price}</span>
          <a href="https://wa.me/919901503680?text=Hi%20It's%20Street%20Coffee,%20I%20took%20your%20Taste%20Quiz%20and%20matched%20with%20${encodeURIComponent(rec.name)}%20(${rec.price}).%20Please%20reserve%20a%20cup%20for%20me%20at%20Talegaon%20Dabhade." target="_blank" class="btn-luxury" style="padding: 0.6rem 1.25rem; font-size: 0.78rem;">Order This Cup</a>
        </div>
      `;
      quizResultBox.classList.add('show');
    }
  }

  // Trigger initial quiz recommendation
  evaluateTasteProfile();

  // --- 7. DRAWER MODALS (RESERVATIONS & FRANCHISE) ---
  const reservationDrawer = document.getElementById('reservationDrawer');
  const franchiseDrawer = document.getElementById('franchiseDrawer');
  const openReservationBtns = document.querySelectorAll('[data-open-drawer="reservation"]');
  const openFranchiseBtns = document.querySelectorAll('[data-open-drawer="franchise"]');
  const closeDrawerBtns = document.querySelectorAll('.drawer-close');
  const drawers = document.querySelectorAll('.drawer-backdrop');

  openReservationBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (reservationDrawer) reservationDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  openFranchiseBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (franchiseDrawer) franchiseDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeAllDrawers() {
    drawers.forEach((drawer) => drawer.classList.remove('active'));
    document.body.style.overflow = '';
  }

  closeDrawerBtns.forEach((btn) => {
    btn.addEventListener('click', closeAllDrawers);
  });

  drawers.forEach((drawer) => {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        closeAllDrawers();
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDrawers();
  });

  // Handle Reservation Form Submit -> Direct WhatsApp Link
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('resName').value.trim();
      const guests = document.getElementById('resGuests').value;
      const date = document.getElementById('resDate').value;
      const time = document.getElementById('resTime').value;
      const notes = document.getElementById('resNotes').value.trim();

      const message = `*TABLE RESERVATION INQUIRY*\n*Outlet:* Talegaon Dabhade, Pune\n*Guest Name:* ${name}\n*Party Size:* ${guests} Guests\n*Date:* ${date}\n*Time:* ${time}${notes ? '\n*Special Requests:* ' + notes : ''}\n\nSent via It's Street Coffee Flagship Website.`;

      const waUrl = `https://wa.me/919901503680?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      closeAllDrawers();
      reservationForm.reset();
    });
  }

  // Handle Franchise Form Submit -> Direct WhatsApp Link
  const franchiseForm = document.getElementById('franchiseForm');
  if (franchiseForm) {
    franchiseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('franName').value.trim();
      const phone = document.getElementById('franPhone').value.trim();
      const city = document.getElementById('franCity').value.trim();
      const budget = document.getElementById('franBudget').value;
      const notes = document.getElementById('franNotes').value.trim();

      const message = `*FRANCHISE PARTNERSHIP INQUIRY*\n*Investor:* ${name}\n*Phone:* ${phone}\n*Target City / Location:* ${city}\n*Investment Capital:* ${budget}${notes ? '\n*Experience / Notes:* ' + notes : ''}\n\nSent via It's Street Coffee Flagship Website.`;

      const waUrl = `https://wa.me/919901503680?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      closeAllDrawers();
      franchiseForm.reset();
    });
  }

  // --- 8. SMOOTH SCROLL FOR IN-PAGE ANCHORS ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // --- 9. HELPERS ---
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
})();
