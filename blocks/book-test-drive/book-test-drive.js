// Sample data for standalone/preview mode.
// In production, the form is rendered the same way; submission sends a message
// back into the conversation so the host can fulfill the booking via the MCP tool.
const SAMPLE_DATA = [
  { name: 'Dacia Bigster', description: 'C-segment SUV with hybrid and Eco-G powertrains and generous interior space.', price: 'de la 20.490 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/oveview/dacia-bigster-db3l1-ph1-055-mobile.jpg.ximg.xsmall.jpg/4b67d90d3c.jpg' },
  { name: 'Dacia Duster', description: 'Versatile compact SUV available with hybrid, Eco-G, and 4x4 options.', price: 'de la 17.100 EUR', category: 'SUV', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/overview/editorial/dacia-duster-p1310-overview-004-1-mobile.jpg.ximg.xsmall.jpg/ba4175c768.jpg' },
  { name: 'Noul Dacia Logan', description: 'Spacious and affordable sedan with modern equipment.', price: 'de la 12.741 EUR', category: 'Sedan', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.large.jpg/f7b183dd4d.jpg' },
  { name: 'Noul Dacia Sandero Stepway', description: 'Crossover-styled hatchback with raised ride height and factory-fitted GPL option.', price: 'de la 13.741 EUR', category: 'Crossover', image_url: 'https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/sandero-stepway/sandero-stepway-bi1-ph2/herozone-banners/sandero-stepway-bi1-ph2-herozone-background-desktop-001.jpg.ximg.large.jpg/48eb89e802.jpg' },
];

// Brand palette from BuildWidgetRequest. getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white text meets WCAG AA contrast.
const PALETTE = ['#646b52'];
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
  { key: 'model', label: 'Model', placeholder: 'Dacia model to test drive.', required: true, type: 'select' },
  { key: 'full_name', label: 'Full Name', placeholder: 'Customer full name.', required: true, type: 'text' },
  { key: 'email', label: 'Email', placeholder: 'Customer email address.', required: true, type: 'email' },
  { key: 'phone', label: 'Phone', placeholder: 'Customer phone number.', required: true, type: 'tel' },
  { key: 'city', label: 'City', placeholder: 'Preferred city or dealer location for the test drive.', required: false, type: 'text' },
];

export default async function decorate(block, bridge) {
  const models = SAMPLE_DATA;
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // After the form is submitted the host runs the tool, which returns a
      // booking confirmation. Read those fields so we can show the result.
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      if (structuredContent && structuredContent.confirmation_id) {
        confirmation = {
          confirmation_id: structuredContent.confirmation_id,
          status: structuredContent.status,
          message: structuredContent.message,
        };
      }
    }
  }

  block.textContent = '';
  renderForm(block, models, bridge, confirmation);

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

function renderForm(block, models, bridge, confirmation) {
  const card = document.createElement('div');
  card.className = 'btd-card';

  // Hero image
  const hero = document.createElement('div');
  hero.className = 'btd-hero';
  const heroSrc = models[0]?.image_url;
  if (heroSrc) {
    const img = document.createElement('img');
    img.src = heroSrc;
    img.alt = models[0]?.name || 'Test drive vehicle';
    img.onerror = () => { hero.style.background = ACCENT; if (img.parentNode) img.parentNode.removeChild(img); };
    hero.appendChild(img);
  } else {
    hero.style.background = ACCENT;
  }
  card.appendChild(hero);

  // Header (palette-themed)
  const header = document.createElement('div');
  header.className = 'btd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'btd-title';
  title.textContent = 'Book Test Drive';
  const desc = document.createElement('p');
  desc.className = 'btd-desc';
  desc.textContent = 'Initiates a test drive booking by capturing the chosen model, customer contact details, and preferred dealer or location, then returns a confirmation of the scheduled request.';
  header.appendChild(title);
  header.appendChild(desc);
  card.appendChild(header);

  // Confirmation state — when the host has returned a booking result.
  if (confirmation) {
    const panel = document.createElement('div');
    panel.className = 'btd-confirmation';

    const badge = document.createElement('span');
    badge.className = 'btd-conf-status';
    badge.textContent = confirmation.status || 'submitted';
    panel.appendChild(badge);

    const msg = document.createElement('p');
    msg.className = 'btd-conf-message';
    msg.textContent = confirmation.message || 'Your test drive request has been submitted.';
    panel.appendChild(msg);

    if (confirmation.confirmation_id) {
      const id = document.createElement('p');
      id.className = 'btd-conf-id';
      id.textContent = `Confirmation ID: ${confirmation.confirmation_id}`;
      panel.appendChild(id);
    }

    card.appendChild(panel);
    block.appendChild(card);
    return;
  }

  // Form
  const form = document.createElement('form');
  form.className = 'btd-form';
  form.style.setProperty('--btd-accent', ACCENT);
  const inputs = {};

  FIELDS.forEach((f) => {
    const field = document.createElement('div');
    field.className = 'btd-field';

    const label = document.createElement('label');
    label.className = 'btd-label';
    label.textContent = f.required ? `${f.label} *` : f.label;
    label.htmlFor = `btd-${f.key}`;
    field.appendChild(label);

    let control;
    if (f.type === 'select') {
      control = document.createElement('select');
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = f.placeholder;
      ph.disabled = true;
      ph.selected = true;
      control.appendChild(ph);
      models.forEach((m) => {
        if (!m?.name) return;
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        control.appendChild(opt);
      });
    } else {
      control = document.createElement('input');
      control.type = f.type;
      control.placeholder = f.placeholder;
    }
    control.id = `btd-${f.key}`;
    control.className = 'btd-input';
    if (f.required) control.required = true;
    inputs[f.key] = control;
    field.appendChild(control);
    form.appendChild(field);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btd-submit';
  submit.textContent = 'Schedule Now';
  form.appendChild(submit);

  const status = document.createElement('p');
  status.className = 'btd-status';
  status.setAttribute('role', 'status');
  form.appendChild(status);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    let missing = false;
    FIELDS.forEach((f) => {
      const v = (inputs[f.key].value || '').trim();
      data[f.key] = v;
      if (f.required && !v) missing = true;
    });
    if (missing) {
      status.textContent = 'Please fill in all required fields.';
      status.classList.add('btd-status-error');
      return;
    }
    status.classList.remove('btd-status-error');
    const parts = [
      `Book a test drive for the ${data.model}.`,
      `Name: ${data.full_name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
    ];
    if (data.city) parts.push(`Preferred location: ${data.city}`);
    const message = parts.join(' ');
    if (bridge) {
      bridge.sendMessage(message);
      status.textContent = 'Request sent — confirming your test drive.';
    } else {
      status.textContent = 'Request submitted.';
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}
