// Sample data for standalone/preview mode (first example from discovery)
const SAMPLE_DATA = {
  name: 'Bigster',
  description: 'SUV hibrid cu GPL, cutie automată și tracțiune 4x4.',
  image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg',
  price: 'de la 22.890 EUR',
  category: 'SUV'
};

// Brand palette from BuildWidgetRequest
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
      item = SAMPLE_DATA;
    } else {
      // Output schema is a single object - structuredContent IS the model object
      const result = await bridge.toolResult;
      const structuredContent = result?.structuredContent || result;
      item = structuredContent || SAMPLE_DATA;
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

  // Left: Image container with CTA
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-wrapper';

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Vehicle';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.cssText = 'width:100%;height:100%;background-color:#646b52;';
    img.onerror = () => {
      if (img.parentNode) img.parentNode.replaceChild(fallbackDiv, img);
    };
    imageWrapper.appendChild(img);
  } else {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.cssText = 'width:100%;height:100%;background-color:#646b52;';
    imageWrapper.appendChild(fallbackDiv);
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn';
  ctaBtn.textContent = 'Configurează';
  ctaBtn.setAttribute('aria-label', `Configurează ${item.name || 'vehicul'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Vreau să configurez ${item.name}`);
    });
  }
  imageWrapper.appendChild(ctaBtn);

  card.appendChild(imageWrapper);

  // Right: Content with darkened palette background
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'model-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  card.appendChild(content);
  block.appendChild(card);
}
