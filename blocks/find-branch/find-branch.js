// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    name: 'Bank of America Financial Center',
    address: '1455 Market Street, Suite 100, San Francisco, CA 94103',
    phone: '(415) 622-8000',
    hours: 'Mon-Fri 9:00 AM - 5:00 PM, Sat 9:00 AM - 2:00 PM'
  },
  {
    name: 'Market Street ATM',
    address: '50 Beale Street, San Francisco, CA 94105',
    phone: '',
    hours: '24/7'
  },
  {
    name: 'Financial Center - Union Square',
    address: '345 Stockton Street, San Francisco, CA 94108',
    phone: '(415) 622-3400',
    hours: 'Mon-Fri 9:00 AM - 5:00 PM'
  }
];

// Brand palette from BuildWidgetRequest — used to derive card background.
const PALETTE = ['#012169', '#e31837', '#a50e28'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (relLum(Math.round(r * mid), Math.round(g * mid), Math.round(b * mid)) > 0.12) hi = mid; else lo = mid;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let locations;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      locations = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.branches — bare array outputSchema; key derived from actionName "find_branch"
      locations = structuredContent?.branches || [];
    }
  } else {
    locations = SAMPLE_DATA;
  }

  block.textContent = '';
  renderLocator(block, locations, bridge);

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

function renderLocator(block, locations, bridge) {
  const container = document.createElement('div');
  container.className = 'locator-container';

  if (!locations || locations.length === 0) {
    // Empty state: search card
    const searchCard = document.createElement('div');
    searchCard.className = 'search-card';
    searchCard.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

    const icon = document.createElement('div');
    icon.className = 'pin-icon';
    icon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    searchCard.appendChild(icon);

    const heading = document.createElement('h3');
    heading.textContent = 'Find a financial center near you';
    searchCard.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'zip-input';
    input.placeholder = 'Enter ZIP code...';
    searchCard.appendChild(input);

    const button = document.createElement('button');
    button.className = 'search-btn';
    button.textContent = 'Find Nearby';
    if (bridge) {
      button.addEventListener('click', () => {
        const zip = input.value.trim();
        if (zip) {
          bridge.sendMessage(`Find branches near ${zip}`);
        }
      });
    }
    searchCard.appendChild(button);

    container.appendChild(searchCard);
  } else {
    // Results state: horizontal flex row of store cards
    const resultsRow = document.createElement('div');
    resultsRow.className = 'results-row';

    const displayLocations = locations.slice(0, 2);
    displayLocations.forEach((loc) => {
      const card = document.createElement('div');
      card.className = 'location-card';
      card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      card.appendChild(pinCircle);

      const name = document.createElement('div');
      name.className = 'location-name';
      name.textContent = loc.name || '';
      card.appendChild(name);

      const address = document.createElement('div');
      address.className = 'location-address';
      address.textContent = loc.address || '';
      card.appendChild(address);

      if (loc.phone) {
        const phone = document.createElement('div');
        phone.className = 'location-phone';
        phone.textContent = loc.phone;
        card.appendChild(phone);
      }

      const hours = document.createElement('div');
      hours.className = 'location-hours';
      hours.textContent = loc.hours || '';
      card.appendChild(hours);

      resultsRow.appendChild(card);
    });

    container.appendChild(resultsRow);
  }

  block.appendChild(container);
}