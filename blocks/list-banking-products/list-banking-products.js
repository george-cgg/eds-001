// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
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

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#012169','#e31837','#a50e28','#3860be'];

// Darkens palette[0] to luminance ≤ 0.12 for WCAG AA contrast with white text.
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

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "list_banking_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderCarousel(block, items, bridge);

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

function renderCarousel(block, items, bridge) {
  const theme = getThemedCardBg(PALETTE);

  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';

  items.slice(0, 6).forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'plan-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'plan-image';

    const fallbackColor = CARD_COLORS[index % CARD_COLORS.length];
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
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-overlay';
    ctaBtn.textContent = 'Learn More';
    ctaBtn.setAttribute('aria-label', `Learn more about ${item.name}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'plan-content';
    content.style.cssText = `background:${theme?.bg ?? '#001144'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('div');
    name.className = 'plan-name';
    name.textContent = item.name;
    content.appendChild(name);

    const description = document.createElement('div');
    description.className = 'plan-description';
    description.textContent = item.description;
    content.appendChild(description);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'plan-badge';
      badge.textContent = item.category;
      content.appendChild(badge);
    }

    card.appendChild(content);
    carousel.appendChild(card);
  });

  const leftBtn = document.createElement('button');
  leftBtn.className = 'nav-btn nav-left';
  leftBtn.innerHTML = '◀';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.style.display = 'none';
  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -230, behavior: 'smooth' });
  });

  const rightBtn = document.createElement('button');
  rightBtn.className = 'nav-btn nav-right';
  rightBtn.innerHTML = '▶';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: 230, behavior: 'smooth' });
  });

  const updateNav = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftBtn.style.display = atStart ? 'none' : 'block';
    rightBtn.style.display = atEnd ? 'none' : 'block';
  };

  carousel.addEventListener('scroll', updateNav);
  updateNav();

  const fade = document.createElement('div');
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#001144'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  wrapper.appendChild(carousel);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);
}
