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

function createPromotionCard(promo, bridge) {
  const card = document.createElement('div');
  card.className = 'gum-product-card gum-promo-card';

  // Promotion badge
  const badge = document.createElement('div');
  badge.className = 'gum-promo-badge';
  badge.textContent = promo.promotionLabel || 'SPECIAL OFFER';
  card.appendChild(badge);

  // Image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'gum-product-image-wrap';
  const img = document.createElement('img');
  img.src = promo.imageUrl;
  img.alt = promo.name;
  img.loading = 'lazy';
  img.addEventListener('load', () => img.classList.add('loaded'));
  imgWrap.appendChild(img);

  // Info
  const info = document.createElement('div');
  info.className = 'gum-product-info';

  const name = document.createElement('h3');
  name.className = 'gum-product-name';
  name.textContent = promo.name;

  const ratingWrap = document.createElement('div');
  ratingWrap.className = 'gum-product-rating';
  const stars = document.createElement('span');
  stars.className = 'gum-stars';
  stars.innerHTML = createStarsSVG(promo.rating);
  const ratingText = document.createElement('span');
  ratingText.className = 'gum-rating-text';
  ratingText.textContent = `${promo.rating} (${promo.reviewCount})`;
  ratingWrap.appendChild(stars);
  ratingWrap.appendChild(ratingText);

  // Price row
  if (promo.promoPrice || promo.originalPrice) {
    const priceWrap = document.createElement('div');
    priceWrap.className = 'gum-promo-price';
    if (promo.originalPrice) {
      const original = document.createElement('span');
      original.className = 'gum-price-original';
      original.textContent = promo.originalPrice;
      priceWrap.appendChild(original);
    }
    if (promo.promoPrice) {
      const priced = document.createElement('span');
      priced.className = 'gum-price-promo';
      priced.textContent = promo.promoPrice;
      priceWrap.appendChild(priced);
    }
    info.appendChild(name);
    info.appendChild(ratingWrap);
    info.appendChild(priceWrap);
  } else {
    info.appendChild(name);
    info.appendChild(ratingWrap);
  }

  const cta = document.createElement('button');
  cta.className = 'gum-product-cta';
  cta.textContent = 'Shop Offer';
  info.appendChild(cta);

  card.appendChild(imgWrap);
  card.appendChild(info);

  card.addEventListener('click', () => {
    const prompt = `Show me the full details for product ${promo.productId} (${promo.name}).`;
    bridge.sendMessage(prompt);
  });

  return card;
}

export default async function decorate(block, bridge) {
  block.textContent = '';
  block.className = 'sunstargum-get-promotions';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Loading promotions…';
  block.appendChild(loading);

  let promotions;

  try {
    if (bridge && bridge.toolResult) {
      const result = await bridge.toolResult;
      const sc = result?.structuredContent || result;
      promotions = sc?.promotions || sc?.products || [];
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[sunstargum-get-promotions] Could not get tool data', e);
  }

  if (!promotions || promotions.length === 0) {
    block.textContent = '';
    block.innerHTML = '<p class="gum-products-empty">No promotions available.</p>';
    return;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gum-products-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'gum-products-carousel';

  promotions.forEach((promo) => {
    carousel.appendChild(createPromotionCard(promo, bridge));
  });

  wrapper.appendChild(carousel);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'gum-carousel-arrow left';
  leftArrow.innerHTML = '‹';
  leftArrow.setAttribute('aria-label', 'Previous');

  const rightArrow = document.createElement('button');
  rightArrow.className = 'gum-carousel-arrow right';
  rightArrow.innerHTML = '›';
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
}
