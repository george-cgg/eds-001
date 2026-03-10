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

function createStarsSVG(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    const filled = i <= Math.round(rating);
    const color = filled ? '#2bb573' : '#d1d5db';
    stars.push(`<svg class="gum-star" viewBox="0 0 20 20" fill="${color}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>`);
  }
  return stars.join('');
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'gum-product-card';

  // Image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'gum-product-image-wrap';
  const img = document.createElement('img');
  img.src = product.imageUrl;
  img.alt = product.name;
  img.loading = 'lazy';
  img.addEventListener('load', () => img.classList.add('loaded'));
  imgWrap.appendChild(img);

  // Info: name + stars
  const info = document.createElement('div');
  info.className = 'gum-product-info';

  const name = document.createElement('h3');
  name.className = 'gum-product-name';
  name.textContent = product.name;

  const ratingWrap = document.createElement('div');
  ratingWrap.className = 'gum-product-rating';
  const stars = document.createElement('span');
  stars.className = 'gum-stars';
  stars.innerHTML = createStarsSVG(product.rating);
  const ratingText = document.createElement('span');
  ratingText.className = 'gum-rating-text';
  ratingText.textContent = `${product.rating} (${product.reviewCount})`;
  ratingWrap.appendChild(stars);
  ratingWrap.appendChild(ratingText);

  info.appendChild(name);
  info.appendChild(ratingWrap);

  card.appendChild(imgWrap);
  card.appendChild(info);

  // Whole card is clickable — directly invoke the getProductDetails tool
  card.addEventListener('click', () => {
    if (window.openai?.callTool) {
      window.openai.callTool('getProductDetails', { productId: product.productId });
    }
  });

  return card;
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Loading GUM products...';
  block.className = 'sunstargum-products-list';

  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    const products = data?.structuredContent?.products || data?.products;

    if (!products || products.length === 0) {
      block.innerHTML = '<p class="gum-products-empty">No products available.</p>';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'gum-products-wrapper';

    const carousel = document.createElement('div');
    carousel.className = 'gum-products-carousel';

    products.forEach((product) => {
      carousel.appendChild(createProductCard(product));
    });

    wrapper.appendChild(carousel);

    // Navigation arrows
    const leftArrow = document.createElement('button');
    leftArrow.className = 'gum-carousel-arrow left';
    leftArrow.innerHTML = '\u2039';
    leftArrow.setAttribute('aria-label', 'Previous');

    const rightArrow = document.createElement('button');
    rightArrow.className = 'gum-carousel-arrow right';
    rightArrow.innerHTML = '\u203A';
    rightArrow.setAttribute('aria-label', 'Next');

    const scrollAmount = 250;

    leftArrow.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    const updateArrows = () => {
      leftArrow.disabled = carousel.scrollLeft <= 0;
      rightArrow.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
    };

    carousel.addEventListener('scroll', updateArrows, { passive: true });
    setTimeout(updateArrows, 100);

    wrapper.appendChild(leftArrow);
    wrapper.appendChild(rightArrow);
    block.appendChild(wrapper);
  }).catch((error) => {
    block.textContent = 'Error loading products';
    // eslint-disable-next-line no-console
    console.error('Error loading products:', error);
  });
}
