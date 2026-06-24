// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  "name": "Bank of America Customized Cash Rewards Credit Card",
  "description": "Earn 3% cash back in the category of your choice plus 2% at grocery stores and wholesale clubs, with a 6% first-year offer in your choice category.",
  "price": "$0 annual fee",
  "category": "Credit Card",
  "image_url": "https://www.bankofamerica.com/content/images/ContextualSiteGraphics/CreditCardArt/en_US/Approved_PCM/8ckn_cshsigcm_v_300x188.png"
};

// Brand palette from BuildWidgetRequest — getThemedCardBg() darkens palette[0] to lum ≤ 0.12.
const PALETTE = ['#012169', '#e31837', '#a50e28'];

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
  return {
    bg: `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

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
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

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
  card.className = 'detail-card';

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'detail-image';

  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};display:flex;align-items:center;justify-content:center;`;
    return d;
  };

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'image-cta';
    ctaBtn.textContent = 'Learn More';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  card.appendChild(imageContainer);

  // Content container (right side)
  const contentContainer = document.createElement('div');
  contentContainer.className = 'detail-content';
  contentContainer.style.cssText = `background:${theme?.bg ?? '#001449'};color:${theme?.fg ?? '#fff'}`;

  // Name
  const name = document.createElement('h2');
  name.className = 'detail-name';
  name.textContent = item.name || '';
  contentContainer.appendChild(name);

  // Category badge
  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = item.category;
    contentContainer.appendChild(badge);
  }

  // Description
  const description = document.createElement('p');
  description.className = 'detail-description';
  description.textContent = item.description || '';
  contentContainer.appendChild(description);

  // Price
  if (item.price) {
    const price = document.createElement('div');
    price.className = 'detail-price';
    price.textContent = item.price;
    contentContainer.appendChild(price);
  }

  card.appendChild(contentContainer);
  block.appendChild(card);
}
