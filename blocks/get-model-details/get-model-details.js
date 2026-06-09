const SAMPLE_DATA = {
  name: 'Bigster',
  description: "Dacia's largest SUV with spacious interior and rugged outdoor-ready design.",
  image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-mobile-001.jpg.ximg.small.jpg/73360fd5b0.jpg',
  price: 'from €22,890',
  category: 'SUV'
};

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
      model = structuredContent;
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
  if (!model) return;

  const card = document.createElement('div');
  card.className = 'model-card';

  const imageSection = document.createElement('div');
  imageSection.className = 'model-image';

  if (model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || 'Vehicle';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = 'width:100%;height:100%;background-color:#646b52;';
      img.parentNode.replaceChild(colorDiv, img);
    };
    imageSection.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = 'width:100%;height:100%;background-color:#646b52;';
    imageSection.appendChild(colorDiv);
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'image-cta';
  ctaBtn.textContent = 'More Details';
  ctaBtn.style.cssText = 'position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:#6699cc;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about the ${model.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  const contentSection = document.createElement('div');
  contentSection.className = 'model-content';
  contentSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'model-name';
  name.textContent = model.name || '';
  contentSection.appendChild(name);

  const description = document.createElement('p');
  description.className = 'model-description';
  description.textContent = model.description || '';
  contentSection.appendChild(description);

  const priceRow = document.createElement('div');
  priceRow.className = 'model-meta';

  const price = document.createElement('span');
  price.className = 'model-price';
  price.textContent = model.price || '';
  priceRow.appendChild(price);

  if (model.category) {
    const badge = document.createElement('span');
    badge.className = 'model-badge';
    badge.textContent = model.category;
    priceRow.appendChild(badge);
  }

  contentSection.appendChild(priceRow);
  card.appendChild(contentSection);
  block.appendChild(card);
}