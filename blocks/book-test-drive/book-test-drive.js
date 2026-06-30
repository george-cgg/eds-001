// Sample data for standalone/preview mode.
// In production, the model list + hero image come from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Bigster', description: "Dacia's largest and most equipped SUV, available with a hybrid-G 150 4x4 powertrain, automatic transmission and a 702L boot.", price: 'de la 20.490 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Bigster%20GPL.jpg.ximg.xsmall.jpg/e6921f98ca.jpg' },
  { name: 'Duster', description: 'Iconic compact SUV with hybrid GPL motorization, automatic gearbox and capable 4x4 off-road performance.', price: 'de la 17.100 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Duster%20GPL.jpg.ximg.xsmall.jpg/589927f26b.jpg' },
  { name: 'Noul Logan', description: 'Spacious and affordable sedan offering practicality and low running costs with factory GPL options.', price: 'de la 12.741 EUR', category: 'Berlină', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Logan%20GPL.jpg.ximg.large.webp/7d9c1a07d2.webp' },
  { name: 'Noul Sandero Stepway', description: 'Crossover-styled hatchback with raised ride height and efficient GPL motorization for versatile everyday driving.', price: 'de la 13.741 EUR', category: 'Crossover', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Stepway%20GPL.jpg.ximg.large.webp/7b6547eeb1.webp' },
  { name: 'Noul Jogger', description: 'Versatile family vehicle with up to 7 seats and a full hybrid option for long-distance comfort.', price: 'de la 16.650 EUR', category: 'Familie', image_url: 'https://cdn.group.renault.com/dac/ro/gpl/Jogger-GPL.jpg.ximg.xsmall.jpg/7292573e4a.jpg' },
];

// Brand palette from BuildWidgetRequest. getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white header text keeps WCAG AA contrast.
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

const CARD_COLORS = ['#646b52', '#3860be', '#0fb5ae', '#e68619', '#d83790'];

const FIELDS = [
  { name: 'model', label: 'Model', type: 'select', required: true, options: ['Bigster', 'Duster', 'Noul Logan', 'Noul Sandero Stepway', 'Noul Jogger'] },
  { name: 'full_name', label: 'Nume complet', type: 'text', required: true, placeholder: 'Customer full name.' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Customer email address.' },
  { name: 'phone', label: 'Telefon', type: 'tel', required: true, placeholder: 'Customer phone number.' },
  { name: 'preferred_date', label: 'Dată preferată', type: 'date', required: false, placeholder: 'Preferred test drive date.' },
];

export default async function decorate(block, bridge) {
  // Model catalogue for the dropdown is always the static enum list (SAMPLE_DATA).
  // The tool result is a booking confirmation, not a model list.
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent — booking confirmation { confirmation_id, status, message }
      if (structuredContent && (structuredContent.confirmation_id || structuredContent.status)) {
        confirmation = structuredContent;
      }
    }
  }

  block.textContent = '';
  renderForm(block, SAMPLE_DATA, bridge, confirmation);

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

function renderForm(block, items, bridge, confirmation) {
  const list = Array.isArray(items) && items.length ? items : SAMPLE_DATA;
  const hero = list.find((it) => it && it.image_url) || list[0] || {};

  const card = document.createElement('div');
  card.className = 'book-test-drive-card';

  // Hero header with image + palette-tinted title overlay
  const header = document.createElement('div');
  header.className = 'book-test-drive-header';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'book-test-drive-hero';
  if (hero.image_url) {
    const img = document.createElement('img');
    img.src = hero.image_url;
    img.alt = hero.name || 'Dacia';
    img.onerror = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
      if (img.parentNode) img.parentNode.replaceChild(d, img);
    };
    imgWrap.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    imgWrap.appendChild(d);
  }
  header.appendChild(imgWrap);

  const titleBar = document.createElement('div');
  titleBar.className = 'book-test-drive-titlebar';
  titleBar.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;
  const title = document.createElement('h3');
  title.className = 'book-test-drive-title';
  title.textContent = 'Programează un test drive';
  const desc = document.createElement('p');
  desc.className = 'book-test-drive-desc';
  desc.textContent = 'Alege modelul Dacia dorit și completează datele de contact pentru a rezerva test drive-ul.';
  titleBar.appendChild(title);
  titleBar.appendChild(desc);
  header.appendChild(titleBar);
  card.appendChild(header);

  // Form body
  const form = document.createElement('form');
  form.className = 'book-test-drive-form';
  form.setAttribute('novalidate', '');

  const modelNames = list.map((it) => it && it.name).filter(Boolean);

  FIELDS.forEach((field) => {
    const group = document.createElement('div');
    group.className = 'book-test-drive-group';

    const label = document.createElement('label');
    label.className = 'book-test-drive-label';
    label.setAttribute('for', `btd-${field.name}`);
    label.textContent = field.required ? `${field.label} *` : field.label;
    group.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selectează un model';
      placeholder.disabled = true;
      placeholder.selected = true;
      input.appendChild(placeholder);
      const opts = modelNames.length ? modelNames : field.options;
      opts.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        input.appendChild(o);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type;
      if (field.placeholder) input.placeholder = field.placeholder;
    }
    input.id = `btd-${field.name}`;
    input.name = field.name;
    input.className = 'book-test-drive-input';
    if (field.required) input.required = true;
    group.appendChild(input);
    form.appendChild(group);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'book-test-drive-submit';
  submit.textContent = 'Programează test drive';
  form.appendChild(submit);

  const status = document.createElement('p');
  status.className = 'book-test-drive-status';
  status.setAttribute('role', 'status');
  form.appendChild(status);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    let valid = true;
    FIELDS.forEach((field) => {
      const el = form.querySelector(`#btd-${field.name}`);
      const value = el ? el.value.trim() : '';
      if (field.required && !value) valid = false;
      data[field.name] = value;
    });
    if (!valid) {
      status.textContent = 'Completează câmpurile obligatorii.';
      status.className = 'book-test-drive-status is-error';
      return;
    }
    status.textContent = '';
    status.className = 'book-test-drive-status';
    if (bridge) {
      const parts = [
        `Aș dori să programez un test drive pentru ${data.model}.`,
        `Nume: ${data.full_name}.`,
        `Email: ${data.email}.`,
        `Telefon: ${data.phone}.`,
      ];
      if (data.preferred_date) parts.push(`Dată preferată: ${data.preferred_date}.`);
      bridge.sendMessage(parts.join(' '));
      status.textContent = 'Cererea ta a fost trimisă.';
      status.className = 'book-test-drive-status is-success';
    } else {
      status.textContent = `Test drive pentru ${data.model} pregătit de trimis.`;
      status.className = 'book-test-drive-status is-success';
    }
  });

  if (confirmation && (confirmation.message || confirmation.confirmation_id)) {
    status.textContent = confirmation.message
      || `Booking ${confirmation.confirmation_id} ${confirmation.status || 'confirmed'}.`;
    status.className = 'book-test-drive-status is-success';
  }

  card.appendChild(form);
  block.appendChild(card);
}
