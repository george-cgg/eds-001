// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult (a single flat item).
const SAMPLE_DATA = {
  name: 'Caribbean',
  description: 'Turquoise waters, white-sand beaches, and island getaways across the Eastern, Western, and Southern Caribbean.',
  category: 'Caribbean',
  image_url: 'https://assets.princess.com/is/image/princesscruises/turtle-in-caribbean-snorkeling?qlt=82&ts=1726517619374',
};

// Brand palette from the action payload — used to derive the content-panel background.
const PALETTE = ['#003595', '#e60060', '#ea0063', '#cce7eb'];
const SECONDARY = '#e60060';

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
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'get-cruise-details-card';

  const media = document.createElement('div');
  media.className = 'get-cruise-details-media';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    media.appendChild(img);
  } else {
    media.appendChild(colorDiv());
  }
  card.appendChild(media);

  const content = document.createElement('div');
  content.className = 'get-cruise-details-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const title = document.createElement('h2');
  title.className = 'get-cruise-details-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'get-cruise-details-chip';
    chip.textContent = item.category;
    content.appendChild(chip);
  }

  const desc = document.createElement('p');
  desc.className = 'get-cruise-details-desc';
  desc.textContent = item.description || '';
  content.appendChild(desc);

  if (item.price) {
    const price = document.createElement('span');
    price.className = 'get-cruise-details-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  const btn = document.createElement('button');
  btn.className = 'get-cruise-details-cta';
  btn.type = 'button';
  btn.textContent = 'View Itineraries';
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name} cruises`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'get-cruise-details-empty';
    empty.textContent = 'No matching cruise destination was found.';
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
