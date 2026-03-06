/* ============================================
   Site Interactions, Hero Animation,
   Card Pixel Art Renderer
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. MOBILE MENU
  // ============================================
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================
  // 2. AUDIO TOGGLE
  // ============================================
  const audioToggle = document.querySelector('.audio-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      const muted = chiptuneAudio.toggleMute();
      audioToggle.setAttribute('aria-pressed', String(!muted));
      audioToggle.querySelector('.audio-icon').textContent = muted ? '\u266B' : '\u266A';
      if (!muted) {
        chiptuneAudio.startBGM();
      } else {
        chiptuneAudio.stopBGM();
      }
    });
  }

  // ============================================
  // 3. SCROLL-REVEAL
  // ============================================
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach((el, index) => {
    el.style.setProperty('--card-index', index);
    revealObserver.observe(el);
  });

  // ============================================
  // 4. NAVBAR SCROLL
  // ============================================
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ============================================
  // 5. GAMES FILTER
  // ============================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const gameCards = document.querySelectorAll('.game-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      gameCards.forEach(card => {
        if (filter === 'all' || card.dataset.platform === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ============================================
  // 6. TIMELINE CAROUSEL
  // ============================================
  const timelineContainer = document.querySelector('.timeline-container');
  const prevBtn = document.querySelector('.timeline-prev');
  const nextBtn = document.querySelector('.timeline-next');

  if (prevBtn && nextBtn && timelineContainer) {
    prevBtn.addEventListener('click', () => {
      timelineContainer.scrollBy({ left: -270, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      timelineContainer.scrollBy({ left: 270, behavior: 'smooth' });
    });
  }

  // ============================================
  // 7. SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const navHeight = nav ? nav.offsetHeight : 0;
        const pos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 8. HERO CANVAS ANIMATION
  // ============================================
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    const hCtx = heroCanvas.getContext('2d');
    let heroFrame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const heroStars = [];
    for (let i = 0; i < 80; i++) {
      heroStars.push({
        x: Math.random(),
        y: Math.random() * 0.7,
        size: Math.random() < 0.3 ? 2 : 1,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    const heroMountains = [];
    for (let i = 0; i < 12; i++) {
      heroMountains.push({
        x: i / 12,
        h: 0.1 + Math.random() * 0.15,
        w: 0.08 + Math.random() * 0.08,
        far: Math.random() < 0.5
      });
    }

    const heroClouds = [];
    for (let i = 0; i < 6; i++) {
      heroClouds.push({
        x: Math.random(),
        y: 0.15 + Math.random() * 0.25,
        w: 0.05 + Math.random() * 0.06,
        h: 0.02 + Math.random() * 0.01
      });
    }

    // Small pixel characters walking across
    const heroChars = [
      { x: 0.1, speed: 0.0003, color: '#ff1744', y: 0.88 },
      { x: 0.5, speed: 0.0002, color: '#0060a8', y: 0.88 },
      { x: 0.8, speed: 0.00025, color: '#39ff14', y: 0.88 },
    ];

    function resizeHero() {
      heroCanvas.width = heroCanvas.parentElement.clientWidth;
      heroCanvas.height = heroCanvas.parentElement.clientHeight;
    }
    resizeHero();
    window.addEventListener('resize', resizeHero);

    function drawHeroScene() {
      const W = heroCanvas.width;
      const H = heroCanvas.height;

      // Sky
      const grad = hCtx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#030308');
      grad.addColorStop(0.5, '#0a0a1a');
      grad.addColorStop(1, '#121230');
      hCtx.fillStyle = grad;
      hCtx.fillRect(0, 0, W, H);

      // Stars
      heroStars.forEach(s => {
        const twinkle = Math.sin(heroFrame * 0.015 + s.twinkle);
        hCtx.globalAlpha = 0.3 + twinkle * 0.4;
        hCtx.fillStyle = '#fff';
        hCtx.fillRect(Math.floor(s.x * W), Math.floor(s.y * H), s.size, s.size);
      });
      hCtx.globalAlpha = 1;

      // Mountains
      heroMountains.forEach(m => {
        const speed = m.far ? 0.00005 : 0.0001;
        const mx = ((m.x + heroFrame * speed) % 1.2) * W;
        hCtx.fillStyle = m.far ? '#111128' : '#1a1a3a';
        const mw = m.w * W;
        const mh = m.h * H;
        const baseY = H * 0.85;
        for (let row = 0; row < mh; row += 4) {
          const ratio = row / mh;
          const rowW = (mw / 2) * ratio;
          hCtx.fillRect(
            Math.floor(mx + mw / 2 - rowW),
            Math.floor(baseY - mh + row),
            Math.floor(rowW * 2),
            4
          );
        }
      });

      // Clouds
      heroClouds.forEach(c => {
        const cx = ((c.x + heroFrame * 0.00008) % 1.2) * W;
        hCtx.fillStyle = '#222244';
        hCtx.fillRect(Math.floor(cx), Math.floor(c.y * H), Math.floor(c.w * W), Math.floor(c.h * H));
        hCtx.fillRect(Math.floor(cx + c.w * W * 0.15), Math.floor(c.y * H - c.h * H * 0.5), Math.floor(c.w * W * 0.7), Math.floor(c.h * H * 0.5));
      });

      // Ground
      const groundY = Math.floor(H * 0.85);
      hCtx.fillStyle = '#1a3a0a';
      hCtx.fillRect(0, groundY, W, H - groundY);
      hCtx.fillStyle = '#2d5016';
      hCtx.fillRect(0, groundY, W, 20);
      // Grass tufts
      hCtx.fillStyle = '#39ff14';
      for (let gx = 0; gx < W; gx += 12) {
        hCtx.fillRect(gx, groundY - 2, 4, 4);
      }

      // Walking pixel characters
      heroChars.forEach(ch => {
        if (!reducedMotion) {
          ch.x = (ch.x + ch.speed) % 1.1;
        }
        const cx = Math.floor(ch.x * W);
        const cy = Math.floor(ch.y * H);
        const f = Math.floor(heroFrame / 15) % 2;
        // Body
        hCtx.fillStyle = ch.color;
        hCtx.fillRect(cx, cy - 12, 8, 8);
        // Head
        hCtx.fillStyle = '#ffcc99';
        hCtx.fillRect(cx + 1, cy - 18, 6, 6);
        // Legs
        hCtx.fillStyle = ch.color;
        hCtx.fillRect(cx + (f ? 0 : 2), cy - 4, 3, 4);
        hCtx.fillRect(cx + (f ? 5 : 3), cy - 4, 3, 4);
      });

      heroFrame++;
      if (!reducedMotion) {
        requestAnimationFrame(drawHeroScene);
      }
    }

    drawHeroScene();
  }

  // ============================================
  // 9. CARD PIXEL ART RENDERER
  // ============================================
  const cardCanvases = document.querySelectorAll('.card-pixel-art');
  cardCanvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawGameThumbnail(ctx, canvas.dataset.game, canvas.width, canvas.height);
  });

  function drawGameThumbnail(ctx, game, w, h) {
    // Use a small offscreen canvas and scale up for pixel art look
    const pw = 40;
    const ph = 25;
    const off = document.createElement('canvas');
    off.width = pw;
    off.height = ph;
    const oc = off.getContext('2d');
    oc.imageSmoothingEnabled = false;

    const scenes = {
      'super-mario-world': () => {
        // Sky
        oc.fillStyle = '#5c94fc';
        oc.fillRect(0, 0, pw, ph);
        // Hills
        oc.fillStyle = '#4caf50';
        oc.fillRect(0, 16, pw, 9);
        oc.fillStyle = '#388e3c';
        for (let i = 0; i < 3; i++) {
          const hx = i * 15 + 2;
          oc.fillRect(hx, 12, 10, 4);
          oc.fillRect(hx + 2, 10, 6, 2);
        }
        // Pipe
        oc.fillStyle = '#2e7d32';
        oc.fillRect(28, 12, 8, 8);
        oc.fillStyle = '#43a047';
        oc.fillRect(27, 12, 10, 3);
        // Question block
        oc.fillStyle = '#ffb300';
        oc.fillRect(14, 6, 5, 5);
        oc.fillStyle = '#fff';
        oc.fillRect(15, 8, 2, 1);
        // Clouds
        oc.fillStyle = '#fff';
        oc.fillRect(5, 3, 6, 3);
        oc.fillRect(25, 2, 5, 2);
      },

      'zelda-link-to-past': () => {
        // Green field
        oc.fillStyle = '#2e7d32';
        oc.fillRect(0, 0, pw, ph);
        // Path
        oc.fillStyle = '#a1887f';
        oc.fillRect(16, 0, 6, ph);
        // Trees
        oc.fillStyle = '#1b5e20';
        for (let i = 0; i < 3; i++) {
          oc.fillRect(2 + i * 4, 4, 3, 3);
          oc.fillRect(3 + i * 4, 7, 1, 2);
        }
        // Link (top-down)
        oc.fillStyle = '#4caf50';
        oc.fillRect(18, 10, 3, 4);
        oc.fillStyle = '#ffcc99';
        oc.fillRect(18, 8, 3, 2);
        // Triforce
        oc.fillStyle = '#ffd700';
        oc.fillRect(32, 5, 2, 2);
        oc.fillRect(31, 7, 4, 2);
        oc.fillRect(34, 5, 2, 2);
      },

      'sonic': () => {
        // Blue sky
        oc.fillStyle = '#4fc3f7';
        oc.fillRect(0, 0, pw, ph);
        // Checkerboard ground
        oc.fillStyle = '#8d6e63';
        oc.fillRect(0, 18, pw, 7);
        oc.fillStyle = '#6d4c41';
        for (let x = 0; x < pw; x += 4) {
          for (let y = 18; y < ph; y += 4) {
            if ((x / 4 + y / 4) % 2 === 0) {
              oc.fillRect(x, y, 4, 4);
            }
          }
        }
        // Loop
        oc.fillStyle = '#4caf50';
        oc.fillRect(6, 6, 14, 2);
        oc.fillRect(4, 8, 2, 8);
        oc.fillRect(20, 8, 2, 8);
        oc.fillRect(6, 16, 14, 2);
        // Ring
        oc.fillStyle = '#ffd700';
        oc.fillRect(30, 10, 4, 1);
        oc.fillRect(29, 11, 1, 3);
        oc.fillRect(34, 11, 1, 3);
        oc.fillRect(30, 14, 4, 1);
        // Sonic (blue dot)
        oc.fillStyle = '#1565c0';
        oc.fillRect(12, 12, 3, 3);
      },

      'street-fighter-ii': () => {
        // Background
        oc.fillStyle = '#1a237e';
        oc.fillRect(0, 0, pw, ph);
        // Floor
        oc.fillStyle = '#5d4037';
        oc.fillRect(0, 19, pw, 6);
        // Two fighters
        // Left (white)
        oc.fillStyle = '#fff';
        oc.fillRect(10, 10, 4, 6);
        oc.fillStyle = '#ffcc99';
        oc.fillRect(10, 7, 4, 3);
        oc.fillRect(8, 12, 2, 3); // punch
        // Right (red)
        oc.fillStyle = '#f44336';
        oc.fillRect(26, 10, 4, 6);
        oc.fillStyle = '#ffcc99';
        oc.fillRect(26, 7, 4, 3);
        oc.fillRect(30, 12, 2, 3);
        // Legs
        oc.fillStyle = '#fff';
        oc.fillRect(10, 16, 2, 3);
        oc.fillRect(12, 16, 2, 3);
        oc.fillStyle = '#f44336';
        oc.fillRect(26, 16, 2, 3);
        oc.fillRect(28, 16, 2, 3);
        // Health bars
        oc.fillStyle = '#f44336';
        oc.fillRect(2, 2, 15, 2);
        oc.fillStyle = '#4caf50';
        oc.fillRect(2, 2, 10, 2);
        oc.fillStyle = '#f44336';
        oc.fillRect(23, 2, 15, 2);
        oc.fillStyle = '#4caf50';
        oc.fillRect(23, 2, 12, 2);
      },

      'doom': () => {
        // Dark corridor
        oc.fillStyle = '#1a1a1a';
        oc.fillRect(0, 0, pw, ph);
        // Walls (perspective)
        oc.fillStyle = '#4a4a4a';
        oc.fillRect(0, 0, 5, ph);
        oc.fillRect(pw - 5, 0, 5, ph);
        oc.fillStyle = '#333';
        oc.fillRect(5, 2, 30, 3);
        oc.fillRect(5, 20, 30, 5);
        // Floor
        oc.fillStyle = '#3e2723';
        oc.fillRect(5, 15, 30, 10);
        // Red light
        oc.fillStyle = '#b71c1c';
        oc.fillRect(18, 6, 4, 4);
        oc.fillStyle = '#f44336';
        oc.fillRect(19, 7, 2, 2);
        // Gun silhouette
        oc.fillStyle = '#666';
        oc.fillRect(16, 18, 8, 3);
        oc.fillRect(19, 15, 2, 3);
      },

      'donkey-kong-country': () => {
        // Jungle
        oc.fillStyle = '#1b5e20';
        oc.fillRect(0, 0, pw, ph);
        // Canopy
        oc.fillStyle = '#2e7d32';
        oc.fillRect(0, 0, pw, 8);
        oc.fillStyle = '#388e3c';
        for (let i = 0; i < pw; i += 5) {
          oc.fillRect(i, 6, 4, 4);
        }
        // Ground
        oc.fillStyle = '#5d4037';
        oc.fillRect(0, 20, pw, 5);
        // DK
        oc.fillStyle = '#795548';
        oc.fillRect(8, 12, 5, 6);
        oc.fillRect(8, 10, 5, 2);
        oc.fillStyle = '#f44336';
        oc.fillRect(9, 11, 3, 1);
        // Banana
        oc.fillStyle = '#ffeb3b';
        oc.fillRect(25, 14, 3, 1);
        oc.fillRect(24, 15, 2, 2);
        // Barrel
        oc.fillStyle = '#8d6e63';
        oc.fillRect(30, 16, 6, 5);
        oc.fillStyle = '#6d4c41';
        oc.fillRect(32, 16, 2, 5);
      },

      'chrono-trigger': () => {
        // Dark background
        oc.fillStyle = '#1a1a2e';
        oc.fillRect(0, 0, pw, ph);
        // Time gate (swirling portal)
        oc.fillStyle = '#3f51b5';
        oc.fillRect(14, 4, 12, 12);
        oc.fillStyle = '#7c4dff';
        oc.fillRect(16, 6, 8, 8);
        oc.fillStyle = '#b388ff';
        oc.fillRect(18, 8, 4, 4);
        oc.fillStyle = '#fff';
        oc.fillRect(19, 9, 2, 2);
        // Sparkles
        oc.fillStyle = '#e1f5fe';
        oc.fillRect(12, 3, 1, 1);
        oc.fillRect(27, 6, 1, 1);
        oc.fillRect(14, 16, 1, 1);
        oc.fillRect(25, 15, 1, 1);
        // Ground
        oc.fillStyle = '#2e7d32';
        oc.fillRect(0, 20, pw, 5);
        // Character
        oc.fillStyle = '#f44336';
        oc.fillRect(6, 15, 3, 4);
        oc.fillStyle = '#ffcc99';
        oc.fillRect(6, 13, 3, 2);
      },

      'resident-evil': () => {
        // Dark mansion
        oc.fillStyle = '#1a1a1a';
        oc.fillRect(0, 0, pw, ph);
        // Door
        oc.fillStyle = '#5d4037';
        oc.fillRect(12, 4, 16, 18);
        oc.fillStyle = '#3e2723';
        oc.fillRect(13, 5, 6, 16);
        oc.fillRect(21, 5, 6, 16);
        // Door handle
        oc.fillStyle = '#ffd700';
        oc.fillRect(18, 12, 2, 2);
        // Blood
        oc.fillStyle = '#b71c1c';
        oc.fillRect(6, 18, 3, 2);
        oc.fillRect(5, 19, 5, 3);
        oc.fillRect(32, 16, 2, 4);
        // Walls
        oc.fillStyle = '#424242';
        oc.fillRect(0, 0, 12, ph);
        oc.fillRect(28, 0, 12, ph);
        oc.fillStyle = '#616161';
        oc.fillRect(0, 22, pw, 3);
      },

      'crash-bandicoot': () => {
        // Jungle
        oc.fillStyle = '#2e7d32';
        oc.fillRect(0, 0, pw, ph);
        oc.fillStyle = '#66bb6a';
        oc.fillRect(0, 0, pw, 6);
        // Path
        oc.fillStyle = '#a1887f';
        oc.fillRect(10, 8, 20, ph - 8);
        // Crate
        oc.fillStyle = '#8d6e63';
        oc.fillRect(22, 14, 6, 6);
        oc.fillStyle = '#ffd700';
        oc.fillRect(24, 16, 2, 2);
        // TNT
        oc.fillStyle = '#f44336';
        oc.fillRect(8, 14, 6, 6);
        oc.fillStyle = '#fff';
        oc.fillRect(9, 16, 4, 2);
        // Crash
        oc.fillStyle = '#ff9800';
        oc.fillRect(16, 12, 4, 5);
        oc.fillStyle = '#ffcc99';
        oc.fillRect(16, 10, 4, 2);
        oc.fillStyle = '#1565c0';
        oc.fillRect(16, 17, 4, 3);
      },

      'pokemon': () => {
        // Grass field
        oc.fillStyle = '#66bb6a';
        oc.fillRect(0, 0, pw, ph);
        oc.fillStyle = '#4caf50';
        oc.fillRect(0, 16, pw, 9);
        // Sky
        oc.fillStyle = '#81d4fa';
        oc.fillRect(0, 0, pw, 12);
        // Pikachu
        oc.fillStyle = '#fdd835';
        oc.fillRect(16, 12, 5, 5);
        oc.fillRect(17, 10, 3, 2);
        // Ears
        oc.fillRect(16, 8, 1, 3);
        oc.fillRect(20, 8, 1, 3);
        // Eyes
        oc.fillStyle = '#000';
        oc.fillRect(17, 13, 1, 1);
        oc.fillRect(19, 13, 1, 1);
        // Cheeks
        oc.fillStyle = '#f44336';
        oc.fillRect(16, 14, 1, 1);
        oc.fillRect(20, 14, 1, 1);
        // Pokeball
        oc.fillStyle = '#f44336';
        oc.fillRect(6, 15, 5, 2);
        oc.fillStyle = '#fff';
        oc.fillRect(6, 17, 5, 2);
        oc.fillStyle = '#000';
        oc.fillRect(6, 17, 5, 1);
        oc.fillStyle = '#fff';
        oc.fillRect(8, 16, 1, 2);
        // Grass patches
        oc.fillStyle = '#2e7d32';
        oc.fillRect(28, 18, 3, 2);
        oc.fillRect(32, 16, 4, 3);
      },

      'final-fantasy-vii': () => {
        // Midgar skyline
        oc.fillStyle = '#1a1a2e';
        oc.fillRect(0, 0, pw, ph);
        // Sky with pollution
        oc.fillStyle = '#263238';
        oc.fillRect(0, 0, pw, 10);
        // Buildings
        oc.fillStyle = '#37474f';
        oc.fillRect(2, 8, 6, 14);
        oc.fillRect(10, 6, 4, 16);
        oc.fillRect(16, 10, 8, 12);
        oc.fillRect(26, 4, 5, 18);
        oc.fillRect(33, 8, 5, 14);
        // Windows
        oc.fillStyle = '#ffeb3b';
        for (let bx = 3; bx < 36; bx += 7) {
          for (let by = 10; by < 20; by += 3) {
            if (Math.random() > 0.3) {
              oc.fillRect(bx, by, 1, 1);
            }
          }
        }
        // Mako reactor glow
        oc.fillStyle = '#4caf50';
        oc.fillRect(18, 12, 4, 2);
        oc.fillStyle = '#69f0ae';
        oc.fillRect(19, 13, 2, 1);
        // Ground
        oc.fillStyle = '#455a64';
        oc.fillRect(0, 22, pw, 3);
      },

      'goldeneye': () => {
        // Gray background
        oc.fillStyle = '#616161';
        oc.fillRect(0, 0, pw, ph);
        // Gun barrel view
        oc.fillStyle = '#212121';
        oc.fillRect(0, 0, pw, ph);
        // Circle opening
        oc.fillStyle = '#9e9e9e';
        oc.fillRect(12, 4, 16, 17);
        oc.fillRect(10, 6, 20, 13);
        // Crosshair
        oc.fillStyle = '#f44336';
        oc.fillRect(19, 4, 2, 17);
        oc.fillRect(10, 11, 20, 2);
        // Bond silhouette
        oc.fillStyle = '#000';
        oc.fillRect(18, 7, 4, 3);
        oc.fillRect(17, 10, 6, 7);
        oc.fillRect(16, 13, 2, 4);
        oc.fillRect(22, 13, 2, 4);
      },

      'starcraft': () => {
        // Space
        oc.fillStyle = '#0a0a1a';
        oc.fillRect(0, 0, pw, ph);
        // Stars
        oc.fillStyle = '#fff';
        for (let i = 0; i < 15; i++) {
          oc.fillRect(Math.floor(Math.random() * pw), Math.floor(Math.random() * ph), 1, 1);
        }
        // Planet surface
        oc.fillStyle = '#795548';
        oc.fillRect(0, 18, pw, 7);
        oc.fillStyle = '#5d4037';
        oc.fillRect(0, 20, pw, 5);
        // Marine
        oc.fillStyle = '#1565c0';
        oc.fillRect(10, 12, 4, 5);
        oc.fillRect(10, 10, 4, 2);
        oc.fillStyle = '#90caf9';
        oc.fillRect(10, 10, 4, 1);
        oc.fillRect(14, 14, 3, 1); // gun
        // Building
        oc.fillStyle = '#424242';
        oc.fillRect(26, 12, 10, 8);
        oc.fillStyle = '#1565c0';
        oc.fillRect(28, 14, 3, 2);
        oc.fillRect(33, 14, 2, 2);
      },

      'metal-gear-solid': () => {
        // Dark background
        oc.fillStyle = '#1a1a1a';
        oc.fillRect(0, 0, pw, ph);
        // Radar screen
        oc.fillStyle = '#1b5e20';
        oc.fillRect(4, 4, 16, 16);
        oc.fillStyle = '#2e7d32';
        oc.fillRect(5, 5, 14, 14);
        // Radar sweep
        oc.fillStyle = '#4caf50';
        oc.fillRect(12, 5, 1, 14);
        oc.fillRect(5, 12, 14, 1);
        // Dot
        oc.fillStyle = '#f44336';
        oc.fillRect(14, 8, 2, 2);
        // Exclamation mark
        oc.fillStyle = '#ffeb3b';
        oc.fillRect(28, 4, 4, 8);
        oc.fillRect(28, 14, 4, 3);
        // Ground
        oc.fillStyle = '#37474f';
        oc.fillRect(0, 20, pw, 5);
      },

      'half-life': () => {
        // Orange background
        oc.fillStyle = '#e65100';
        oc.fillRect(0, 0, pw, ph);
        // Darker frame
        oc.fillStyle = '#bf360c';
        oc.fillRect(0, 0, pw, 3);
        oc.fillRect(0, ph - 3, pw, 3);
        oc.fillRect(0, 0, 3, ph);
        oc.fillRect(pw - 3, 0, 3, ph);
        // Lambda symbol
        oc.fillStyle = '#fff';
        // Left leg of lambda
        oc.fillRect(14, 6, 2, 2);
        oc.fillRect(15, 8, 2, 2);
        oc.fillRect(16, 10, 2, 2);
        oc.fillRect(17, 12, 2, 2);
        oc.fillRect(18, 14, 2, 2);
        oc.fillRect(19, 16, 2, 2);
        // Right leg
        oc.fillRect(26, 6, 2, 2);
        oc.fillRect(25, 8, 2, 2);
        oc.fillRect(24, 10, 2, 2);
        oc.fillRect(23, 12, 2, 2);
        oc.fillRect(22, 14, 2, 2);
        oc.fillRect(21, 16, 2, 2);
        // Top bar
        oc.fillRect(12, 5, 4, 2);
        // Bottom connection
        oc.fillRect(19, 16, 4, 2);
      },
    };

    const drawFn = scenes[game];
    if (drawFn) {
      drawFn();
      // Scale up to full canvas
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, pw, ph, 0, 0, w, h);
    } else {
      // Fallback: gradient
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#39ff14';
      ctx.font = '12px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText(game || '?', w / 2, h / 2);
    }
  }

});
