// Sample data for standalone/preview mode.
// In production, confirmation data comes dynamically from bridge.toolResult.
const SAMPLE_MODELS = [
  { name: 'Dacia Bigster', description: 'The largest Dacia SUV, offering C-segment space with rugged styling and hybrid powertrains.', price: 'de la 21.400 EUR', category: 'SUV' },
  { name: 'Dacia Duster', description: 'Iconic compact SUV built for adventure, available with 4x4 and hybrid options.', price: 'de la 18.900 EUR', category: 'SUV' },
  { name: 'Dacia Spring', description: 'Fully electric city car with an accessible price and compact urban footprint.', price: 'de la 16.700 EUR', category: 'City car (electric)' },
  { name: 'Dacia Jogger', description: 'Versatile family vehicle with up to 7 seats and a hybrid powertrain option.', price: 'de la 16.500 EUR', category: 'Family / 7-seater' },
  { name: 'Dacia Sandero Stepway', description: 'Compact crossover-styled hatchback with raised ride height and rugged trim.', price: 'de la 14.200 EUR', category: 'Crossover' },
  { name: 'Dacia Logan', description: 'Affordable and spacious sedan combining comfort with a low cost of ownership.', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg', price: 'de la 13.100 EUR', category: 'Sedan' },
];

const MODEL_OPTIONS = ['Dacia Bigster', 'Dacia Duster', 'Dacia Spring', 'Dacia Jogger', 'Dacia Sandero Stepway', 'Dacia Logan'];

// Brand palette from the action payload.
const PALETTE = ['#646b52', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#646b52';

const FIELDS = [
  { key: 'model', label: 'Model', type: 'select', required: true, options: MODEL_OPTIONS, placeholder: 'Select a model' },
  { key: 'dealer_city', label: 'Dealer City', type: 'text', required: false, placeholder: 'Preferred dealer city or location for the test drive.' },
  { key: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: "Customer's full name." },
  { key: 'email', label: 'Email', type: 'email', required: true, placeholder: "Customer's email address." },
  { key: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: "Customer's phone number." },
  { key: 'preferred_date', label: 'Preferred Date', type: 'date', required: false, placeholder: '' },
];

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      if (structuredContent && (structuredContent.confirmation_id || structuredContent.status || structuredContent.message)) {
        confirmation = structuredContent;
      }
    }
  }

  block.textContent = '';
  renderForm(block, bridge, confirmation);

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

function heroFor(modelName) {
  return SAMPLE_MODELS.find((m) => m.name === modelName) || null;
}

function renderForm(block, bridge, confirmation) {
  const card = document.createElement('div');
  card.className = 'btd-card';

  // Hero image — driven by selected model; omit <img> when no image_url.
  const hero = document.createElement('div');
  hero.className = 'btd-hero';
  const initialModel = heroFor('Dacia Bigster');
  const fallbackColor = CARD_COLORS[0];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  const paintHero = (model) => {
    hero.textContent = '';
    if (model && model.image_url) {
      const img = document.createElement('img');
      img.src = model.image_url;
      img.alt = model.name || 'Dacia model';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      hero.appendChild(img);
      hero.style.display = '';
    } else {
      hero.style.display = 'none';
    }
  };
  paintHero(initialModel);
  card.appendChild(hero);

  // Header block — palette-derived background.
  const header = document.createElement('div');
  header.className = 'btd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'btd-title';
  title.textContent = 'Book Test Drive';
  header.appendChild(title);
  const desc = document.createElement('p');
  desc.className = 'btd-desc';
  desc.textContent = 'Submits a test drive request for a selected Dacia model, capturing the model choice, preferred dealer location, and the customer’s contact details, and returns a booking confirmation.';
  header.appendChild(desc);
  card.appendChild(header);

  if (confirmation) {
    card.appendChild(buildConfirmation(confirmation));
    block.appendChild(card);
    return;
  }

  const form = document.createElement('form');
  form.className = 'btd-form';
  form.setAttribute('novalidate', '');
  const inputs = {};

  FIELDS.forEach((f) => {
    const wrap = document.createElement('div');
    wrap.className = 'btd-field';

    const label = document.createElement('label');
    label.className = 'btd-label';
    label.setAttribute('for', `btd-${f.key}`);
    label.textContent = f.required ? `${f.label} *` : f.label;
    wrap.appendChild(label);

    let el;
    if (f.type === 'select') {
      el = document.createElement('select');
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = f.placeholder;
      ph.disabled = true;
      el.appendChild(ph);
      f.options.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        el.appendChild(o);
      });
      el.value = 'Dacia Bigster';
      el.addEventListener('change', () => paintHero(heroFor(el.value)));
    } else {
      el = document.createElement('input');
      el.type = f.type;
      el.placeholder = f.placeholder;
    }
    el.id = `btd-${f.key}`;
    el.className = 'btd-input';
    if (f.required) el.required = true;
    inputs[f.key] = el;
    wrap.appendChild(el);
    form.appendChild(wrap);
  });

  const error = document.createElement('p');
  error.className = 'btd-error';
  error.style.display = 'none';
  form.appendChild(error);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btd-submit';
  submit.textContent = 'Book Test Drive';
  submit.style.cssText = `background:${ACCENT};`;
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    Object.keys(inputs).forEach((k) => { values[k] = inputs[k].value.trim(); });
    const missing = FIELDS.filter((f) => f.required && !values[f.key]);
    if (missing.length) {
      error.textContent = `Please fill in: ${missing.map((m) => m.label).join(', ')}.`;
      error.style.display = '';
      return;
    }
    error.style.display = 'none';
    if (bridge) {
      const parts = [`I'd like to book a test drive for the ${values.model}.`];
      if (values.dealer_city) parts.push(`Preferred dealer: ${values.dealer_city}.`);
      parts.push(`My name is ${values.full_name}, email ${values.email}, phone ${values.phone}.`);
      if (values.preferred_date) parts.push(`Preferred date: ${values.preferred_date}.`);
      bridge.sendMessage(parts.join(' '));
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}

function buildConfirmation(c) {
  const box = document.createElement('div');
  box.className = 'btd-confirm';

  const check = document.createElement('div');
  check.className = 'btd-check';
  check.textContent = '✓';
  check.style.cssText = `background:${ACCENT};`;
  box.appendChild(check);

  const status = document.createElement('p');
  status.className = 'btd-status';
  status.textContent = c.status || 'Confirmed';
  box.appendChild(status);

  if (c.message) {
    const msg = document.createElement('p');
    msg.className = 'btd-message';
    msg.textContent = c.message;
    box.appendChild(msg);
  }

  if (c.confirmation_id) {
    const id = document.createElement('p');
    id.className = 'btd-confid';
    id.textContent = `Confirmation: ${c.confirmation_id}`;
    box.appendChild(id);
  }

  return box;
}
