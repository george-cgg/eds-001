/*
 * ADOBE CONFIDENTIAL
 * ___________________
 * Copyright 2025 Adobe
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

function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`;
}

function createHeader(config) {
  const header = document.createElement('div');
  header.className = 'config-header';

  const img = document.createElement('img');
  img.src = `${config.imageUrl}?width=800&format=webply&optimize=medium`;
  img.alt = config.model;
  img.loading = 'eager';
  img.addEventListener('load', () => img.classList.add('loaded'));

  const info = document.createElement('div');
  info.className = 'config-header-info';

  const title = document.createElement('h1');
  title.className = 'config-title';
  title.textContent = `Configure ${config.model}`;

  const basePrice = document.createElement('p');
  basePrice.className = 'config-base-price';
  basePrice.textContent = `Starting at ${formatCurrency(config.basePrice)}`;

  info.appendChild(title);
  info.appendChild(basePrice);

  header.appendChild(img);
  header.appendChild(info);
  return header;
}

function createOptionGroup(label, options, groupKey, state, onUpdate) {
  const group = document.createElement('div');
  group.className = 'config-option-group';

  const heading = document.createElement('h2');
  heading.className = 'config-group-heading';
  heading.textContent = label;
  group.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'config-option-grid';

  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'config-option-btn';
    if (state.selections[groupKey] === option.id) {
      btn.classList.add('selected');
    }

    const name = document.createElement('span');
    name.className = 'config-option-name';
    name.textContent = option.name;

    const price = document.createElement('span');
    price.className = 'config-option-price';
    price.textContent = option.price === 0 ? 'Included' : `+${formatCurrency(option.price)}`;

    btn.appendChild(name);
    btn.appendChild(price);

    btn.addEventListener('click', () => {
      state.selections[groupKey] = option.id;
      // Update UI — deselect siblings, select this
      grid.querySelectorAll('.config-option-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      onUpdate();
    });

    grid.appendChild(btn);
  });

  group.appendChild(grid);
  return group;
}

function createAccessoriesGroup(accessories, state, onUpdate) {
  const group = document.createElement('div');
  group.className = 'config-option-group';

  const heading = document.createElement('h2');
  heading.className = 'config-group-heading';
  heading.textContent = 'Accessories';
  group.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'config-option-grid';

  accessories.forEach((acc) => {
    const btn = document.createElement('button');
    btn.className = 'config-option-btn';
    if (state.accessories.includes(acc.id)) {
      btn.classList.add('selected');
    }

    const name = document.createElement('span');
    name.className = 'config-option-name';
    name.textContent = acc.name;

    const price = document.createElement('span');
    price.className = 'config-option-price';
    price.textContent = `+${formatCurrency(acc.price)}`;

    btn.appendChild(name);
    btn.appendChild(price);

    btn.addEventListener('click', () => {
      const idx = state.accessories.indexOf(acc.id);
      if (idx >= 0) {
        state.accessories.splice(idx, 1);
        btn.classList.remove('selected');
      } else {
        state.accessories.push(acc.id);
        btn.classList.add('selected');
      }
      onUpdate();
    });

    grid.appendChild(btn);
  });

  group.appendChild(grid);
  return group;
}

function createSummaryBar(config, state) {
  const bar = document.createElement('div');
  bar.className = 'config-summary-bar';

  const label = document.createElement('span');
  label.className = 'config-summary-label';
  label.textContent = 'Estimated Total';

  const total = document.createElement('span');
  total.className = 'config-summary-total';

  function calculateTotal() {
    let price = config.basePrice;

    // Add selected option prices
    ['colors', 'wheels', 'packages', 'interiorTrims'].forEach((category) => {
      const selectedId = state.selections[category];
      if (selectedId) {
        const opt = config[category].find((o) => o.id === selectedId);
        if (opt) price += opt.price;
      }
    });

    // Add accessories
    state.accessories.forEach((accId) => {
      const acc = config.accessories.find((a) => a.id === accId);
      if (acc) price += acc.price;
    });

    return price;
  }

  function update() {
    total.textContent = formatCurrency(calculateTotal());
  }

  update();

  bar.appendChild(label);
  bar.appendChild(total);
  bar.update = update;
  return bar;
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Loading configurator...';
  block.className = 'automotive-car-configuration';

  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    const config = data?.structuredContent?.configuration || data?.configuration;

    if (!config) {
      block.innerHTML = '<p class="config-error">Configuration not available.</p>';
      return;
    }

    // State
    const state = {
      selections: {
        colors: config.colors[0]?.id || null,
        wheels: config.wheels[0]?.id || null,
        packages: null,
        interiorTrims: config.interiorTrims[0]?.id || null,
      },
      accessories: [],
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'config-wrapper';

    wrapper.appendChild(createHeader(config));

    // Summary bar (sticky)
    const summaryBar = createSummaryBar(config, state);
    wrapper.appendChild(summaryBar);

    const onUpdate = () => summaryBar.update();

    // Option groups
    wrapper.appendChild(createOptionGroup('Exterior Color', config.colors, 'colors', state, onUpdate));
    wrapper.appendChild(createOptionGroup('Wheels', config.wheels, 'wheels', state, onUpdate));
    wrapper.appendChild(createOptionGroup('Packages', config.packages, 'packages', state, onUpdate));
    wrapper.appendChild(createOptionGroup('Interior Trim', config.interiorTrims, 'interiorTrims', state, onUpdate));
    wrapper.appendChild(createAccessoriesGroup(config.accessories, state, onUpdate));

    block.appendChild(wrapper);
  }).catch((error) => {
    block.textContent = 'Error loading configurator';
    // eslint-disable-next-line no-console
    console.error('Error loading configurator:', error);
  });
}
