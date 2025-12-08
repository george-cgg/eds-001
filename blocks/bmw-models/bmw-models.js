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

function createBmwCard(vehicle) {
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
  leasePrice.innerHTML = `Lease for <strong>${formatCurrency(vehicle.leasePrice)}/month.</strong>`;

  // Terms text
  const terms = document.createElement('p');
  terms.className = 'bmw-terms';
  terms.textContent = `${vehicle.leaseTerm} months with ${formatCurrency(vehicle.dueAtSigning)} due at signing, ` +
    `plus loyalty credit up to ${formatCurrency(vehicle.loyaltyCredit)} for qualified buyers. ` +
    `Now through ${vehicle.offerExpiry}.`;

  // CTA button
  const button = document.createElement('button');
  button.className = 'bmw-cta-button';
  button.textContent = 'Offer details';
  button.addEventListener('click', () => {
    window.open(`https://www.bmwusa.com/special-offers-new.html#/offer-detail/${vehicle.id}/lease`, '_blank');
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

function createCategoryFilter(categories, activeCategory, onSelect) {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'bmw-filter-container';

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'bmw-filter-btn';
    if (cat === activeCategory) {
      btn.classList.add('active');
    }
    btn.textContent = cat === 'all' ? 'All Models' : cat;
    btn.addEventListener('click', () => onSelect(cat));
    filterContainer.appendChild(btn);
  });

  return filterContainer;
}

export default async function decorate(block, onDataLoaded) {
  block.textContent = 'Loading BMW models...';
  block.className = 'bmw-models';

  onDataLoaded.then((data) => {
    block.textContent = '';

    if (!data || !data.models || !Array.isArray(data.models) || data.models.length === 0) {
      block.innerHTML = '<p class="bmw-no-models">No BMW models available at this time.</p>';
      return;
    }

    const allModels = data.models;
    let activeCategory = data.category || 'all';

    const renderModels = (category) => {
      // Clear existing content except filter
      const existingContainer = block.querySelector('.bmw-container');
      const existingArrows = block.querySelectorAll('.bmw-carousel-arrow');
      if (existingContainer) existingContainer.remove();
      existingArrows.forEach((arrow) => arrow.remove());

      // Filter models
      const filteredModels = category === 'all'
        ? allModels
        : allModels.filter((m) => m.category === category);

      // Create carousel container
      const container = document.createElement('div');
      container.className = 'bmw-container';

      filteredModels.forEach((vehicle) => {
        const card = createBmwCard(vehicle);
        container.appendChild(card);
      });

      block.appendChild(container);
      createCarouselArrows(container, block);

      // Update filter buttons active state
      block.querySelectorAll('.bmw-filter-btn').forEach((btn) => {
        const btnCategory = btn.textContent === 'All Models' ? 'all' : btn.textContent;
        btn.classList.toggle('active', btnCategory === category);
      });
    };

    // Create and add filter
    const categories = ['all', 'SUV', 'Sedan', 'Electric'];
    const filter = createCategoryFilter(categories, activeCategory, (cat) => {
      activeCategory = cat;
      renderModels(cat);
    });
    block.appendChild(filter);

    // Initial render
    renderModels(activeCategory);
  }).catch((error) => {
    block.textContent = 'Error loading BMW models';
    console.error('Error loading BMW models:', error);
  });
}

