// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Dacia Bigster',
    description: 'C-segment SUV with hybrid and Eco-G powertrains and generous interior space.',
    price: 'de la 20.490 EUR',
    category: 'SUV',
    image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/oveview/dacia-bigster-db3l1-ph1-055-mobile.jpg.ximg.xsmall.jpg/4b67d90d3c.jpg',
  },
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#646b52'];

const CARD_COLORS = ['#646b52', '#9256d9', '#0fb5ae', '#e68619'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      [item] = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    [item] = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDetail(block, item || {}, bridge);

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

  // Image (LEFT)
  const imageWrap = document.createElement('div');
  imageWrap.className = 'detail-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Content (RIGHT)
  const content = document.createElement('div');
  content.className = 'detail-content';

  const title = document.createElement('h3');
  title.className = 'detail-name';
  title.textContent = item.name || '';
  content.appendChild(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  if (item.price) {
    const price = document.createElement('span');
    price.className = 'detail-price';
    price.textContent = item.price;
    meta.appendChild(price);
  }
  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'detail-chip';
    chip.textContent = item.category;
    meta.appendChild(chip);
  }
  content.appendChild(meta);

  const btn = document.createElement('button');
  btn.className = 'detail-cta';
  btn.type = 'button';
  btn.textContent = 'Learn More';
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name || 'this model'}`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
