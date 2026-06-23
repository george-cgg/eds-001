// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Lloyds Classic",
    "description": "Free everyday banking with no monthly fee when you stay in credit, plus cashback, payment insights and card control in the app.",
    "price": "No monthly fee",
    "category": "Checking"
  },
  {
    "name": "Club Lloyds",
    "description": "All the benefits of Classic plus no debit card fees abroad, a choice of lifestyle benefits like Disney+, and monthly credit interest.",
    "price": "£5/month (refunded if you pay in £2,000+)",
    "category": "Checking"
  },
  {
    "name": "Lloyds Premier",
    "description": "All the benefits of Club Lloyds plus Bupa digital GP appointments, up to £120 a year cashback on debit card spend, and a dedicated support team.",
    "price": "£15/month (refunded if you pay in £5,000+)",
    "category": "Checking"
  },
  {
    "name": "Club Lloyds Silver",
    "description": "All the benefits of Club Lloyds plus European and UK family travel insurance, AA breakdown family cover and mobile phone insurance.",
    "price": "£11.50/month",
    "category": "Packaged",
    "image_url": "https://www.lloydsbank.com/assets/current_accounts/lloyds-card-club-lloyds-silver.png"
  },
  {
    "name": "Club Lloyds Platinum",
    "description": "All the benefits of Club Lloyds plus worldwide family travel insurance up to age 80, AA breakdown family cover with national recovery and mobile phone insurance.",
    "price": "£22.50/month",
    "category": "Packaged",
    "image_url": "https://www.lloydsbank.com/assets/current_accounts/lloyds-card-club-lloyds-platinum.png"
  },
  {
    "name": "Silver",
    "description": "All the benefits of Classic plus European and UK family travel insurance, AA breakdown family cover and mobile phone insurance.",
    "price": "£11.50/month",
    "category": "Packaged",
    "image_url": "https://www.lloydsbank.com/assets/current_accounts/lloyds-card-silver.png"
  },
  {
    "name": "Platinum",
    "description": "All the benefits of Classic plus worldwide family travel insurance up to age 80, AA breakdown family cover with national recovery and mobile phone insurance.",
    "price": "£22.50/month",
    "category": "Packaged",
    "image_url": "https://www.lloydsbank.com/assets/current_accounts/lloyds-card-platinum.png"
  }
];

const PALETTE = ['#11b67a'];

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
      item = SAMPLE_DATA[4];
    } else {
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA[4];
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

  const imageContainer = document.createElement('div');
  imageContainer.className = 'image-container';

  const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => {
      if (img.parentNode) {
        img.parentNode.replaceChild(colorDiv(), img);
      }
    };
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn';
  ctaBtn.textContent = 'Apply now';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I'd like to apply for ${item.name || 'this product'}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h3');
  name.textContent = item.name || '';
  content.appendChild(name);

  if (item.category) {
    const categoryChip = document.createElement('span');
    categoryChip.className = 'category-chip';
    categoryChip.textContent = item.category;
    content.appendChild(categoryChip);
  }

  const description = document.createElement('p');
  description.className = 'description';
  description.textContent = item.description || '';
  content.appendChild(description);

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = item.price || '';
  content.appendChild(price);

  card.appendChild(content);
  block.appendChild(card);
}