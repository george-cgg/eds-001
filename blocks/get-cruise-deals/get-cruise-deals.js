// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Caribbean', description: 'Turquoise waters, white-sand beaches, and island getaways across the Eastern, Western, and Southern Caribbean.', category: 'Caribbean', image_url: 'https://assets.princess.com/is/image/princesscruises/turtle-in-caribbean-snorkeling?qlt=82&ts=1726517619374' },
  { name: 'Hawaii', description: 'Cruise the Hawaiian Islands with dramatic waterfalls, volcanoes, and lush overlooks.', category: 'Hawaii', image_url: 'https://assets.princess.com/is/image/princesscruises/kauai-hawaii-wailua-twin-waterfalls-overlook?qlt=82&ts=1697265713818' },
  { name: 'Japan', description: 'Explore historic temples, kimono culture, and scenic landscapes across Japan and Asia.', category: 'Asia', image_url: 'https://assets.princess.com/is/image/princesscruises/sensoji-temple-asakusa-city-tokyo-japan-lady-kimono-dress?qlt=82&ts=1698797169578' },
  { name: 'Australia & New Zealand', description: 'Discover wildlife, coastlines, and city life across Australia and New Zealand.', category: 'Australia & New Zealand', image_url: 'https://assets.princess.com/is/image/princesscruises/melbourne-australia-wildlife-koala-healesville-animal-sanctuary?qlt=82&ts=1697265322714' },
  { name: 'Asia', description: 'Sail through Thailand, Japan, and beyond on immersive Asia itineraries.', category: 'Asia', image_url: 'https://assets.princess.com/is/image/princesscruises/japan-terraced-rice-field-landscape-mountains?qlt=82&ts=1697264998421' },
  { name: 'Canada & New England', description: 'Fall foliage, coastal cities, and Vancouver harbor views on Canada and New England voyages.', category: 'Canada & New England', image_url: 'https://assets.princess.com/is/image/princesscruises/vancouver-canada-harbor-city-view-at-night?qlt=82&ts=1697265479496' },
  { name: 'Alaska', description: 'Glacier tours and national parks on award-winning Alaska itineraries.', category: 'Alaska', price: 'From $1,739', is_deal: true, image_url: 'https://assets.princess.com/is/image/princesscruises/whittier-glacier-tour%3A4x5-Portrait?ts=1782936496617' },
  { name: 'Mediterranean', description: 'Limited-time offer on Mediterranean and Greek Isles cruises visiting Santorini and beyond.', category: 'Mediterranean', price: 'From $1,970', is_deal: true, image_url: 'https://assets.princess.com/is/image/princesscruises/santorini-greece-oia-village-blue-roof-buildings%3A1x1-Square?ts=1784050249212' },
  { name: 'California Coast', description: 'Sunny beach towns and coastal scenery on California Coast getaways.', category: 'California Coast', price: 'From $735', is_deal: true, image_url: 'https://assets.princess.com/is/image/princesscruises/santa-barbara-california-beach-group-walking-sand-iceplant-palm-trees%3A1x1-Square?ts=1784050272776' },
  { name: 'Panama Canal', description: 'Transit the iconic locks of the Panama Canal on a memorable voyage.', category: 'Panama Canal', price: 'From $1,648', is_deal: true, image_url: 'https://assets.princess.com/is/image/princesscruises/panama-canal-coral-princess-deck-bow-locks-transit%3A1x1-Square?ts=1784050295973' },
];

// Brand palette from the action payload — used to derive card info-strip background.
const PALETTE = ['#003595', '#e60060', '#ea0063', '#cce7eb'];
const CONCEPT = 'deals-list';

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

function partitionDeals(list) {
  return (list || []).filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));
}

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
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_cruise_deals"
      items = structuredContent?.deals || [];
    }
    items = partitionDeals(items);
    block.textContent = '';
    renderDeals(block, items, bridge);
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  } else {
    items = partitionDeals(SAMPLE_DATA);
    block.textContent = '';
    renderDeals(block, items, bridge);
  }
}

function renderDeals(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'get-cruise-deals-wrapper';

  const track = document.createElement('div');
  track.className = 'get-cruise-deals-track';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'get-cruise-deals-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'get-cruise-deals-image';

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
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'get-cruise-deals-badge';
      badge.textContent = item.category;
      imageBox.appendChild(badge);
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'get-cruise-deals-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'get-cruise-deals-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'get-cruise-deals-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    if (item.price) {
      const price = document.createElement('span');
      price.className = 'get-cruise-deals-price';
      price.textContent = item.price;
      info.appendChild(price);
    }

    const btn = document.createElement('button');
    btn.className = 'get-cruise-deals-cta';
    btn.type = 'button';
    btn.textContent = 'View Deal';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name} cruise deals`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'get-cruise-deals-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `get-cruise-deals-arrow get-cruise-deals-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.addEventListener('click', () => {
      const card = track.querySelector('.get-cruise-deals-card');
      const step = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
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
    fade.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
