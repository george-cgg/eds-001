// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Dacia Bigster",
    "description": "Large SUV with hybrid-G 150 4x4 and 702L trunk capacity.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.largex2.webp/7caee35b86.webp",
    "price": "from 23,350 EUR",
    "category": "SUV"
  },
  {
    "name": "Dacia Duster",
    "description": "Compact SUV with hybrid-G 150 4x4 and 217mm ground clearance.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.largex2.webp/310f84027e.webp",
    "price": "from 19,500 EUR",
    "category": "SUV"
  },
  {
    "name": "Dacia Logan",
    "description": "Sedan with Eco-G 120 GPL engine and up to 1500km range.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.largex2.webp/f7b183dd4d.webp",
    "price": "from 14,950 EUR",
    "category": "Sedan"
  }
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#646b52', '#555555', '#6699cc'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (r,g,b) => 0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) {
    const m=(lo+hi)/2;
    if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let modelData;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      modelData = SAMPLE_DATA[0];
    } else {
      const { structuredContent } = await bridge.toolResult;
      // structuredContent.models — derived from actionName "get_model_details"
      const models = structuredContent?.models || [];
      modelData = Array.isArray(models) ? models[0] : models;
    }
  } else {
    modelData = SAMPLE_DATA[0];
  }

  block.textContent = '';

  if (!modelData) {
    block.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">No model details available</p>';
    return;
  }

  renderModelDetail(block, modelData, bridge);

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

function renderModelDetail(block, model, bridge) {
  const card = document.createElement('div');
  card.className = 'model-detail-card';

  // Left side: Image with CTA button
  const imageSection = document.createElement('div');
  imageSection.className = 'model-image-section';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'model-image-container';

  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || 'Vehicle';
    img.className = 'model-image';
    img.onerror = () => {
      if (img.parentNode) {
        img.parentNode.replaceChild(colorDiv(), img);
      }
    };
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  imageSection.appendChild(imageContainer);

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'model-cta-btn';
  ctaBtn.textContent = 'Book Test Drive';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to book a test drive for the ${model.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  // Right side: Content with darkened palette background
  const contentSection = document.createElement('div');
  contentSection.className = 'model-content-section';
  contentSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  // Name
  const nameEl = document.createElement('h2');
  nameEl.className = 'model-name';
  nameEl.textContent = model.name || '';
  nameEl.style.color = theme?.fg ?? '#fff';
  contentSection.appendChild(nameEl);

  // Description
  const descEl = document.createElement('p');
  descEl.className = 'model-description';
  descEl.textContent = model.description || '';
  descEl.style.color = theme?.fg ?? '#fff';
  contentSection.appendChild(descEl);

  // Price
  if (model.price) {
    const priceEl = document.createElement('div');
    priceEl.className = 'model-price';
    priceEl.textContent = model.price;
    priceEl.style.color = theme?.fg ?? '#fff';
    contentSection.appendChild(priceEl);
  }

  // Category badge
  if (model.category) {
    const badgeEl = document.createElement('span');
    badgeEl.className = 'model-category-badge';
    badgeEl.textContent = model.category;
    contentSection.appendChild(badgeEl);
  }

  card.appendChild(contentSection);
  block.appendChild(card);
}
