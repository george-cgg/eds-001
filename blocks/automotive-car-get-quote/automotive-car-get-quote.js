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

function createQuoteHeader(quote) {
  const header = document.createElement('div');
  header.className = 'quote-header';

  const img = document.createElement('img');
  img.src = `${quote.imageUrl}?width=800&format=webply&optimize=medium`;
  img.alt = quote.model;
  img.loading = 'eager';
  img.addEventListener('load', () => img.classList.add('loaded'));

  const overlay = document.createElement('div');
  overlay.className = 'quote-header-overlay';

  const title = document.createElement('h1');
  title.className = 'quote-title';
  title.textContent = `${quote.model} Quote`;

  const subtitle = document.createElement('p');
  subtitle.className = 'quote-subtitle';
  subtitle.textContent = `${quote.year} Model`;

  overlay.appendChild(title);
  overlay.appendChild(subtitle);
  header.appendChild(img);
  header.appendChild(overlay);
  return header;
}

function createLineItem(label, value, className) {
  const row = document.createElement('div');
  row.className = `quote-line-item ${className || ''}`;

  const labelEl = document.createElement('span');
  labelEl.className = 'quote-line-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'quote-line-value';
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  return row;
}

function createPricingBreakdown(quote) {
  const section = document.createElement('div');
  section.className = 'quote-section';

  const heading = document.createElement('h2');
  heading.className = 'quote-section-heading';
  heading.textContent = 'Price Breakdown';
  section.appendChild(heading);

  const breakdown = document.createElement('div');
  breakdown.className = 'quote-breakdown';

  breakdown.appendChild(createLineItem('MSRP', formatCurrency(quote.msrp)));
  breakdown.appendChild(createLineItem('Destination & Handling', formatCurrency(quote.destinationCharge)));
  breakdown.appendChild(createLineItem('Dealer Fees', formatCurrency(quote.dealerFees)));
  breakdown.appendChild(createLineItem('Estimated Tax', formatCurrency(quote.estimatedTax)));
  breakdown.appendChild(createLineItem('Total', formatCurrency(quote.totalMsrp), 'quote-line-total'));

  if (quote.loyaltyCredit > 0) {
    breakdown.appendChild(createLineItem('Loyalty Credit', `-${formatCurrency(quote.loyaltyCredit)}`, 'quote-line-credit'));
  }

  section.appendChild(breakdown);
  return section;
}

function createPaymentOption(title, details, isHighlighted) {
  const card = document.createElement('div');
  card.className = `quote-payment-card ${isHighlighted ? 'highlighted' : ''}`;

  const heading = document.createElement('h3');
  heading.className = 'quote-payment-heading';
  heading.textContent = title;
  card.appendChild(heading);

  details.forEach(({ label, value, isBig }) => {
    const row = document.createElement('div');
    row.className = 'quote-payment-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'quote-payment-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = `quote-payment-value ${isBig ? 'big' : ''}`;
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    card.appendChild(row);
  });

  return card;
}

function createPaymentOptions(quote) {
  const section = document.createElement('div');
  section.className = 'quote-section';

  const heading = document.createElement('h2');
  heading.className = 'quote-section-heading';
  heading.textContent = 'Payment Options';
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'quote-payment-grid';

  // Lease
  grid.appendChild(createPaymentOption('Lease', [
    { label: 'Monthly', value: `${formatCurrency(quote.lease.monthlyPayment)}/mo`, isBig: true },
    { label: 'Term', value: `${quote.lease.term} months` },
    { label: 'Due at Signing', value: formatCurrency(quote.lease.dueAtSigning) },
    { label: 'Annual Mileage', value: `${quote.lease.annualMileage.toLocaleString()} mi` },
  ], true));

  // Finance
  grid.appendChild(createPaymentOption('Finance', [
    { label: 'Monthly', value: `${formatCurrency(quote.finance.monthlyPayment)}/mo`, isBig: true },
    { label: 'Term', value: `${quote.finance.term} months` },
    { label: 'APR', value: `${quote.finance.apr}%` },
    { label: 'Down Payment', value: formatCurrency(quote.finance.downPayment) },
  ], false));

  // Cash
  grid.appendChild(createPaymentOption('Cash', [
    { label: 'Price', value: formatCurrency(quote.cashPrice), isBig: true },
    { label: 'Savings', value: 'No interest charges' },
  ], false));

  section.appendChild(grid);
  return section;
}

function createOfferBanner(quote) {
  const banner = document.createElement('div');
  banner.className = 'quote-offer-banner';
  banner.textContent = `Offer expires ${quote.offerExpiry}. Contact your local dealer for final pricing.`;
  return banner;
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Generating quote...';
  block.className = 'automotive-car-get-quote';

  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    const quote = data?.structuredContent?.quote || data?.quote;

    if (!quote) {
      block.innerHTML = '<p class="quote-error">Quote not available.</p>';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'quote-wrapper';

    wrapper.appendChild(createQuoteHeader(quote));
    wrapper.appendChild(createPricingBreakdown(quote));
    wrapper.appendChild(createPaymentOptions(quote));
    wrapper.appendChild(createOfferBanner(quote));

    block.appendChild(wrapper);
  }).catch((error) => {
    block.textContent = 'Error loading quote';
    // eslint-disable-next-line no-console
    console.error('Error loading quote:', error);
  });
}
