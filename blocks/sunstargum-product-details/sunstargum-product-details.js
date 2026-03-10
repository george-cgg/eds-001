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

function createStarsSVG(rating, size = 16) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    const filled = i <= Math.round(rating);
    const color = filled ? '#2bb573' : '#d1d5db';
    stars.push(`<svg class="gum-detail-star" width="${size}" height="${size}" viewBox="0 0 20 20" fill="${color}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>`);
  }
  return stars.join('');
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Loading product details...';
  block.className = 'sunstargum-product-details';

  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    const product = data?.structuredContent?.product || data?.product;

    if (!product) {
      block.innerHTML = '<p class="gum-detail-error">Product details not available.</p>';
      return;
    }

    const card = document.createElement('div');
    card.className = 'gum-detail-card';

    // Hero section
    const hero = document.createElement('div');
    hero.className = 'gum-detail-hero';

    // Image
    const imageWrap = document.createElement('div');
    imageWrap.className = 'gum-detail-image';
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.name;
    img.loading = 'eager';
    img.addEventListener('load', () => img.classList.add('loaded'));
    imageWrap.appendChild(img);

    // Info
    const info = document.createElement('div');
    info.className = 'gum-detail-info';

    const category = document.createElement('span');
    category.className = 'gum-detail-category';
    category.textContent = `${product.category} / ${product.subcategory}`;

    const name = document.createElement('h2');
    name.className = 'gum-detail-name';
    name.textContent = product.name;

    const ratingWrap = document.createElement('div');
    ratingWrap.className = 'gum-detail-rating';
    const stars = document.createElement('span');
    stars.className = 'gum-detail-stars';
    stars.innerHTML = createStarsSVG(product.rating);
    const ratingText = document.createElement('span');
    ratingText.className = 'gum-detail-rating-text';
    ratingText.textContent = `${product.rating}/5 (${product.reviewCount} reviews)`;
    if (product.recommendPercent) {
      ratingText.textContent += ` \u2022 ${product.recommendPercent}% recommend`;
    }
    ratingWrap.appendChild(stars);
    ratingWrap.appendChild(ratingText);

    const sku = document.createElement('span');
    sku.className = 'gum-detail-sku';
    sku.textContent = `SKU: ${product.sku}`;

    const desc = document.createElement('p');
    desc.className = 'gum-detail-description';
    desc.textContent = product.description;

    // Features
    const featuresList = document.createElement('ul');
    featuresList.className = 'gum-detail-features';
    (product.features || []).forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      featuresList.appendChild(li);
    });

    info.appendChild(category);
    info.appendChild(name);
    info.appendChild(ratingWrap);
    info.appendChild(sku);
    info.appendChild(desc);
    info.appendChild(featuresList);

    hero.appendChild(imageWrap);
    hero.appendChild(info);
    card.appendChild(hero);

    // Highlights
    if (product.highlights && product.highlights.length > 0) {
      const highlights = document.createElement('div');
      highlights.className = 'gum-detail-highlights';

      const hlTitle = document.createElement('h3');
      hlTitle.className = 'gum-detail-highlights-title';
      hlTitle.textContent = 'Product Highlights';
      highlights.appendChild(hlTitle);

      product.highlights.forEach((hl) => {
        const item = document.createElement('div');
        item.className = 'gum-highlight-item';

        const label = document.createElement('div');
        label.className = 'gum-highlight-label';
        label.textContent = hl.label;

        const text = document.createElement('div');
        text.className = 'gum-highlight-text';
        text.textContent = hl.text;

        item.appendChild(label);
        item.appendChild(text);
        highlights.appendChild(item);
      });

      card.appendChild(highlights);
    }

    // CTAs
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'gum-detail-cta';

    const findStoresBtn = document.createElement('button');
    findStoresBtn.className = 'gum-btn';
    findStoresBtn.textContent = 'Find Nearby Stores';
    findStoresBtn.addEventListener('click', () => {
      const prompt = `Find nearby stores in San Jose that carry ${product.name}. Use the getNearbyStores tool with location "san jose".`;
      if (window.openai?.sendFollowUpMessage) {
        window.openai.sendFollowUpMessage({ prompt });
      }
    });

    const visitBtn = document.createElement('button');
    visitBtn.className = 'gum-btn-outline';
    visitBtn.textContent = 'View on GUM Website';
    visitBtn.addEventListener('click', () => {
      if (product.productUrl) {
        window.open(product.productUrl, '_blank');
      }
    });

    ctaWrap.appendChild(findStoresBtn);
    ctaWrap.appendChild(visitBtn);
    card.appendChild(ctaWrap);

    block.appendChild(card);
  }).catch((error) => {
    block.textContent = 'Error loading product details';
    // eslint-disable-next-line no-console
    console.error('Error loading product details:', error);
  });
}
