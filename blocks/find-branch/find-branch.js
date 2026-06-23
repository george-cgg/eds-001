// synthetic fixture — no sample data available from Action Planner
const SAMPLE_BRANCHES = [
  {
    name: 'Financial Center - Downtown Branch',
    address: '123 Main Street, San Francisco, CA 94102',
    phone: '(415) 555-0100',
    hours: 'Mon-Fri 9AM-5PM, Sat 9AM-1PM'
  },
  {
    name: 'ATM - Market Street',
    address: '456 Market Street, San Francisco, CA 94105',
    phone: 'N/A',
    hours: '24/7'
  }
];

const PALETTE = ['#012169', '#e31837', '#a50e28', '#3860be'];

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
  let branches;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      branches = SAMPLE_BRANCHES;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.branches — bare array outputSchema; key derived from actionName "find_branch"
      branches = structuredContent?.branches || [];
    }
  } else {
    branches = SAMPLE_BRANCHES;
  }

  block.textContent = '';
  
  if (branches && branches.length > 0) {
    renderBranches(block, branches.slice(0, 2), bridge);
  } else {
    renderSearchCard(block, bridge);
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

function renderBranches(block, branches, bridge) {
  const container = document.createElement('div');
  container.className = 'store-cards';

  branches.forEach(branch => {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

    const pinIcon = document.createElement('div');
    pinIcon.className = 'pin-icon';
    pinIcon.textContent = '📍';
    card.appendChild(pinIcon);

    const name = document.createElement('p');
    name.className = 'store-name';
    name.textContent = branch.name || '';
    card.appendChild(name);

    const address = document.createElement('p');
    address.className = 'store-address';
    address.textContent = branch.address || '';
    card.appendChild(address);

    if (branch.phone && branch.phone !== 'N/A') {
      const phone = document.createElement('p');
      phone.className = 'store-phone';
      phone.textContent = branch.phone;
      card.appendChild(phone);
    }

    const hours = document.createElement('p');
    hours.className = 'store-hours';
    hours.textContent = branch.hours || '';
    card.appendChild(hours);

    container.appendChild(card);
  });

  block.appendChild(container);
}

function renderSearchCard(block, bridge) {
  const card = document.createElement('div');
  card.className = 'search-card';
  card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

  const pinIcon = document.createElement('div');
  pinIcon.className = 'pin-icon-large';
  pinIcon.textContent = '📍';
  card.appendChild(pinIcon);

  const heading = document.createElement('h2');
  heading.textContent = 'Find a branch near you';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter ZIP code...';
  input.setAttribute('aria-label', 'ZIP code');
  card.appendChild(input);

  const button = document.createElement('button');
  button.textContent = 'Search';
  if (bridge) {
    button.addEventListener('click', () => {
      const zip = input.value.trim();
      if (zip) {
        bridge.sendMessage(`Find a branch near ${zip}`);
      }
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const zip = input.value.trim();
        if (zip) {
          bridge.sendMessage(`Find a branch near ${zip}`);
        }
      }
    });
  }
  card.appendChild(button);

  block.appendChild(card);
}
