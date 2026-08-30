// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Bigster',
    description: 'The most equipped and spacious Dacia SUV with hybrid GPL 150 HP, 4x4 and automatic transmission.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg',
    price: 'From 22,890 EUR',
    category: 'SUV'
  },
  {
    name: 'Duster',
    description: 'Proven SUV with hybrid GPL 150 HP, available with 4x4, trusted by over 2 million owners worldwide.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.large.jpg/310f84027e.jpg',
    price: 'From 19,100 EUR',
    category: 'SUV'
  },
  {
    name: 'Logan',
    description: 'Spacious sedan with 120 HP GPL engine from factory and available automatic transmission.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg',
    price: 'From 14,650 EUR',
    category: 'Sedan'
  },
  {
    name: 'Jogger',
    description: 'Versatile family vehicle with 5 or 7 seats, available in hybrid 155 HP version.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/5224fc9270.jpg',
    price: 'From 18,650 EUR',
    category: 'Family MPV'
  },
  {
    name: 'Spring',
    description: '100% electric city car with 225 km WLTP range, 100 HP motor, and compact urban design.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-s2e-ph2-my26/overview/editorial/dacia-spring-s2e-ph2-hero-zone-background-desktop-001.jpg.ximg.large.jpg/1f111e4936.jpg',
    price: 'From 18,600 EUR',
    category: 'Electric City Car'
  },
  {
    name: 'Sandero Stepway',
    description: 'Versatile crossover with 120 HP GPL engine, automatic transmission, and up to 1500 km range.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-background-desktop-001.jpg.ximg.large.jpg/48eb89e802.jpg',
    price: 'From 15,650 EUR',
    category: 'Crossover'
  }
];

// Brand palette from BuildWidgetRequest.
// getThemedCardBg() darkens palette[0] to luminance ≤ 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#646b52', '#555555', '#6699cc', '#0000ee'];

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
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return {
    bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);
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

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'list-models-scroll';

  items.slice(0, 6).forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'list-models-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'list-models-image';

    const fallbackColor = CARD_COLORS[index % CARD_COLORS.length];
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
      img.onerror = () => {
        if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img);
      };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'list-models-cta';
    ctaBtn.textContent = 'View Details';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'list-models-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'list-models-name';
    name.textContent = item.name;
    content.appendChild(name);

    const description = document.createElement('div');
    description.className = 'list-models-description';
    description.textContent = item.description;
    content.appendChild(description);

    const footer = document.createElement('div');
    footer.className = 'list-models-footer';

    const price = document.createElement('span');
    price.className = 'list-models-price';
    price.textContent = item.price;
    footer.appendChild(price);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-models-badge';
      badge.textContent = item.category;
      footer.appendChild(badge);
    }

    content.appendChild(footer);
    card.appendChild(content);
    scrollContainer.appendChild(card);
  });

  wrapper.appendChild(scrollContainer);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'list-models-arrow list-models-arrow-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';
  leftBtn.style.display = 'none';
  wrapper.appendChild(leftBtn);

  const rightBtn = document.createElement('button');
  rightBtn.className = 'list-models-arrow list-models-arrow-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';
  wrapper.appendChild(rightBtn);

  const fade = document.createElement('div');
  fade.className = 'list-models-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const updateArrows = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    leftBtn.style.display = scrollLeft > 10 ? 'flex' : 'none';
    rightBtn.style.display = scrollLeft < scrollWidth - clientWidth - 10 ? 'flex' : 'none';
  };

  const scrollByCard = (direction) => {
    const cardWidth = 220 + 16;
    scrollContainer.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
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

  scrollContainer.addEventListener('scroll', updateArrows);
  updateArrows();

  block.appendChild(wrapper);
}