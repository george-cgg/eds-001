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

function createHeroSection(car) {
  const hero = document.createElement('div');
  hero.className = 'car-details-hero';

  const img = document.createElement('img');
  img.src = `${car.imageUrl}?width=1200&format=webply&optimize=medium`;
  img.srcset = `${car.imageUrl}?width=600&format=webply&optimize=medium 1x, ${car.imageUrl}?width=1200&format=webply&optimize=medium 2x`;
  img.sizes = '(max-width: 768px) 100vw, 600px';
  img.alt = car.model;
  img.loading = 'eager';
  img.addEventListener('load', () => img.classList.add('loaded'));

  const overlay = document.createElement('div');
  overlay.className = 'car-details-hero-overlay';

  const title = document.createElement('h1');
  title.className = 'car-details-title';
  title.textContent = car.model;

  const subtitle = document.createElement('p');
  subtitle.className = 'car-details-subtitle';
  subtitle.textContent = `${car.year} ${car.category}`;

  overlay.appendChild(title);
  overlay.appendChild(subtitle);
  hero.appendChild(img);
  hero.appendChild(overlay);

  return hero;
}

function createSpecItem(label, value) {
  const item = document.createElement('div');
  item.className = 'car-details-spec-item';

  const labelEl = document.createElement('span');
  labelEl.className = 'car-details-spec-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'car-details-spec-value';
  valueEl.textContent = value;

  item.appendChild(labelEl);
  item.appendChild(valueEl);
  return item;
}

function createPerformanceSection(car) {
  const section = document.createElement('div');
  section.className = 'car-details-section';

  const heading = document.createElement('h2');
  heading.className = 'car-details-section-heading';
  heading.textContent = 'Performance';
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'car-details-spec-grid';

  grid.appendChild(createSpecItem('Engine', car.engine));
  grid.appendChild(createSpecItem('Horsepower', `${car.horsepower} HP`));
  grid.appendChild(createSpecItem('Torque', car.torque));
  grid.appendChild(createSpecItem('Transmission', car.transmission));
  grid.appendChild(createSpecItem('0-60 mph', car.acceleration));
  grid.appendChild(createSpecItem('Top Speed', car.topSpeed));
  grid.appendChild(createSpecItem('Drive Type', car.driveType));
  if (car.mpg) {
    grid.appendChild(createSpecItem('Fuel Economy', car.mpg));
  }

  section.appendChild(grid);
  return section;
}

function createPricingSection(car) {
  const section = document.createElement('div');
  section.className = 'car-details-section car-details-pricing';

  const heading = document.createElement('h2');
  heading.className = 'car-details-section-heading';
  heading.textContent = 'Pricing';
  section.appendChild(heading);

  const priceHighlight = document.createElement('div');
  priceHighlight.className = 'car-details-price-highlight';

  const priceAmount = document.createElement('span');
  priceAmount.className = 'car-details-price-amount';
  priceAmount.textContent = `${formatCurrency(car.leasePrice)}/mo`;

  const priceTerm = document.createElement('span');
  priceTerm.className = 'car-details-price-term';
  priceTerm.textContent = `${car.leaseTerm}-month lease`;

  priceHighlight.appendChild(priceAmount);
  priceHighlight.appendChild(priceTerm);
  section.appendChild(priceHighlight);

  const grid = document.createElement('div');
  grid.className = 'car-details-spec-grid';

  grid.appendChild(createSpecItem('Due at Signing', formatCurrency(car.dueAtSigning)));
  grid.appendChild(createSpecItem('Loyalty Credit', `Up to ${formatCurrency(car.loyaltyCredit)}`));
  grid.appendChild(createSpecItem('Offer Expires', car.offerExpiry));

  section.appendChild(grid);
  return section;
}

function createInteriorSection(car) {
  const section = document.createElement('div');
  section.className = 'car-details-section';

  const heading = document.createElement('h2');
  heading.className = 'car-details-section-heading';
  heading.textContent = 'Interior & Space';
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'car-details-spec-grid';

  grid.appendChild(createSpecItem('Seating', `${car.seating} passengers`));
  grid.appendChild(createSpecItem('Cargo Space', car.cargo));

  section.appendChild(grid);
  return section;
}

function createColorsSection(car) {
  if (!car.colors || car.colors.length === 0) return null;

  const section = document.createElement('div');
  section.className = 'car-details-section';

  const heading = document.createElement('h2');
  heading.className = 'car-details-section-heading';
  heading.textContent = 'Available Colors';
  section.appendChild(heading);

  const colorList = document.createElement('div');
  colorList.className = 'car-details-color-list';

  car.colors.forEach((color) => {
    const chip = document.createElement('span');
    chip.className = 'car-details-color-chip';
    chip.textContent = color;
    colorList.appendChild(chip);
  });

  section.appendChild(colorList);
  return section;
}

function createCtaSection(car) {
  const section = document.createElement('div');
  section.className = 'car-details-cta';

  const exploreBtn = document.createElement('button');
  exploreBtn.className = 'car-details-cta-button car-details-cta-primary';
  exploreBtn.textContent = `Explore ${car.shortName || car.model}`;
  exploreBtn.addEventListener('click', () => {
    window.open(car.exploreUrl, '_blank');
  });

  section.appendChild(exploreBtn);
  return section;
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Loading car details...';
  block.className = 'automotive-car-details';

  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    const car = data?.structuredContent?.car || data?.car;

    if (!car) {
      block.innerHTML = '<p class="car-details-error">Car details not available.</p>';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'car-details-wrapper';

    wrapper.appendChild(createHeroSection(car));
    wrapper.appendChild(createPerformanceSection(car));
    wrapper.appendChild(createPricingSection(car));
    wrapper.appendChild(createInteriorSection(car));

    const colorsSection = createColorsSection(car);
    if (colorsSection) wrapper.appendChild(colorsSection);

    wrapper.appendChild(createCtaSection(car));

    block.appendChild(wrapper);
  }).catch((error) => {
    block.textContent = 'Error loading car details';
    // eslint-disable-next-line no-console
    console.error('Error loading car details:', error);
  });
}
