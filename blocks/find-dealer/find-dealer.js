// Sample dealer data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Dacia Paris Center',
    address: '123 Avenue des Champs-Élysées, 75008 Paris',
    phone: '+33 1 23 45 67 89',
    services: ['Sales', 'Service', 'Parts'],
    distance_km: 2.4
  },
  {
    name: 'Dacia Lyon South',
    address: '456 Rue de la République, 69002 Lyon',
    phone: '+33 4 78 90 12 34',
    services: ['Sales', 'Service'],
    distance_km: 5.8
  }
];

// Brand palette from BuildWidgetRequest — used to derive card background.
const PALETTE = ['#646b52', '#555555', '#6699cc', '#0000ee'];

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
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let dealers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DATA;
    } else {
      // Production — data from MCP tool result
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "find_dealer"
      dealers = structuredContent?.dealers || [];
    }
  } else {
    // Standalone EDS preview
    dealers = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!dealers || dealers.length === 0) {
    renderEmptyState(block, bridge);
  } else {
    renderDealers(block, dealers, bridge);
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

function renderEmptyState(block, bridge) {
  const container = document.createElement('div');
  container.className = 'find-dealer-empty';
  container.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

  // Pin icon
  const icon = document.createElement('div');
  icon.className = 'pin-icon';
  icon.innerHTML = '📍';
  icon.style.cssText = `opacity:0.7;color:${theme?.fg ?? '#fff'}`;
  container.appendChild(icon);

  // Heading
  const heading = document.createElement('h2');
  heading.textContent = 'Find a store near you';
  heading.className = 'empty-heading';
  container.appendChild(heading);

  // Input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code…';
  input.className = 'zip-input';
  input.setAttribute('aria-label', 'ZIP code or city');
  container.appendChild(input);

  // Button
  const button = document.createElement('button');
  button.textContent = 'Find Nearest Dealer';
  button.className = 'search-btn';
  if (bridge) {
    button.addEventListener('click', () => {
      const location = input.value.trim();
      if (location) {
        bridge.sendMessage(`Find Dacia dealers near ${location}`);
      }
    });
  }
  container.appendChild(button);

  block.appendChild(container);
}

function renderDealers(block, dealers, bridge) {
  const container = document.createElement('div');
  container.className = 'dealers-row';

  // Show up to 2 dealers
  const displayDealers = dealers.slice(0, 2);

  displayDealers.forEach((dealer) => {
    const card = document.createElement('div');
    card.className = 'dealer-card';
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    // Pin circle
    const pinCircle = document.createElement('div');
    pinCircle.className = 'pin-circle';
    pinCircle.innerHTML = '📍';
    card.appendChild(pinCircle);

    // Name
    const name = document.createElement('h3');
    name.className = 'dealer-name';
    name.textContent = dealer.name || '';
    name.style.cssText = `color:${theme?.fg ?? '#fff'}`;
    card.appendChild(name);

    // Address
    if (dealer.address) {
      const address = document.createElement('p');
      address.className = 'dealer-address';
      address.textContent = dealer.address;
      card.appendChild(address);
    }

    // Phone
    if (dealer.phone) {
      const phone = document.createElement('a');
      phone.className = 'dealer-phone';
      phone.href = `tel:${dealer.phone}`;
      phone.textContent = dealer.phone;
      phone.style.color = PALETTE[0] || '#646b52';
      card.appendChild(phone);
    }

    // Hours/Services
    if (dealer.services && dealer.services.length > 0) {
      const services = document.createElement('p');
      services.className = 'dealer-services';
      services.textContent = dealer.services.join(', ');
      card.appendChild(services);
    }

    // Distance
    if (dealer.distance_km) {
      const distance = document.createElement('p');
      distance.className = 'dealer-distance';
      distance.textContent = `${dealer.distance_km} km away`;
      card.appendChild(distance);
    }

    container.appendChild(card);
  });

  block.appendChild(container);
}
