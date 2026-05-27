// Sample data for standalone/preview mode - Dacia vehicle models
const SAMPLE_DATA = [
  {
    "name": "Dacia Bigster",
    "description": "Large SUV with hybrid-G 150 4x4 and 702L trunk capacity.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.largex2.webp/7caee35b86.webp",
    "price": "from 23,350 EUR",
    "category": "SUV"
  },
  {
    "name": "Dacia Duster",
    "description": "Compact SUV with hybrid-G 150 4x4 and 217mm ground clearance.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/duster-p1310/hero-zone/dacia-duster-p1310-hero-zone-background-desktop-003.jpg.ximg.largex2.webp/310f84027e.webp",
    "price": "from 19,500 EUR",
    "category": "SUV"
  },
  {
    "name": "Dacia Logan",
    "description": "Sedan with Eco-G 120 GPL engine and up to 1500km range.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/logan/logan-li1-ph2/herozone-banners/dacia-logan-li1-ph2-herozone-background-001-desktop.jpg.ximg.largex2.webp/f7b183dd4d.webp",
    "price": "from 14,950 EUR",
    "category": "Sedan"
  },
  {
    "name": "Dacia Jogger",
    "description": "Versatile family vehicle with 5 or 7 seats and hybrid 155 engine.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/homepage-banner/order-opening/dacia-bigster-homepage-001-desktop.jpg.ximg.largex2.webp/af86c2985c.webp",
    "price": "from 19,000 EUR",
    "category": "MPV"
  },
  {
    "name": "Dacia Spring",
    "description": "100% electric city car with 225km WLTP range and 315km urban range.",
    "image_url": "https://cdn.group.renault.com/dac/master/dacia-vn/editorial/new-homepage/Dacia_new_range_4_cars_2560x1440_V2.jpg.ximg.large.webp/9ea2771775.webp",
    "price": "from 18,900 EUR",
    "category": "Electric"
  }
];

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
    const mid=(lo+hi)/2;
    if (relLum(Math.round(r*mid),Math.round(g*mid),Math.round(b*mid)) > 0.12) hi=mid; else lo=mid;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;

    if (!isPreview) {
      // Production mode - check if we have a confirmation result
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;

      if (structuredContent && structuredContent.confirmation_id) {
        renderConfirmation(block, structuredContent);
        bridge.reportSize(block.offsetWidth, block.offsetHeight);
        let resizeTimer;
        const ro = new ResizeObserver(() => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
        });
        ro.observe(block);
        return;
      }
    }
  }

  // Render form (preview mode or when no result yet)
  renderForm(block, bridge);

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

function renderForm(block, bridge) {
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'booking-container';

  // Hero image
  if (SAMPLE_DATA[0].image_url) {
    const heroImg = document.createElement('img');
    heroImg.src = SAMPLE_DATA[0].image_url;
    heroImg.alt = 'Dacia vehicle';
    heroImg.className = 'hero-image';
    heroImg.onerror = () => {
      const fallback = document.createElement('div');
      fallback.className = 'hero-image';
      fallback.style.cssText = 'width:100%;height:140px;background-color:#378ef0;';
      heroImg.parentNode.replaceChild(fallback, heroImg);
    };
    container.appendChild(heroImg);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'hero-image';
    fallback.style.cssText = 'width:100%;height:140px;background-color:#378ef0;';
    container.appendChild(fallback);
  }

  // Header with title and description
  const header = document.createElement('div');
  header.className = 'booking-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const title = document.createElement('h2');
  title.textContent = 'Book Test Drive';
  header.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'description';
  desc.textContent = 'Initiates a test drive booking for a selected Dacia model by collecting the model name and preferred dealer location, returning a confirmation with next steps.';
  header.appendChild(desc);

  container.appendChild(header);

  // Form fields container
  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  const form = document.createElement('form');
  form.className = 'booking-form';

  // Model name field (required)
  const modelGroup = document.createElement('div');
  modelGroup.className = 'form-group';

  const modelLabel = document.createElement('label');
  modelLabel.textContent = 'MODEL NAME';
  modelLabel.htmlFor = 'model-name';

  const required = document.createElement('span');
  required.className = 'required';
  required.textContent = ' *';
  modelLabel.appendChild(required);

  modelGroup.appendChild(modelLabel);

  const modelSelect = document.createElement('select');
  modelSelect.id = 'model-name';
  modelSelect.name = 'model_name';
  modelSelect.required = true;

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a Dacia model';
  placeholder.disabled = true;
  placeholder.selected = true;
  modelSelect.appendChild(placeholder);

  const modelOptions = ['Bigster', 'Duster', 'Logan', 'Sandero Stepway', 'Spring', 'Jogger', 'Sandero'];
  modelOptions.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });

  modelGroup.appendChild(modelSelect);
  form.appendChild(modelGroup);

  // Location field (optional)
  const locationGroup = document.createElement('div');
  locationGroup.className = 'form-group';

  const locationLabel = document.createElement('label');
  locationLabel.textContent = 'LOCATION';
  locationLabel.htmlFor = 'location';
  locationGroup.appendChild(locationLabel);

  const locationInput = document.createElement('input');
  locationInput.id = 'location';
  locationInput.name = 'location';
  locationInput.type = 'text';
  locationInput.placeholder = 'City or address to find nearby dealer';
  locationGroup.appendChild(locationInput);

  form.appendChild(locationGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Schedule Test Drive';
  submitBtn.className = 'submit-btn';
  form.appendChild(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const modelName = modelSelect.value;
    const location = locationInput.value;

    if (bridge) {
      const message = location
        ? `Book a test drive for ${modelName} near ${location}`
        : `Book a test drive for ${modelName}`;
      bridge.sendMessage(message);
    }
  });

  formContainer.appendChild(form);
  container.appendChild(formContainer);
  block.appendChild(container);
}

function renderConfirmation(block, confirmation) {
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'confirmation-container';
  container.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  const icon = document.createElement('div');
  icon.className = 'check-icon';
  icon.textContent = '✓';
  container.appendChild(icon);

  const title = document.createElement('h2');
  title.textContent = 'Booking Confirmed';
  container.appendChild(title);

  const details = document.createElement('div');
  details.className = 'confirmation-details';

  if (confirmation.confirmation_id) {
    const idP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Confirmation ID: ';
    idP.appendChild(strong);
    idP.appendChild(document.createTextNode(confirmation.confirmation_id));
    details.appendChild(idP);
  }

  if (confirmation.status) {
    const statusP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Status: ';
    statusP.appendChild(strong);
    statusP.appendChild(document.createTextNode(confirmation.status));
    details.appendChild(statusP);
  }

  if (confirmation.model) {
    const modelP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Model: ';
    modelP.appendChild(strong);
    modelP.appendChild(document.createTextNode(confirmation.model));
    details.appendChild(modelP);
  }

  if (confirmation.dealer_name) {
    const dealerP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Dealer: ';
    dealerP.appendChild(strong);
    dealerP.appendChild(document.createTextNode(confirmation.dealer_name));
    details.appendChild(dealerP);
  }

  if (confirmation.message) {
    const msgP = document.createElement('p');
    msgP.className = 'message';
    msgP.textContent = confirmation.message;
    details.appendChild(msgP);
  }

  container.appendChild(details);
  block.appendChild(container);
}
