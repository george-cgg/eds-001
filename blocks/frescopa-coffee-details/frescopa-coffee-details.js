function createDetailView(coffee) {
  const container = document.createElement('div');
  container.className = 'coffee-detail-container';

  // Left side - Image
  const imageSection = document.createElement('div');
  imageSection.className = 'coffee-detail-image-section';

  const img = document.createElement('img');
  img.src = coffee.imageUrl;
  img.alt = coffee.name;
  img.className = 'coffee-detail-image';

  imageSection.appendChild(img);

  // Right side - Info
  const infoSection = document.createElement('div');
  infoSection.className = 'coffee-detail-info';

  // Category badge
  if (coffee.category) {
    const category = document.createElement('span');
    category.className = 'coffee-detail-category';
    category.textContent = coffee.category;
    infoSection.appendChild(category);
  }

  // Product name
  const title = document.createElement('h1');
  title.className = 'coffee-detail-title';
  title.textContent = coffee.name;
  infoSection.appendChild(title);

  // SKU
  if (coffee.sku) {
    const sku = document.createElement('span');
    sku.className = 'coffee-detail-sku';
    sku.textContent = coffee.sku;
    infoSection.appendChild(sku);
  }

  // Price
  const price = document.createElement('div');
  price.className = 'coffee-detail-price';
  price.textContent = coffee.price;
  infoSection.appendChild(price);

  // Short description
  if (coffee.shortDescription) {
    const shortDesc = document.createElement('p');
    shortDesc.className = 'coffee-detail-short-desc';
    shortDesc.textContent = coffee.shortDescription;
    infoSection.appendChild(shortDesc);
  }

  // Divider
  const divider = document.createElement('hr');
  divider.className = 'coffee-detail-divider';
  infoSection.appendChild(divider);

  // Full description
  if (coffee.longDescription) {
    const fullDesc = document.createElement('p');
    fullDesc.className = 'coffee-detail-long-desc';
    fullDesc.textContent = coffee.longDescription;
    infoSection.appendChild(fullDesc);
  }

  container.appendChild(imageSection);
  container.appendChild(infoSection);

  return container;
}

export default async function decorate(block, onDataLoaded) {
  block.textContent = 'Loading coffee details...';
  block.className = 'frescopa-coffee-details';

  onDataLoaded.then((data) => {
    block.textContent = '';

    if (!data || !data.coffee) {
      block.innerHTML = '<p class="no-coffee">Coffee details not available.</p>';
      return;
    }

    const detailView = createDetailView(data.coffee);
    block.appendChild(detailView);
  }).catch((error) => {
    block.textContent = 'Error loading coffee details';
    // eslint-disable-next-line no-console
    console.error('Error loading coffee details:', error);
  });
}
