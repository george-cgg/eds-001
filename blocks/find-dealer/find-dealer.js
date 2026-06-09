// Sample dealer data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: "Dacia Bucharest Showroom", address: "Str. Gara Herastrau 2, Bucharest 020334", phone: "+40 21 230 0000", services: "Sales, Service, Parts" },
  { name: "Dacia Cluj Service Center", address: "Calea Turzii 178, Cluj-Napoca 400495", phone: "+40 264 123 456", services: "Service, Parts" }
];

// Hero image for empty state banner
const HERO_IMAGE = "https://cdn.group.renault.com/dac/master/dacia-vn/vehicules/bigster-db3l1-ph1/herozone/dacia-bigster-db3l1-ph1-hero-zone-background-desktop-001.jpg.ximg.large.jpg/7caee35b86.jpg";

// Brand palette from BuildWidgetRequest
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
  let dealers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "find_dealer"
      dealers = structuredContent?.dealers || [];
    }
  } else {
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

  // Hero banner
  const banner = document.createElement('div');
  banner.className = 'find-dealer-banner';
  const bannerImg = document.createElement('img');
  bannerImg.src = HERO_IMAGE;
  bannerImg.alt = 'Find your nearest Dacia dealer';
  bannerImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  banner.appendChild(bannerImg);
  container.appendChild(banner);

  // Search card
  const card = document.createElement('div');
  card.className = 'find-dealer-search-card';
  card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

  const iconContainer = document.createElement('div');
  iconContainer.className = 'find-dealer-icon';
  iconContainer.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
  iconContainer.style.cssText = `opacity:0.7;color:${theme?.fg ?? '#fff'};margin-bottom:12px;`;
  card.appendChild(iconContainer);

  const heading = document.createElement('h3');
  heading.textContent = 'Find a dealer near you';
  heading.style.cssText = 'margin:0 0 16px;font-size:15px;font-weight:600;';
  card.appendChild(heading);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter city or region...';
  input.className = 'find-dealer-input';
  input.style.cssText = 'width:100%;padding:10px;border-radius:8px;border:none;background:#fff;color:#333;font-size:14px;margin-bottom:12px;box-sizing:border-box;';
  card.appendChild(input);

  const button = document.createElement('button');
  button.textContent = 'Find Nearby Dealers';
  button.className = 'find-dealer-button';
  button.style.cssText = `width:100%;padding:10px;border-radius:8px;border:none;background:#646b52;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.15s;`;
  button.addEventListener('mouseenter', () => button.style.opacity = '0.85');
  button.addEventListener('mouseleave', () => button.style.opacity = '1');

  if (bridge) {
    button.addEventListener('click', () => {
      const city = input.value.trim();
      if (city) {
        bridge.sendMessage(`Find Dacia dealers in ${city}`);
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const city = input.value.trim();
        if (city) {
          bridge.sendMessage(`Find Dacia dealers in ${city}`);
        }
      }
    });
  }

  card.appendChild(button);
  container.appendChild(card);
  block.appendChild(container);
}

function renderDealers(block, dealers, bridge) {
  const container = document.createElement('div');
  container.className = 'find-dealer-results';

  const grid = document.createElement('div');
  grid.className = 'find-dealer-grid';

  dealers.slice(0, 2).forEach((dealer) => {
    const card = document.createElement('div');
    card.className = 'find-dealer-card';
    card.style.cssText = `background:${theme?.bg ?? '#1a3a5c'};color:${theme?.fg ?? '#fff'}`;

    const iconCircle = document.createElement('div');
    iconCircle.className = 'find-dealer-pin';
    iconCircle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    card.appendChild(iconCircle);

    const name = document.createElement('h3');
    name.textContent = dealer.name;
    name.style.cssText = `margin:12px 0 8px;font-size:14px;font-weight:600;color:${theme?.fg ?? '#fff'}`;
    card.appendChild(name);

    const address = document.createElement('p');
    address.textContent = dealer.address;
    address.style.cssText = `margin:0 0 8px;font-size:12px;opacity:0.78;line-height:1.4;`;
    card.appendChild(address);

    const phone = document.createElement('p');
    phone.textContent = dealer.phone;
    phone.style.cssText = `margin:0 0 8px;font-size:12px;color:${theme?.fg ?? '#fff'};font-weight:500;`;
    card.appendChild(phone);

    if (dealer.services) {
      const services = document.createElement('p');
      services.textContent = dealer.services;
      services.style.cssText = 'margin:0;font-size:11px;opacity:0.65;';
      card.appendChild(services);
    }

    grid.appendChild(card);
  });

  container.appendChild(grid);
  block.appendChild(container);
}