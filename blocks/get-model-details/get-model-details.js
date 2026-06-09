// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Bigster',
  description: 'Dacia\'s flagship SUV combining rugged design with spacious interior.',
  image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/bigster-herozone-desktop.jpg',
  category: 'SUV'
};

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
      modelData = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      modelData = structuredContent;
    }
  } else {
    modelData = SAMPLE_DATA;
  }

  block.textContent = '';
  renderModel(block, modelData, bridge);

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
  if (!model) {
    const empty = document.createElement('p');
    empty.textContent = 'No model data available';
    empty.style.cssText = 'padding:1rem;text-align:center;color:#666;';
    block.appendChild(empty);
    return;
  }

  const card = document.createElement('div');
  card.className = 'model-card';

  // Image container (LEFT side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'model-image';

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
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-overlay';
  ctaBtn.textContent = 'Configurează';
  ctaBtn.style.backgroundColor = PALETTE[0];
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Configurează ${model.name}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  // Content container (RIGHT side)
  const content = document.createElement('div');
  content.className = 'model-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const name = document.createElement('h3');
  name.className = 'model-name';
  name.textContent = model.name || '';
  name.style.color = theme?.fg ?? '#fff';
  content.appendChild(name);

  if (model.description) {
    const desc = document.createElement('p');
    desc.className = 'model-description';
    desc.textContent = model.description;
    desc.style.color = theme?.fg ?? '#fff';
    content.appendChild(desc);
  }

  if (model.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = model.category;
    badge.style.color = theme?.fg ?? '#fff';
    content.appendChild(badge);
  }

  card.appendChild(content);
  block.appendChild(card);
}
