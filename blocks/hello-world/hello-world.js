export default async function decorate(block, llmContext) {
  block.textContent = 'Content loading...';

  // Set theme
  block.setAttribute('data-theme', llmContext.theme || 'light');

  // Subscribe to theme changes
  llmContext.on('theme', (theme) => {
    block.setAttribute('data-theme', theme);
  });

  llmContext.on('toolOutput', (data) => {
    // eslint-disable-next-line no-console
    console.log('Data loaded', data);
    if (data) {
      block.textContent = `key1: ${data.key1}\nkey2: ${data.key2}`;
    }
  });
}
