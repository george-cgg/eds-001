// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
// synthetic fixture — no sample data available from Action Planner
const SAMPLE_DATA = [
  {
    "name": "Lloyds Bank - London Oxford Street",
    "address": "234 Oxford Street, London, W1C 1DE",
    "phone": "0345 602 1997",
    "hours": "Mon-Fri: 9:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM"
  },
  {
    "name": "Lloyds Bank - Manchester City Centre",
    "address": "58 Market Street, Manchester, M1 1PW",
    "phone": "0345 602 1998",
    "hours": "Mon-Fri: 9:00 AM - 5:00 PM, Sat: Closed"
  },
  {
    "name": "Lloyds Bank - Birmingham New Street",
    "address": "125 New Street, Birmingham, B2 4JQ",
    "phone": "0345 602 1999",
    "hours": "Mon-Fri: 9:30 AM - 4:30 PM, Sat: 9:00 AM - 12:30 PM"
  }
];

const PALETTE = ['#11b67a'];

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
  let branches;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      branches = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.branches — bare array outputSchema; key derived from actionName "find_branch"
      branches = structuredContent?.branches || [];
    }
  } else {
    branches = SAMPLE_DATA;
  }

  block.textContent = '';
  renderBranchLocator(block, branches, bridge);

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

function renderBranchLocator(block, branches, bridge) {
  const container = document.createElement('div');
  container.className = 'branch-locator-container';

  if (!branches || branches.length === 0) {
    // Empty state: show search card
    const searchCard = document.createElement('div');
    searchCard.className = 'search-card';
    searchCard.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

    const pinIcon = document.createElement('div');
    pinIcon.className = 'pin-icon';
    pinIcon.innerHTML = '📍';
    pinIcon.style.cssText = `opacity: 0.7; color: ${theme?.fg ?? '#fff'}; font-size: 32px;`;
    searchCard.appendChild(pinIcon);

    const heading = document.createElement('h3');
    heading.textContent = 'Find a branch near you';
    heading.style.cssText = `color: ${theme?.fg ?? '#fff'};`;
    searchCard.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter postcode…';
    input.className = 'postcode-input';
    searchCard.appendChild(input);

    const button = document.createElement('button');
    button.className = 'search-btn';
    button.textContent = 'Find a branch';
    if (bridge) {
      button.addEventListener('click', () => {
        const postcode = input.value.trim();
        if (postcode) {
          bridge.sendMessage(`Find a branch near ${postcode}`);
        }
      });
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const postcode = input.value.trim();
          if (postcode) {
            bridge.sendMessage(`Find a branch near ${postcode}`);
          }
        }
      });
    }
    searchCard.appendChild(button);

    container.appendChild(searchCard);
  } else {
    // Results: show branch cards (max 2 visible)
    const cardsRow = document.createElement('div');
    cardsRow.className = 'branch-cards-row';

    branches.slice(0, 2).forEach((branch) => {
      const card = document.createElement('div');
      card.className = 'branch-card';
      card.style.cssText = `background: ${theme?.bg ?? '#1a3a5c'}; color: ${theme?.fg ?? '#fff'};`;

      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = '📍';
      card.appendChild(pinCircle);

      const name = document.createElement('div');
      name.className = 'branch-name';
      name.textContent = branch.name || '';
      name.style.cssText = `color: ${theme?.fg ?? '#fff'};`;
      card.appendChild(name);

      const address = document.createElement('div');
      address.className = 'branch-address';
      address.textContent = branch.address || '';
      card.appendChild(address);

      if (branch.phone) {
        const phone = document.createElement('div');
        phone.className = 'branch-phone';
        phone.textContent = branch.phone;
        card.appendChild(phone);
      }

      if (branch.hours) {
        const hours = document.createElement('div');
        hours.className = 'branch-hours';
        hours.textContent = branch.hours;
        card.appendChild(hours);
      }

      cardsRow.appendChild(card);
    });

    container.appendChild(cardsRow);
  }

  block.appendChild(container);
}
