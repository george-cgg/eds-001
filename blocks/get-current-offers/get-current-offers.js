// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Bigster',
    description: 'The largest and best-equipped SUV in the range, now with a hybrid-G LPG powertrain, automatic gearbox and 4x4.',
    price: 'from 20.490 EUR',
    category: 'SUV',
    is_deal: true,
    discount_percentage: 'Rabla',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg',
  },
  {
    name: 'Duster',
    description: 'Iconic compact SUV available with full hybrid and factory-fitted LPG options.',
    price: 'from 17.100 EUR',
    category: 'SUV',
    is_deal: true,
    discount_percentage: 'Rabla',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Duster%20GPL.jpg.ximg.large.webp/589927f26b.webp',
  },
  {
    name: 'Logan',
    description: 'Spacious and economical sedan with modern design and connected technology.',
    price: 'from 12.650 EUR',
    category: 'Sedan',
    is_deal: true,
    discount_percentage: 'Rabla',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Logan%20GPL.jpg.ximg.large.webp/7d9c1a07d2.webp',
  },
  {
    name: 'Sandero Stepway',
    description: 'Versatile crossover with raised stance, roof bars and economical LPG engines.',
    price: 'from 13.650 EUR',
    category: 'Crossover',
    is_deal: true,
    discount_percentage: 'Rabla',
    image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Stepway%20GPL.jpg.ximg.large.webp/7b6547eeb1.webp',
  },
  {
    name: 'Jogger',
    description: 'Family vehicle with 5 or 7 seats combining generous interior space with the latest hybrid technology.',
    price: 'from 16.650 EUR',
    category: 'MPV',
    is_deal: true,
    discount_percentage: 'Rabla',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/rji/jogger-ri1-ph2/herozone-banners/jogger-ri1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/5224fc9270.jpg',
  },
];

const CARD_COLORS = ['#646b52', '#7a8265', '#565c47', '#8a9173', '#4c5140'];

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
      // structuredContent.offers — bare array outputSchema; key derived from actionName "get_current_offers"
      items = structuredContent?.offers || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderOffers(block, items, bridge);

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

function renderOffers(block, items, bridge) {
  const deals = (items || []).filter((it) => it && it.is_deal !== false).slice(0, 8);

  const wrapper = document.createElement('div');
  wrapper.className = 'get-current-offers-wrapper';

  const track = document.createElement('div');
  track.className = 'get-current-offers-track';

  deals.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'get-current-offers-card';

    const media = document.createElement('div');
    media.className = 'get-current-offers-media';

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
      img.loading = 'lazy';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      media.appendChild(img);
    } else {
      media.appendChild(colorDiv());
    }

    if (item.discount_percentage) {
      const badge = document.createElement('span');
      badge.className = 'get-current-offers-badge';
      badge.textContent = item.discount_percentage;
      media.appendChild(badge);
    }

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'get-current-offers-cta';
    cta.textContent = 'Vreau oferta';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Vreau oferta pentru ${item.name}`);
      });
    }
    media.appendChild(cta);

    card.appendChild(media);

    const info = document.createElement('div');
    info.className = 'get-current-offers-info';

    const name = document.createElement('h3');
    name.className = 'get-current-offers-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'get-current-offers-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    if (item.price) {
      const price = document.createElement('span');
      price.className = 'get-current-offers-price';
      price.textContent = item.price;
      info.appendChild(price);
    }

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'get-current-offers-fade';
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `get-current-offers-arrow get-current-offers-arrow-${dir}`;
    btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    btn.textContent = dir === 'left' ? '◀' : '▶';
    const step = () => {
      const card = track.querySelector('.get-current-offers-card');
      const delta = (card ? card.offsetWidth : 220) + 16;
      track.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' });
    };
    btn.addEventListener('click', step);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(); }
    });
    return btn;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
