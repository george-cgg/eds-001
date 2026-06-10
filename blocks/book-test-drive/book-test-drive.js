// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
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

export default async function decorate(block, bridge) {
  let models = SAMPLE_DATA;
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;

    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      if (structuredContent && structuredContent.confirmation_id) {
        confirmation = structuredContent;
      }
    }
  }

  block.textContent = '';

  if (confirmation) {
    renderConfirmation(block, confirmation);
  } else {
    renderForm(block, models, bridge);
  }

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

function renderForm(block, models, bridge) {
  const container = document.createElement('div');
  container.className = 'booking-container';

  const card = document.createElement('div');
  card.className = 'booking-card';

  // Hero image
  const heroContainer = document.createElement('div');
  heroContainer.className = 'hero-image';
  const heroImg = document.createElement('img');
  heroImg.src = models[0].image_url;
  heroImg.alt = models[0].name;
  heroImg.id = 'selected-model-image';
  heroContainer.appendChild(heroImg);
  card.appendChild(heroContainer);

  // Header with darkened palette background
  const header = document.createElement('div');
  header.className = 'booking-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h2');
  title.textContent = 'Programează Test Drive';
  header.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = 'Selectează modelul și completează datele pentru a programa un test drive.';
  header.appendChild(desc);

  card.appendChild(header);

  // Form
  const form = document.createElement('form');
  form.className = 'booking-form';

  // Model selection
  const modelGroup = document.createElement('div');
  modelGroup.className = 'form-group';

  const modelLabel = document.createElement('label');
  modelLabel.textContent = 'MODEL NAME';
  modelLabel.htmlFor = 'model_name';
  modelGroup.appendChild(modelLabel);

  const modelSelect = document.createElement('select');
  modelSelect.id = 'model_name';
  modelSelect.name = 'model_name';
  modelSelect.required = true;

  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.name;
    option.textContent = `${model.name} - ${model.price}`;
    modelSelect.appendChild(option);
  });

  modelSelect.addEventListener('change', (e) => {
    const selected = models.find(m => m.name === e.target.value);
    if (selected) {
      heroImg.src = selected.image_url;
      heroImg.alt = selected.name;
    }
  });

  modelGroup.appendChild(modelSelect);
  form.appendChild(modelGroup);

  // Preferred date
  const dateGroup = document.createElement('div');
  dateGroup.className = 'form-group';

  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'PREFERRED DATE';
  dateLabel.htmlFor = 'preferred_date';
  dateGroup.appendChild(dateLabel);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'preferred_date';
  dateInput.name = 'preferred_date';
  dateInput.placeholder = 'Preferred date for the test drive in YYYY-MM-DD format.';
  dateGroup.appendChild(dateInput);
  form.appendChild(dateGroup);

  // Full name
  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'FULL NAME';
  nameLabel.htmlFor = 'full_name';
  nameGroup.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'full_name';
  nameInput.name = 'full_name';
  nameInput.required = true;
  nameInput.placeholder = 'Full name of the person booking.';
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);

  // Phone
  const phoneGroup = document.createElement('div');
  phoneGroup.className = 'form-group';

  const phoneLabel = document.createElement('label');
  phoneLabel.textContent = 'PHONE';
  phoneLabel.htmlFor = 'phone';
  phoneGroup.appendChild(phoneLabel);

  const phoneInput = document.createElement('input');
  phoneInput.type = 'tel';
  phoneInput.id = 'phone';
  phoneInput.name = 'phone';
  phoneInput.required = true;
  phoneInput.placeholder = 'Contact phone number.';
  phoneGroup.appendChild(phoneInput);
  form.appendChild(phoneGroup);

  // Email
  const emailGroup = document.createElement('div');
  emailGroup.className = 'form-group';

  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'EMAIL';
  emailLabel.htmlFor = 'email';
  emailGroup.appendChild(emailLabel);

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.placeholder = 'Contact email address.';
  emailGroup.appendChild(emailInput);
  form.appendChild(emailGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Schedule Test Drive';
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (bridge) {
      const formData = {
        model_name: modelSelect.value,
        preferred_date: dateInput.value || undefined,
        full_name: nameInput.value,
        phone: phoneInput.value,
        email: emailInput.value || undefined
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        await bridge.callTool('book_test_drive', formData);
      } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Schedule Test Drive';
        alert('Failed to book test drive. Please try again.');
      }
    } else {
      alert('Form submitted (standalone mode)');
    }
  });

  card.appendChild(form);
  container.appendChild(card);
  block.appendChild(container);
}

function renderConfirmation(block, confirmation) {
  const container = document.createElement('div');
  container.className = 'booking-container';

  const card = document.createElement('div');
  card.className = 'confirmation-card';
  card.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const icon = document.createElement('div');
  icon.className = 'confirmation-icon';
  icon.textContent = '✓';
  card.appendChild(icon);

  const title = document.createElement('h2');
  title.textContent = 'Test Drive Confirmed';
  card.appendChild(title);

  const details = document.createElement('div');
  details.className = 'confirmation-details';

  const addDetail = (label, value) => {
    if (value) {
      const row = document.createElement('div');
      row.className = 'detail-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'detail-label';
      labelEl.textContent = label;
      row.appendChild(labelEl);

      const valueEl = document.createElement('span');
      valueEl.className = 'detail-value';
      valueEl.textContent = value;
      row.appendChild(valueEl);

      details.appendChild(row);
    }
  };

  addDetail('Confirmation ID:', confirmation.confirmation_id);
  addDetail('Status:', confirmation.status);
  addDetail('Dealer:', confirmation.dealer_name);
  addDetail('Date:', confirmation.appointment_date);

  card.appendChild(details);
  container.appendChild(card);
  block.appendChild(container);
}
