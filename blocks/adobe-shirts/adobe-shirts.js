function createShirtCard(shirt) {
  const card = document.createElement('div');
  card.className = 'shirt-card';

  // Product image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'shirt-card-image';

  const img = document.createElement('img');
  img.src = shirt.imageUrl;
  img.alt = shirt.name;
  img.loading = 'lazy';

  imageContainer.appendChild(img);
  card.appendChild(imageContainer);

  // Product body
  const body = document.createElement('div');
  body.className = 'shirt-card-body';

  const title = document.createElement('h3');
  title.className = 'shirt-title';
  title.textContent = shirt.name;

  const price = document.createElement('div');
  price.className = 'shirt-price';
  price.textContent = shirt.price;

  const description = document.createElement('p');
  description.className = 'shirt-description';
  description.textContent = shirt.description;

  const color = document.createElement('div');
  color.className = 'shirt-color';
  color.textContent = `Color: ${shirt.color}`;

  body.appendChild(title);
  body.appendChild(price);
  body.appendChild(description);
  body.appendChild(color);
  card.appendChild(body);

  return card;
}

function createCarouselArrows(container, block) {
  const leftArrow = document.createElement('button');
  leftArrow.className = 'carousel-arrow carousel-arrow-left';
  leftArrow.setAttribute('aria-label', 'Previous shirts');
  leftArrow.textContent = '‹';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'carousel-arrow carousel-arrow-right';
  rightArrow.setAttribute('aria-label', 'Next shirts');
  rightArrow.textContent = '›';

  // Update arrow states based on scroll position
  const updateArrows = () => {
    const { scrollLeft } = container;
    const maxScroll = container.scrollWidth - container.clientWidth;

    leftArrow.classList.toggle('disabled', scrollLeft <= 0);
    rightArrow.classList.toggle('disabled', scrollLeft >= maxScroll - 1);
  };

  // Scroll functionality
  const scrollAmount = 320; // pixels to scroll

  leftArrow.addEventListener('click', () => {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Update arrows on scroll
  container.addEventListener('scroll', updateArrows);

  // Initial update
  setTimeout(updateArrows, 100);

  block.appendChild(leftArrow);
  block.appendChild(rightArrow);
}

export default async function decorate(block, onDataLoaded) {
  block.textContent = 'Loading Adobe shirts...';
  block.className = 'adobe-shirts';

  onDataLoaded.then((data) => {
    // Clear the loading message
    block.textContent = '';

    if (!data || !data.shirts || !Array.isArray(data.shirts) || data.shirts.length === 0) {
      block.innerHTML = '<p class="no-shirts">No shirts available at this time.</p>';
      return;
    }

    // Create carousel container
    const container = document.createElement('div');
    container.className = 'shirts-container';

    // Create cards for each shirt
    data.shirts.forEach((shirt) => {
      const card = createShirtCard(shirt);
      container.appendChild(card);
    });

    block.appendChild(container);

    // Add carousel arrows
    createCarouselArrows(container, block);
  }).catch((error) => {
    block.textContent = 'Error loading shirts';
    console.error('Error loading Adobe shirts:', error);
  });
}
