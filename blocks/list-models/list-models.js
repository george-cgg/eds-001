// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "Bigster",
    "description": "SUV hibrid cu GPL, cutie automată și tracțiune 4x4.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg",
    "price": "de la 22.890 EUR",
    "category": "SUV"
  },
  {
    "name": "Duster",
    "description": "SUV cu motorizare hibridă GPL și tracțiune 4x4.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.large.jpg/310f84027e.jpg",
    "price": "de la 19.100 EUR",
    "category": "SUV"
  },
  {
    "name": "Logan",
    "description": "Berlină accesibilă cu motorizare GPL și habitaclu generos.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg",
    "price": "de la 14.650 EUR",
    "category": "Sedan"
  },
  {
    "name": "Sandero Stepway",
    "description": "Crossover compact cu design outdoor și motorizare GPL.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-background-desktop-001.jpg.ximg.large.jpg/48eb89e802.jpg",
    "price": "de la 15.650 EUR",
    "category": "Crossover"
  },
  {
    "name": "Spring",
    "description": "Mașină electrică urbană accesibilă cu autonomie generoasă.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-s2e-ph2-my26/overview/editorial/dacia-spring-s2e-ph2-hero-zone-background-desktop-001.jpg.ximg.large.jpg/1f111e4936.jpg",
    "price": "de la 18.600 EUR",
    "category": "Electric"
  },
  {
    "name": "Jogger",
    "description": "Mașină familială cu 7 locuri și motorizare hibridă GPL.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/5224fc9270.jpg",
    "price": "de la 18.650 EUR",
    "category": "Family"
  }
];

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#646b52','#555555','#6699cc','#0000ee'];

// Color fallbacks for broken images
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if(hex.length!==6)return null;
  let [r,g,b]=[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)];
  if(isNaN(r)||isNaN(g)||isNaN(b))return null;
  const lum=(c)=>{const s=c/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4);};
  const relLum=(r,g,b)=>0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if(relLum(r,g,b)<=0.12)return{bg:`#${hex}`,fg:'#ffffff'};
  let lo=0,hi=1;
  for(let i=0;i<20;i++){const m=(lo+hi)/2;if(relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m))>0.12)hi=m;else lo=m;}
  const dr=Math.round(r*lo),dg=Math.round(g*lo),db=Math.round(b*lo);
  return{bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,fg:'#ffffff'};
}

const theme = getThemedCardBg(PALETTE);

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
  wrapper.className = 'list-models-carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'list-models-carousel';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'list-models-card';

    // Image container
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'list-models-card-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const createColorDiv = () => {
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
          img.parentNode.replaceChild(createColorDiv(), img);
        }
      };
      imageWrapper.appendChild(img);
    } else {
      imageWrapper.appendChild(createColorDiv());
    }

    // CTA button on image
    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'list-models-cta';
    ctaBtn.textContent = 'Descoperă';
    ctaBtn.setAttribute('aria-label', `Descoperă ${item.name || 'model'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageWrapper.appendChild(ctaBtn);

    card.appendChild(imageWrapper);

    // Content section
    const content = document.createElement('div');
    content.className = 'list-models-card-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    // Category badge
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-models-category';
      badge.textContent = item.category;
      content.appendChild(badge);
    }

    // Name
    const name = document.createElement('h3');
    name.className = 'list-models-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    // Description
    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'list-models-description';
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    // Price
    if (item.price) {
      const price = document.createElement('div');
      price.className = 'list-models-price';
      price.textContent = item.price;
      content.appendChild(price);
    }

    card.appendChild(content);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  // Right fade gradient
  const fade = document.createElement('div');
  fade.className = 'list-models-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  // Navigation arrows
  const leftArrow = document.createElement('button');
  leftArrow.className = 'list-models-arrow list-models-arrow-left';
  leftArrow.innerHTML = '&#9664;';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'list-models-arrow list-models-arrow-right';
  rightArrow.innerHTML = '&#9654;';
  rightArrow.setAttribute('aria-label', 'Scroll right');

  const updateArrows = () => {
    const scrollLeft = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    leftArrow.style.display = scrollLeft > 5 ? 'flex' : 'none';
    rightArrow.style.display = scrollLeft < maxScroll - 5 ? 'flex' : 'none';
  };

  const scrollByCard = (direction) => {
    const cardWidth = 220 + 16; // card width + gap
    carousel.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  leftArrow.addEventListener('click', () => scrollByCard(-1));
  rightArrow.addEventListener('click', () => scrollByCard(1));

  leftArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollByCard(-1);
    }
  });

  rightArrow.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollByCard(1);
    }
  });

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  block.appendChild(wrapper);
}
