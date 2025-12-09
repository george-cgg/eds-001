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

// eslint-disable-next-line no-unused-vars
const MOCK_BMW_MODELS = [
  // SUVs
  {
    id: '26XD',
    model: 'X3 30 xDrive',
    shortName: 'X3',
    year: 2026,
    category: 'SUV',
    leasePrice: 599,
    dueAtSigning: 5129,
    leaseTerm: 39,
    loyaltyCredit: 1000,
    driveType: 'All-Wheel Drive',
    mpg: '33 MPG',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/x-series/x3/bmw-x3.html',
    offerExpiry: 'January 2nd',
  },
  {
    id: '26XG',
    model: 'X5 xDrive40i',
    shortName: 'X5',
    year: 2026,
    category: 'SUV',
    leasePrice: 899,
    dueAtSigning: 6369,
    leaseTerm: 39,
    loyaltyCredit: 2000,
    driveType: 'All-Wheel Drive',
    mpg: '27 MPG',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/x-series/x5/bmw-x5.html',
    offerExpiry: 'January 2nd',
  },
  {
    id: '26XB',
    model: 'X1 xDrive28i',
    shortName: 'X1',
    year: 2026,
    category: 'SUV',
    leasePrice: 499,
    dueAtSigning: 4899,
    leaseTerm: 39,
    loyaltyCredit: 1000,
    driveType: 'All-Wheel Drive',
    mpg: '33 MPG',
    imageUrl: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/x-series/x1/bmw-x1.html',
    offerExpiry: 'January 2nd',
  },
  {
    id: '26SA',
    model: 'X7 xDrive40i',
    shortName: 'X7',
    year: 2026,
    category: 'SUV',
    leasePrice: 969,
    dueAtSigning: 8409,
    leaseTerm: 39,
    loyaltyCredit: 2000,
    driveType: 'All-Wheel Drive',
    mpg: '25 MPG',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/x-series/x7/bmw-x7.html',
    offerExpiry: 'January 2nd',
  },
  // Sedans
  {
    id: '263X',
    model: '330i xDrive Sedan',
    shortName: '3 Series',
    year: 2026,
    category: 'Sedan',
    leasePrice: 499,
    dueAtSigning: 4999,
    leaseTerm: 39,
    loyaltyCredit: 1000,
    driveType: 'All-Wheel Drive',
    mpg: '34 MPG',
    imageUrl: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/3-series/3-series-sedan/bmw-3-series-sedan.html',
    offerExpiry: 'January 2nd',
  },
  {
    id: '265B',
    model: '530i xDrive Sedan',
    shortName: '5 Series',
    year: 2026,
    category: 'Sedan',
    leasePrice: 659,
    dueAtSigning: 6239,
    leaseTerm: 39,
    loyaltyCredit: 2000,
    driveType: 'All-Wheel Drive',
    mpg: null,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/5-series/sedan/bmw-5-series-sedan-overview.html',
    offerExpiry: 'January 2nd',
  },
  // Electric
  {
    id: '25DA',
    model: 'i4 eDrive40',
    shortName: 'i4',
    year: 2025,
    category: 'Electric',
    leasePrice: 399,
    dueAtSigning: 4999,
    leaseTerm: 36,
    loyaltyCredit: 2000,
    driveType: 'Rear-Wheel Drive',
    mpg: '295-318 mi. range',
    imageUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/bmw-i-series/i4/bmw-i4-gran-coupe.html',
    offerExpiry: 'January 2nd',
  },
  {
    id: '265T',
    model: 'i5 eDrive40',
    shortName: 'i5',
    year: 2026,
    category: 'Electric',
    leasePrice: 599,
    dueAtSigning: 5679,
    leaseTerm: 36,
    loyaltyCredit: 2000,
    driveType: 'Rear-Wheel Drive',
    mpg: '278-310 mi. range',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop',
    exploreUrl: 'https://www.bmwusa.com/vehicles/bmw-i-series/i5/bmw-i5-overview.html',
    offerExpiry: 'January 2nd',
  },
];

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
  terms.textContent = `${vehicle.leaseTerm} months with ${formatCurrency(vehicle.dueAtSigning)} due at signing, `
    + `plus loyalty credit up to ${formatCurrency(vehicle.loyaltyCredit)} for qualified buyers. `
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

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Loading BMW models...';
  block.className = 'bmw-models';

  // Set up theme change handler
  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    // Fallback for non-ChatGPT environments
    block.setAttribute('data-theme', 'light');
  }

  // Mock onDataLoaded for testing purposes - COMMENTED OUT FOR PRODUCTION
  // onDataLoaded = Promise.resolve({
  //   structuredContent: {
  //     models: MOCK_BMW_MODELS,
  //     category: 'all',
  //     totalCount: MOCK_BMW_MODELS.length
  //   }
  // });

  onDataLoaded.then((data) => {
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
      const card = createBmwCard(vehicle);
      container.appendChild(card);
    });

    block.appendChild(container);
    createCarouselArrows(container, block);
  }).catch((error) => {
    block.textContent = 'Error loading BMW models';
    // eslint-disable-next-line no-console
    console.error('Error loading BMW models:', error);
  });
}
