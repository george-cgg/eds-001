const SAMPLE_DATA = [
  {
    name: 'Lloyds Bank - Oxford Street',
    address: '123 Oxford Street, London, W1D 2HG',
    phone: '0345 300 0000',
    hours: 'Mon-Fri: 9am-5pm, Sat: 9am-1pm'
  },
  {
    name: 'Lloyds Bank - Canary Wharf',
    address: '25 Canada Square, London, E14 5LB',
    phone: '0345 300 0001',
    hours: 'Mon-Fri: 9am-6pm, Sat: Closed'
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
      branches = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
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
  if (!branches || branches.length === 0) {
    const searchCard = document.createElement('div');
    searchCard.className = 'branch-search-card';
    searchCard.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const icon = document.createElement('div');
    icon.className = 'pin-icon';
    icon.innerHTML = '📍';
    searchCard.appendChild(icon);

    const heading = document.createElement('h3');
    heading.textContent = 'Find a branch near you';
    searchCard.appendChild(heading);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter postcode...';
    input.className = 'postcode-input';
    searchCard.appendChild(input);

    const button = document.createElement('button');
    button.className = 'search-btn';
    button.textContent = 'Find a branch';
    if (bridge) {
      button.addEventListener('click', () => {
        const postcode = input.value.trim();
        if (postcode) {
          bridge.sendMessage(`Find branches near ${postcode}`);
        }
      });
    }
    searchCard.appendChild(button);

    block.appendChild(searchCard);
  } else {
    const container = document.createElement('div');
    container.className = 'branch-results';

    const maxBranches = Math.min(branches.length, 2);
    for (let i = 0; i < maxBranches; i++) {
      const branch = branches[i];
      const card = document.createElement('div');
      card.className = 'branch-card';
      card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

      const pinCircle = document.createElement('div');
      pinCircle.className = 'pin-circle';
      pinCircle.innerHTML = '📍';
      card.appendChild(pinCircle);

      const name = document.createElement('h4');
      name.className = 'branch-name';
      name.textContent = branch.name;
      card.appendChild(name);

      const address = document.createElement('p');
      address.className = 'branch-address';
      address.textContent = branch.address;
      card.appendChild(address);

      if (branch.phone) {
        const phone = document.createElement('p');
        phone.className = 'branch-phone';
        phone.textContent = branch.phone;
        card.appendChild(phone);
      }

      if (branch.hours) {
        const hours = document.createElement('p');
        hours.className = 'branch-hours';
        hours.textContent = branch.hours;
        card.appendChild(hours);
      }

      container.appendChild(card);
    }

    block.appendChild(container);
  }
}