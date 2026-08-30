// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Alaska Cruises',
    description: 'Explore glaciers, national parks and wildlife with the #1-rated Alaska cruise line on 2026-2028 itineraries.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/aurora-alaska%3A4x5-Portrait?ts=1756238551509',
    category: 'Alaska',
  },
  {
    name: 'Hawaii Cruises',
    description: 'Sail to the Hawaiian Islands and experience tropical beaches, volcanoes and island culture.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/honolulu-hawaii-2%3A4x5-Portrait?ts=1756238510701',
    category: 'Hawaii',
  },
  {
    name: 'California & Pacific Coast Cruises',
    description: 'Cruise the scenic California coastline with stops along the Pacific shoreline.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/santa-monica-california%3A4x5-Portrait?ts=1756238489918',
    category: 'California Pacific Coast',
  },
  {
    name: 'Mediterranean & Greek Isles Cruises',
    description: 'Discover Santorini, the Greek Isles and iconic Mediterranean ports.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/plc-santorini-greece-sp-sun-fira-sunset-location-drone:16x9',
    category: 'Mediterranean',
  },
  {
    name: 'Free 3rd & 4th Guests on Alaska Cruises',
    description: 'Limited-time Alaska offer with free 3rd and 4th guests.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/whittier-glacier-tour%3A4x5-Portrait?ts=1782936496617',
    category: 'Alaska',
    price: '$599 per person',
    original_price: '$1,509',
    is_deal: true,
  },
  {
    name: 'Last Minute Cruise Deals',
    description: 'Book a last-minute getaway at a deeply discounted per-person fare.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/tres-trap-aruba-princess-cruises%3A1x1-Square?ts=1782836003847',
    category: 'Caribbean',
    price: '$175 per person',
    original_price: '$325',
    is_deal: true,
  },
  {
    name: 'Up to 40% Off & $300 Instant Savings',
    description: 'Caribbean limited-time offer with up to 40% off and instant savings.',
    category: 'Caribbean',
    price: '$475 per person',
    original_price: '$984',
    discount_percentage: '40% OFF',
    is_deal: true,
    image_url: 'https://www.princess.com/content/dam/princess/promos-deals/denali-national-park-1220x686.jpg',
  },
];

const CONCEPT = 'deals-list';

// Brand palette from the action payload — used to derive card info-strip background.
const PALETTE = ['#003595', '#e60060', '#ea0063', '#b6254f', '#efefef'];

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
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_cruise_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  // deals-list widget shows ONLY deal items.
  items = (items || []).filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));

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
  wrapper.className = 'get-cruise-deals-wrapper';

  const row = document.createElement('div');
  row.className = 'get-cruise-deals-row';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'get-cruise-deals-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'get-cruise-deals-image';

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

    if (item.discount_percentage) {
      const badge = document.createElement('span');
      badge.className = 'get-cruise-deals-badge';
      badge.textContent = item.discount_percentage;
      imageContainer.appendChild(badge);
    }

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'get-cruise-deals-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'get-cruise-deals-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    const priceRow = document.createElement('div');
    priceRow.className = 'get-cruise-deals-price-row';
    if (item.price) {
      const price = document.createElement('span');
      price.className = 'get-cruise-deals-price';
      price.textContent = item.price;
      priceRow.appendChild(price);
    }
    if (item.original_price) {
      const orig = document.createElement('span');
      orig.className = 'get-cruise-deals-original';
      orig.textContent = item.original_price;
      priceRow.appendChild(orig);
    }
    if (priceRow.childNodes.length) info.appendChild(priceRow);

    const cta = document.createElement('button');
    cta.className = 'get-cruise-deals-cta';
    cta.textContent = 'View Deal';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${item.name} cruise deal`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    row.appendChild(card);
  });

  wrapper.appendChild(row);

  const fade = document.createElement('div');
  fade.className = 'get-cruise-deals-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;
  wrapper.appendChild(fade);

  block.appendChild(wrapper);
}
