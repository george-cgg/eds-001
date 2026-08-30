const SAMPLE_DATA = [
  {
    "name": "Bigster",
    "description": "Dacia's largest SUV with spacious interior and rugged outdoor-ready design.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-mobile-001.jpg.ximg.small.jpg/73360fd5b0.jpg",
    "price": "from €22,890",
    "category": "SUV"
  },
  {
    "name": "Duster",
    "description": "Versatile compact SUV built for both urban drives and off-road adventures.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-mobile-003.jpg.ximg.small.jpg/51ec6dab16.jpg",
    "price": "from €19,100",
    "category": "SUV"
  },
  {
    "name": "Logan",
    "description": "Practical and spacious sedan offering exceptional value and everyday comfort.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-001-mobile.jpg.ximg.small.jpg/85abe768b9.jpg",
    "price": "from €14,650",
    "category": "Sedan"
  },
  {
    "name": "Sandero Stepway",
    "description": "Stylish crossover-inspired hatchback with elevated ride height and bold design.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-mobile-001.jpg.ximg.small.jpg/635d9dd22b.jpg",
    "price": "from €15,650",
    "category": "Crossover"
  },
  {
    "name": "Jogger",
    "description": "Versatile 7-seat family car combining MPV space with SUV styling.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-001-mobile.jpg.ximg.small.jpg/6e94a6c990.jpg",
    "price": "from €18,650",
    "category": "MPV"
  },
  {
    "name": "Spring",
    "description": "Fully electric city car delivering zero-emission urban mobility.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/dacia-bbg/spring-s2e-ph2-my26/overview/editorial/dacia-spring-s2e-ph2-hero-zone-background-mobile-001.jpg.ximg.small.jpg/aaa9b2163a.jpg",
    "price": "from €18,600",
    "category": "Electric"
  }
];

const PALETTE = ['#646b52','#555555','#6699cc','#0000ee'];

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
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

export default async function decorate(block, bridge) {
  let models;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      models = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.models — bare array outputSchema; key derived from actionName "list_models"
      models = structuredContent?.models || [];
    }
  } else {
    models = SAMPLE_DATA;
  }

  block.textContent = '';
  renderCarousel(block, models, bridge);

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

function renderCarousel(block, models, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Vehicle models carousel');

  models.forEach((model, i) => {
    const card = document.createElement('div');
    card.className = 'model-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };

    if (model.image_url) {
      const img = document.createElement('img');
      img.src = model.image_url;
      img.alt = model.name || 'Vehicle model';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => {
        if (img.parentNode) {
          img.parentNode.replaceChild(colorDiv(), img);
        }
      };
      imageContainer.appendChild(img);

      const ctaBtn = document.createElement('button');
      ctaBtn.className = 'cta-btn';
      ctaBtn.textContent = 'View Details';
      ctaBtn.setAttribute('aria-label', `View details for ${model.name}`);
      if (bridge) {
        ctaBtn.addEventListener('click', () => {
          bridge.sendMessage(`Tell me more about the ${model.name}`);
        });
      }
      imageContainer.appendChild(ctaBtn);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'card-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const header = document.createElement('div');
    header.className = 'card-header';

    const name = document.createElement('h3');
    name.textContent = model.name;
    name.style.color = theme?.fg ?? '#fff';
    header.appendChild(name);

    if (model.category) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = model.category;
      badge.style.cssText = `background:#646b52;color:#fff;`;
      header.appendChild(badge);
    }

    info.appendChild(header);

    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = model.description;
    desc.style.color = theme?.fg ?? '#fff';
    info.appendChild(desc);

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = model.price;
    price.style.color = theme?.fg ?? '#fff';
    info.appendChild(price);

    card.appendChild(info);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'nav-btn nav-left';
  leftBtn.innerHTML = '&#9664;';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.style.display = 'none';
  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -236, behavior: 'smooth' });
  });
  leftBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: -236, behavior: 'smooth' });
    }
  });

  const rightBtn = document.createElement('button');
  rightBtn.className = 'nav-btn nav-right';
  rightBtn.innerHTML = '&#9654;';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: 236, behavior: 'smooth' });
  });
  rightBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: 236, behavior: 'smooth' });
    }
  });

  const updateArrows = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
  };

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  const fade = document.createElement('div');
  fade.className = 'fade-gradient';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  wrapper.appendChild(fade);

  block.appendChild(wrapper);
}
