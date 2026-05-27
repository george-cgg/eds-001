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
  },
  {
    "name": "Dacia Jogger",
    "description": "Versatile family vehicle with 5 or 7 seats and hybrid 155 engine.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/homepage-banner/order-opening/dacia-bigster-homepage-001-desktop.jpg.ximg.largex2.webp/af86c2985c.webp",
    "price": "from 19,000 EUR",
    "category": "MPV"
  },
  {
    "name": "Dacia Spring",
    "description": "100% electric city car with 225km WLTP range and 315km urban range.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/editorial/new-homepage/Dacia_new_range_4_cars_2560x1440_V2.jpg.ximg.large.webp/9ea2771775.webp",
    "price": "from 18,900 EUR",
    "category": "Electric"
  }
];

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#646b52', '#555555', '#6699cc'];

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
  return {
    bg: `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

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
      // structuredContent.models — bare array outputSchema; key derived from actionName "list_models"
      items = structuredContent?.models || [];
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
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  // Left arrow
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow carousel-arrow-left';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.textContent = '◀';
  leftArrow.style.display = 'none'; // hidden at start
  wrapper.appendChild(leftArrow);

  // Carousel container
  const carousel = document.createElement('div');
  carousel.className = 'carousel-container';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'model-card';

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';

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
      img.onerror = () => {
        if (img.parentNode) {
          img.parentNode.replaceChild(colorDiv(), img);
        }
      };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'card-cta';
    ctaBtn.textContent = 'View Details';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    // Card content (info strip with darkened palette bg)
    const content = document.createElement('div');
    content.className = 'card-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    const price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = item.price || '';
    content.appendChild(price);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const category = document.createElement('span');
    category.className = 'card-badge';
    category.textContent = item.category || '';
    footer.appendChild(category);

    content.appendChild(footer);
    card.appendChild(content);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  // Right arrow
  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow carousel-arrow-right';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.textContent = '▶';
  wrapper.appendChild(rightArrow);

  // Right fade gradient
  const fade = document.createElement('div');
  fade.className = 'carousel-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  block.appendChild(wrapper);

  // Scroll handlers
  const cardWidth = 220 + 16; // card width + gap
  const updateArrows = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };

  const scrollLeft = () => {
    carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };
  const scrollRight = () => {
    carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  leftArrow.addEventListener('click', scrollLeft);
  rightArrow.addEventListener('click', scrollRight);

  // Keyboard support
  leftArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollLeft();
    }
  });
  rightArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollRight();
    }
  });

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();
}
