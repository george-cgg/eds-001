const SAMPLE_DATA = [
  {
    name: 'Bigster',
    description: 'SUV de familie cu design robust și spațiu generos.',
    image_url: 'https://www.dacia.ro/aMedias/Dacia_Bigster_34_AV_Journey_V2_1-1f29cc8c.png',
    price: 'de la 24.250 €',
    category: 'SUV'
  },
  {
    name: 'Duster',
    description: 'SUV compact versatil pentru aventuri off-road și urbane.',
    image_url: 'https://www.dacia.ro/aMedias/Dacia_Duster_34_AV_Journey_V3-bb5e63c1.png',
    price: 'de la 19.650 €',
    category: 'SUV'
  },
  {
    name: 'Noul Logan',
    description: 'Berlină accesibilă cu design modern și confort.',
    image_url: 'https://www.dacia.ro/aMedias/Dacia_Logan_34_AV_Expression-0dfbc15e.png',
    price: 'de la 12.150 €',
    category: 'Sedan'
  },
  {
    name: 'Noul Jogger',
    description: 'Vehicul familial cu 7 locuri și versatilitate maximă.',
    image_url: 'https://www.dacia.ro/aMedias/Dacia_Jogger_34_AV_Extreme-4db1f6ed.png',
    price: 'de la 17.800 €',
    category: 'Family'
  },
  {
    name: 'Spring',
    description: 'Vehicul 100% electric accesibil pentru mobilitate urbană.',
    image_url: 'https://www.dacia.ro/aMedias/Dacia_Spring_34AV_Expression-12b01760.png',
    price: 'de la 17.900 €',
    category: 'Electric'
  }
];

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
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
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

  const container = document.createElement('div');
  container.className = 'carousel-container';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'model-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

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

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-btn';
    ctaBtn.textContent = 'View Details';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'card-content';
    content.style.cssText = `background: ${theme?.bg ?? '#1a1a1a'}; color: ${theme?.fg ?? '#fff'};`;

    const name = document.createElement('h3');
    name.className = 'model-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'model-description';
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    const bottomRow = document.createElement('div');
    bottomRow.className = 'bottom-row';

    if (item.price) {
      const price = document.createElement('p');
      price.className = 'model-price';
      price.textContent = item.price;
      bottomRow.appendChild(price);
    }

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = item.category;
      bottomRow.appendChild(badge);
    }

    content.appendChild(bottomRow);
    card.appendChild(content);
    container.appendChild(card);
  });

  wrapper.appendChild(container);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow left hidden';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.textContent = '◀';
  wrapper.appendChild(leftArrow);

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow right';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.textContent = '▶';
  wrapper.appendChild(rightArrow);

  const fade = document.createElement('div');
  fade.className = 'fade-gradient';
  fade.style.cssText = `background: linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc);`;
  wrapper.appendChild(fade);

  block.appendChild(wrapper);

  const updateArrows = () => {
    const atStart = container.scrollLeft <= 1;
    const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    leftArrow.classList.toggle('hidden', atStart);
    rightArrow.classList.toggle('hidden', atEnd);
  };

  const scrollByCard = (direction) => {
    const cardWidth = 220 + 16;
    container.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
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

  container.addEventListener('scroll', updateArrows);
  updateArrows();
}