// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Bigster',
  description: 'The largest Dacia SUV with up to 4x4 capability and hybrid powertrain options.',
  image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg',
  price: 'de la 22.900 €',
  category: 'SUV'
};

// Brand palette from BuildWidgetRequest
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
  let model;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      model = SAMPLE_DATA;
    } else {
      const { structuredContent } = await bridge.toolResult;
      model = structuredContent || {};
    }
  } else {
    model = SAMPLE_DATA;
  }

  block.textContent = '';
  renderModelDetail(block, model, bridge);

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
  card.className = 'detail-card';

  // Left side: Image with CTA button
  const imageSection = document.createElement('div');
  imageSection.className = 'image-section';

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
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageSection.appendChild(img);
  } else {
    imageSection.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-button';
  ctaBtn.textContent = 'More Details';
  ctaBtn.setAttribute('aria-label', `View more details about ${model.name || 'this model'}`);

  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about the ${model.name}`);
    });
  }

  imageSection.appendChild(ctaBtn);
  card.appendChild(imageSection);

  // Right side: Content with themed background
  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';
  contentSection.style.cssText = `background: ${theme?.bg ?? '#1a1a1a'}; color: ${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'model-name';
  name.textContent = model.name || 'Model Name';
  contentSection.appendChild(name);

  const description = document.createElement('p');
  description.className = 'model-description';
  description.textContent = model.description || '';
  contentSection.appendChild(description);

  // Price and category in horizontal row at bottom (matches reference)
  const priceCategoryRow = document.createElement('div');
  priceCategoryRow.className = 'price-category-row';

  if (model.price) {
    const price = document.createElement('div');
    price.className = 'model-price';
    price.textContent = model.price;
    priceCategoryRow.appendChild(price);
  }

  if (model.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = model.category;
    priceCategoryRow.appendChild(badge);
  }

  contentSection.appendChild(priceCategoryRow);

  card.appendChild(contentSection);
  block.appendChild(card);
}
