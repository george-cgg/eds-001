// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DEALERS = [
  {
    name: 'Dacia Bucharest Central',
    address: 'Str. Victoriei 123, București 010101',
    phone: '+40 21 123 4567',
    services: ['Sales', 'Service', 'Parts']
  },
  {
    name: 'Dacia Cluj-Napoca',
    address: 'Calea Turzii 45, Cluj-Napoca 400495',
    phone: '+40 264 234 567',
    services: ['Sales', 'Service']
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

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let dealers = [];

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DEALERS;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "find_dealer"
      dealers = structuredContent?.dealers || [];
    }
  } else {
    dealers = SAMPLE_DEALERS;
  }

  block.textContent = '';
  render(block, dealers, bridge);

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

function render(block, dealers, bridge) {
  const container = document.createElement('div');
  container.className = 'find-dealer-container';

  // Always show search card
  const searchCard = document.createElement('div');
  searchCard.className = 'search-card';
  searchCard.style.cssText = `background:${theme?.bg ?? '#4a5942'};color:${theme?.fg ?? '#fff'}`;

  const pinIcon = document.createElement('div');
  pinIcon.className = 'pin-icon';
  pinIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  searchCard.appendChild(pinIcon);

  const heading = document.createElement('h2');
  heading.textContent = 'Find a dealer near you';
  searchCard.appendChild(heading);

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'input-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code...';
  input.setAttribute('aria-label', 'ZIP code or city');
  inputWrapper.appendChild(input);

  const searchBtn = document.createElement('button');
  searchBtn.className = 'search-btn';
  searchBtn.textContent = 'Search';
  searchBtn.style.background = PALETTE[0] || '#646b52';
  if (bridge) {
    searchBtn.addEventListener('click', () => {
      const query = input.value.trim();
      if (query) {
        bridge.sendMessage(`Find dealers near ${query}`);
      }
    });
  }
  inputWrapper.appendChild(searchBtn);

  searchCard.appendChild(inputWrapper);
  container.appendChild(searchCard);

  // Show results if available
  if (dealers && dealers.length > 0) {
    const resultsRow = document.createElement('div');
    resultsRow.className = 'results-row';

    dealers.slice(0, 2).forEach((dealer) => {
      const card = document.createElement('div');
      card.className = 'dealer-card';
      card.style.cssText = `background:${theme?.bg ?? '#4a5942'};color:${theme?.fg ?? '#fff'}`;

      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
      card.appendChild(pinCircle);

      const name = document.createElement('div');
      name.className = 'dealer-name';
      name.textContent = dealer.name || '';
      card.appendChild(name);

      const address = document.createElement('div');
      address.className = 'dealer-address';
      address.textContent = dealer.address || '';
      card.appendChild(address);

      if (dealer.phone) {
        const phone = document.createElement('div');
        phone.className = 'dealer-phone';
        phone.textContent = dealer.phone;
        phone.style.color = PALETTE[0] || '#646b52';
        card.appendChild(phone);
      }

      if (dealer.services && dealer.services.length > 0) {
        const services = document.createElement('div');
        services.className = 'dealer-services';
        services.textContent = dealer.services.join(' • ');
        card.appendChild(services);
      }

      resultsRow.appendChild(card);
    });

    container.appendChild(resultsRow);
  }

  block.appendChild(container);
}