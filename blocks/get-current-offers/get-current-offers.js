const SAMPLE_DATA = [
  {
    name: "Duster",
    description: "Versatile SUV with 4x4 capability, hybrid engine, and rugged design for on and off-road adventures.",
    image_url: "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.largex2.webp/310f84027e.webp",
    price: "from 17,100 EUR",
    category: "SUV"
  },
  {
    name: "Logan",
    description: "Spacious and efficient sedan offering generous interior room and low running costs.",
    image_url: "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.largex2.webp/f7b183dd4d.webp",
    price: "from 12,741 EUR",
    category: "Sedan"
  },
  {
    name: "Jogger",
    description: "Family MPV with 5 or 7 seats and hybrid powertrain for versatile everyday use.",
    image_url: "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-background-001-desktop.jpg.ximg.largex2.webp/5224fc9270.webp",
    price: "from 16,741 EUR",
    category: "MPV"
  },
  {
    name: "Spring",
    description: "Compact electric city car with 225 km range and 100 CP motor for urban mobility.",
    image_url: "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-s2e-ph2-my26/overview/editorial/dacia-spring-s2e-ph2-hero-zone-background-desktop-001.jpg.ximg.largex2.webp/1f111e4936.webp",
    price: "from 15,069 EUR",
    category: "Electric",
    is_deal: "true",
    original_price: "18,600 EUR",
    discount_percentage: "19% OFF"
  },
  {
    name: "Sandero Stepway",
    description: "Elevated crossover with robust design, GPL engine option, and automatic transmission.",
    image_url: "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-background-desktop-001.jpg.ximg.largex2.webp/48eb89e802.webp",
    price: "from 13,741 EUR",
    category: "Crossover"
  }
];

const PALETTE = ['#646b52','#555555','#6699cc','#0000ee'];
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

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

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA.filter(item => item.is_deal === "true");
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.offers — bare array outputSchema; key derived from actionName "get_current_offers"
      items = structuredContent?.offers || [];
    }
  } else {
    items = SAMPLE_DATA.filter(item => item.is_deal === "true");
  }

  block.textContent = '';
  const theme = getThemedCardBg(PALETTE);
  renderDeals(block, items, theme, bridge);

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

function renderDeals(block, items, theme, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'deals-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'deals-carousel';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'deal-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'deal-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
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

    if (item.discount_percentage) {
      const badge = document.createElement('div');
      badge.className = 'discount-badge';
      badge.textContent = item.discount_percentage;
      imageContainer.appendChild(badge);
    }

    const cta = document.createElement('button');
    cta.className = 'view-deal-btn';
    cta.textContent = 'View Deal';
    cta.setAttribute('aria-label', `View deal for ${item.name}`);
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${item.name} offer`);
      });
    }
    imageContainer.appendChild(cta);

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'deal-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const title = document.createElement('h3');
    title.textContent = item.name;
    info.appendChild(title);

    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';

    if (item.original_price) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'original-price';
      originalPrice.textContent = item.original_price;
      priceRow.appendChild(originalPrice);
    }

    const salePrice = document.createElement('span');
    salePrice.className = 'sale-price';
    salePrice.textContent = item.price || item.discounted_price || '';
    priceRow.appendChild(salePrice);

    info.appendChild(priceRow);
    card.appendChild(info);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'scroll-arrow left';
  leftArrow.innerHTML = '◀';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';
  leftArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: -220, behavior: 'smooth' });
  });

  const rightArrow = document.createElement('button');
  rightArrow.className = 'scroll-arrow right';
  rightArrow.innerHTML = '▶';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: 220, behavior: 'smooth' });
  });

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
  };

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  if (items.length > 1) {
    const fade = document.createElement('div');
    fade.className = 'fade-edge';
    fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
    wrapper.appendChild(fade);
  }

  block.appendChild(wrapper);
}
