/* ============================================================
   THE BUTTERFLY LOVERS — App Controller
   Handles: chapter rendering, pinyin ruby, language toggle,
   audio playback, autoplay, scroll tracking, chapter nav.
   ============================================================ */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────
  const state = {
    currentLang: 'zh',       // 'zh' or 'en'
    currentChapter: 0,       // 0 = none (hero), 1–8 = active chapter
    autoplay: false,
    playing: false,
    audioCtx: null,          // HTMLAudioElement (reused, src changes)
    volume: 1,
    visited: new Set(),
  };

  // ── DOM refs ─────────────────────────────────────────────
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const dom = {
    hero:       $('#hero'),
    beginBtn:   $('#begin-btn'),
    story:      $('#story'),
    toolbar:    $('#toolbar'),
    chapterNav: $('#chapter-nav'),
    langToggle: $('#lang-toggle'),
    autoplayBtn:$('#autoplay-btn'),
    chapters:   $('#chapters-container'),
    playBtn:    $('#play-btn'),
    prevBtn:    $('#prev-btn'),
    nextBtn:    $('#next-btn'),
    progressBar:$('#progress-bar'),
    progressFill:$('#progress-fill'),
    audioLabel: $('#audio-chapter-label'),
    audioTime:  $('#audio-time'),
    volumeSlider:$('#volume-slider'),
    player:     $('#audio-player'),
    iconPlay:   $('.icon-play',  $('#play-btn')),
    iconPause:  $('.icon-pause', $('#play-btn')),
  };

  // ── Audio element ────────────────────────────────────────
  const audio = new Audio();
  audio.preload = 'metadata';
  state.audio = audio;

  // ── Helpers ──────────────────────────────────────────────
  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function chapterTitleZH(ch) {
    return ch.title.zh + ' · ' + ch.title.pinyin;
  }

  // ── Build pinyin Ruby HTML ──────────────────────────────
  function renderPinyinText(chapterId) {
    const pinyinParagraphs = window.PINYIN_DATA?.[chapterId];
    if (!pinyinParagraphs) return '<p><em>(pinyin data unavailable)</em></p>';

    return pinyinParagraphs.map(para => {
      const inner = para.map(token => {
        if (token.p) {
          // Hanzi with ruby
          return `<ruby class="ruby-char" lang="zh-CN"><rb>${token.c}</rb><rp>(</rp><rt>${token.p}</rt><rp>)</rp></ruby>`;
        } else {
          // Punctuation or space — pass through as plain text
          return token.c === '\n' ? '<br>' : `<span class="punct">${token.c}</span>`;
        }
      }).join('');
      return `<p>${inner}</p>`;
    }).join('\n');
  }

  // ── Build chapter HTML ──────────────────────────────────
  function renderChapter(ch) {
    const html = `
      <article class="chapter hidden-init" id="chapter-${ch.id}" data-chapter="${ch.id}">
        <header class="chapter__header">
          <span class="chapter__number">Chapter ${ch.id}</span>
          <h2 class="chapter__title-zh">${ch.title.zh}</h2>
          <p class="chapter__title-en">${ch.title.en}</p>
        </header>
        <figure class="chapter__illustration">
          <img src="images/${ch.image}.webp" 
               alt="Illustration for ${ch.title.en}" 
               loading="lazy"
               onerror="this.onerror=null;this.src='images/${ch.image}.png'">
        </figure>
        <div class="chapter__text">
          <div class="text-zh ${state.currentLang !== 'zh' ? 'hidden' : ''}">
            ${renderPinyinText(ch.id)}
          </div>
          <div class="text-en ${state.currentLang !== 'en' ? 'hidden' : ''}">
            ${ch.en.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
          </div>
        </div>
      </article>`;
    return html;
  }

  function renderAllChapters() {
    dom.chapters.innerHTML = STORY.chapters.map(renderChapter).join('\n');
  }

  // ── Chapter navigation dots ──────────────────────────────
  function renderChapterDots() {
    dom.chapterNav.innerHTML = STORY.chapters.map(ch => {
      const shortZH = ch.title.zh;
      return `<button class="chapter-dot" data-chapter="${ch.id}"
                      data-label="${shortZH}"
                      title="Chapter ${ch.id}: ${ch.title.en}"
                      aria-label="Go to chapter ${ch.id}: ${ch.title.en}"></button>`;
    }).join('');
  }

  function updateChapterDots(activeId) {
    $$('.chapter-dot').forEach(dot => {
      const id = parseInt(dot.dataset.chapter);
      dot.classList.toggle('active', id === activeId);
      dot.classList.toggle('visited', state.visited.has(id) && id !== activeId);
    });
  }

  // ── Language toggle ──────────────────────────────────────
  function setLanguage(lang) {
    state.currentLang = lang;
    // Update toggle buttons
    $$('.lang-toggle__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Show/hide text blocks
    $$('.text-zh').forEach(el => el.classList.toggle('hidden', lang !== 'zh'));
    $$('.text-en').forEach(el => el.classList.toggle('hidden', lang !== 'en'));
    // Update audio source if playing
    if (state.currentChapter > 0) {
      loadChapterAudio(state.currentChapter, false);
    }
  }

  // ── Audio ────────────────────────────────────────────────
  function loadChapterAudio(chapterId, autoPlay = false) {
    const langKey = state.currentLang;
    const src = `audio/${langKey}/${String(chapterId).padStart(2, '0')}.mp3`;
    const wasPlaying = state.playing;
    audio.pause();
    audio.src = src;
    audio.load();
    updatePlayPauseUI(false);
    if (autoPlay || wasPlaying) {
      audio.play().then(() => updatePlayPauseUI(true)).catch(() => {});
    }
  }

  function togglePlay() {
    if (!state.currentChapter) return;
    if (audio.paused) {
      audio.play().then(() => updatePlayPauseUI(true)).catch(() => {});
    } else {
      audio.pause();
      updatePlayPauseUI(false);
    }
  }

  function updatePlayPauseUI(playing) {
    state.playing = playing;
    dom.iconPlay.style.display  = playing ? 'none' : 'block';
    dom.iconPause.style.display = playing ? 'block' : 'none';
  }

  function updateProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    dom.progressFill.style.width = pct + '%';
    dom.audioTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }

  // ── Navigate to chapter ──────────────────────────────────
  function goToChapter(id, scrollTo = true) {
    if (id < 1 || id > STORY.chapters.length) return;
    state.currentChapter = id;
    state.visited.add(id);
    updateChapterDots(id);
    // Update label
    const ch = STORY.chapters[id - 1];
    dom.audioLabel.textContent = `Chapter ${id}: ${state.currentLang === 'zh' ? ch.title.zh : ch.title.en}`;
    // Load audio
    loadChapterAudio(id, state.autoplay);
    // Show player
    dom.player.classList.add('visible');
    // Explicitly reveal the chapter (iOS fix: IntersectionObserver may not fire)
    const el = document.getElementById(`chapter-${id}`);
    if (el) {
      el.classList.remove('hidden-init');
      el.classList.add('revealed');
    }
    // Scroll
    if (scrollTo && el) {
      const offset = dom.toolbar.offsetHeight + 16;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // ── Autoplay ─────────────────────────────────────────────
  function toggleAutoplay() {
    state.autoplay = !state.autoplay;
    dom.autoplayBtn.classList.toggle('active', state.autoplay);
    // If turning on and not playing, start current chapter
    if (state.autoplay && state.currentChapter && audio.paused) {
      audio.play().then(() => updatePlayPauseUI(true)).catch(() => {});
    }
  }

  // ── Intersection Observer for scroll tracking ────────────
  function setupScrollObserver() {
    const options = { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = parseInt(entry.target.dataset.chapter);
          if (id !== state.currentChapter) {
            state.currentChapter = id;
            state.visited.add(id);
            updateChapterDots(id);
            const ch = STORY.chapters[id - 1];
            dom.audioLabel.textContent = `Chapter ${id}: ${state.currentLang === 'zh' ? ch.title.zh : ch.title.en}`;
            dom.player.classList.add('visible');
          }
          entry.target.classList.add('revealed');
        }
      });
    }, options);

    $$('.chapter').forEach(ch => observer.observe(ch));
  }

  // ── Event Bindings ───────────────────────────────────────
  function bindEvents() {
    // Begin button
    dom.beginBtn.addEventListener('click', () => {
      // iOS fix: use opacity + visibility instead of display:none transition
      dom.hero.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      dom.hero.style.opacity = '0';
      dom.hero.style.transform = 'translateY(-40px)';
      dom.hero.style.pointerEvents = 'none';
      setTimeout(() => {
        dom.hero.style.visibility = 'hidden';
        dom.hero.style.height = '0';
        dom.hero.style.minHeight = '0';
        dom.hero.style.overflow = 'hidden';
        dom.story.classList.remove('story-hidden');
        // Force layout recalc before scrolling (iOS fix)
        void dom.story.offsetHeight;
        goToChapter(1, true);
      }, 850);
    });

    // Language toggle
    dom.langToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-toggle__btn');
      if (!btn) return;
      setLanguage(btn.dataset.lang);
    });

    // Autoplay toggle
    dom.autoplayBtn.addEventListener('click', toggleAutoplay);

    // Chapter dots
    dom.chapterNav.addEventListener('click', (e) => {
      const dot = e.target.closest('.chapter-dot');
      if (!dot) return;
      goToChapter(parseInt(dot.dataset.chapter));
    });

    // Play/pause
    dom.playBtn.addEventListener('click', togglePlay);
    dom.prevBtn.addEventListener('click', () => goToChapter(Math.max(1, state.currentChapter - 1)));
    dom.nextBtn.addEventListener('click', () => goToChapter(Math.min(STORY.chapters.length, state.currentChapter + 1)));

    // Progress bar seek
    dom.progressBar.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = dom.progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    // Volume
    dom.volumeSlider.addEventListener('input', (e) => {
      state.volume = parseFloat(e.target.value);
      audio.volume = state.volume;
    });

    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      updatePlayPauseUI(false);
      if (state.autoplay) {
        const nextId = state.currentChapter + 1;
        if (nextId <= STORY.chapters.length) {
          goToChapter(nextId);
        } else {
          state.autoplay = false;
          dom.autoplayBtn.classList.remove('active');
        }
      }
    });
    audio.addEventListener('error', () => {
      console.warn('Audio failed to load:', audio.src);
    });

    // Toolbar scroll shadow
    window.addEventListener('scroll', () => {
      dom.toolbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToChapter(Math.max(1, state.currentChapter - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToChapter(Math.min(STORY.chapters.length, state.currentChapter + 1));
          break;
      }
    });
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    renderAllChapters();
    renderChapterDots();
    setupScrollObserver();
    bindEvents();
    audio.volume = state.volume;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
