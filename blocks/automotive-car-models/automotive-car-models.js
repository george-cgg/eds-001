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

function createCarCard(vehicle) {
  const card = document.createElement('div');
  card.className = 'automotive-card';

  // Image container with vehicle image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'automotive-card-image';

  const img = document.createElement('img');
  // Optimize image: server-side resize, WebP format, medium quality
  img.src = `${vehicle.imageUrl}?width=760&format=webply&optimize=medium`;
  img.srcset = `${vehicle.imageUrl}?width=380&format=webply&optimize=medium 1x, ${vehicle.imageUrl}?width=760&format=webply&optimize=medium 2x, ${vehicle.imageUrl}?width=1140&format=webply&optimize=medium 3x`;
  img.sizes = '(max-width: 768px) 300px, 380px';
  img.alt = vehicle.model;
  img.loading = 'lazy';

  // Add loaded class when image loads for smooth fade-in
  img.addEventListener('load', () => {
    img.classList.add('loaded');
  });

  // Year badge
  const yearBadge = document.createElement('span');
  yearBadge.className = 'automotive-year-badge';
  yearBadge.textContent = vehicle.year;

  imageContainer.appendChild(img);
  imageContainer.appendChild(yearBadge);
  card.appendChild(imageContainer);

  // Card body
  const body = document.createElement('div');
  body.className = 'automotive-card-body';

  // Model name
  const modelName = document.createElement('h3');
  modelName.className = 'automotive-model-name';
  modelName.textContent = vehicle.model;

  // Lease price headline
  const leasePrice = document.createElement('p');
  leasePrice.className = 'automotive-lease-price';
  leasePrice.innerHTML = `Lease for <strong>${formatCurrency(vehicle.leasePrice)}/month.</strong>`;

  // Terms text
  const terms = document.createElement('p');
  terms.className = 'automotive-terms';
  terms.textContent = `${vehicle.leaseTerm} months with ${formatCurrency(vehicle.dueAtSigning)} due at signing, `
    + `plus loyalty credit up to ${formatCurrency(vehicle.loyaltyCredit)} for qualified buyers. `
    + `Now through ${vehicle.offerExpiry}.`;

  // CTA button - Explore link
  const button = document.createElement('button');
  button.className = 'automotive-cta-button';
  button.textContent = `Explore ${vehicle.shortName || vehicle.model.split(' ')[0]}`;
  button.addEventListener('click', () => {
    window.open(vehicle.exploreUrl, '_blank');
  });

  body.appendChild(modelName);
  body.appendChild(leasePrice);
  body.appendChild(terms);
  body.appendChild(button);
  card.appendChild(body);

  return card;
}

function createCarouselArrows(container, block) {
  const leftArrow = document.createElement('button');
  leftArrow.className = 'automotive-carousel-arrow automotive-carousel-arrow-left';
  leftArrow.setAttribute('aria-label', 'Previous vehicles');
  leftArrow.textContent = '‹';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'automotive-carousel-arrow automotive-carousel-arrow-right';
  rightArrow.setAttribute('aria-label', 'Next vehicles');
  rightArrow.textContent = '›';

  const updateArrows = () => {
    const { scrollLeft } = container;
    const maxScroll = container.scrollWidth - container.clientWidth;

    leftArrow.classList.toggle('disabled', scrollLeft <= 0);
    rightArrow.classList.toggle('disabled', scrollLeft >= maxScroll - 1);
  };

  const scrollAmount = 400;

  leftArrow.addEventListener('click', () => {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  container.addEventListener('scroll', updateArrows);
  setTimeout(updateArrows, 100);

  block.appendChild(leftArrow);
  block.appendChild(rightArrow);
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Loading car models...';
  block.className = 'automotive-car-models';

  // Set up theme change handler
  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    // Fallback for non-ChatGPT environments
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    // Handle both data structures: direct and wrapped in structuredContent
    const modelsData = data?.structuredContent?.models || data?.models;

    if (!modelsData || !Array.isArray(modelsData) || modelsData.length === 0) {
      block.innerHTML = '<p class="automotive-no-models">No car models available at this time.</p>';
      return;
    }

    const allModels = modelsData;

    // Create carousel container
    const container = document.createElement('div');
    container.className = 'automotive-container';

    allModels.forEach((vehicle) => {
      const card = createCarCard(vehicle);
      container.appendChild(card);
    });

    block.appendChild(container);
    createCarouselArrows(container, block);
  }).catch((error) => {
    block.textContent = 'Error loading car models';
    // eslint-disable-next-line no-console
    console.error('Error loading car models:', error);
  });
}
