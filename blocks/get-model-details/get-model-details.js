// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Dacia Bigster',
    description: 'Large SUV with hybrid-G 150 4x4 and 702L trunk capacity.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.largex2.webp/7caee35b86.webp',
    price: 'from 23,350 EUR',
    category: 'SUV'
  },
  {
    name: 'Dacia Duster',
    description: 'Compact SUV with hybrid-G 150 4x4 and 217mm ground clearance.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.largex2.webp/310f84027e.webp',
    price: 'from 19,500 EUR',
    category: 'SUV'
  },
  {
    name: 'Dacia Logan',
    description: 'Sedan with Eco-G 120 GPL engine and up to 1500km range.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.largex2.webp/f7b183dd4d.webp',
    price: 'from 14,950 EUR',
    category: 'Sedan'
  },
  {
    name: 'Dacia Jogger',
    description: 'Versatile family vehicle with 5 or 7 seats and hybrid 155 engine.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/homepage-banner/order-opening/dacia-bigster-homepage-001-desktop.jpg.ximg.largex2.webp/af86c2985c.webp',
    price: 'from 19,000 EUR',
    category: 'MPV'
  },
  {
    name: 'Dacia Spring',
    description: '100% electric city car with 225km WLTP range and 315km urban range.',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/editorial/new-homepage/Dacia_new_range_4_cars_2560x1440_V2.jpg.ximg.large.webp/9ea2771775.webp',
    price: 'from 18,900 EUR',
    category: 'Electric'
  }
];

// Brand palette from BuildWidgetRequest.
// getThemedCardBg() darkens palette[0] to luminance ≤ 0.12 so white text has WCAG AA contrast.
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
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return {
    bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let model;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      model = SAMPLE_DATA[0];
    } else {
      const { structuredContent } = await bridge.toolResult;
      // structuredContent.models — bare array outputSchema; key derived from actionName "get_model_details"
      const models = structuredContent?.models;
      model = Array.isArray(models) ? models[0] : models;
    }
  } else {
    model = SAMPLE_DATA[0];
  }

  block.textContent = '';

  if (model) {
    renderDetailCard(block, model, bridge);
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

function renderDetailCard(block, model, bridge) {
  const card = document.createElement('div');
  card.className = 'detail-card';

  // Left side: Image with CTA button overlay
  const imageSection = document.createElement('div');
  imageSection.className = 'image-section';

  const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || '';
    img.className = 'model-image';
    img.onerror = () => {
      const fallback = colorDiv();
      fallback.className = 'model-image';
      img.parentNode.replaceChild(fallback, img);
    };
    imageSection.appendChild(img);
  } else {
    const fallback = colorDiv();
    fallback.className = 'model-image';
    imageSection.appendChild(fallback);
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-overlay';
  ctaBtn.textContent = 'Book Test Drive';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to book a test drive for the ${model.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  // Right side: Content with themed background
  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';
  contentSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const heading = document.createElement('h2');
  heading.textContent = model.name || '';
  heading.className = 'model-name';
  contentSection.appendChild(heading);

  if (model.description) {
    const desc = document.createElement('p');
    desc.textContent = model.description;
    desc.className = 'model-description';
    contentSection.appendChild(desc);
  }

  if (model.price) {
    const price = document.createElement('div');
    price.textContent = model.price;
    price.className = 'model-price';
    contentSection.appendChild(price);
  }

  if (model.category) {
    const badge = document.createElement('span');
    badge.textContent = model.category;
    badge.className = 'category-badge';
    contentSection.appendChild(badge);
  }

  card.appendChild(contentSection);
  block.appendChild(card);
}
