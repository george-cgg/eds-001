// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Bigster",
    "description": "SUV de familie cu design robust și spațiu generos.",
    "image_url": "https://www.dacia.ro/aMedias/Dacia_Bigster_34_AV_Journey_V2_1-1f29cc8c.png",
    "price": "de la 24.250 €",
    "category": "SUV"
  },
  {
    "name": "Duster",
    "description": "SUV compact versatil pentru aventuri off-road și urbane.",
    "image_url": "https://www.dacia.ro/aMedias/Dacia_Duster_34_AV_Journey_V3-bb5e63c1.png",
    "price": "de la 19.650 €",
    "category": "SUV"
  },
  {
    "name": "Noul Logan",
    "description": "Berlină accesibilă cu design modern și confort.",
    "image_url": "https://www.dacia.ro/aMedias/Dacia_Logan_34_AV_Expression-0dfbc15e.png",
    "price": "de la 12.150 €",
    "category": "Sedan"
  },
  {
    "name": "Noul Jogger",
    "description": "Vehicul familial cu 7 locuri și versatilitate maximă.",
    "image_url": "https://www.dacia.ro/aMedias/Dacia_Jogger_34_AV_Extreme-4db1f6ed.png",
    "price": "de la 17.800 €",
    "category": "Family"
  },
  {
    "name": "Spring",
    "description": "Vehicul 100% electric accesibil pentru mobilitate urbană.",
    "image_url": "https://www.dacia.ro/aMedias/Dacia_Spring_34AV_Expression-12b01760.png",
    "price": "de la 17.900 €",
    "category": "Electric"
  }
];

// Brand palette from BuildWidgetRequest — used to derive card background.
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
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      item = structuredContent || SAMPLE_DATA[0];
    }
  } else {
    item = SAMPLE_DATA[0];
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

  // Left: Image wrapper
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'detail-image';
  imageWrapper.style.cssText = 'position:relative;width:260px;height:100%;flex-shrink:0;';

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Vehicle';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

    const CARD_COLORS = ['#646b52','#555555','#6699cc','#378ef0','#9256d9'];
    const fallbackColor = CARD_COLORS[0];
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      img.parentNode.replaceChild(colorDiv, img);
    };

    imageWrapper.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = `width:100%;height:100%;background-color:#646b52;`;
    imageWrapper.appendChild(colorDiv);
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'image-cta';
  ctaBtn.textContent = 'Configure';
  ctaBtn.style.cssText = `position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:#646b52;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;z-index:1;`;

  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I want to configure the ${item.name}`);
    });
  }

  imageWrapper.appendChild(ctaBtn);
  card.appendChild(imageWrapper);

  // Right: Content
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};padding:16px;display:flex;flex-direction:column;gap:8px;flex:1;`;

  const name = document.createElement('h2');
  name.textContent = item.name || '';
  name.style.cssText = `margin:0;font-size:18px;font-weight:700;color:${theme?.fg ?? '#fff'};`;
  content.appendChild(name);

  const description = document.createElement('p');
  description.textContent = item.description || '';
  description.className = 'detail-description';
  description.style.cssText = `margin:0;font-size:13px;opacity:0.78;line-height:1.4;color:${theme?.fg ?? '#fff'};`;
  content.appendChild(description);

  const priceLabel = document.createElement('div');
  priceLabel.textContent = item.price || '';
  priceLabel.style.cssText = `font-size:15px;font-weight:700;color:${theme?.fg ?? '#fff'};margin-top:4px;`;
  content.appendChild(priceLabel);

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = item.category;
    badge.style.cssText = `display:inline-block;padding:4px 10px;border-radius:12px;background:rgba(255,255,255,0.15);font-size:11px;font-weight:600;color:${theme?.fg ?? '#fff'};margin-top:4px;`;
    content.appendChild(badge);
  }

  card.appendChild(content);
  block.appendChild(card);
}
