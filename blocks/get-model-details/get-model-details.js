// Sample data for standalone/preview mode
const SAMPLE_DATA = [
  {
    "name": "Bigster",
    "description": "The most equipped and spacious model in the range, available with hybrid GPL powertrain and 4x4.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg",
    "price": "from 22,890 EUR",
    "category": "SUV"
  },
  {
    "name": "Duster",
    "description": "Robust SUV with hybrid powertrain and optional 4x4 capability.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.large.jpg/310f84027e.jpg",
    "price": "from 19,100 EUR",
    "category": "SUV"
  }
];

const PALETTE = ['#646b52','#555555','#6699cc'];

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
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
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
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.models — bare array outputSchema; key derived from actionName "get_model_details"
      const models = structuredContent?.models || [];
      model = models[0] || {};
    }
  } else {
    model = SAMPLE_DATA[0];
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

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'model-image';

  if (model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || 'Model image';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = 'width:100%;height:100%;background-color:#378ef0;';
      img.parentNode.replaceChild(colorDiv, img);
    };
    imageContainer.appendChild(img);

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-button';
    ctaBtn.textContent = 'Configure';
    ctaBtn.style.cssText = 'position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:#646b52;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Configure ${model.name}`);
      });
    }
    imageContainer.style.position = 'relative';
    imageContainer.appendChild(ctaBtn);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = 'width:100%;height:100%;background-color:#378ef0;';
    imageContainer.appendChild(colorDiv);
  }

  card.appendChild(imageContainer);

  // Content container (right side)
  const content = document.createElement('div');
  content.className = 'model-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const name = document.createElement('h3');
  name.textContent = model.name || '';
  content.appendChild(name);

  const description = document.createElement('p');
  description.className = 'description';
  description.textContent = model.description || '';
  content.appendChild(description);

  const priceRow = document.createElement('div');
  priceRow.className = 'price-row';

  const price = document.createElement('span');
  price.className = 'price';
  price.textContent = model.price || '';
  priceRow.appendChild(price);

  if (model.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = model.category;
    priceRow.appendChild(badge);
  }

  content.appendChild(priceRow);
  card.appendChild(content);
  block.appendChild(card);
}