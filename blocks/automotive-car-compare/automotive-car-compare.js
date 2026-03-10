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

function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`;
}

function createModelHeader(car) {
  const col = document.createElement('div');
  col.className = 'compare-model-header';

  const img = document.createElement('img');
  img.src = `${car.imageUrl}?width=600&format=webply&optimize=medium`;
  img.alt = car.model;
  img.loading = 'eager';
  img.addEventListener('load', () => img.classList.add('loaded'));

  const name = document.createElement('h2');
  name.className = 'compare-model-name';
  name.textContent = car.model;

  const year = document.createElement('span');
  year.className = 'compare-model-year';
  year.textContent = `${car.year} ${car.category}`;

  col.appendChild(img);
  col.appendChild(name);
  col.appendChild(year);
  return col;
}

function createComparisonRow(label, val1, val2, highlightFn) {
  const row = document.createElement('div');
  row.className = 'compare-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'compare-row-label';
  labelEl.textContent = label;

  const cell1 = document.createElement('div');
  cell1.className = 'compare-row-value';
  cell1.textContent = val1;

  const cell2 = document.createElement('div');
  cell2.className = 'compare-row-value';
  cell2.textContent = val2;

  // Highlight the better value
  if (highlightFn) {
    const winner = highlightFn(val1, val2);
    if (winner === 1) cell1.classList.add('compare-winner');
    else if (winner === 2) cell2.classList.add('compare-winner');
  }

  row.appendChild(labelEl);
  row.appendChild(cell1);
  row.appendChild(cell2);
  return row;
}

// Lower is better (for prices)
function lowerWins(v1, v2) {
  const n1 = parseFloat(v1.replace(/[$,]/g, ''));
  const n2 = parseFloat(v2.replace(/[$,]/g, ''));
  if (Number.isNaN(n1) || Number.isNaN(n2)) return 0;
  if (n1 < n2) return 1;
  if (n2 < n1) return 2;
  return 0;
}

// Higher is better (for horsepower)
function higherWins(v1, v2) {
  const n1 = parseFloat(v1.replace(/[^0-9.]/g, ''));
  const n2 = parseFloat(v2.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(n1) || Number.isNaN(n2)) return 0;
  if (n1 > n2) return 1;
  if (n2 > n1) return 2;
  return 0;
}

function createCtaSection(models) {
  const section = document.createElement('div');
  section.className = 'compare-cta-section';

  models.forEach((car) => {
    const btn = document.createElement('button');
    btn.className = 'compare-cta-btn';
    btn.textContent = `Explore ${car.model.split(' ').pop()}`;

    btn.addEventListener('click', () => {
      const objective = window.openai?.toolInput?.objective || 'DISCOVER_COMPARE';
      const prompt = `I'm interested in the ${car.model} (${car.modelId}). `
        + `Show me the full details for modelId=${car.modelId} with objective=${objective}.`;

      if (window.openai?.sendFollowUpMessage) {
        window.openai.sendFollowUpMessage({ prompt });
      }
    });

    section.appendChild(btn);
  });

  return section;
}

export default async function decorate(block, onDataLoaded, onThemeChanged) {
  block.textContent = 'Comparing models...';
  block.className = 'automotive-car-compare';

  if (onThemeChanged) {
    onThemeChanged((theme) => {
      block.setAttribute('data-theme', theme);
    });
  } else {
    block.setAttribute('data-theme', 'light');
  }

  onDataLoaded.then((data) => {
    block.textContent = '';

    const models = data?.structuredContent?.models || data?.models;

    if (!models || models.length < 2) {
      block.innerHTML = '<p class="compare-error">Comparison data not available. Two models are required.</p>';
      return;
    }

    const [car1, car2] = models;

    const wrapper = document.createElement('div');
    wrapper.className = 'compare-wrapper';

    // Model headers (images + names)
    const headersRow = document.createElement('div');
    headersRow.className = 'compare-headers';

    // Empty cell for label column
    const labelSpacer = document.createElement('div');
    labelSpacer.className = 'compare-label-spacer';
    headersRow.appendChild(labelSpacer);

    headersRow.appendChild(createModelHeader(car1));
    headersRow.appendChild(createModelHeader(car2));
    wrapper.appendChild(headersRow);

    // Comparison table
    const table = document.createElement('div');
    table.className = 'compare-table';

    // Pricing rows
    const pricingLabel = document.createElement('div');
    pricingLabel.className = 'compare-section-label';
    pricingLabel.textContent = 'Pricing';
    table.appendChild(pricingLabel);

    table.appendChild(createComparisonRow('MSRP', formatCurrency(car1.msrp), formatCurrency(car2.msrp), lowerWins));
    table.appendChild(createComparisonRow('Lease', `${formatCurrency(car1.leaseMonthly)}/mo`, `${formatCurrency(car2.leaseMonthly)}/mo`, lowerWins));
    table.appendChild(createComparisonRow('Finance', `${formatCurrency(car1.financeMonthly)}/mo (${car1.financeApr}%)`, `${formatCurrency(car2.financeMonthly)}/mo (${car2.financeApr}%)`, lowerWins));
    table.appendChild(createComparisonRow('Cash Price', formatCurrency(car1.cashPrice), formatCurrency(car2.cashPrice), lowerWins));

    // Specs rows
    const specsLabel = document.createElement('div');
    specsLabel.className = 'compare-section-label';
    specsLabel.textContent = 'Specifications';
    table.appendChild(specsLabel);

    table.appendChild(createComparisonRow('Engine', car1.engine, car2.engine));
    table.appendChild(createComparisonRow('Horsepower', `${car1.horsepower} HP`, `${car2.horsepower} HP`, higherWins));
    table.appendChild(createComparisonRow('Drivetrain', car1.driveType, car2.driveType));
    table.appendChild(createComparisonRow('Economy', car1.mpg || 'N/A', car2.mpg || 'N/A'));

    wrapper.appendChild(table);

    // CTA buttons
    wrapper.appendChild(createCtaSection(models));

    block.appendChild(wrapper);
  }).catch((error) => {
    block.textContent = 'Error loading comparison';
    // eslint-disable-next-line no-console
    console.error('Error loading comparison:', error);
  });
}
