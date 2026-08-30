// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: "Dacia Bucharest Nord",
    address: "Str. Fabrica de Glucoză 11, Sector 2, București 020331",
    phone: "+40 21 252 5500",
    services: ["Sales", "Service", "Parts"],
    distance_km: 2.3
  },
  {
    name: "Dacia Otopeni",
    address: "Șoseaua București-Ploiești 42D, Otopeni 075100",
    phone: "+40 21 350 1200",
    services: ["Sales", "Service"],
    distance_km: 8.7
  }
];

// Brand palette from BuildWidgetRequest — replace with actual palette[] from the action payload.
// getThemedCardBg() darkens palette[0] to luminance ≤ 0.12 so white text has WCAG AA contrast.
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
  let dealers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DATA;
    } else {
      // Production — data comes from the MCP tool result.
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
  renderStoreLocator(block, dealers, bridge);

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

function renderStoreLocator(block, dealers, bridge) {
  if (!dealers || dealers.length === 0) {
    // Empty state — show search card
    const searchCard = document.createElement('div');
    searchCard.className = 'search-card';
    searchCard.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    // Pin icon
    const pinIcon = document.createElement('div');
    pinIcon.className = 'pin-icon';
    pinIcon.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    searchCard.appendChild(pinIcon);

    // Heading
    const heading = document.createElement('h2');
    heading.textContent = 'Find a dealer near you';
    searchCard.appendChild(heading);

    // Input
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter ZIP code...';
    searchCard.appendChild(input);

    // Button
    const button = document.createElement('button');
    button.textContent = 'Search';
    if (bridge) {
      button.addEventListener('click', () => {
        const location = input.value.trim();
        if (location) {
          bridge.sendMessage(`Find dealers near ${location}`);
        }
      });
    }
    searchCard.appendChild(button);

    block.appendChild(searchCard);
  } else {
    // Results state — show dealer cards
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';

    // Show up to 2 dealers
    const displayDealers = dealers.slice(0, 2);

    displayDealers.forEach(dealer => {
      const card = document.createElement('div');
      card.className = 'store-card';
      card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

      // Pin circle
      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      card.appendChild(pinCircle);

      // Store name
      const name = document.createElement('h3');
      name.className = 'store-name';
      name.textContent = dealer.name || '';
      card.appendChild(name);

      // Address
      if (dealer.address) {
        const address = document.createElement('p');
        address.className = 'store-address';
        address.textContent = dealer.address;
        card.appendChild(address);
      }

      // Phone
      if (dealer.phone) {
        const phone = document.createElement('a');
        phone.className = 'store-phone';
        phone.href = `tel:${dealer.phone}`;
        phone.textContent = dealer.phone;
        card.appendChild(phone);
      }

      // Services
      if (dealer.services && dealer.services.length > 0) {
        const services = document.createElement('div');
        services.className = 'store-services';
        services.textContent = `Services: ${dealer.services.join(', ')}`;
        card.appendChild(services);
      }

      // Distance (as hours if present)
      if (dealer.distance_km) {
        const hours = document.createElement('div');
        hours.className = 'store-hours';
        hours.textContent = `${dealer.distance_km} km away`;
        card.appendChild(hours);
      }

      resultsContainer.appendChild(card);
    });

    block.appendChild(resultsContainer);
  }
}
