// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', description: 'The largest Dacia SUV, offering C-segment space with rugged styling and hybrid powertrains.', price: 'de la 21.400 EUR', category: 'SUV' },
  { name: 'Dacia Duster', description: 'Iconic compact SUV built for adventure, available with 4x4 and hybrid options.', price: 'de la 18.900 EUR', category: 'SUV' },
  { name: 'Dacia Spring', description: 'Fully electric city car with an accessible price and compact urban footprint.', price: 'de la 16.700 EUR', category: 'City car (electric)' },
  { name: 'Dacia Jogger', description: 'Versatile family vehicle with up to 7 seats and a hybrid powertrain option.', price: 'de la 16.500 EUR', category: 'Family / 7-seater' },
  { name: 'Dacia Sandero Stepway', description: 'Compact crossover-styled hatchback with raised ride height and rugged trim.', price: 'de la 14.200 EUR', category: 'Crossover' },
  { name: 'Dacia Logan', description: 'Affordable and spacious sedan combining comfort with a low cost of ownership.', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg', price: 'de la 13.100 EUR', category: 'Sedan' },
];

// Brand palette from the action payload.
const PALETTE = ['#646b52', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
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
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.models — bare array outputSchema; key derived from actionName "list_models"
      items = structuredContent?.models || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-models-wrapper';

  const track = document.createElement('div');
  track.className = 'list-models-track';

  items.slice(0, 10).forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'list-models-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'list-models-image';
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
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageWrap.appendChild(img);
    } else {
      imageWrap.appendChild(colorDiv());
    }
    card.appendChild(imageWrap);

    const info = document.createElement('div');
    info.className = 'list-models-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'list-models-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'list-models-desc';
      const text = item.description;
      desc.textContent = text.length > 50 ? `${text.slice(0, 48).trimEnd()}…` : text;
      info.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'list-models-meta';
    const price = document.createElement('span');
    price.className = 'list-models-price';
    price.textContent = item.price || '';
    meta.appendChild(price);
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-models-badge';
      badge.textContent = item.category;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'list-models-cta';
    cta.textContent = 'View Details';
    if (bridge) {
      cta.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'list-models-fade';
  fade.style.cssText = `background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `list-models-arrow list-models-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    const scrollBy = () => {
      const card = track.querySelector('.list-models-card');
      const amount = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    b.addEventListener('click', scrollBy);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
