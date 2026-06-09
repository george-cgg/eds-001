// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge context.
const SAMPLE_DATA = [
  { name: 'Bigster', description: 'Dacia\'s flagship SUV combining rugged design with spacious interior.', image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/bigster-herozone-desktop.jpg', category: 'SUV' },
  { name: 'Duster', description: 'Versatile compact SUV built for both city driving and off-road adventures.', image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/duster-herozone-desktop.jpg', category: 'SUV' },
  { name: 'Noul Logan', description: 'Modern sedan offering comfort and efficiency for everyday commuting.', image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/logan-herozone-desktop.jpg', category: 'Sedan' },
  { name: 'Noul Sandero Stepway', description: 'Crossover-styled hatchback with elevated ride height and robust styling.', image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/sandero-stepway-herozone-desktop.jpg', category: 'Hatchback' },
  { name: 'Spring', description: 'Affordable fully electric city car with zero emissions.', image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/spring-herozone-desktop.jpg', category: 'Electric' },
  { name: 'Noul Jogger', description: 'Spacious 7-seat family vehicle blending MPV practicality with SUV style.', image_url: 'https://cdn.group.renault.com/ren/ro/transversal-assets/pages/hero-zone/jogger-herozone-desktop.jpg', category: 'MPV' }
];

// Brand palette from BuildWidgetRequest — used to derive card header background.
const PALETTE = ['#646b52','#555555','#6699cc'];

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
  let isProduction = false;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    isProduction = !isPreview;
  }

  block.textContent = '';
  renderBookingForm(block, models, bridge, isProduction);

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

function renderBookingForm(block, models, bridge, isProduction) {
  const container = document.createElement('div');
  container.className = 'booking-container';

  const card = document.createElement('div');
  card.className = 'booking-card';

  // Header section with darkened palette background
  const header = document.createElement('div');
  header.className = 'form-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};padding:16px;`;

  const title = document.createElement('h2');
  title.textContent = 'Book Test Drive';
  title.style.cssText = 'margin:0 0 8px;font-size:15px;font-weight:700;';
  header.appendChild(title);

  const description = document.createElement('p');
  description.textContent = 'Submits a test drive booking request for a selected Dacia model at a preferred dealer location, accepting the model name, customer contact details, and preferred date to schedule the appointment.';
  description.style.cssText = 'margin:0;font-size:12px;line-height:1.4;opacity:0.75;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;';
  header.appendChild(description);

  card.appendChild(header);

  // Form section
  const form = document.createElement('form');
  form.className = 'booking-form';
  form.style.cssText = `padding:16px;background:${theme?.bg ?? '#1a1a1a'};`;

  // Model dropdown
  const modelField = createFormField('model_name', 'MODEL NAME', 'select', 'Dacia model to test drive.', true, models);
  form.appendChild(modelField);

  // Full name
  const nameField = createFormField('full_name', 'FULL NAME', 'text', 'Customer full name.', true);
  form.appendChild(nameField);

  // Email
  const emailField = createFormField('email', 'EMAIL', 'email', 'Customer email address.', true);
  form.appendChild(emailField);

  // Phone
  const phoneField = createFormField('phone', 'PHONE', 'tel', 'Customer phone number.', true);
  form.appendChild(phoneField);

  // Preferred date
  const dateField = createFormField('preferred_date', 'PREFERRED DATE', 'date', 'Preferred test drive date.', false);
  form.appendChild(dateField);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Programează Test Drive';
  submitBtn.style.cssText = `width:100%;padding:12px;border:none;border-radius:6px;background:${PALETTE[0]};color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;transition:opacity 0.15s;`;
  form.appendChild(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Validate required fields
    if (!data.model_name || !data.full_name || !data.email || !data.phone) {
      alert('Please fill in all required fields (marked with *)');
      return;
    }

    if (bridge && isProduction) {
      // Send natural language booking request
      let message = `I'd like to book a test drive for the ${data.model_name}. `;
      message += `Name: ${data.full_name}, Email: ${data.email}, Phone: ${data.phone}`;
      if (data.preferred_date) {
        message += `, Preferred date: ${data.preferred_date}`;
      }
      bridge.sendMessage(message);
    } else {
      // Preview mode - show alert
      alert(`Test drive booking submitted:\n\nModel: ${data.model_name}\nName: ${data.full_name}\nEmail: ${data.email}\nPhone: ${data.phone}\nDate: ${data.preferred_date || 'Not specified'}`);
    }
  });

  card.appendChild(form);
  container.appendChild(card);
  block.appendChild(container);
}

function createFormField(name, label, type, placeholder, required, options = null) {
  const fieldGroup = document.createElement('div');
  fieldGroup.className = 'form-field';
  fieldGroup.style.cssText = 'margin-bottom:12px;';

  const labelEl = document.createElement('label');
  labelEl.htmlFor = name;
  labelEl.textContent = label + (required ? ' *' : '');
  labelEl.style.cssText = 'display:block;font-size:10px;font-weight:600;text-transform:uppercase;opacity:0.5;margin-bottom:6px;color:rgba(255,255,255,0.5);';
  fieldGroup.appendChild(labelEl);

  let inputEl;
  if (type === 'select' && options) {
    inputEl = document.createElement('select');
    inputEl.id = name;
    inputEl.name = name;
    inputEl.required = required;
    inputEl.style.cssText = 'width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;font-size:12px;background:rgba(255,255,255,0.1);color:#fff;';

    options.forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.name;
      optionEl.textContent = opt.name;
      inputEl.appendChild(optionEl);
    });
  } else {
    inputEl = document.createElement('input');
    inputEl.type = type;
    inputEl.id = name;
    inputEl.name = name;
    inputEl.placeholder = placeholder;
    inputEl.required = required;
    inputEl.style.cssText = 'width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;font-size:12px;box-sizing:border-box;background:rgba(255,255,255,0.1);color:#fff;';
  }

  fieldGroup.appendChild(inputEl);
  return fieldGroup;
}
