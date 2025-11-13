export default async function decorate(block, onDataLoaded) {
  block.textContent = 'Content loading...';
  onDataLoaded.then((data) => {
    // eslint-disable-next-line no-console
    console.log('Data loaded', data);
    block.textContent = `key1: ${data.key1}\nkey2: ${data.key2}`;
  });
}
