// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'Bigster',
  description: 'The largest and best-equipped SUV in the range, now with a hybrid-G LPG powertrain, automatic gearbox and 4x4.',
  price: 'from 20.490 EUR',
  category: 'SUV',
  image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg',
};

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#646b52'];
const ACCENT = PALETTE[0] || '#2563eb';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA;
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

  // Image (left)
  const imageBox = document.createElement('div');
  imageBox.className = 'detail-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imageBox.appendChild(img);
  } else {
    imageBox.appendChild(colorDiv());
  }
  card.appendChild(imageBox);

  // Content (right)
  const content = document.createElement('div');
  content.className = 'detail-content';

  const title = document.createElement('h3');
  title.className = 'detail-name';
  title.textContent = item.name || '';
  content.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = item.description || '';
  content.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  if (item.price) {
    const price = document.createElement('span');
    price.className = 'detail-price';
    price.textContent = item.price;
    meta.appendChild(price);
  }
  if (item.category) {
    const cat = document.createElement('span');
    cat.className = 'detail-category';
    cat.textContent = item.category;
    meta.appendChild(cat);
  }
  content.appendChild(meta);

  const btn = document.createElement('button');
  btn.className = 'detail-cta';
  btn.type = 'button';
  btn.textContent = 'Configurează';
  btn.style.backgroundColor = ACCENT;
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name || 'this model'}`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
