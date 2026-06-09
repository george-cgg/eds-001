// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
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

export default async function decorate(block, bridge) {
  const theme = getThemedCardBg(PALETTE);
  let confirmationData = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      confirmationData = structuredContent;
    }
  }

  block.textContent = '';

  if (confirmationData && confirmationData.confirmation_id) {
    renderConfirmation(block, confirmationData, theme);
  } else {
    renderForm(block, bridge, theme);
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

function renderForm(block, bridge, theme) {
  const card = document.createElement('div');
  card.className = 'booking-card';

  // Hero image
  const heroImg = document.createElement('div');
  heroImg.className = 'hero-image';
  const img = document.createElement('img');
  img.src = SAMPLE_DATA[0].image_url;
  img.alt = 'Book Test Drive';
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  heroImg.appendChild(img);
  card.appendChild(heroImg);

  // Header with darkened palette bg
  const header = document.createElement('div');
  header.className = 'booking-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h2');
  title.textContent = 'Book Test Drive';
  title.style.cssText = `color:${theme?.fg ?? '#fff'}`;
  header.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = 'Submits a test drive booking request for a selected Dacia model at a preferred dealer location, requiring contact details and preferred date, and returns a booking confirmation.';
  desc.style.cssText = `color:${theme?.fg ?? '#fff'}`;
  header.appendChild(desc);

  card.appendChild(header);

  // Form container
  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  const form = document.createElement('form');
  form.className = 'booking-form';

  // Model name field (required)
  const modelGroup = document.createElement('div');
  modelGroup.className = 'form-group';
  const modelLabel = document.createElement('label');
  modelLabel.textContent = 'MODEL NAME *';
  modelLabel.setAttribute('for', 'model-name');
  const modelSelect = document.createElement('select');
  modelSelect.id = 'model-name';
  modelSelect.name = 'model_name';
  modelSelect.required = true;
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a model...';
  modelSelect.appendChild(defaultOption);
  ['Bigster', 'Duster', 'Logan', 'Sandero Stepway', 'Jogger', 'Spring'].forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    modelSelect.appendChild(opt);
  });
  modelGroup.appendChild(modelLabel);
  modelGroup.appendChild(modelSelect);
  form.appendChild(modelGroup);

  // Preferred date field (required)
  const dateGroup = document.createElement('div');
  dateGroup.className = 'form-group';
  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'PREFERRED DATE *';
  dateLabel.setAttribute('for', 'preferred-date');
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'preferred-date';
  dateInput.name = 'preferred_date';
  dateInput.required = true;
  dateGroup.appendChild(dateLabel);
  dateGroup.appendChild(dateInput);
  form.appendChild(dateGroup);

  // Full name field (required)
  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'FULL NAME *';
  nameLabel.setAttribute('for', 'full-name');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'full-name';
  nameInput.name = 'full_name';
  nameInput.required = true;
  nameInput.placeholder = 'Your full name';
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);

  // Phone field (required)
  const phoneGroup = document.createElement('div');
  phoneGroup.className = 'form-group';
  const phoneLabel = document.createElement('label');
  phoneLabel.textContent = 'PHONE *';
  phoneLabel.setAttribute('for', 'phone');
  const phoneInput = document.createElement('input');
  phoneInput.type = 'tel';
  phoneInput.id = 'phone';
  phoneInput.name = 'phone';
  phoneInput.required = true;
  phoneInput.placeholder = 'Contact phone number';
  phoneGroup.appendChild(phoneLabel);
  phoneGroup.appendChild(phoneInput);
  form.appendChild(phoneGroup);

  // Email field (optional)
  const emailGroup = document.createElement('div');
  emailGroup.className = 'form-group';
  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'EMAIL';
  emailLabel.setAttribute('for', 'email');
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.placeholder = 'Contact email address';
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  form.appendChild(emailGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Book Test Drive';
  form.appendChild(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (bridge) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      bridge.sendMessage(`Book a test drive for ${data.model_name} on ${data.preferred_date}. Name: ${data.full_name}, Phone: ${data.phone}${data.email ? ', Email: ' + data.email : ''}`);
    }
  });

  formContainer.appendChild(form);
  card.appendChild(formContainer);
  block.appendChild(card);
}

function renderConfirmation(block, data, theme) {
  const card = document.createElement('div');
  card.className = 'booking-card confirmation-card';

  const header = document.createElement('div');
  header.className = 'booking-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h2');
  title.textContent = 'Booking Confirmed';
  title.style.cssText = `color:${theme?.fg ?? '#fff'}`;
  header.appendChild(title);
  card.appendChild(header);

  const confirmContainer = document.createElement('div');
  confirmContainer.className = 'confirmation-container';

  const message = document.createElement('p');
  message.className = 'confirmation-message';
  message.textContent = data.message || 'Your test drive booking has been confirmed.';
  confirmContainer.appendChild(message);

  const details = document.createElement('div');
  details.className = 'confirmation-details';

  const confirmId = document.createElement('p');
  confirmId.innerHTML = `<strong>Confirmation ID:</strong> ${data.confirmation_id || 'N/A'}`;
  details.appendChild(confirmId);

  const status = document.createElement('p');
  status.innerHTML = `<strong>Status:</strong> ${data.status || 'N/A'}`;
  details.appendChild(status);

  const model = document.createElement('p');
  model.innerHTML = `<strong>Model:</strong> ${data.model_name || 'N/A'}`;
  details.appendChild(model);

  const appointmentDate = document.createElement('p');
  appointmentDate.innerHTML = `<strong>Appointment Date:</strong> ${data.appointment_date || 'N/A'}`;
  details.appendChild(appointmentDate);

  confirmContainer.appendChild(details);
  card.appendChild(confirmContainer);
  block.appendChild(card);
}