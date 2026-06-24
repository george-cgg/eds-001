// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Mortgages",
    "description": "Explore and compare mortgage rates, or apply online or in the app, including a £5k deposit mortgage for first-time buyers.",
    "image_url": "https://www.lloydsbank.com/assets/homepage/homepage-new/remortgage-desktop-lloyds.jpg",
    "category": "Mortgage"
  },
  {
    "name": "Current accounts",
    "description": "From everyday banking to bank accounts with added rewards, find the current account that's right for you.",
    "image_url": "https://www.lloydsbank.com/assets/homepage/homepage-new/lds-current-accounts-homepage-desktop-vertical.jpg",
    "category": "Checking"
  },
  {
    "name": "Investments",
    "description": "Whether you're an experienced investor or just starting out, find an investment product to suit you.",
    "image_url": "https://www.lloydsbank.com/assets/investing/tye/wheatfield-767x384.jpg",
    "category": "Investment"
  },
  {
    "name": "Personal loans",
    "description": "For big ideas or smaller plans, see how much you could borrow before you apply. Rate depends on personal circumstances.",
    "image_url": "https://www.lloydsbank.com/assets/homepage/homepage-new/personal-loan-desktop-lloyds.jpg",
    "category": "Personal Loan"
  },
  {
    "name": "Credit cards",
    "description": "Check your eligibility before you apply in about 5 minutes without affecting your credit score.",
    "image_url": "https://www.lloydsbank.com/assets/homepage/homepage-new/credit-card-desktop-lloyds.jpg",
    "category": "Credit Card"
  },
  {
    "name": "Savings",
    "description": "Whatever you want to save for, a range of savings accounts can help you find the right account.",
    "image_url": "https://www.lloydsbank.com/assets/adaptive-images/stock-images/214927303/214927303_c110_promo_vertical_desktop.jpg",
    "category": "Savings"
  },
  {
    "name": "Home insurance",
    "description": "Straightforward home insurance with monthly payment options at no extra fee and a 24/7 emergency claims line.",
    "image_url": "https://www.lloydsbank.com/assets/homepage/homepage-new/home-ins-hp-carousel-desktop.jpg",
    "category": "Insurance"
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
    const mid=(lo+hi)/2;
    if (relLum(Math.round(r*mid),Math.round(g*mid),Math.round(b*mid)) > 0.12) hi=mid; else lo=mid;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
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
      // Detail concept — structuredContent IS the item (flat). Do NOT look for a wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
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

  // Image container LEFT
  const imageContainer = document.createElement('div');
  imageContainer.className = 'detail-image';

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
    img.alt = item.name || 'Product image';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-on-image';
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

  // Content RIGHT
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const name = document.createElement('h2');
  name.className = 'detail-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  const description = document.createElement('p');
  description.className = 'detail-description';
  description.textContent = item.description || '';
  content.appendChild(description);

  card.appendChild(content);
  block.appendChild(card);
}
