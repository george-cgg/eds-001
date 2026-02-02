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

import { formatCurrency as formatCurrencyLocale } from '../../scripts/llm-helpers.js';

function formatCurrency(amount, locale = 'en-US') {
  return formatCurrencyLocale(amount, locale, 'USD');
}

function createBmwCard(vehicle, locale = 'en-US') {
  const card = document.createElement('div');
  card.className = 'bmw-card';

  // Image container with vehicle image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'bmw-card-image';

  const img = document.createElement('img');
  img.src = vehicle.imageUrl;
  img.alt = vehicle.model;
  img.loading = 'lazy';

  // Year badge
  const yearBadge = document.createElement('span');
  yearBadge.className = 'bmw-year-badge';
  yearBadge.textContent = vehicle.year;

  imageContainer.appendChild(img);
  imageContainer.appendChild(yearBadge);
  card.appendChild(imageContainer);

  // Card body
  const body = document.createElement('div');
  body.className = 'bmw-card-body';

  // Model name
  const modelName = document.createElement('h3');
  modelName.className = 'bmw-model-name';
  modelName.textContent = vehicle.model;

  // Lease price headline
  const leasePrice = document.createElement('p');
  leasePrice.className = 'bmw-lease-price';
  leasePrice.innerHTML = `Lease for <strong>${formatCurrency(vehicle.leasePrice, locale)}/month.</strong>`;

  // Terms text
  const terms = document.createElement('p');
  terms.className = 'bmw-terms';
  terms.textContent = `${vehicle.leaseTerm} months with ${formatCurrency(vehicle.dueAtSigning, locale)} due at signing, `
    + `plus loyalty credit up to ${formatCurrency(vehicle.loyaltyCredit, locale)} for qualified buyers. `
    + `Now through ${vehicle.offerExpiry}.`;

  // CTA button - Explore link
  const button = document.createElement('button');
  button.className = 'bmw-cta-button';
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
  leftArrow.className = 'bmw-carousel-arrow bmw-carousel-arrow-left';
  leftArrow.setAttribute('aria-label', 'Previous vehicles');
  leftArrow.textContent = '‹';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'bmw-carousel-arrow bmw-carousel-arrow-right';
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

export default async function decorate(block, llmContext) {
  block.textContent = 'Loading BMW models...';
  block.className = 'bmw-models';

  // Get current locale and theme
  const currentLocale = llmContext.locale || 'en-US';
  const currentTheme = llmContext.theme || 'light';

  // Set initial theme
  block.setAttribute('data-theme', currentTheme);

  // Subscribe to theme changes
  llmContext.on('theme', (theme) => {
    block.setAttribute('data-theme', theme);
  });

  // Function to render models with current locale
  const renderModels = (data, locale) => {
    block.textContent = '';

    // Handle both data structures: direct and wrapped in structuredContent
    const modelsData = data?.structuredContent?.models || data?.models;

    if (!modelsData || !Array.isArray(modelsData) || modelsData.length === 0) {
      block.innerHTML = '<p class="bmw-no-models">No BMW models available at this time.</p>';
      return;
    }

    const allModels = modelsData;

    // Create carousel container
    const container = document.createElement('div');
    container.className = 'bmw-container';

    allModels.forEach((vehicle) => {
      const card = createBmwCard(vehicle, locale);
      container.appendChild(card);
    });

    block.appendChild(container);
    createCarouselArrows(container, block);
  };

  // Subscribe to locale changes and re-render
  let currentData = null;
  llmContext.on('locale', (locale) => {
    if (currentData) {
      renderModels(currentData, locale);
    }
  });

  // Load and render data using event pattern
  llmContext.on('toolOutput', (data) => {
    if (!data) {
      block.textContent = 'Error loading BMW models';
      // eslint-disable-next-line no-console
      console.error('Error loading BMW models: no data received');
      return;
    }
    currentData = data;
    renderModels(data, currentLocale);
  });
}
