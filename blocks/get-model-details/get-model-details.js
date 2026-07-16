// Sample data for standalone/preview mode.
// In production, data comes dynamically from the bridge tool result promise, resolving to a single flat item.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', description: 'The largest Dacia SUV, offering C-segment space with rugged styling and hybrid powertrains.', price: 'de la 21.400 EUR', category: 'SUV' },
  { name: 'Dacia Duster', description: 'Iconic compact SUV built for adventure, available with 4x4 and hybrid options.', price: 'de la 18.900 EUR', category: 'SUV' },
  { name: 'Dacia Spring', description: 'Fully electric city car with an accessible price and compact urban footprint.', price: 'de la 16.700 EUR', category: 'City car (electric)' },
  { name: 'Dacia Jogger', description: 'Versatile family vehicle with up to 7 seats and a hybrid powertrain option.', price: 'de la 16.500 EUR', category: 'Family / 7-seater' },
  { name: 'Dacia Sandero Stepway', description: 'Compact crossover-styled hatchback with raised ride height and rugged trim.', price: 'de la 14.200 EUR', category: 'Crossover' },
  { name: 'Dacia Logan', description: 'Affordable and spacious sedan combining comfort with a low cost of ownership.', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg', price: 'de la 13.100 EUR', category: 'Sedan' },
];

// Brand palette from the action payload — used to derive the content-panel background.
const PALETTE = ['#646b52', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
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
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA[0];
  }

  block.textContent = '';
  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'gmd-empty';
    empty.textContent = 'No matching model was found.';
    block.appendChild(empty);
  } else {
    renderDetail(block, item, bridge);
  }

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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'gmd-card';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'gmd-image';
  const fallbackColor = CARD_COLORS[0];
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
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  const content = document.createElement('div');
  content.className = 'gmd-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const title = document.createElement('h3');
  title.className = 'gmd-title';
  title.textContent = item.name;
  content.appendChild(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'gmd-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'gmd-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'gmd-chip';
    chip.textContent = item.category;
    content.appendChild(chip);
  }

  const btn = document.createElement('button');
  btn.className = 'gmd-cta';
  btn.type = 'button';
  btn.textContent = 'Configure';
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name}`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
