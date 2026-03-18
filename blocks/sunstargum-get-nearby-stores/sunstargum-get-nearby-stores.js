/*
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2026 Adobe
 * All Rights Reserved.
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 *  Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

const PIN_SVG = `<svg class="gum-stores-pin-icon" viewBox="0 0 24 24" fill="#009257"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`;

const PHONE_SVG = `<svg class="gum-store-meta-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>`;

const CLOCK_SVG = `<svg class="gum-store-meta-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>`;

function createStoreCard(store) {
  const card = document.createElement('div');
  card.className = 'gum-store-card';

  // Top row: name + distance badge
  const top = document.createElement('div');
  top.className = 'gum-store-top';

  const name = document.createElement('h3');
  name.className = 'gum-store-name';
  name.textContent = store.name;

  const distance = document.createElement('span');
  distance.className = 'gum-store-distance';
  distance.textContent = store.distance;

  top.appendChild(name);
  top.appendChild(distance);

  // Address
  const address = document.createElement('p');
  address.className = 'gum-store-address';
  address.textContent = `${store.address}, ${store.city}, ${store.state} ${store.zip}`;

  // Meta (phone, hours)
  const meta = document.createElement('div');
  meta.className = 'gum-store-meta';

  const phoneRow = document.createElement('div');
  phoneRow.className = 'gum-store-meta-row';
  phoneRow.innerHTML = `${PHONE_SVG} ${store.phone}`;

  const hoursRow = document.createElement('div');
  hoursRow.className = 'gum-store-meta-row';
  hoursRow.innerHTML = `${CLOCK_SVG} ${store.hours}`;

  meta.appendChild(phoneRow);
  meta.appendChild(hoursRow);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'gum-store-actions';

  const directionsBtn = document.createElement('a');
  directionsBtn.className = 'gum-store-btn';
  directionsBtn.innerHTML = `<svg class="gum-store-btn-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg> Get Directions`;
  directionsBtn.href = store.directionsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state} ${store.zip}`)}`;
  directionsBtn.target = '_blank';
  directionsBtn.rel = 'noopener noreferrer';

  const callBtn = document.createElement('a');
  callBtn.className = 'gum-store-btn-outline';
  callBtn.textContent = 'Call Store';
  callBtn.href = `tel:${store.phone.replace(/[^0-9+]/g, '')}`;

  actions.appendChild(directionsBtn);
  actions.appendChild(callBtn);

  card.appendChild(top);
  card.appendChild(address);
  card.appendChild(meta);
  card.appendChild(actions);

  return card;
}

export default async function decorate(block, bridge) {
  block.textContent = '';
  block.className = 'sunstargum-get-nearby-stores';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Finding nearby stores\u2026';
  block.appendChild(loading);

  let stores;
  let location = 'your area';

  try {
    if (bridge && bridge.toolResult) {
      const result = await bridge.toolResult;
      const sc = result?.structuredContent || result;
      stores = sc?.stores || [];
      location = sc?.searchArea || result?.location || 'your area';
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[sunstargum-get-nearby-stores] Could not get tool data', e);
  }

  if (!stores || stores.length === 0) {
    block.textContent = '';
    block.innerHTML = '<p class="gum-stores-empty">No stores found nearby.</p>';
    return;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gum-stores-wrapper';

  // Header
  const header = document.createElement('div');
  header.className = 'gum-stores-header';
  header.innerHTML = PIN_SVG;

  const title = document.createElement('h2');
  title.className = 'gum-stores-title';
  title.textContent = `Stores near ${location}`;

  const count = document.createElement('span');
  count.className = 'gum-stores-count';
  count.textContent = `${stores.length} locations`;

  header.appendChild(title);
  header.appendChild(count);
  wrapper.appendChild(header);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'gum-stores-grid';

  stores.forEach((store) => {
    grid.appendChild(createStoreCard(store));
  });

  wrapper.appendChild(grid);
  block.appendChild(wrapper);
}
