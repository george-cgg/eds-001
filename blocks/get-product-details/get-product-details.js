const SAMPLE_DATA = [
  {
    "name": "Advantage SafeBalance Banking",
    "description": "Simple digital checking with no paper check writing and no Overdraft Item Fees; no monthly fee if under age 25.",
    "category": "Checking"
  },
  {
    "name": "Advantage Plus Banking",
    "description": "Flexible checking with a variety of payment options and multiple ways to waive the monthly maintenance fee, including direct deposit.",
    "category": "Checking"
  },
  {
    "name": "Advantage Relationship Banking",
    "description": "Comprehensive interest-earning checking with no monthly fee on select additional accounts and no fees on select banking services.",
    "category": "Checking"
  },
  {
    "name": "SafeBalance Banking for Family Banking",
    "description": "A parent-owned account a child can use, with parental controls, spending alerts, and no monthly fee until the child is 25.",
    "category": "Checking"
  },
  {
    "name": "Bank of America Customized Cash Rewards",
    "description": "Earn 6% cash back in the category of your choice for the first year, plus a $200 online cash rewards bonus offer.",
    "image_url": "https://www.bankofamerica.com/content/images/ContextualSiteGraphics/CreditCardArt/en_US/Approved_PCM/8ckn_cshsigcm_v_300x188.png",
    "category": "Credit Card"
  },
  {
    "name": "Bank of America Unlimited Cash Rewards",
    "description": "Earn unlimited 2% cash back on purchases for the first year, plus a $200 online cash rewards bonus offer.",
    "image_url": "https://www.bankofamerica.com/content/images/ContextualSiteGraphics/CreditCardArt/en_US/Approved_PCM/bofa_ucr_fifa_8284155_e_300.png",
    "category": "Credit Card"
  },
  {
    "name": "BankAmericard",
    "description": "A low-interest card with an intro APR offer and no annual fee, designed to help manage balances and interest costs.",
    "image_url": "https://www.bankofamerica.com/content/images/ContextualSiteGraphics/CreditCardArt/en_US/Approved_PCM/bofa_nrwcm_mc_300x188.png",
    "category": "Credit Card"
  }
];

const PALETTE = ['#012169', '#e31837', '#a50e28', '#3860be'];

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

const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
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

  const card = document.createElement('div');
  card.className = 'detail-card';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'detail-image';

  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};display:flex;align-items:center;justify-content:center;`;
    const icon = document.createElement('div');
    icon.style.cssText = 'width:80px;height:80px;background:rgba(255,255,255,0.2);border-radius:8px;';
    d.appendChild(icon);
    return d;
  };

  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'image-cta-btn';
  ctaBtn.textContent = 'Apply Now';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`I want to apply for ${item.name}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

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

export default decorate;
