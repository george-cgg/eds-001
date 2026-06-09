// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  "name": "Bigster",
  "description": "The largest Dacia SUV with hybrid and LPG options for families and adventurers.",
  "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg",
  "price": "de la 22.890 EUR",
  "category": "SUV"
};

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#646b52','#555555','#6699cc','#0000ee'];

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
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // outputSchema is a single object - use directly
      model = structuredContent || SAMPLE_DATA;
    }
  } else {
    model = SAMPLE_DATA;
  }

  block.textContent = '';
  renderModel(block, model, bridge);

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

function renderModel(block, model, bridge) {
  const card = document.createElement('div');
  card.className = 'model-card';

  // Left side: image with CTA overlay
  const imageContainer = document.createElement('div');
  imageContainer.className = 'model-image';

  if (model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || 'Model image';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

    const fallbackColor = '#646b52';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      img.parentNode.replaceChild(colorDiv, img);
    };

    imageContainer.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = 'width:100%;height:100%;background-color:#646b52;';
    imageContainer.appendChild(colorDiv);
  }

  // CTA button overlaid on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn';
  ctaBtn.textContent = 'More Details';
  ctaBtn.setAttribute('aria-label', `View details for ${model.name || 'this model'}`);

  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about the ${model.name}`);
    });
  }

  imageContainer.appendChild(ctaBtn);
  card.appendChild(imageContainer);

  // Right side: content with themed background
  const content = document.createElement('div');
  content.className = 'model-content';
  content.style.cssText = `background:${theme?.bg ?? '#3a4a3a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'model-name';
  name.textContent = model.name || '';
  content.appendChild(name);

  const description = document.createElement('p');
  description.className = 'model-description';
  description.textContent = model.description || '';
  content.appendChild(description);

  const priceRow = document.createElement('div');
  priceRow.className = 'model-price-row';

  const price = document.createElement('span');
  price.className = 'model-price';
  price.textContent = model.price || '';
  priceRow.appendChild(price);

  if (model.category) {
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'model-category';
    categoryBadge.textContent = model.category;
    priceRow.appendChild(categoryBadge);
  }

  content.appendChild(priceRow);
  card.appendChild(content);

  block.appendChild(card);
}
