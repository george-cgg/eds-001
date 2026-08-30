// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Bigster",
    "description": "Dacia's flagship SUV combining rugged design with spacious interior.",
    "image_url": "https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/bigster-herozone-desktop.jpg",
    "category": "SUV"
  },
  {
    "name": "Duster",
    "description": "Versatile compact SUV built for both city driving and off-road adventures.",
    "image_url": "https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/duster-herozone-desktop.jpg",
    "category": "SUV"
  },
  {
    "name": "Noul Logan",
    "description": "Modern sedan offering comfort and efficiency for everyday commuting.",
    "image_url": "https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/logan-herozone-desktop.jpg",
    "category": "Sedan"
  },
  {
    "name": "Noul Sandero Stepway",
    "description": "Crossover-styled hatchback with elevated ride height and robust styling.",
    "image_url": "https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/sandero-stepway-herozone-desktop.jpg",
    "category": "Hatchback"
  },
  {
    "name": "Spring",
    "description": "Affordable fully electric city car with zero emissions.",
    "image_url": "https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/spring-herozone-desktop.jpg",
    "category": "Electric"
  },
  {
    "name": "Noul Jogger",
    "description": "Spacious 7-seat family vehicle blending MPV practicality with SUV style.",
    "image_url": "https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/jogger-herozone-desktop.jpg",
    "category": "MPV"
  }
];

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#646b52', '#555555', '#6699cc'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m;
    else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return {
    bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

// Fallback colors for missing images
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.models — bare array outputSchema; key derived from actionName "list_models"
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderCarousel(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderCarousel(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-models-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'list-models-carousel';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'list-models-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'list-models-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };

    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'list-models-cta';
    ctaBtn.textContent = 'Detalii';
    ctaBtn.setAttribute('aria-label', `Vezi detalii despre ${item.name || 'modelul selectat'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Arată-mi mai multe detalii despre ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'list-models-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('h3');
    name.className = 'list-models-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'list-models-description';
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-models-badge';
      badge.textContent = item.category;
      content.appendChild(badge);
    }

    card.appendChild(content);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'list-models-nav list-models-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.innerHTML = '&#9664;';
  leftBtn.style.display = 'none';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'list-models-nav list-models-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.innerHTML = '&#9654;';

  const updateNavButtons = () => {
    const atStart = carousel.scrollLeft <= 0;
    const atEnd = carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 1;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
  };

  const scrollByCard = (direction) => {
    const cardWidth = 220 + 16;
    carousel.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  leftBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollByCard(-1);
    }
  });
  rightBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollByCard(1);
    }
  });

  carousel.addEventListener('scroll', updateNavButtons);
  updateNavButtons();

  const fade = document.createElement('div');
  fade.className = 'list-models-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  wrapper.appendChild(fade);

  block.appendChild(wrapper);
}
