// Sample data for standalone EDS preview (no bridge).
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
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
}

const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      // bridge.toolResult may resolve to the full MCP result or to structuredContent directly
      const result = await bridge.toolResult;
      const sc = result?.structuredContent || result;
      item = sc?.models || {};
    }
  } else {
    item = SAMPLE_DATA[0];
  }

  block.textContent = '';
  renderDetailCard(block, item, bridge);

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

function renderDetailCard(block, item, bridge) {
  const theme = getThemedCardBg(PALETTE);
  const fallbackColor = CARD_COLORS[0];

  const card = document.createElement('div');
  card.className = 'model-detail-card';

  // Left: Image container with CTA
  const imageContainer = document.createElement('div');
  imageContainer.className = 'model-image-container';

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || 'Vehicle';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      img.parentNode.replaceChild(colorDiv, img);
    };
    imageContainer.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    imageContainer.appendChild(colorDiv);
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-on-image';
  ctaBtn.textContent = 'More Details';
  ctaBtn.style.background = PALETTE[0] || '#646b52';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about the ${item.name || 'vehicle'}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  // Right: Content section with darkened palette background
  const content = document.createElement('div');
  content.className = 'model-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'model-name';
  name.textContent = item.name || 'Model Name';
  content.appendChild(name);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'model-description';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'model-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  // Book Test Drive button
  const bookBtn = document.createElement('button');
  bookBtn.className = 'book-test-drive-btn';
  bookBtn.textContent = 'Book Test Drive';
  bookBtn.style.background = PALETTE[0] || '#646b52';
  if (bridge) {
    bookBtn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to book a test drive for the ${item.name || 'vehicle'}`);
    });
  }
  content.appendChild(bookBtn);

  card.appendChild(content);
  block.appendChild(card);
}
