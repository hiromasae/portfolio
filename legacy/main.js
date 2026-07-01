/* ── Aurora Background Animation ── */
const auroraMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const auroraMobileQuery = window.matchMedia('(max-width: 760px)');
const auroraRoot = document.documentElement;
const AURORA_FRAME_MS = 1000 / 15;
let auroraFrameId = null;
let auroraLastFrameTime = 0;

function applyAuroraFrame(timeMs) {
  const t = timeMs * 0.0003;
  const x1 = 50 + Math.sin(t * 1.0) * 8;
  const y1 =  0 + Math.sin(t * 0.7) * 6;
  const x2 = 50 + Math.cos(t * 0.8) * 6;
  const x3 = 50 + Math.sin(t * 0.5) * 5;
  const y3 = 100 + Math.cos(t * 0.6) * 4;

  auroraRoot.style.setProperty('--aurora-x1', `${x1}%`);
  auroraRoot.style.setProperty('--aurora-y1', `${y1}%`);
  auroraRoot.style.setProperty('--aurora-x2', `${x2}%`);
  auroraRoot.style.setProperty('--aurora-x3', `${x3}%`);
  auroraRoot.style.setProperty('--aurora-y3', `${y3}%`);
}

function shouldAnimateAurora() {
  return !auroraMotionQuery.matches && !auroraMobileQuery.matches && !document.hidden;
}

function stopAurora() {
  if (auroraFrameId !== null) {
    cancelAnimationFrame(auroraFrameId);
    auroraFrameId = null;
  }
}

function tickAurora(timeMs) {
  if (!shouldAnimateAurora()) {
    stopAurora();
    return;
  }

  if (!auroraLastFrameTime || timeMs - auroraLastFrameTime >= AURORA_FRAME_MS) {
    auroraLastFrameTime = timeMs;
    applyAuroraFrame(timeMs);
  }

  auroraFrameId = requestAnimationFrame(tickAurora);
}

function refreshAurora() {
  stopAurora();
  auroraLastFrameTime = 0;
  applyAuroraFrame(performance.now());
  if (shouldAnimateAurora()) {
    auroraFrameId = requestAnimationFrame(tickAurora);
  }
}

auroraMotionQuery.addEventListener('change', refreshAurora);
auroraMobileQuery.addEventListener('change', refreshAurora);
document.addEventListener('visibilitychange', refreshAurora);
refreshAurora();


/* ── Sliding Glass Pill Indicator ── */
const mainNav  = document.getElementById('main-nav');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

// Inject the pill element
const indicator = document.createElement('div');
indicator.className = 'nav-indicator';
mainNav.appendChild(indicator);

function moveIndicatorTo(link) {
  const navRect  = mainNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  indicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
  indicator.style.width     = linkRect.width + 'px';
}

function setActive(link) {
  navLinks.forEach(l => l.classList.remove('active'));
  link.classList.add('active');
  moveIndicatorTo(link);
}

// Seed position instantly (no transition on first paint)
const firstActive = document.querySelector('.nav-link.active');
if (firstActive) {
  indicator.style.transition = 'none';
  // Wait one frame for layout to settle
  requestAnimationFrame(() => {
    moveIndicatorTo(firstActive);
    requestAnimationFrame(() => { indicator.style.transition = ''; });
  });
}

// Suppress observer updates during click-initiated scrolls
let scrollLockTimer = null;
let isScrollLocked = false;

function lockScroll() {
  isScrollLocked = true;
  clearTimeout(scrollLockTimer);
  scrollLockTimer = setTimeout(() => { isScrollLocked = false; }, 2000);
}

function scrollToSection(target, navLink = null) {
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (navLink) setActive(navLink);
  lockScroll();
}

function handleHashLinkClick(link, event = null) {
  const href = link.getAttribute('href');
  if (!href?.startsWith('#')) return false;

  const target = document.querySelector(href);
  if (!target) return false;

  event?.preventDefault();
  const navLink = link.classList.contains('nav-link')
    ? link
    : document.querySelector(`.nav-link[href="${href}"]`);

  scrollToSection(target, navLink);
  return true;
}

function handleNavScroll() {
  if (isScrollLocked) {
    clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => { isScrollLocked = false; }, 150);
  }

  const isScrolled = window.scrollY > 40;
  mainNav.classList.toggle('scrolled', isScrolled);
  if (scrollHint) scrollHint.classList.toggle('hidden', isScrolled);
}

/* ── Drag-to-select nav ── */
let isDragging = false;
let dragMoved  = false;
let dragTarget = null;

mainNav.addEventListener('mousedown', e => {
  const link = e.target.closest('.nav-link');
  if (!link) return;
  isDragging = true;
  dragMoved  = false;
  dragTarget = link;
  e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  dragMoved = true;
  const hovered = document.elementFromPoint(e.clientX, e.clientY)?.closest('.nav-link');
  if (hovered && hovered !== dragTarget) {
    dragTarget = hovered;
    setActive(hovered);
  }
});

window.addEventListener('mouseup', () => {
  if (isDragging && dragMoved && dragTarget) {
    handleHashLinkClick(dragTarget);
  }
  isDragging = false;
  dragTarget = null;
});

const sectionObserver = new IntersectionObserver((entries) => {
  if (isScrollLocked) return;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
      if (link) setActive(link);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Scroll-reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Smooth scroll for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    handleHashLinkClick(a, e);
  });
});

/* ── Nav shadow on scroll ── */
const scrollHint = document.querySelector('.hero-scroll-hint');

// Strip the entry animation once it finishes so the hide transition can take over
if (scrollHint) {
  scrollHint.addEventListener('animationend', () => {
    scrollHint.style.animation = 'none';
  }, { once: true });
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ── Card Expander ── */
const projectData = {
  stacksmith: {
    meta: 'Stacksmith · 2026',
    title: 'Stacksmith: AI Tool Stack Discovery',
    link: 'https://app.subframe.com/a4820e3a0486/design/e6b3b72d-a1bb-41d8-95b6-dfe778ef8e78/share',
    thumb: { type: 'image', src: 'images/stacksmith1.png' },
    images: ['images/stacksmith1.png', 'images/stacksmith2.png', 'images/stacksmith3.png', 'images/stacksmith4.png'],
    problem: 'There are a lot of AI tools now, but most directories still feel like long lists with no real context. Stacksmith was my attempt to make that easier to sort through by showing what tools fit different roles, where they overlap, and how they might work together in an actual stack.',
    contributions: [
      'Designed flows for browsing tools by role and use case',
      'Built comparison views for looking at different stacks side by side',
      'Mapped tool relationships to show integrations and overlap',
      'Created the overall visual system for the product',
    ],
  },
  suma: {
    meta: 'Suma Solutions Inc. · 2025',
    title: 'Commercialization Plan Diagrams',
    link: 'https://www.yoursuma.com/',
    thumb: { type: 'image', src: 'images/suma1.webp' },
    images: ['images/suma1.webp','images/suma2.webp','images/suma3.webp','images/suma4.webp'],
    problem: 'Suma needed a clearer way to explain how its platform worked during a commercialization review. The audience was not deeply technical, so the challenge was turning a pretty complex healthcare product into diagrams that were easy to follow and still accurate.',
    contributions: [
      'Designed user flow diagrams for the SumaAdmin platform',
      'Made architecture visuals for review materials',
      'Created supporting graphics around risk and process flow',
      'Added search and filter to the enrollment table interface',
      'Implemented real-time database sync for student enrollment data',
    ],
  },
  shipyard: {
    meta: 'Shipyard · 2025–2026',
    title: 'Shipyard',
    link: 'https://shipyardhq.tech/',
    thumb: { type: 'image', src: 'images/shipyard1.webp' },
    images: ['images/shipyard1.webp','images/shipyard2.webp','images/shipyard3.webp','images/shipyard4.webp','images/shipyard5.webp'],
    problem: 'A lot of project platforms feel more focused on submission rules than the work itself. Shipyard was meant to feel lighter and more current, with a cleaner way for teams to show what they built and for other people to browse through projects.',
    contributions: [
      'Led product UI decisions alongside the dev team',
      'Refined layouts and interactions as the product changed',
      'Designed the main showcase and discovery flows',
    ],
  },
  indio: {
    meta: 'Indio Technologies · 2019',
    title: 'Agent Dashboard & Broker Profile',
    thumb: { type: 'image', src: 'images/indio1.webp' },
    images: ['images/indio1.webp','images/indio2.webp','images/indio3.webp','images/indio4.webp'],
    problem: 'These internal insurance tools had gotten pretty cluttered over time. The screens were dense, hard to scan, and not very intuitive, so the redesign focused on making everyday tasks feel less confusing and easier to get through.',
    contributions: [
      'Audited the existing components before starting the redesign',
      'Reworked the Agent Dashboard with a simpler layout',
      'Redesigned the Broker Profile to reduce visual clutter',
      'Helped make patterns more consistent across the product',
    ],
  },
};

const expander        = document.getElementById('card-expander');
const expanderBg      = document.getElementById('expander-backdrop');
const expanderGallery = document.getElementById('expander-gallery');
const gallerySlides   = document.getElementById('gallery-slides');
const galleryFilmstrip = document.getElementById('gallery-filmstrip');
const galleryPrevBtn  = document.getElementById('gallery-prev');
const galleryNextBtn  = document.getElementById('gallery-next');
const expanderContent = document.getElementById('expander-content');
const expanderClose   = document.getElementById('expander-close');
const expanderMeta    = document.getElementById('expander-meta');
const expanderTitle   = document.getElementById('expander-title');
const expanderProb    = document.getElementById('expander-problem');
const expanderList    = document.getElementById('expander-contributions');
const expanderLink    = document.getElementById('expander-link');
const expHeaderEl     = document.getElementById('expander-header');
const expBodyEl       = document.getElementById('expander-body');

// Ordered project IDs matching DOM grid order
const projectOrder = Array.from(document.querySelectorAll('.project-card[data-project]'))
  .map(c => c.dataset.project);

let activeCard      = null;
let isExpanded      = false;
let isClosing       = false;
let expanderAnimationId = 0;
let currentIndex    = 0;
let isNavigating    = false;
let expandedL       = 0;
let expandedW       = 0;
let galleryIndex        = 0;
let galleryCount        = 0;
let galleryTrack        = null;
let galleryImages       = [];
let suppressScrollSync           = false;
let programmaticScrollInProgress = false;
let scrollAnimId                 = null;
const PROJECT_THUMB_OPEN_DURATION = 360;
const MOTION_EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const PANEL_SLIDE_OUT_MS = 200;
const PANEL_SLIDE_IN_MS = 250;
const ZOOM_TRANSITION = `transform 0.3s ${MOTION_EASE}`;
const SWIPE_COMPLETE_TRANSITION = `transform 250ms ${MOTION_EASE}`;
const SWIPE_SPRINGBACK_TRANSITION = `transform 300ms ${MOTION_EASE}`;
const DRAWER_TRANSITION = 'transform 0.35s cubic-bezier(0.22,1,0.36,1)';

/* ── Mobile drawer state ── */
function isMobile() {
  return window.innerWidth <= 760 ||
    (window.innerWidth <= 1020 && window.innerHeight <= 520);
}

function getViewportHeight() {
  return Math.round(window.visualViewport?.height || window.innerHeight);
}

function getSafeAreaInset(name) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--safe-area-inset-${name}`);
  return parseFloat(value) || 0;
}

let drawerExpanded      = false;
let drawerBodyH         = 0;
let drawerDragging      = false;
let drawerStartY        = 0;
let drawerBodyStartY    = 0;

function setDrawerCollapsed(animate) {
  if (!isMobile()) return;
  drawerExpanded = false;
  expanderContent.style.transition = animate
    ? DRAWER_TRANSITION
    : 'none';
  expanderContent.style.transform = `translateY(${drawerBodyH}px)`;
}

function setDrawerExpanded(animate) {
  if (!isMobile()) return;
  drawerExpanded = true;
  expanderContent.style.transition = animate
    ? DRAWER_TRANSITION
    : 'none';
  expanderContent.style.transform = 'translateY(0)';
}

function getMobileBottomBar() {
  return 64 + getSafeAreaInset('bottom');
}

function positionExpanderClose() {
  if (isMobile()) {
    const safeBottom = getSafeAreaInset('bottom');
    expanderClose.style.bottom    = Math.round(safeBottom + (64 - 44) / 2) + 'px';
    expanderClose.style.left      = '50%';
    expanderClose.style.transform = 'translateX(-50%)';
    expanderClose.style.top       = 'auto';
    expanderClose.style.right     = 'auto';
  } else {
    expanderClose.style.top       = '14px';
    expanderClose.style.right     = '14px';
    expanderClose.style.left      = 'auto';
    expanderClose.style.bottom    = 'auto';
    expanderClose.style.transform = 'none';
  }
}

function applyExpanderViewportGeometry(updateDrawer = false) {
  expandedL = 0;
  expandedW = window.innerWidth;

  const navRect     = mainNav.getBoundingClientRect();
  const navAtBottom = navRect.top > getViewportHeight() * 0.5;
  const bottomClear = isMobile()
    ? getMobileBottomBar()
    : (navAtBottom ? (getViewportHeight() - navRect.top + 8) : 0);
  const targetModalH = Math.max(260, getViewportHeight() - bottomClear);
  const targetModalT = 0;

  expander.style.left         = expandedL + 'px';
  expander.style.top          = targetModalT + 'px';
  expander.style.width        = expandedW + 'px';
  expander.style.height       = targetModalH + 'px';
  expander.style.borderRadius = isMobile() ? '0 0 20px 20px' : '0';
  positionExpanderClose();

  if (updateDrawer) initDrawer(true);

  return { targetModalH, targetModalT };
}

function initDrawer(preserveState = false) {
  const wasExpanded = drawerExpanded;

  if (!isMobile()) {
    // Reset any mobile-specific inline styles
    expanderContent.style.transform  = '';
    expanderContent.style.transition = '';
    expanderContent.style.maxHeight  = '';
    expanderContent.style.height     = '';
    expanderGallery.style.paddingBottom = '';
    if (expBodyEl) {
      expBodyEl.style.maxHeight = '';
      expBodyEl.style.height    = '';
    }
    if (galleryTrack) galleryTrack.style.transform = '';
    drawerExpanded = false;
    return;
  }

  if (!expBodyEl || !expHeaderEl) return;

  // Clear any horizontal gallery transform (not used on mobile)
  if (galleryTrack) { teleportToReal(0); galleryIndex = 0; }

  const expanderH = expander.offsetHeight;
  const headerH   = expHeaderEl.offsetHeight;
  const safeTop = getSafeAreaInset('top');
  const drawerH = Math.max(headerH + 60, expanderH - 16 - safeTop);
  const maxBodyH  = Math.max(60, drawerH - headerH);
  expanderContent.style.height = drawerH + 'px';
  expBodyEl.style.height = maxBodyH + 'px';
  expBodyEl.style.maxHeight = maxBodyH + 'px';

  // Force layout before measuring
  expBodyEl.offsetHeight;
  drawerBodyH = expBodyEl.offsetHeight;

  // Bottom padding on gallery keeps images above the collapsed handle
  expanderGallery.style.paddingBottom = headerH + 'px';

  if (preserveState && wasExpanded) setDrawerExpanded(false);
  else setDrawerCollapsed(false);
}

/* Instantly reposition to slide i without triggering the scroll listener */
function teleportToReal(i) {
  const slide = galleryTrack && galleryTrack.children[i];
  if (!slide) return;
  if (scrollAnimId) clearTimeout(scrollAnimId);
  scrollAnimId = null;
  galleryTrack.style.transition = 'none';
  galleryTrack.style.transform = `translateX(${-i * 100}%)`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      galleryTrack.style.transition = '';
    });
  });
}

function animateGalleryScroll(index, duration = 320) {
  if (scrollAnimId) clearTimeout(scrollAnimId);
  galleryTrack.style.transition = `transform ${duration}ms ${MOTION_EASE}`;
  galleryTrack.style.transform = `translateX(${-index * 100}%)`;
  scrollAnimId = setTimeout(() => {
    scrollAnimId = null;
    galleryTrack.style.transition = '';
  }, duration);
}

function goToSlide(index) {
  if (isMobile()) return;
  const thumbs = galleryFilmstrip.querySelectorAll('.gallery-thumb');
  const next = Math.max(0, Math.min(galleryCount - 1, index));
  if (!galleryTrack) return;

  const slide = galleryTrack.children[next];
  if (!slide) return;

  Array.from(galleryTrack.children).forEach((s, i) =>
    s.classList.toggle('active-slide', i === next));
  thumbs[galleryIndex]?.classList.remove('active');
  galleryIndex = next;
  thumbs[galleryIndex]?.classList.add('active');

  // Scroll the active thumbnail into view within the filmstrip
  const activeThumb = thumbs[galleryIndex];
  if (activeThumb) {
    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  animateGalleryScroll(next);
}

function openGalleryImage(images, index) {
  if (!images.length) return;

  const next = Math.max(0, Math.min(images.length - 1, index));
  openCarousel([images[next]], 0);
}

function getContainedImageRect(img, naturalSize) {
  const rect = img.getBoundingClientRect();
  const style = getComputedStyle(img);
  const padL = parseFloat(style.paddingLeft) || 0;
  const padR = parseFloat(style.paddingRight) || 0;
  const padT = parseFloat(style.paddingTop) || 0;
  const padB = parseFloat(style.paddingBottom) || 0;
  const contentW = Math.max(0, rect.width - padL - padR);
  const contentH = Math.max(0, rect.height - padT - padB);
  const naturalW = naturalSize?.width || img.naturalWidth || contentW;
  const naturalH = naturalSize?.height || img.naturalHeight || contentH;
  const scale = Math.min(contentW / naturalW, contentH / naturalH);
  const width = naturalW * scale;
  const height = naturalH * scale;

  return {
    left: rect.left + padL + (contentW - width) / 2,
    top: rect.top + padT + (contentH - height) / 2,
    width,
    height
  };
}

function createProjectThumbMorph(card, targetRect) {
  const img = card.querySelector('.card-thumb-video');
  if (!img) return null;

  // FIRST — pixel-aligned rect of the visible image content
  const sourceRect = getContainedImageRect(img);

  // LAST — position morph at the target (gallery) rect
  const morph = document.createElement('div');
  morph.className = 'project-open-morph project-open-morph-thumb';
  morph.style.left = `${targetRect.left}px`;
  morph.style.top = `${targetRect.top}px`;
  morph.style.width = `${targetRect.width}px`;
  morph.style.height = `${targetRect.height}px`;
  morph.style.borderRadius = '0px';
  morph.style.transformOrigin = '0 0';

  // INVERT — transform from target back to source
  const scaleX = sourceRect.width / targetRect.width;
  const scaleY = sourceRect.height / targetRect.height;
  const dx = sourceRect.left - targetRect.left;
  const dy = sourceRect.top - targetRect.top;
  const invertTransform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

  // Apply invert immediately so the morph appears at the thumbnail position
  morph.style.transform = invertTransform;

  const morphImg = document.createElement('img');
  morphImg.src = img.src;
  morphImg.alt = '';
  morph.appendChild(morphImg);
  document.body.appendChild(morph);

  // PLAY — animate from inverted (source) to identity (target)
  const animation = morph.animate([
    { transform: invertTransform },
    { transform: 'translate(0, 0) scale(1, 1)' }
  ], {
    duration: PROJECT_THUMB_OPEN_DURATION,
    easing: 'cubic-bezier(0.34,1,0.64,1)',
    fill: 'forwards'
  });

  return { element: morph, animation };
}

function createProjectInfoMorph(source, targetRect) {
  if (!source?.rect) return null;

  const sourceRect = source.rect;
  const targetStyle = getComputedStyle(expanderContent);
  const morph = document.createElement('div');
  morph.className = 'project-open-morph project-open-morph-info';
  morph.style.left = `${targetRect.left}px`;
  morph.style.top = `${targetRect.top}px`;
  morph.style.width = `${targetRect.width}px`;
  morph.style.height = `${targetRect.height}px`;
  morph.style.borderRadius = source.borderRadius;
  morph.style.padding = source.padding;
  morph.style.transformOrigin = '0 0';

  const scaleX = sourceRect.width / targetRect.width;
  const scaleY = sourceRect.height / targetRect.height;
  const dx = sourceRect.left - targetRect.left;
  const dy = sourceRect.top - targetRect.top;
  const invertTransform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
  const finalTransform = 'translate(0, 0) scale(1, 1)';
  morph.style.transform = invertTransform;

  const sourceText = document.createElement('div');
  sourceText.className = 'project-open-morph-info-source';
  sourceText.innerHTML = source.html;

  const targetText = document.createElement('div');
  targetText.className = 'project-open-morph-info-target';
  targetText.innerHTML = `
    <div class="expander-header">
      <p class="card-meta">${expanderMeta.textContent}</p>
      <h3 class="expander-title">${expanderTitle.textContent}</h3>
    </div>
    <div class="expander-body">
      <p class="expander-section-label">Problem</p>
      <p class="expander-problem">${expanderProb.textContent}</p>
      <p class="expander-section-label">Contributions</p>
      <ul class="expander-contributions">${expanderList.innerHTML}</ul>
    </div>
  `;

  morph.appendChild(sourceText);
  morph.appendChild(targetText);

  document.body.appendChild(morph);

  morph.animate([
    { padding: source.padding },
    { padding: targetStyle.padding }
  ], {
    duration: PROJECT_THUMB_OPEN_DURATION,
    easing: 'cubic-bezier(0.34,1,0.64,1)',
    fill: 'forwards'
  });

  sourceText.animate([
    { opacity: 1 },
    { opacity: 0, offset: 0.45 },
    { opacity: 0 }
  ], {
    duration: PROJECT_THUMB_OPEN_DURATION,
    easing: 'ease',
    fill: 'forwards'
  });

  targetText.animate([
    { opacity: 0 },
    { opacity: 0 }
  ], {
    duration: PROJECT_THUMB_OPEN_DURATION,
    easing: 'ease',
    fill: 'forwards'
  });

  const animation = morph.animate([
    {
      transform: invertTransform,
      borderRadius: source.borderRadius,
      easing: 'cubic-bezier(0.34,1,0.64,1)'
    },
    {
      transform: finalTransform,
      borderRadius: '20px'
    }
  ], {
    duration: PROJECT_THUMB_OPEN_DURATION,
    fill: 'forwards'
  });

  return { element: morph, animation };
}

function createProjectThumbCloseMorph(card, sourceImg) {
  const targetImg = card.querySelector('.card-thumb-video');
  if (!sourceImg || !targetImg) return null;

  const naturalSize = {
    width: sourceImg.naturalWidth || targetImg.naturalWidth,
    height: sourceImg.naturalHeight || targetImg.naturalHeight
  };
  // Pixel-aligned rect of gallery image content
  const sourceRect = getContainedImageRect(sourceImg, naturalSize);
  // Pixel-aligned rect of thumbnail image content
  const targetRect = getContainedImageRect(targetImg);

  // Position morph at gallery image position
  const morph = document.createElement('div');
  morph.className = 'project-open-morph project-open-morph-thumb';
  morph.style.left = `${sourceRect.left}px`;
  morph.style.top = `${sourceRect.top}px`;
  morph.style.width = `${sourceRect.width}px`;
  morph.style.height = `${sourceRect.height}px`;
  morph.style.borderRadius = '0px';
  morph.style.transformOrigin = '0 0';

  const morphImg = document.createElement('img');
  morphImg.src = targetImg.src;
  morphImg.alt = '';
  morph.appendChild(morphImg);
  document.body.appendChild(morph);

  // Animate transform from gallery position to thumbnail position
  const scaleX = targetRect.width / sourceRect.width;
  const scaleY = targetRect.height / sourceRect.height;
  const dx = targetRect.left - sourceRect.left;
  const dy = targetRect.top - sourceRect.top;

  const animation = morph.animate([
    { transform: 'translate(0, 0) scale(1, 1)' },
    { transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})` }
  ], {
    duration: 320,
    easing: MOTION_EASE,
    fill: 'forwards'
  });

  return { element: morph, animation };
}

function createProjectInfoCloseMorph(card) {
  const targetInfo = card.querySelector('.card-info');
  if (!targetInfo) return null;

  const sourceRect = expanderContent.getBoundingClientRect();
  const targetRect = targetInfo.getBoundingClientRect();
  const sourceStyle = getComputedStyle(expanderContent);
  const targetStyle = getComputedStyle(targetInfo);
  const morph = document.createElement('div');
  morph.className = 'project-open-morph project-open-morph-info';
  morph.style.left = `${sourceRect.left}px`;
  morph.style.top = `${sourceRect.top}px`;
  morph.style.width = `${sourceRect.width}px`;
  morph.style.height = `${sourceRect.height}px`;
  morph.style.borderRadius = sourceStyle.borderRadius;
  morph.style.padding = sourceStyle.padding;

  const sourceText = document.createElement('div');
  sourceText.className = 'project-open-morph-info-source';
  sourceText.innerHTML = `
    <div class="expander-header">
      <p class="card-meta">${expanderMeta.textContent}</p>
      <h3 class="expander-title">${expanderTitle.textContent}</h3>
    </div>
    <div class="expander-body">
      <p class="expander-section-label">Problem</p>
      <p class="expander-problem">${expanderProb.textContent}</p>
      <p class="expander-section-label">Contributions</p>
      <ul class="expander-contributions">${expanderList.innerHTML}</ul>
    </div>
  `;

  const targetText = document.createElement('div');
  targetText.className = 'project-open-morph-info-target';
  targetText.innerHTML = targetInfo.innerHTML;

  morph.appendChild(sourceText);
  morph.appendChild(targetText);
  document.body.appendChild(morph);

  morph.animate([
    { padding: sourceStyle.padding },
    { padding: targetStyle.padding }
  ], {
    duration: 320,
    easing: MOTION_EASE,
    fill: 'forwards'
  });

  sourceText.animate([
    { opacity: 1 },
    { opacity: 0, offset: 0.55 },
    { opacity: 0 }
  ], {
    duration: 320,
    easing: 'ease',
    fill: 'forwards'
  });

  targetText.animate([
    { opacity: 0 },
    { opacity: 0, offset: 0.45 },
    { opacity: 1 }
  ], {
    duration: 320,
    easing: 'ease',
    fill: 'forwards'
  });

  const animation = morph.animate([
    {
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      borderRadius: sourceStyle.borderRadius
    },
    {
      left: `${targetRect.left}px`,
      top: `${targetRect.top}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      borderRadius: targetStyle.borderRadius
    }
  ], {
    duration: 320,
    easing: MOTION_EASE,
    fill: 'forwards'
  });

  return { element: morph, animation };
}

function populateExpander(projectId) {
  const d = projectData[projectId];
  if (!d) return;

  const images = (d.images && d.images.length > 0) ? d.images : [d.thumb.src];
  galleryImages = images;
  galleryIndex = 0;
  galleryCount = images.length;

  // Build a flex track — slides sit side-by-side, track translates to show current
  gallerySlides.innerHTML = '';
  galleryTrack = document.createElement('div');
  galleryTrack.className = 'gallery-track';
  gallerySlides.appendChild(galleryTrack);

  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${d.title} — image ${i + 1}`;
    slide.appendChild(img);
    galleryTrack.appendChild(slide);
  });

  const spacer = document.createElement('div');
  spacer.className = 'gallery-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  galleryTrack.appendChild(spacer);

  // Mark first slide active
  galleryTrack.children[0].classList.add('active-slide');

  // Build thumbnail filmstrip (only if multiple images)
  galleryFilmstrip.innerHTML = '';
  const multi = images.length > 1;
  galleryPrevBtn.hidden = !multi;
  galleryNextBtn.hidden = !multi;
  if (multi) {
    images.forEach((src, i) => {
      const thumb = document.createElement('button');
      thumb.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
      thumb.setAttribute('aria-label', `Image ${i + 1}`);
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.draggable = false;
      thumb.appendChild(img);
      thumb.addEventListener('click', e => { e.stopPropagation(); goToSlide(i); });
      galleryFilmstrip.appendChild(thumb);
    });
  }

  expanderMeta.textContent  = d.meta;
  expanderTitle.textContent = d.title;
  expanderProb.textContent  = d.problem;
  expanderList.innerHTML    = d.contributions.map(c => `<li>${c}</li>`).join('');

  // Handle project link
  if (d.link) {
    expanderLink.href = d.link;
    expanderLink.textContent = 'View project →';
    expanderLink.classList.remove('expander-link-hidden');
  } else {
    expanderLink.classList.add('expander-link-hidden');
  }

  // Reset scroll after DOM is fully rebuilt — start at first slide.
  // Double rAF: first frame lets the browser process the display change on
  // the expander (so offsetLeft is non-zero), second commits the scroll.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      teleportToReal(0);
      expanderGallery.scrollTop = 0;
      if (expBodyEl) expBodyEl.scrollTop = 0;
    });
  });
}

function openExpander(card) {
  if (isExpanded) return;
  const animationId = ++expanderAnimationId;
  isExpanded = true;
  isClosing = false;
  card.classList.remove('pressed');
  document.body.classList.add('animating');
  setTimeout(() => document.body.classList.remove('animating'), 500);

  activeCard    = card;
  currentIndex  = projectOrder.indexOf(card.dataset.project);
  const cardDesc = card.querySelector('.card-desc');
  const cardDescStyle = cardDesc ? getComputedStyle(cardDesc) : null;
  const cardDescMorphSource = cardDesc ? {
    rect: cardDesc.getBoundingClientRect(),
    html: cardDesc.outerHTML,
    borderRadius: cardDescStyle.borderRadius || '0px',
    padding: cardDescStyle.padding || '0px'
  } : null;

  populateExpander(card.dataset.project);

  // Place the modal at its final geometry; temporary morph layers carry the
  // visual transition from the card thumbnail and description pill.
  expander.style.transition   = 'none';
  applyExpanderViewportGeometry(false);
  expander.style.display      = 'flex';
  expander.style.opacity      = '0';

  expanderContent.classList.remove('visible', 'entering');
  expanderClose.classList.remove('visible');
  expander.classList.remove('content-visible');

  card.style.pointerEvents = 'none';

  expanderBg.classList.add('visible');
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.paddingRight        = scrollbarWidth + 'px';
  mainNav.style.left                      = `calc(50% - ${scrollbarWidth / 2}px)`;
  document.documentElement.classList.add('modal-open');

  expander.offsetHeight;
  expanderContent.offsetHeight;
  expanderContent.style.setProperty('--expander-text-entry-delay', `${PROJECT_THUMB_OPEN_DURATION}ms`);
  expanderContent.classList.add('entering');
  expander.style.transition = 'opacity 0.25s ease';
  expander.style.opacity    = '1';
  initDrawer(); // set mobile drawer geometry before measuring targets

  const activeGalleryImg = galleryTrack?.children[0]?.querySelector('img');
  const thumbImg = card.querySelector('.card-thumb-video');
  const thumbNaturalSize = thumbImg
    ? { width: thumbImg.naturalWidth, height: thumbImg.naturalHeight }
    : null;
  const galleryTargetRect = activeGalleryImg
    ? getContainedImageRect(activeGalleryImg, thumbNaturalSize)
    : gallerySlides.getBoundingClientRect();
  const contentTargetRect = expanderContent.getBoundingClientRect();
  const thumbMorph = createProjectThumbMorph(card, galleryTargetRect);
  const infoMorph = createProjectInfoMorph(cardDescMorphSource, contentTargetRect);
  let galleryImageRevealed = false;
  const entryGalleryImgs = galleryTrack
    ? Array.from(galleryTrack.querySelectorAll('.gallery-slide img'))
    : (activeGalleryImg ? [activeGalleryImg] : []);
  const entryGalleryImgStyles = new Map(entryGalleryImgs.map(galleryImg => [galleryImg, {
    transition: galleryImg.style.transition,
    opacity: galleryImg.style.opacity,
    pointerEvents: galleryImg.style.pointerEvents
  }]));
  entryGalleryImgs.forEach(galleryImg => {
    galleryImg.style.transition = 'none';
    galleryImg.style.opacity = '0';
    galleryImg.style.pointerEvents = 'none';
  });
  expander.classList.add('content-visible');
  card.style.opacity = '0';

  // Position the close button (it lives outside #card-expander)
  positionExpanderClose();

  let morphsDone = 0;
  const morphsTotal = [thumbMorph, infoMorph].filter(Boolean).length;
  let modalContentRevealed = false;
  const isCurrentOpen = () => (
    animationId === expanderAnimationId &&
    isExpanded &&
    !isClosing &&
    activeCard === card
  );
  const cleanupOpenMorphs = () => {
    thumbMorph?.element.remove();
    infoMorph?.element.remove();
    entryGalleryImgs.forEach(galleryImg => {
      const originalStyle = entryGalleryImgStyles.get(galleryImg);
      galleryImg.style.transition = galleryImageRevealed && galleryImg === activeGalleryImg
        ? 'none'
        : originalStyle.transition;
      galleryImg.style.opacity = originalStyle.opacity;
      galleryImg.style.pointerEvents = originalStyle.pointerEvents;
    });
    if (galleryImageRevealed && activeGalleryImg) {
      requestAnimationFrame(() => {
        const originalStyle = entryGalleryImgStyles.get(activeGalleryImg);
        activeGalleryImg.style.transition = originalStyle.transition;
      });
    }
  };
  const revealGalleryImage = () => {
    if (!activeGalleryImg || galleryImageRevealed) return;
    const originalStyle = entryGalleryImgStyles.get(activeGalleryImg);
    galleryImageRevealed = true;
    activeGalleryImg.style.transition = 'none';
    activeGalleryImg.style.opacity = originalStyle.opacity || '1';
    activeGalleryImg.style.pointerEvents = originalStyle.pointerEvents;

    requestAnimationFrame(() => {
      activeGalleryImg.style.transition = originalStyle.transition;
    });
  };
  const revealModalContent = () => {
    if (!isCurrentOpen()) return;
    if (modalContentRevealed) return;
    modalContentRevealed = true;
    expanderContent.classList.remove('entering');
    expanderContent.classList.add('visible');
    expanderClose.classList.add('visible');
    expander.classList.add('content-visible');
  };
  const finishOpen = () => {
    if (!isCurrentOpen()) {
      cleanupOpenMorphs();
      return;
    }
    morphsDone++;
    if (morphsDone < morphsTotal) return;
    revealModalContent();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealGalleryImage();
        cleanupOpenMorphs();
      });
    });
  };

  if (morphsTotal === 0) {
    revealGalleryImage();
    revealModalContent();
    cleanupOpenMorphs();
  } else {
    if (thumbMorph) {
      thumbMorph.animation.onfinish = () => {
        if (isCurrentOpen()) {
          revealGalleryImage();
          thumbMorph.element.remove();
        }
        finishOpen();
      };
    } else {
      revealGalleryImage();
    }
    if (infoMorph) infoMorph.animation.onfinish = finishOpen;
  }
}

function closeExpander() {
  if (!isExpanded || !activeCard || isClosing) return;
  const animationId = ++expanderAnimationId;
  const closingCard = activeCard;
  isClosing = true;
  document.body.classList.add('animating');

  // Clear pressed state instantly so it can't influence the collapse target rect
  closingCard.style.transition = 'none';
  closingCard.classList.remove('pressed');
  closingCard.offsetHeight;
  closingCard.style.transition = '';

  const activeSlide = galleryTrack?.children[galleryIndex] || galleryTrack?.children[0];
  const activeGalleryImg = activeSlide?.querySelector('img');
  const thumbMorph = createProjectThumbCloseMorph(closingCard, activeGalleryImg);
  const infoMorph = createProjectInfoCloseMorph(closingCard);

  expanderContent.classList.remove('visible');
  expanderContent.classList.remove('entering');
  expanderClose.classList.remove('visible');
  expander.classList.remove('content-visible');
  expanderBg.classList.remove('visible');
  expander.style.opacity = '0';
  expander.style.pointerEvents = 'none';

  let morphsDone = 0;
  const morphsTotal = [thumbMorph, infoMorph].filter(Boolean).length;
  let cardRevealed = false;
  const isCurrentClose = () => animationId === expanderAnimationId && isClosing;
  const revealCard = () => {
    if (!isCurrentClose()) return;
    if (cardRevealed) return;
    cardRevealed = true;
    closingCard.style.opacity = '';
  };
  const finishClose = () => {
    if (!isCurrentClose()) return;
    morphsDone++;
    if (morphsDone < morphsTotal) return;

    revealCard();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        thumbMorph?.element.remove();
        infoMorph?.element.remove();
      });
    });
    expander.style.zIndex          = '';
    expander.style.display         = 'none';
    expander.style.opacity         = '';
    expander.style.pointerEvents   = '';
    closingCard.style.pointerEvents = '';
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight = '';
    mainNav.style.left               = '';
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('animating');
    // Reset close button inline position
    expanderClose.style.top       = '';
    expanderClose.style.right     = '';
    expanderClose.style.left      = '';
    expanderClose.style.bottom    = '';
    expanderClose.style.transform = '';
    // Reset drawer
    expanderContent.style.transform     = '';
    expanderContent.style.transition    = '';
    expanderContent.style.maxHeight     = '';
    expanderContent.style.height        = '';
    expanderGallery.style.paddingBottom = '';
    if (expBodyEl) {
      expBodyEl.style.maxHeight = '';
      expBodyEl.style.height    = '';
    }
    drawerExpanded = false;
    activeCard    = null;
    isExpanded    = false;
    isClosing     = false;
  };

  if (morphsTotal === 0) {
    finishClose();
  } else {
    setTimeout(revealCard, 220);
    if (thumbMorph) thumbMorph.animation.onfinish = finishClose;
    if (infoMorph) infoMorph.animation.onfinish = finishClose;
  }
}

function navigateExpander(direction) {
  if (!isExpanded || isNavigating) return;
  isNavigating = true;
  document.body.classList.add('animating');

  const slideOut = PANEL_SLIDE_OUT_MS;
  const slideIn  = PANEL_SLIDE_IN_MS;
  const outX     = direction === 1 ? '-100vw' : '100vw';
  const inX      = direction === 1 ?  '100vw' : '-100vw';

  // Slide the whole panel out
  expander.style.transition = `transform ${slideOut}ms ${MOTION_EASE}, opacity ${slideOut}ms ${MOTION_EASE}`;
  expander.style.transform  = `translateX(${outX})`;
  expander.style.opacity    = '0';

  setTimeout(() => {
    currentIndex = (currentIndex + direction + projectOrder.length) % projectOrder.length;
    populateExpander(projectOrder[currentIndex]);
    if (isMobile()) initDrawer(); // reset drawer for new project

    // Update activeCard so close animates back to the correct card
    if (activeCard) { activeCard.style.opacity = ''; activeCard.style.pointerEvents = ''; }
    activeCard    = document.querySelector(`.project-card[data-project="${projectOrder[currentIndex]}"]`);
    if (activeCard) activeCard.style.opacity = '0';

    // Reposition new panel off-screen on the opposite side instantly
    expander.style.transition = 'none';
    expander.style.transform  = `translateX(${inX})`;
    expander.style.opacity    = '0';

    const thumbImg = gallerySlides.querySelector('img');

    function triggerSlideIn() {
      expander.offsetHeight; // force reflow, commits off-screen position before animating in
      expander.style.transition = `transform ${slideIn}ms ${MOTION_EASE}, opacity ${slideIn}ms ${MOTION_EASE}`;
      expander.style.transform  = 'translateX(0)';
      expander.style.opacity    = '1';

      setTimeout(() => {
        expander.style.transition = '';
        expander.style.transform  = '';
        expander.style.opacity    = '';
        document.body.classList.remove('animating');
        isNavigating = false;
      }, slideIn + 50);
    }

    if (thumbImg && !thumbImg.complete) {
      thumbImg.addEventListener('load',  triggerSlideIn, { once: true });
      thumbImg.addEventListener('error', triggerSlideIn, { once: true });
    } else {
      triggerSlideIn();
    }
  }, slideOut);
}

/* ── Canvas Viewer ─────────────────────────────────────────── */

/* Canvas data for each project.
   srcs    — ordered image URLs
   columns — grid columns (default 2)
   gap     — uniform horizontal AND vertical gap between elements (default 60)
   imgWidth is computed dynamically in _layoutGrid from window.innerWidth */
const canvasProjectData = {
  stacksmith: {
    title: 'Stacksmith: AI Tool Stack Discovery',
    description: 'A concept for browsing and comparing AI tools in a way that feels more useful than a giant list.',
    tags: ['Product Design', 'UI/UX', '2026'],
    link: null,
    columns: 2, gap: 60,
    srcs: projectData.stacksmith.images,
  },
  suma: {
    title: 'Commercialization Plan Diagrams',
    description: 'Diagrams for a healthcare compliance product made to be clear enough for non-technical reviewers.',
    tags: ['Diagrams', 'Healthcare', 'UX', '2025'],
    link: null,
    columns: 2, gap: 60,
    srcs: projectData.suma.images,
  },
  shipyard: {
    title: 'Shipyard',
    description: 'A lighter project showcase platform shaped in close collaboration with the dev team.',
    tags: ['Product Design', 'UI/UX', '2025–2026'],
    link: null,
    columns: 2, gap: 60,
    srcs: projectData.shipyard.images,
  },
  indio: {
    title: 'Agent Dashboard & Broker Profile',
    description: 'A redesign of dense internal insurance tools, focused on clarity, structure, and easier day-to-day use.',
    tags: ['UI Redesign', 'Dashboard', 'InsurTech', '2019'],
    link: null,
    columns: 2, gap: 60,
    srcs: projectData.indio.images,
  },
};

class CanvasViewer {
  constructor(data, originCard) {
    // Capture rects NOW — before _build() locks scroll, which shifts getBoundingClientRect().
    this._originRect   = originCard ? originCard.getBoundingClientRect() : null;
    this._cardInfoEl   = originCard ? originCard.querySelector('.card-info')        : null;
    this._thumbEl      = originCard ? originCard.querySelector('.card-thumb-video') : null;
    this._cardInfoRect = this._cardInfoEl ? this._cardInfoEl.getBoundingClientRect() : null;
    this._thumbRect    = this._thumbEl    ? this._thumbEl.getBoundingClientRect()    : null;

    this.data    = data;
    this.tx      = 0;
    this.ty      = 0;
    this.zoom    = 1;
    this.minZoom = 0.25;
    this.maxZoom = 4;

    // Inertia
    this.vx = 0; this.vy = 0; this._raf = null;

    // Mouse pan state
    this._dragging = false;
    this._lastX = 0; this._lastY = 0;
    this._prevX = 0; this._prevY = 0; this._prevT = 0;

    // Pinch state
    this._pinching  = false;
    this._pinchDist = 0;
    this._pinchMidX = 0; this._pinchMidY = 0;
    this._pinchZoom = 1; this._pinchTx = 0; this._pinchTy = 0;

    // Desc card drag state
    this._descDragging = false;
    this._descOX = 0; this._descOY = 0;

    this._originCard         = originCard || null;
    this._morphEl            = null;   // in-flight pill morph DOM element
    this._thumbMorphEl       = null;   // in-flight thumb-bg morph DOM element
    this._openMorphAnim      = null;   // WAAPI ref for pill open morph
    this._openThumbMorphAnim = null;   // WAAPI ref for thumb open morph
    this._openBgAnim         = null;   // WAAPI ref for bg fade-in

    this._build();
    this._bindEvents();
    this._initView();
    this._layoutGrid();
    this._animateOpen();
  }

  _build() {
    const overlay = document.createElement('div');
    overlay.className = 'canvas-viewer';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', this.data.title);
    this._overlay = overlay;

    // Background layer — fades in after the open morph completes
    const bg = document.createElement('div');
    bg.className = 'cv-bg';
    bg.style.opacity = '0';
    this._bg = bg;
    overlay.appendChild(bg);

    // Canvas — receives wheel / pointer events
    const canvas = document.createElement('div');
    canvas.className = 'cv-canvas';
    canvas.style.opacity = '0';
    this._canvas = canvas;
    overlay.appendChild(canvas);

    // World — the CSS-transformed infinite plane
    const world = document.createElement('div');
    world.className = 'cv-world';
    this._world = world;
    canvas.appendChild(world);

    // Image elements are created asynchronously in _layoutGrid()
    // after their natural dimensions are known.
    this._elements = [];

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cv-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 14 14" fill="none">
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
    closeBtn.style.opacity = '0';
    this._closeBtn = closeBtn;
    overlay.appendChild(closeBtn);

    // Floating description card
    const desc = document.createElement('div');
    desc.className = 'cv-desc';
    desc.style.cssText = 'top:24px;left:24px;opacity:0';

    const handle = document.createElement('div');
    handle.className = 'cv-desc-handle';

    const titleEl = document.createElement('h3');
    titleEl.className = 'cv-desc-title';
    titleEl.textContent = this.data.title;

    const bodyEl = document.createElement('p');
    bodyEl.className = 'cv-desc-text';
    bodyEl.textContent = this.data.description;

    desc.appendChild(handle);
    desc.appendChild(titleEl);
    desc.appendChild(bodyEl);

    if (this.data.tags && this.data.tags.length) {
      const tagsEl = document.createElement('div');
      tagsEl.className = 'cv-desc-tags';
      this.data.tags.forEach(t => {
        const pill = document.createElement('span');
        pill.className = 'cv-tag';
        pill.textContent = t;
        tagsEl.appendChild(pill);
      });
      desc.appendChild(tagsEl);
    }

    if (this.data.link) {
      const link = document.createElement('a');
      link.className = 'cv-desc-link';
      link.href = this.data.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = `View Project <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      desc.appendChild(link);
    }

    this._desc = desc;
    overlay.appendChild(desc);

    // Pan/zoom hint
    const hint = document.createElement('div');
    hint.className = 'cv-hint';
    hint.textContent = 'Scroll to pan · Ctrl / ⌘ + Scroll to zoom · Drag to pan';
    this._hint = hint;
    overlay.appendChild(hint);

    document.body.appendChild(overlay);

    // Lock page scroll
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.paddingRight = sbw + 'px';
    document.documentElement.classList.add('modal-open');
  }

  _initView() {
    // Grid layout is async — _fitView() is called once all rows are placed.
    // Start with a neutral transform so the empty canvas looks intentional.
    this._applyTransform();
  }

  // Builds the grid row-by-row, gating each row's placement on its images
  // having loaded so we can use their real naturalWidth/naturalHeight.
  _layoutGrid() {
    const srcs = this.data.srcs    || [];
    const cols = Math.max(1, this.data.columns || 2);
    const gap  = this.data.gap     || 60;
    const n    = srcs.length;
    if (!n) return;

    // Actual columns may be fewer than cols if there are fewer images
    const actualCols = Math.min(cols, n);

    // Compute imgW so the grid fills the viewport at 1:1 zoom with padding on both sides
    const PAD  = window.innerWidth < 768 ? 24 : 48;
    const imgW = Math.floor((window.innerWidth - PAD * 2 - gap * (actualCols - 1)) / actualCols);

    // heights[i] filled in once image i has loaded; null = still pending
    const heights = new Array(n).fill(null);
    let yOffset   = 0;   // top edge of the next row, in canvas-space px
    let nextRow   = 0;   // row index we're waiting to place next

    const tryPlaceRow = rowIdx => {
      // Rows must be placed in order — wait if a prior row isn't done yet
      if (rowIdx !== nextRow) return;

      const start = rowIdx * cols;
      const end   = Math.min(start + cols, n);

      // Block until every image in this row has reported its height
      for (let i = start; i < end; i++) {
        if (heights[i] === null) return;
      }

      // Height of the tallest element in this row
      let maxH = 0;
      for (let i = start; i < end; i++) maxH = Math.max(maxH, heights[i]);

      // Position and reveal each element in the row
      for (let i = start; i < end; i++) {
        const col = i - start;
        const el  = this._elements[i];
        el.style.left       = (col * (imgW + gap)) + 'px';
        el.style.top        = yOffset + 'px';
        el.style.visibility = 'visible';
      }

      yOffset += maxH + gap;
      nextRow++;

      const allPlaced = nextRow * cols >= n;
      if (allPlaced) {
        // Grid is complete — fit the full content into the viewport
        const contentW = actualCols * imgW + (actualCols - 1) * gap;
        const contentH = yOffset - gap; // strip the trailing gap after last row
        this._fitView(contentW, contentH);
      } else {
        // Next row might already be fully loaded — try immediately
        tryPlaceRow(nextRow);
      }
    };

    srcs.forEach((src, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'cv-element';
      // Hidden until the row is placed; position will be set by tryPlaceRow
      wrap.style.cssText = `position:absolute;width:${imgW}px;visibility:hidden;left:0;top:0`;

      const img = document.createElement('img');
      img.alt      = '';
      img.draggable = false;

      // Attach handlers before setting src so we never miss a cached load
      img.onload = () => {
        heights[i] = imgW * (img.naturalHeight / img.naturalWidth);
        tryPlaceRow(Math.floor(i / cols));
      };
      img.onerror = () => {
        heights[i] = imgW * (9 / 16); // fallback: assume 16 ∶ 9
        tryPlaceRow(Math.floor(i / cols));
      };

      img.src = src;
      wrap.appendChild(img);
      this._world.appendChild(wrap);
      this._elements.push(wrap);
    });
  }

  // Called by _layoutGrid() once the full grid is positioned.
  // Zooms to fill the viewport width and anchors to the top — tall grids
  // show only the top rows on open; the user scrolls down to see the rest.
  _fitView(contentW, contentH) {
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const SIDE = 24; // match page section side padding
    const CONTAINER_MAX = 1100; // match .container max-width

    // Target visual width mirrors the page container: up to 1100px, centered
    const targetW = Math.min(vw - SIDE * 2, CONTAINER_MAX);
    const zoomW   = targetW / contentW;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoomW));

    this.tx = (vw - contentW * this.zoom) / 2;
    const scaledH = contentH * this.zoom;
    this.ty = scaledH + SIDE * 2 < vh
      ? (vh - scaledH) / 2   // short grid: center vertically
      : SIDE;                 // tall grid: anchor to top

    this._applyTransform();
  }

  _applyTransform() {
    this._world.style.transform =
      `translate(${this.tx}px,${this.ty}px) scale(${this.zoom})`;
    // Sync dot grid so it appears to belong to the infinite world
    const gs = 24 * this.zoom;
    this._canvas.style.backgroundSize =
      `${gs}px ${gs}px`;
    this._canvas.style.backgroundPosition =
      `${((this.tx % gs) + gs) % gs}px ${((this.ty % gs) + gs) % gs}px`;
  }

  _zoomAt(factor, cx, cy) {
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
    if (nz === this.zoom) return;
    const r = nz / this.zoom;
    this.tx   = cx - (cx - this.tx) * r;
    this.ty   = cy - (cy - this.ty) * r;
    this.zoom = nz;
    this._applyTransform();
  }

  _startInertia() {
    const decay = 0.91;
    const tick  = () => {
      if (Math.abs(this.vx) < 0.3 && Math.abs(this.vy) < 0.3) { this._raf = null; return; }
      this.tx += this.vx;
      this.ty += this.vy;
      this.vx *= decay;
      this.vy *= decay;
      this._applyTransform();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _stopInertia() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    this.vx = 0; this.vy = 0;
  }

  _hideHint() {
    if (this._hint) { this._hint.classList.add('cv-hint-hidden'); }
  }

  _bindEvents() {
    // ── Wheel: pan and zoom ──────────────────────────────────
    this._onWheel = e => {
      e.preventDefault();
      this._hideHint();
      let dx = e.deltaX, dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 16; dy *= 16; }
      if (e.deltaMode === 2) { dx *= 400; dy *= 400; }

      if (e.ctrlKey || e.metaKey) {
        // Zoom at cursor (also handles trackpad pinch — browsers set ctrlKey for pinch)
        this._stopInertia();
        this._zoomAt(Math.exp(-dy / 300), e.clientX, e.clientY);
      } else if (e.shiftKey) {
        // Shift + scroll → horizontal pan
        this._stopInertia();
        this.tx -= dy;
        this._applyTransform();
      } else {
        // Plain scroll → pan both axes
        this._stopInertia();
        this.tx -= dx;
        this.ty -= dy;
        this._applyTransform();
      }
    };
    this._overlay.addEventListener('wheel', this._onWheel, { passive: false });

    // ── Mouse drag ───────────────────────────────────────────
    this._onMouseDown = e => {
      if (e.target.closest('.cv-desc, .cv-close')) return;
      if (e.button !== 0) return;
      e.preventDefault();
      this._stopInertia();
      this._hideHint();
      this._dragging = true;
      this._lastX = this._prevX = e.clientX;
      this._lastY = this._prevY = e.clientY;
      this._prevT = performance.now();
      this.vx = this.vy = 0;
      this._canvas.classList.add('cv-grabbing');
    };
    this._onMouseMove = e => {
      if (!this._dragging) return;
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      const now = performance.now(), dt = now - this._prevT;
      if (dt > 0) {
        // Normalize velocity to approx. pixels/frame at 60 fps
        this.vx = (e.clientX - this._prevX) / dt * 16;
        this.vy = (e.clientY - this._prevY) / dt * 16;
        this._prevX = e.clientX; this._prevY = e.clientY; this._prevT = now;
      }
      this.tx += dx; this.ty += dy;
      this._lastX = e.clientX; this._lastY = e.clientY;
      this._applyTransform();
    };
    this._onMouseUp = () => {
      if (!this._dragging) return;
      this._dragging = false;
      this._canvas.classList.remove('cv-grabbing');
      this._startInertia();
    };
    this._overlay.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup',   this._onMouseUp);

    // ── Touch: drag and pinch ────────────────────────────────
    this._onTouchStart = e => {
      if (e.target.closest('.cv-desc, .cv-close')) return;
      this._hideHint();
      if (e.touches.length === 2) {
        this._pinching = true;
        this._dragging = false;
        this._stopInertia();
        const t = e.touches;
        this._pinchDist = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        this._pinchMidX = (t[0].clientX + t[1].clientX) / 2;
        this._pinchMidY = (t[0].clientY + t[1].clientY) / 2;
        this._pinchZoom = this.zoom;
        this._pinchTx   = this.tx;
        this._pinchTy   = this.ty;
      } else if (e.touches.length === 1 && !this._pinching) {
        this._stopInertia();
        this._dragging = true;
        this._lastX = this._prevX = e.touches[0].clientX;
        this._lastY = this._prevY = e.touches[0].clientY;
        this._prevT = performance.now();
        this.vx = this.vy = 0;
      }
    };
    this._onTouchMove = e => {
      if (e.target.closest('.cv-desc')) return;
      e.preventDefault();
      if (this._pinching && e.touches.length === 2) {
        const t    = e.touches;
        const dist = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
        const nz   = Math.max(this.minZoom, Math.min(this.maxZoom, this._pinchZoom * (dist / this._pinchDist)));
        const r    = nz / this._pinchZoom;
        this.tx   = this._pinchMidX - (this._pinchMidX - this._pinchTx) * r;
        this.ty   = this._pinchMidY - (this._pinchMidY - this._pinchTy) * r;
        this.zoom = nz;
        this._applyTransform();
      } else if (this._dragging && e.touches.length === 1) {
        const dx  = e.touches[0].clientX - this._lastX;
        const dy  = e.touches[0].clientY - this._lastY;
        const now = performance.now(), dt = now - this._prevT;
        if (dt > 0) {
          this.vx = (e.touches[0].clientX - this._prevX) / dt * 16;
          this.vy = (e.touches[0].clientY - this._prevY) / dt * 16;
          this._prevX = e.touches[0].clientX;
          this._prevY = e.touches[0].clientY;
          this._prevT = now;
        }
        this.tx += dx; this.ty += dy;
        this._lastX = e.touches[0].clientX;
        this._lastY = e.touches[0].clientY;
        this._applyTransform();
      }
    };
    this._onTouchEnd = e => {
      if (this._pinching && e.touches.length < 2) this._pinching = false;
      if (this._dragging && e.touches.length === 0) {
        this._dragging = false;
        this._startInertia();
      }
    };
    this._canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this._canvas.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    this._canvas.addEventListener('touchend',   this._onTouchEnd,   { passive: true });

    // ── Description card drag (mouse) ────────────────────────
    this._onDescDown = e => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      const rect = this._desc.getBoundingClientRect();
      this._descDragging = true;
      this._descOX = e.clientX - rect.left;
      this._descOY = e.clientY - rect.top;
      e.stopPropagation();
    };
    this._onDescMove = e => {
      if (!this._descDragging) return;
      const rect = this._desc.getBoundingClientRect();
      this._desc.style.left = Math.max(0, Math.min(window.innerWidth  - rect.width,  e.clientX - this._descOX)) + 'px';
      this._desc.style.top  = Math.max(0, Math.min(window.innerHeight - rect.height, e.clientY - this._descOY)) + 'px';
    };
    this._onDescUp = () => { this._descDragging = false; };
    this._desc.addEventListener('mousedown', this._onDescDown);
    window.addEventListener('mousemove', this._onDescMove);
    window.addEventListener('mouseup',   this._onDescUp);

    // ── Description card drag (touch) ────────────────────────
    this._onDescTouchStart = e => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      const rect = this._desc.getBoundingClientRect();
      this._descDragging = true;
      this._descOX = e.touches[0].clientX - rect.left;
      this._descOY = e.touches[0].clientY - rect.top;
    };
    this._onDescTouchMove = e => {
      if (!this._descDragging) return;
      e.preventDefault();
      const rect = this._desc.getBoundingClientRect();
      this._desc.style.left = Math.max(0, Math.min(window.innerWidth  - rect.width,  e.touches[0].clientX - this._descOX)) + 'px';
      this._desc.style.top  = Math.max(0, Math.min(window.innerHeight - rect.height, e.touches[0].clientY - this._descOY)) + 'px';
    };
    this._onDescTouchEnd = () => { this._descDragging = false; };
    this._desc.addEventListener('touchstart', this._onDescTouchStart, { passive: true });
    this._desc.addEventListener('touchmove',  this._onDescTouchMove,  { passive: false });
    this._desc.addEventListener('touchend',   this._onDescTouchEnd,   { passive: true });

    // ── Close button ─────────────────────────────────────────
    this._onClose = () => this.close();
    this._closeBtn.addEventListener('click', this._onClose);

    // ── Keyboard: Escape + focus trap ────────────────────────
    this._onKeyDown = e => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation(); // beat existing expander handler
        this.close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = [...this._overlay.querySelectorAll('button:not([disabled]), a[href]')];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    // Capture phase so Escape fires before the existing bubble-phase expander handler
    document.addEventListener('keydown', this._onKeyDown, true);
  }

  // ── Animation helpers ────────────────────────────────────────

  _animateOpen() {
    const infoRect = this._cardInfoRect;
    const thumbR   = this._thumbRect;
    const EASE     = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const MORPH_DUR = 420;

    // Hide the origin card immediately so it doesn't show through the morphs
    if (this._originCard) this._originCard.style.visibility = 'hidden';

    // ── No origin: simple bg + canvas fade ──────────────────
    if (!infoRect && !thumbR) {
      this._overlay.style.pointerEvents = 'all';
      this._desc.style.opacity = '1';
      const a = this._bg.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 300, easing: 'ease', fill: 'forwards' }
      );
      a.onfinish = () => { this._bg.style.opacity = '1'; a.cancel(); this._revealCanvas(); };
      return;
    }

    // Measure desc card (opacity:0 but still has layout)
    const descW = this._desc.offsetWidth  || 288;
    const descH = this._desc.offsetHeight || 200;

    this._overlay.style.pointerEvents = 'all';

    // Count how many simultaneous morphs to wait for
    let pendingCount = (infoRect ? 1 : 0) + (thumbR ? 1 : 0);
    let doneCount    = 0;

    const onMorphsDone = () => {
      doneCount++;
      if (doneCount < pendingCount) return;

      // Show real desc card; hide pill morph
      this._desc.style.opacity = '1';
      if (this._morphEl) this._morphEl.style.opacity = '0';
      if (this._openMorphAnim)      { this._openMorphAnim.cancel();      this._openMorphAnim      = null; }
      if (this._openThumbMorphAnim) { this._openThumbMorphAnim.cancel(); this._openThumbMorphAnim = null; }

      // Fade in the dark bg over the thumb morph
      this._openBgAnim = this._bg.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 200, easing: 'ease', fill: 'forwards' }
      );
      this._openBgAnim.onfinish = () => {
        this._bg.style.opacity = '1';
        this._openBgAnim.cancel();
        this._openBgAnim = null;
        if (this._morphEl)      { this._morphEl.remove();      this._morphEl      = null; }
        if (this._thumbMorphEl) { this._thumbMorphEl.remove(); this._thumbMorphEl = null; }
        this._revealCanvas();
      };
    };

    // ── 1. Thumb morph: .card-thumb-video → full viewport ───
    if (thumbR) {
      // Border-radius comes from the clipping parent (.card-thumb), not the img
      const thumbParentBR = this._thumbEl
        ? getComputedStyle(this._thumbEl.parentElement).borderRadius
        : '0px';
      const vw = window.innerWidth, vh = window.innerHeight;

      const morphThumb = document.createElement('div');
      morphThumb.className = 'cv-morph-bg';
      morphThumb.style.cssText =
        `left:${thumbR.left}px;top:${thumbR.top}px;width:${thumbR.width}px;height:${thumbR.height}px;border-radius:${thumbParentBR}`;

      const thumbImg = document.createElement('img');
      thumbImg.className    = 'cv-morph-thumb';
      thumbImg.src          = this._thumbEl ? this._thumbEl.src : (this.data.srcs[0] || '');
      thumbImg.alt          = '';
      morphThumb.appendChild(thumbImg);

      this._thumbMorphEl = morphThumb;
      this._overlay.appendChild(morphThumb);

      this._openThumbMorphAnim = morphThumb.animate([
        { left:`${thumbR.left}px`, top:`${thumbR.top}px`, width:`${thumbR.width}px`, height:`${thumbR.height}px`, borderRadius: thumbParentBR },
        { left:'0px',              top:'0px',              width:`${vw}px`,           height:`${vh}px`,            borderRadius:'0px' }
      ], { duration: MORPH_DUR, easing: EASE, fill: 'forwards' });

      // Image fades out as the element expands to reveal the dark bg
      thumbImg.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: MORPH_DUR * 0.6, easing: 'ease', fill: 'forwards' }
      );

      this._openThumbMorphAnim.onfinish = () => {
        morphThumb.style.left         = '0px';
        morphThumb.style.top          = '0px';
        morphThumb.style.width        = `${vw}px`;
        morphThumb.style.height       = `${vh}px`;
        morphThumb.style.borderRadius = '0px';
        onMorphsDone();
      };
    }

    // ── 2. Pill morph: .card-info → .cv-desc ────────────────
    if (infoRect) {
      const cardInfoBR = this._cardInfoEl
        ? getComputedStyle(this._cardInfoEl).borderRadius
        : '14px';

      const morphPill = document.createElement('div');
      morphPill.className = 'cv-morph-card';
      morphPill.style.cssText =
        `left:${infoRect.left}px;top:${infoRect.top}px;width:${infoRect.width}px;height:${infoRect.height}px;border-radius:${cardInfoBR}`;

      // Text content starts invisible and fades in during the last half
      const pillText = document.createElement('div');
      pillText.className   = 'cv-morph-text';
      pillText.innerHTML   = this._desc.innerHTML;
      pillText.style.opacity = '0';
      morphPill.appendChild(pillText);

      this._morphEl = morphPill;
      this._overlay.appendChild(morphPill);

      this._openMorphAnim = morphPill.animate([
        { left:`${infoRect.left}px`, top:`${infoRect.top}px`, width:`${infoRect.width}px`, height:`${infoRect.height}px`, borderRadius: cardInfoBR },
        { left:'24px',               top:'24px',               width:`${descW}px`,          height:`${descH}px`,           borderRadius:'16px' }
      ], { duration: MORPH_DUR, easing: EASE, fill: 'forwards' });

      // Text fades in over the last 55%
      pillText.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: MORPH_DUR * 0.55, delay: MORPH_DUR * 0.45, easing: 'ease', fill: 'forwards' }
      );

      this._openMorphAnim.onfinish = () => {
        morphPill.style.left         = '24px';
        morphPill.style.top          = '24px';
        morphPill.style.width        = `${descW}px`;
        morphPill.style.height       = `${descH}px`;
        morphPill.style.borderRadius = '16px';
        onMorphsDone();
      };
    }
  }

  // Fades the canvas images and UI chrome in as the final open step.
  _revealCanvas() {
    this._overlay.style.pointerEvents = 'all';
    const DUR = 200;
    [this._canvas, this._closeBtn].forEach(el => {
      const a = el.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: DUR, easing: 'ease', fill: 'forwards' }
      );
      a.onfinish = () => { el.style.opacity = '1'; a.cancel(); };
    });
    // Hint uses a CSS opacity transition — clearing the inline style lets it fade in.
    setTimeout(() => { this._hint.style.opacity = ''; }, DUR);
  }

  // Reverses the open: canvas+bg fade out, then pill and thumb morph back simultaneously.
  _animateClose() {
    const infoRect = this._cardInfoRect;
    const thumbR   = this._thumbRect;
    const EASE     = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const CLOSE_DUR = 380;

    // ── Capture current animated states BEFORE canceling ─────
    const canvasOp = parseFloat(getComputedStyle(this._canvas).opacity) || 0;
    const bgOp     = parseFloat(getComputedStyle(this._bg).opacity)     || 0;

    // Commit in-flight pill morph position so it stays put after cancel
    let pillStart = null;
    if (this._morphEl) {
      const cs = getComputedStyle(this._morphEl);
      pillStart = { left: cs.left, top: cs.top, width: cs.width, height: cs.height, borderRadius: cs.borderRadius };
      Object.assign(this._morphEl.style, pillStart);
    }

    // Commit in-flight thumb morph position
    let thumbBgStart = null;
    if (this._thumbMorphEl) {
      const cs = getComputedStyle(this._thumbMorphEl);
      thumbBgStart = { left: cs.left, top: cs.top, width: cs.width, height: cs.height, borderRadius: cs.borderRadius };
      Object.assign(this._thumbMorphEl.style, thumbBgStart);
    }

    // Cancel in-flight open animations
    if (this._openMorphAnim)      { this._openMorphAnim.cancel();      this._openMorphAnim      = null; }
    if (this._openThumbMorphAnim) { this._openThumbMorphAnim.cancel(); this._openThumbMorphAnim = null; }
    if (this._openBgAnim)         { this._openBgAnim.cancel();         this._openBgAnim         = null; }

    this._bg.style.opacity     = String(bgOp);
    this._canvas.style.opacity = String(canvasOp);

    // Immediately disable interaction and hide chrome
    this._overlay.style.pointerEvents = 'none';
    this._desc.style.opacity     = '0';
    this._hint.style.opacity     = '0';
    this._closeBtn.style.opacity = '0';

    // ── Step 2: both morphs reverse simultaneously ────────────
    const doReverseMorphs = () => {
      if (!infoRect && !thumbR) { this._teardown(); return; }

      let morphsDone   = 0;
      const morphsNeeded = (infoRect ? 1 : 0) + (thumbR ? 1 : 0);
      const onAllDone  = () => { morphsDone++; if (morphsDone < morphsNeeded) return; this._teardown(); };

      // ── Pill morph: cv-desc → .card-info ─────────────────
      if (infoRect) {
        let startLeft, startTop, startWidth, startHeight, startBR;
        if (pillStart) {
          ({ left: startLeft, top: startTop, width: startWidth,
             height: startHeight, borderRadius: startBR } = pillStart);
        } else {
          const dr = this._desc.getBoundingClientRect();
          startLeft = `${dr.left}px`; startTop    = `${dr.top}px`;
          startWidth = `${dr.width}px`; startHeight = `${dr.height}px`;
          startBR   = '16px';
        }

        let morph = this._morphEl;
        if (!morph) {
          morph = document.createElement('div');
          morph.className = 'cv-morph-card';
          morph.style.cssText =
            `left:${startLeft};top:${startTop};width:${startWidth};height:${startHeight};border-radius:${startBR}`;
          const text = document.createElement('div');
          text.className  = 'cv-morph-text';
          text.innerHTML  = this._desc.innerHTML;
          morph.appendChild(text);
          this._morphEl = morph;
          this._overlay.appendChild(morph);
        }

        const text = morph.querySelector('.cv-morph-text');
        if (text) text.style.opacity = '1';
        morph.style.opacity = '1';

        const cardInfoBR = this._cardInfoEl
          ? getComputedStyle(this._cardInfoEl).borderRadius
          : '14px';

        const pillAnim = morph.animate([
          { left: startLeft, top: startTop, width: startWidth, height: startHeight, borderRadius: startBR },
          { left:`${infoRect.left}px`, top:`${infoRect.top}px`, width:`${infoRect.width}px`, height:`${infoRect.height}px`, borderRadius: cardInfoBR }
        ], { duration: CLOSE_DUR, easing: EASE, fill: 'forwards' });

        // Text fades out over the first half
        if (text) text.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: CLOSE_DUR * 0.5, easing: 'ease', fill: 'forwards' }
        );

        pillAnim.onfinish = onAllDone;
      }

      // ── Thumb morph: full viewport → .card-thumb-video ───
      if (thumbR) {
        const vw = window.innerWidth, vh = window.innerHeight;

        // Start from committed mid-position if closed mid-open, else full viewport
        let curLeft = '0px', curTop = '0px', curW = `${vw}px`, curH = `${vh}px`, curBR = '0px';
        if (thumbBgStart) {
          ({ left: curLeft, top: curTop, width: curW, height: curH, borderRadius: curBR } = thumbBgStart);
        }

        let thumbMorph = this._thumbMorphEl;
        if (!thumbMorph) {
          thumbMorph = document.createElement('div');
          thumbMorph.className = 'cv-morph-bg';
          thumbMorph.style.cssText =
            `left:${curLeft};top:${curTop};width:${curW};height:${curH};border-radius:${curBR}`;
          const thumbImg = document.createElement('img');
          thumbImg.className     = 'cv-morph-thumb';
          thumbImg.src           = this._thumbEl ? this._thumbEl.src : (this.data.srcs[0] || '');
          thumbImg.alt           = '';
          thumbImg.style.opacity = '0'; // image faded out during open
          thumbMorph.appendChild(thumbImg);
          this._thumbMorphEl = thumbMorph;
          this._overlay.appendChild(thumbMorph);
        }

        const thumbParentBR = this._thumbEl
          ? getComputedStyle(this._thumbEl.parentElement).borderRadius
          : '0px';
        const thumbImg = thumbMorph.querySelector('.cv-morph-thumb');

        const thumbAnim = thumbMorph.animate([
          { left: curLeft, top: curTop, width: curW, height: curH, borderRadius: curBR },
          { left:`${thumbR.left}px`, top:`${thumbR.top}px`, width:`${thumbR.width}px`, height:`${thumbR.height}px`, borderRadius: thumbParentBR }
        ], { duration: CLOSE_DUR, easing: EASE, fill: 'forwards' });

        // Image fades back in during the second half
        if (thumbImg) thumbImg.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: CLOSE_DUR * 0.5, delay: CLOSE_DUR * 0.5, easing: 'ease', fill: 'forwards' }
        );

        thumbAnim.onfinish = onAllDone;
      }
    };

    // ── Step 1: fade canvas and bg out simultaneously ─────────
    let fadeDone   = 0;
    let fadesNeeded = (canvasOp > 0.01 ? 1 : 0) + (bgOp > 0.01 ? 1 : 0);

    if (fadesNeeded === 0) { doReverseMorphs(); return; }

    const onFadesDone = () => { fadeDone++; if (fadeDone < fadesNeeded) return; doReverseMorphs(); };

    if (canvasOp > 0.01) {
      const a = this._canvas.animate(
        [{ opacity: canvasOp }, { opacity: 0 }],
        { duration: 150, easing: 'ease', fill: 'forwards' }
      );
      a.onfinish = () => { this._canvas.style.opacity = '0'; a.cancel(); onFadesDone(); };
    }

    if (bgOp > 0.01) {
      const a = this._bg.animate(
        [{ opacity: bgOp }, { opacity: 0 }],
        { duration: 150, easing: 'ease', fill: 'forwards' }
      );
      a.onfinish = () => { this._bg.style.opacity = '0'; a.cancel(); onFadesDone(); };
    }
  }

  _teardown() {
    if (this._morphEl)      { this._morphEl.remove();      this._morphEl      = null; }
    if (this._thumbMorphEl) { this._thumbMorphEl.remove(); this._thumbMorphEl = null; }
    this._overlay.remove();
    // Restore the origin card now that the closing morphs have landed on it
    if (this._originCard) this._originCard.style.visibility = '';
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight        = '';
    document.documentElement.classList.remove('modal-open');
  }

  // ── Listener management ──────────────────────────────────────

  _removeListeners() {
    this._overlay.removeEventListener('wheel',     this._onWheel);
    this._overlay.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup',   this._onMouseUp);
    this._canvas.removeEventListener('touchstart', this._onTouchStart);
    this._canvas.removeEventListener('touchmove',  this._onTouchMove);
    this._canvas.removeEventListener('touchend',   this._onTouchEnd);
    this._desc.removeEventListener('mousedown', this._onDescDown);
    window.removeEventListener('mousemove', this._onDescMove);
    window.removeEventListener('mouseup',   this._onDescUp);
    this._desc.removeEventListener('touchstart', this._onDescTouchStart);
    this._desc.removeEventListener('touchmove',  this._onDescTouchMove);
    this._desc.removeEventListener('touchend',   this._onDescTouchEnd);
    this._closeBtn.removeEventListener('click', this._onClose);
    document.removeEventListener('keydown', this._onKeyDown, true);
  }

  close() {
    this._stopInertia();
    this._removeListeners();
    this._animateClose();
  }
}

document.querySelectorAll('.project-card[data-project]').forEach(card => {
  card.addEventListener('mousedown', () => card.classList.add('pressed'));
  card.addEventListener('mouseleave', () => card.classList.remove('pressed'));
  card.addEventListener('click', () => openExpander(card));
});

expanderClose.addEventListener('click', closeExpander);
expanderBg.addEventListener('click', closeExpander);
galleryPrevBtn.addEventListener('click', e => { e.stopPropagation(); goToSlide(galleryIndex - 1); });
galleryNextBtn.addEventListener('click', e => { e.stopPropagation(); goToSlide(galleryIndex + 1); });

document.addEventListener('keydown', e => {
  if (!isExpanded || isMobile()) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    galleryNextBtn.classList.add('pressed');
    goToSlide(galleryIndex + 1);
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    galleryPrevBtn.classList.add('pressed');
    goToSlide(galleryIndex - 1);
  }
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowRight') galleryNextBtn.classList.remove('pressed');
  if (e.key === 'ArrowLeft')  galleryPrevBtn.classList.remove('pressed');
});

gallerySlides.addEventListener('click', e => {
  if (!galleryTrack || !galleryImages.length) return;

  let targetIndex = galleryIndex;
  const clickedSlide = e.target.closest('.gallery-slide');
  if (clickedSlide && galleryTrack.contains(clickedSlide)) {
    const clickedIndex = Array.prototype.indexOf.call(galleryTrack.children, clickedSlide);
    if (clickedIndex >= 0 && clickedIndex < galleryImages.length) {
      targetIndex = clickedIndex;
    }
    if (!isMobile() && clickedIndex !== galleryIndex) {
      goToSlide(clickedIndex);
      return;
    }
  }

  if (!isMobile()) {
    const activeSlide = galleryTrack.children[galleryIndex];
    const activeImg = activeSlide?.querySelector('img');
    if (!activeImg) return;

    const rect = activeImg.getBoundingClientRect();
    const clickedActiveImage =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (!clickedActiveImage) return;
  }

  openGalleryImage(galleryImages, targetIndex);
});

/* ── Scroll → filmstrip sync ── */
gallerySlides.addEventListener('scroll', () => {
  if (isMobile() || !galleryTrack || suppressScrollSync) return;

  const sl     = gallerySlides.scrollLeft;
  const thumbs = galleryFilmstrip.querySelectorAll('.gallery-thumb');

  let closestDom = 0, minDist = Infinity;
  Array.from(galleryTrack.children).forEach((slide, i) => {
    const dist = Math.abs(slide.offsetLeft - 12 - sl);
    if (dist < minDist) { minDist = dist; closestDom = i; }
  });

  if (!programmaticScrollInProgress) {
    if (closestDom !== galleryIndex) {
      thumbs[galleryIndex]?.classList.remove('active');
      galleryIndex = closestDom;
      thumbs[galleryIndex]?.classList.add('active');
      // Keep filmstrip scrolled to the active thumbnail
      const activeThumb = thumbs[galleryIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    Array.from(galleryTrack.children).forEach((s, i) =>
      s.classList.toggle('active-slide', i === closestDom));
  }
}, { passive: true });

/* ── Mobile drawer: header tap & drag ── */
expHeaderEl.addEventListener('click', () => {
  if (!isMobile()) return;
  if (drawerExpanded) setDrawerCollapsed(true);
  else setDrawerExpanded(true);
});

expHeaderEl.addEventListener('touchstart', e => {
  if (!isMobile()) return;
  drawerDragging = true;
  drawerStartY   = e.touches[0].clientY;
  expanderContent.style.transition = 'none';
}, { passive: true });

expHeaderEl.addEventListener('touchmove', e => {
  if (!drawerDragging || !isMobile()) return;
  const dy     = e.touches[0].clientY - drawerStartY;
  const startT = drawerExpanded ? 0 : drawerBodyH;
  const newT   = Math.max(0, Math.min(drawerBodyH, startT + dy));
  expanderContent.style.transform = `translateY(${newT}px)`;
}, { passive: true });

expHeaderEl.addEventListener('touchend', e => {
  if (!drawerDragging) return;
  drawerDragging = false;
  if (!isMobile()) return;
  const dy = e.changedTouches[0].clientY - drawerStartY;
  if (drawerExpanded) {
    if (dy > 48) setDrawerCollapsed(true); else setDrawerExpanded(true);
  } else {
    if (dy < -48) setDrawerExpanded(true); else setDrawerCollapsed(true);
  }
});

expHeaderEl.addEventListener('touchcancel', () => {
  if (!drawerDragging) return;
  drawerDragging = false;
  if (!isMobile()) return;
  if (drawerExpanded) setDrawerExpanded(true);
  else setDrawerCollapsed(true);
});

/* ── Mobile drawer: overscroll at body top collapses drawer ── */
expBodyEl.addEventListener('touchstart', e => {
  if (!isMobile() || !drawerExpanded) return;
  drawerBodyStartY = e.touches[0].clientY;
}, { passive: true });

expBodyEl.addEventListener('touchmove', e => {
  if (!isMobile() || !drawerExpanded) return;
  const dy = e.touches[0].clientY - drawerBodyStartY;
  if (expBodyEl.scrollTop <= 0 && dy > 0) {
    expanderContent.style.transition = 'none';
    expanderContent.style.transform  = `translateY(${Math.min(drawerBodyH, dy)}px)`;
    e.preventDefault();
  }
}, { passive: false });

expBodyEl.addEventListener('touchend', e => {
  if (!isMobile() || !drawerExpanded) return;
  const dy = e.changedTouches[0].clientY - drawerBodyStartY;
  if (expBodyEl.scrollTop <= 0 && dy > 48) setDrawerCollapsed(true);
  else setDrawerExpanded(true);
});

expBodyEl.addEventListener('touchcancel', () => {
  if (!isMobile() || !drawerExpanded) return;
  setDrawerExpanded(true);
});

let expanderViewportTimer = null;
function refreshExpanderViewport() {
  if (!isExpanded || isClosing) return;
  clearTimeout(expanderViewportTimer);
  expanderViewportTimer = setTimeout(() => {
    if (!isExpanded || isClosing) return;
    expander.style.transition = 'none';
    applyExpanderViewportGeometry(true);
    requestAnimationFrame(() => {
      if (isExpanded && !isClosing) expander.style.transition = '';
    });
  }, 80);
}

window.addEventListener('resize', refreshExpanderViewport, { passive: true });
window.addEventListener('orientationchange', refreshExpanderViewport, { passive: true });
window.visualViewport?.addEventListener('resize', refreshExpanderViewport, { passive: true });

/* ── Image Carousel ── */
const carouselOverlay = document.getElementById('carousel-overlay');
const carouselImg     = document.getElementById('carousel-img');
const carouselCounter = document.getElementById('carousel-counter');
const carouselCloseBtn = document.getElementById('carousel-close');
const carouselPrevBtn  = document.getElementById('carousel-prev');
const carouselNextBtn  = document.getElementById('carousel-next');

let carouselImages = [];
let carouselIndex  = 0;
let isCarouselOpen = false;

function positionCarouselCounter() {
  if (window.innerWidth > 760) return;
  const rect = carouselImg.getBoundingClientRect();
  if (rect.height === 0) return;
  carouselCounter.style.top    = `${rect.bottom + 12}px`;
  carouselCounter.style.bottom = 'unset';
}

function showCarouselSlide() {
  carouselImg.src = carouselImages[carouselIndex];
  carouselCounter.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
  if (window.innerWidth <= 760) {
    if (carouselImg.complete && carouselImg.naturalHeight !== 0) {
      positionCarouselCounter();
    } else {
      carouselImg.onload = positionCarouselCounter;
    }
  }
}

function openCarousel(images, startIndex) {
  carouselImages = images;
  carouselIndex  = startIndex || 0;
  isCarouselOpen = true;
  carouselOverlay.classList.toggle('single', images.length === 1);

  // Build dots
  carouselCounter.innerHTML = '';
  images.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === carouselIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Image ${i + 1}`);
    dot.addEventListener('click', () => {
      carouselIndex = i;
      showCarouselSlide();
    });
    carouselCounter.appendChild(dot);
  });

  showCarouselSlide();

  // Position the carousel nav buttons relative to the expanded modal (desktop only)
  if (window.innerWidth > 760) {
    carouselPrevBtn.style.left = Math.round(expandedL / 2 - 16) + 'px';
    carouselNextBtn.style.left = Math.round(expandedL + expandedW + (window.innerWidth - expandedL - expandedW) / 2 - 16) + 'px';
  } else {
    carouselPrevBtn.style.left = '';
    carouselNextBtn.style.left = '';
  }

  carouselOverlay.classList.add('visible');
}

function closeCarousel() {
  isCarouselOpen = false;
  resetImgZoom();
  carouselOverlay.classList.remove('visible');
}

function carouselNavigate(dir) {
  if (carouselImages.length <= 1) return;
  resetImgZoom();

  const slideOut = PANEL_SLIDE_OUT_MS;
  const slideIn  = PANEL_SLIDE_IN_MS;
  const outX     = dir === 1 ? '-100vw' : '100vw';
  const inX      = dir === 1 ?  '100vw' : '-100vw';

  carouselImg.style.transition = `transform ${slideOut}ms ${MOTION_EASE}, opacity ${slideOut}ms ${MOTION_EASE}`;
  carouselImg.style.transform  = `translateX(${outX})`;
  carouselImg.style.opacity    = '0';

  setTimeout(() => {
    carouselIndex = (carouselIndex + dir + carouselImages.length) % carouselImages.length;
    showCarouselSlide();

    carouselImg.style.transition = 'none';
    carouselImg.style.transform  = `translateX(${inX})`;
    carouselImg.style.opacity    = '0';

    carouselImg.offsetHeight; // force reflow

    carouselImg.style.transition = `transform ${slideIn}ms ${MOTION_EASE}, opacity ${slideIn}ms ${MOTION_EASE}`;
    carouselImg.style.transform  = 'translateX(0)';
    carouselImg.style.opacity    = '1';

    setTimeout(() => {
      carouselImg.style.transition = '';
      carouselImg.style.transform  = '';
      carouselImg.style.opacity    = '';
    }, slideIn + 50);
  }, slideOut);
}

carouselCloseBtn.addEventListener('click', closeCarousel);
carouselPrevBtn.addEventListener('click', () => carouselNavigate(-1));
carouselNextBtn.addEventListener('click', () => carouselNavigate(1));
carouselOverlay.addEventListener('click', e => {
  if (e.target === carouselOverlay || e.target.closest('.carousel-img-wrap') === e.target) closeCarousel();
});

/* ── Click-to-zoom + mouse-drag-to-pan (desktop) ── */
let desktopPanActive = false;
let desktopPanStartX = 0;
let desktopPanStartY = 0;
let desktopPanBaseX  = 0;
let desktopPanBaseY  = 0;
let desktopPanMoved  = false;

carouselImg.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') return;
  e.preventDefault();
  desktopPanActive = true;
  desktopPanMoved  = false;
  desktopPanStartX = e.clientX;
  desktopPanStartY = e.clientY;
  desktopPanBaseX  = panOffsetX;
  desktopPanBaseY  = panOffsetY;
  carouselImg.setPointerCapture(e.pointerId);
  if (zoomScale > 1) carouselImg.style.cursor = 'grabbing';
});

carouselImg.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' || !desktopPanActive || zoomScale <= 1) return;
  const dx = e.clientX - desktopPanStartX;
  const dy = e.clientY - desktopPanStartY;
  if (!desktopPanMoved && Math.hypot(dx, dy) > 4) desktopPanMoved = true;
  if (!desktopPanMoved) return;
  panOffsetX = desktopPanBaseX + dx;
  panOffsetY = desktopPanBaseY + dy;
  clampPan();
  carouselImg.style.transition = 'none';
  carouselImg.style.transform  = `translate(${panOffsetX}px,${panOffsetY}px) scale(${zoomScale})`;
});

carouselImg.addEventListener('pointerup', e => {
  if (e.pointerType === 'touch') return;
  desktopPanActive = false;
  carouselImg.style.cursor = zoomScale > 1 ? 'zoom-out' : 'zoom-in';

  if (desktopPanMoved) return; // was a drag, not a click

  // Clean tap — toggle zoom
  e.stopPropagation();
  if (zoomScale > 1) {
    zoomScale  = 1;
    panOffsetX = 0;
    panOffsetY = 0;
    carouselImg.style.transition = ZOOM_TRANSITION;
    carouselImg.style.transform  = '';
    carouselImg.classList.remove('zoomed');
    setTimeout(() => { carouselImg.style.transition = ''; }, 320);
  } else {
    zoomScale = 2;
    const rect = carouselImg.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top  - rect.height / 2;
    panOffsetX = -cx;
    panOffsetY = -cy;
    clampPan();
    carouselImg.style.transition = ZOOM_TRANSITION;
    carouselImg.style.transform  = `translate(${panOffsetX}px,${panOffsetY}px) scale(${zoomScale})`;
    carouselImg.classList.add('zoomed');
    setTimeout(() => { carouselImg.style.transition = ''; }, 320);
  }
});

/* ── Scroll-to-pan when zoomed (desktop trackpad / mouse wheel) ── */
carouselOverlay.addEventListener('wheel', e => {
  if (zoomScale <= 1) return;
  e.preventDefault();
  panOffsetX -= e.deltaX;
  panOffsetY -= e.deltaY;
  clampPan();
  carouselImg.style.transition = 'none';
  carouselImg.style.transform  = `translate(${panOffsetX}px,${panOffsetY}px) scale(${zoomScale})`;
}, { passive: false });

// Drag-to-swipe with peek
let dragStartX    = 0;
let dragStartY    = 0;
let dragDx        = 0;
let carouselDragging = false;
let dragLocked    = false;
let dragDir       = 0;
let peekImg       = null;

function removePeekImg() {
  if (peekImg) { peekImg.remove(); peekImg = null; }
}

// Pinch-to-zoom state (mobile)
let pinchActive    = false;
let pinchStartDist = 0;
let pinchBaseScale = 1;
let zoomScale      = 1;
let panActive      = false;
let panStartX      = 0;
let panStartY      = 0;
let panOffsetX     = 0;
let panOffsetY     = 0;
let pinchBasePanX  = 0;
let pinchBasePanY  = 0;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}
function clampPan() {
  const vw   = carouselOverlay.clientWidth;
  const vh   = carouselOverlay.clientHeight;
  const maxX = Math.max(0, (carouselImg.offsetWidth  * zoomScale - vw) / 2);
  const maxY = Math.max(0, (carouselImg.offsetHeight * zoomScale - vh) / 2);
  panOffsetX = Math.max(-maxX, Math.min(maxX, panOffsetX));
  panOffsetY = Math.max(-maxY, Math.min(maxY, panOffsetY));
}
function applyImgZoom() {
  clampPan();
  carouselImg.style.transform = `translate(${panOffsetX}px,${panOffsetY}px) scale(${zoomScale})`;
  carouselImg.style.transition = 'none';
}
function resetImgZoom() {
  zoomScale  = 1;
  panOffsetX = 0;
  panOffsetY = 0;
  pinchActive      = false;
  panActive        = false;
  desktopPanActive = false;
  desktopPanMoved  = false;
  carouselImg.style.transform  = '';
  carouselImg.style.transition = '';
  carouselImg.style.cursor     = '';
  carouselImg.classList.remove('zoomed');
}

function cancelCarouselTouchGesture() {
  if (pinchActive) {
    pinchActive = false;
    if (zoomScale < 1.05) resetImgZoom();
    else applyImgZoom();
    return;
  }

  if (panActive) {
    panActive = false;
    applyImgZoom();
    return;
  }

  carouselDragging = false;
  dragLocked = false;
  dragDx = 0;
  carouselImg.style.transition = '';
  carouselImg.style.transform = zoomScale > 1
    ? `translate(${panOffsetX}px,${panOffsetY}px) scale(${zoomScale})`
    : '';
  removePeekImg();
}

carouselOverlay.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    // Begin pinch-to-zoom
    pinchActive    = true;
    carouselDragging = false;
    dragLocked     = false;
    removePeekImg();
    pinchStartDist = getTouchDist(e.touches);
    pinchBaseScale = zoomScale;
    pinchBasePanX  = panOffsetX;
    pinchBasePanY  = panOffsetY;
    return;
  }
  if (zoomScale > 1) {
    // Pan the zoomed image
    panActive  = true;
    panStartX  = e.touches[0].clientX - panOffsetX;
    panStartY  = e.touches[0].clientY - panOffsetY;
    carouselDragging = false;
    return;
  }
  dragStartX = e.touches[0].clientX;
  dragStartY = e.touches[0].clientY;
  dragDx = 0;
  dragDir = 0;
  carouselDragging = true;
  dragLocked = false;
  removePeekImg();
  carouselImg.style.transition = 'none';
}, { passive: true });

carouselOverlay.addEventListener('touchmove', e => {
  if (pinchActive && e.touches.length === 2) {
    const dist = getTouchDist(e.touches);
    zoomScale = Math.max(1, Math.min(5, pinchBaseScale * (dist / pinchStartDist)));
    applyImgZoom();
    return;
  }
  if (panActive && e.touches.length === 1) {
    panOffsetX = e.touches[0].clientX - panStartX;
    panOffsetY = e.touches[0].clientY - panStartY;
    applyImgZoom();
    return;
  }
  if (!carouselDragging) return;
  const dx = e.touches[0].clientX - dragStartX;
  const dy = e.touches[0].clientY - dragStartY;

  // Wait for intentional movement, then lock axis
  if (!dragLocked) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    if (Math.abs(dy) > Math.abs(dx)) { carouselDragging = false; return; }
    dragLocked = true;
    dragDir = dx < 0 ? 1 : -1; // 1 = next, -1 = prev

    // Spawn peek image off-screen in the incoming direction
    if (carouselImages.length > 1) {
      const peekIndex = (carouselIndex + dragDir + carouselImages.length) % carouselImages.length;
      const rect = carouselImg.getBoundingClientRect();
      peekImg = document.createElement('img');
      peekImg.src = carouselImages[peekIndex];
      peekImg.style.cssText = [
        `position:fixed`,
        `top:${rect.top}px`,
        `left:${rect.left}px`,
        `width:${rect.width}px`,
        `height:${rect.height}px`,
        `object-fit:contain`,
        `border-radius:12px`,
        `box-shadow:0 24px 80px rgba(0,0,0,0.60)`,
        `pointer-events:none`,
        `z-index:201`,
        `transform:translateX(${dragDir * window.innerWidth}px)`,
      ].join(';');
      document.body.appendChild(peekImg);
    }
  }

  dragDx = dx;
  const resistance = carouselImages.length <= 1 ? 0.15 : 1;
  carouselImg.style.transform = `translateX(${dragDx * resistance}px)`;
  if (peekImg) {
    peekImg.style.transform = `translateX(${dragDx + dragDir * window.innerWidth}px)`;
  }
}, { passive: true });

carouselOverlay.addEventListener('touchend', () => {
  if (pinchActive) {
    pinchActive = false;
    if (zoomScale < 1.05) resetImgZoom();
    return;
  }
  if (panActive) {
    panActive = false;
    return;
  }
  if (!carouselDragging || !dragLocked) {
    carouselDragging = false;
    removePeekImg();
    return;
  }
  carouselDragging = false;
  dragLocked = false;

  const threshold = window.innerWidth * 0.25;
  if (Math.abs(dragDx) > threshold && carouselImages.length > 1) {
    // Complete: current flies out, peek snaps to center
    carouselImg.style.transition = SWIPE_COMPLETE_TRANSITION;
    carouselImg.style.transform  = `translateX(${dragDir * -window.innerWidth}px)`;
    if (peekImg) {
      peekImg.style.transition = SWIPE_COMPLETE_TRANSITION;
      peekImg.style.transform  = 'translateX(0)';
    }
    setTimeout(() => {
      carouselIndex = (carouselIndex + dragDir + carouselImages.length) % carouselImages.length;
      showCarouselSlide();
      carouselImg.style.transition = 'none';
      carouselImg.style.transform  = '';
      removePeekImg();
      setTimeout(() => { carouselImg.style.transition = ''; }, 50);
    }, 260);
  } else {
    // Spring back: both images return to start
    carouselImg.style.transition = SWIPE_SPRINGBACK_TRANSITION;
    carouselImg.style.transform  = 'translateX(0)';
    if (peekImg) {
      peekImg.style.transition = SWIPE_SPRINGBACK_TRANSITION;
      peekImg.style.transform  = `translateX(${dragDir * window.innerWidth}px)`;
    }
    setTimeout(() => {
      carouselImg.style.transition = '';
      removePeekImg();
    }, 320);
  }
});

carouselOverlay.addEventListener('touchcancel', cancelCarouselTouchGesture);

function flashPressed(el) {
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 150);
}

document.addEventListener('keydown', e => {
  if (isCarouselOpen) {
    if (e.key === 'Escape')     { flashPressed(carouselCloseBtn); closeCarousel(); }
    if (e.key === 'ArrowLeft')  { flashPressed(carouselPrevBtn);  carouselNavigate(-1); }
    if (e.key === 'ArrowRight') { flashPressed(carouselNextBtn);  carouselNavigate(1); }
    return;
  }
  if (e.key === 'Escape')     { flashPressed(expanderClose); closeExpander(); }
});

/* ── About toolkit reactive float ── */
const aboutSection = document.getElementById('about');
const toolkitPills = Array.from(document.querySelectorAll('.toolkit-pill'));

if (aboutSection && toolkitPills.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const pillMotion = toolkitPills.map(pill => ({
    pill,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    phase: Math.random() * Math.PI * 2,
    speed: 0.00055 + Math.random() * 0.00045,
    scrollMultiplier: 0.18 + Math.random() * 0.32,
    scrollOffsetY: 0,
    width: 0,
    height: 0,
    docX: 0,
    docY: 0
  }));
  let isPointerInsideAbout = false;
  let isAboutVisible = false;
  let animationFrameId = null;
  let cursorX = 0;
  let cursorY = 0;
  let previousScrollY = window.scrollY;
  let previousElapsed = 0;
  let measureFrameId = null;

  const resetToolkitPills = () => {
    pillMotion.forEach(state => {
      state.offsetX = 0;
      state.offsetY = 0;
      state.velocityX = 0;
      state.velocityY = 0;
      state.scrollOffsetY = 0;
      state.pill.style.transform = '';
    });
  };

  const measureToolkitPills = elapsed => {
    pillMotion.forEach(state => {
      const rect = state.pill.getBoundingClientRect();
      const idleX = Math.sin(elapsed * state.speed * 0.6 + state.phase) * 0.4;
      const idleAmplitude = Math.min(2.5, 0.6 + Math.hypot(state.offsetX, state.offsetY) * 0.03);
      const idleY = Math.sin(elapsed * state.speed + state.phase) * idleAmplitude + state.scrollOffsetY;
      state.width = rect.width;
      state.height = rect.height;
      state.docX = window.scrollX + rect.left - state.offsetX - idleX;
      state.docY = window.scrollY + rect.top - state.offsetY - idleY;
    });
  };

  const shouldAnimateToolkitPills = () =>
    isAboutVisible &&
    !prefersReducedMotion.matches &&
    finePointerQuery.matches;

  const queueToolkitMeasurement = () => {
    if (measureFrameId !== null) return;
    measureFrameId = requestAnimationFrame(() => {
      measureFrameId = null;
      measureToolkitPills(previousElapsed || performance.now());
    });
  };

  aboutSection.addEventListener('mousemove', e => {
    isPointerInsideAbout = true;
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  aboutSection.addEventListener('mouseleave', () => {
    isPointerInsideAbout = false;
  });

  const animateToolkitPills = elapsed => {
    if (!shouldAnimateToolkitPills()) {
      animationFrameId = null;
      previousScrollY = window.scrollY;
      previousElapsed = elapsed;
      resetToolkitPills();
      return;
    }

    const dt = previousElapsed ? Math.min(1.35, (elapsed - previousElapsed) / 16.6667) : 1;
    previousElapsed = elapsed;
    const currentScrollY = window.scrollY;
    const scrollVelocity = currentScrollY - previousScrollY;
    previousScrollY = currentScrollY;

    pillMotion.forEach(state => {
      state.scrollOffsetY += scrollVelocity * state.scrollMultiplier;
      state.scrollOffsetY *= 0.88;
      if (Math.abs(state.scrollOffsetY) < 0.01) state.scrollOffsetY = 0;
    });

    pillMotion.forEach(state => {
      const idleRepulsion = Math.hypot(state.offsetX, state.offsetY);
      state.phase += idleRepulsion * 0.00035;

      const baseX = state.docX - window.scrollX;
      const baseY = state.docY - window.scrollY;

      if (isPointerInsideAbout) {
        const pillCenterX = baseX + state.width / 2 + state.offsetX;
        const pillCenterY = baseY + state.height / 2 + state.offsetY + state.scrollOffsetY;
        const dx = pillCenterX - cursorX;
        const dy = pillCenterY - cursorY;
        const distance = Math.max(Math.hypot(dx, dy), 0.001);
        const radius = 120;

        if (distance < radius) {
          const influence = 1 - distance / radius;
          const force = 1.1 * influence * influence;
          state.velocityX += (dx / distance) * force * dt;
          state.velocityY += (dy / distance) * force * dt;
        }
      }

      state.velocityX += (-state.offsetX) * 0.05 * dt;
      state.velocityY += (-state.offsetY) * 0.05 * dt;
    });

    for (let i = 0; i < pillMotion.length; i += 1) {
      for (let j = i + 1; j < pillMotion.length; j += 1) {
        const a = pillMotion[i];
        const b = pillMotion[j];
        const ax = a.docX - window.scrollX + a.width / 2 + a.offsetX;
        const ay = a.docY - window.scrollY + a.height / 2 + a.offsetY + a.scrollOffsetY;
        const bx = b.docX - window.scrollX + b.width / 2 + b.offsetX;
        const by = b.docY - window.scrollY + b.height / 2 + b.offsetY + b.scrollOffsetY;
        let dx = bx - ax;
        let dy = by - ay;
        let distance = Math.hypot(dx, dy);

        if (distance === 0) {
          dx = 0.01;
          dy = 0.01;
          distance = 0.014;
        }

        const minDistance = (Math.min(a.width, 120) + Math.min(b.width, 120)) * 0.25;
        if (distance >= minDistance) continue;

        const overlap = minDistance - distance;
        const nx = dx / distance;
        const ny = dy / distance;
        const push = overlap * 0.18;
        const bounce = overlap * 0.035;

        a.offsetX -= nx * push;
        a.offsetY -= ny * push;
        b.offsetX += nx * push;
        b.offsetY += ny * push;

        a.velocityX -= nx * bounce;
        a.velocityY -= ny * bounce;
        b.velocityX += nx * bounce;
        b.velocityY += ny * bounce;
      }
    }

    pillMotion.forEach(state => {
      state.velocityX *= Math.pow(0.9, dt);
      state.velocityY *= Math.pow(0.9, dt);
      state.offsetX += state.velocityX * dt;
      state.offsetY += state.velocityY * dt;

      const maxOffsetX = 22;
      const maxOffsetY = 18;
      state.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, state.offsetX));
      state.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, state.offsetY));

      if (Math.abs(state.offsetX) < 0.01) state.offsetX = 0;
      if (Math.abs(state.offsetY) < 0.01) state.offsetY = 0;
      if (Math.abs(state.velocityX) < 0.01) state.velocityX = 0;
      if (Math.abs(state.velocityY) < 0.01) state.velocityY = 0;

      const deflectionMagnitude = Math.hypot(state.offsetX, state.offsetY);
      const amplitude = Math.min(2.5, 0.6 + deflectionMagnitude * 0.03);
      const idleX = Math.sin(elapsed * state.speed * 0.6 + state.phase) * 0.4;
      const idleY = Math.sin(elapsed * state.speed + state.phase) * amplitude;
      state.pill.style.transform =
        `translate(${(idleX + state.offsetX).toFixed(2)}px, ${(idleY + state.offsetY + state.scrollOffsetY).toFixed(2)}px)`;
    });

    animationFrameId = requestAnimationFrame(animateToolkitPills);
  };

  const startToolkitAnimation = () => {
    if (!animationFrameId && shouldAnimateToolkitPills()) {
      previousScrollY = window.scrollY;
      measureToolkitPills(previousElapsed || performance.now());
      animationFrameId = requestAnimationFrame(animateToolkitPills);
    }
  };

  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
      resetToolkitPills();
      return;
    }

    startToolkitAnimation();
  });
  finePointerQuery.addEventListener('change', () => {
    if (!finePointerQuery.matches) {
      resetToolkitPills();
      return;
    }

    queueToolkitMeasurement();
    startToolkitAnimation();
  });

  window.addEventListener('resize', queueToolkitMeasurement, { passive: true });
  window.addEventListener('orientationchange', queueToolkitMeasurement, { passive: true });
  window.visualViewport?.addEventListener('resize', queueToolkitMeasurement, { passive: true });

  const aboutObserver = new IntersectionObserver(entries => {
    isAboutVisible = entries.some(entry => entry.isIntersecting);
    if (isAboutVisible) {
      queueToolkitMeasurement();
      startToolkitAnimation();
    }
  });

  aboutObserver.observe(aboutSection);
}
