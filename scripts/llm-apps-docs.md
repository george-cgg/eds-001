# LLM Apps SDK

**Lightweight JavaScript SDK for building interactive widgets inside AI-powered conversations.**

MCP tools are great for giving AI assistants new capabilities, but their responses are just text. When your tool returns something visual — a product catalog, a vehicle lineup, a booking form — text alone doesn't really work. The SDK lets you render your own HTML widgets right in the conversation, with full control over styling and interactivity. Users swipe through a carousel, click a button, and that action feeds straight back into the chat as a new prompt. Everything stays in one place.

Under the hood, the SDK handles the boring stuff: connecting to the host application, receiving the structured data your tool returned, adapting to the host's theme, and managing the widget lifecycle. You just write standard HTML and JavaScript — fetch the data, render your UI, wire up your buttons. The SDK takes care of the rest.

**Zero dependencies. Works in any browser context. Host-agnostic — supports ChatGPT, Claude, and any MCP-compatible host.**

## Installation

```bash
npm install @adobe/llmapps-sdk
```

Or load it directly in a `<script>` tag:

```html
<script type="module">
  import { LLMApp } from './path/to/llmapps-sdk.js';
</script>
```

## Quick Start

```javascript
import { LLMApp } from '@adobe/llmapps-sdk';

const app = new LLMApp({
  appInfo: { name: 'MyWidget', version: '1.0.0' },
});

await app.connect();

// Get the structured data your MCP tool returned
const { structuredContent } = await app.toolResult;

// Render it however you want
document.getElementById('root').innerHTML = renderProducts(structuredContent);
```

Or use the shorthand:

```javascript
import { createApp } from '@adobe/llmapps-sdk';

const app = await createApp({
  appInfo: { name: 'MyWidget', version: '1.0.0' },
});
const { structuredContent } = await app.toolResult;
```

## API Reference

### Constructor

```javascript
const app = new LLMApp({
  appInfo: { name: 'MyWidget', version: '1.0.0' },
  appCapabilities: {                              // optional
    availableDisplayModes: ['inline', 'fullscreen'],
  },
});
```

### Connection

| Method | Description |
|--------|-------------|
| `await app.connect()` | Connect to the host. Returns the app instance. Safe to call outside an iframe (standalone mode). |
| `app.isConnected` | `true` after a successful handshake with the host. |
| `app.isEmbedded` | `true` if running inside an iframe. |
| `app.host` | Detected host name: `'chatgpt'`, `'claude'`, `'unknown'`, or `null`. |
| `app.destroy()` | Disconnect, clean up listeners and observers. |

### Receiving Data

| Property | Description |
|----------|-------------|
| `await app.toolResult` | Promise that resolves with the tool's response (`{ structuredContent, ... }`). |
| `await app.toolInput` | Promise that resolves with the tool's input arguments. |
| `await app.toolCancelled` | Promise that resolves if the tool invocation is cancelled. |
| `app.onToolInputPartial(callback)` | Subscribe to partial/streaming tool input. Returns an unsubscribe function. |

### Sending Messages

| Method | Description |
|--------|-------------|
| `app.sendMessage(text)` | Send a user message back into the conversation (e.g., from a button click). |
| `app.callTool(name, args)` | Invoke another MCP tool by name. |
| `app.updateModelContext(text)` | Update the model's context with additional information. |
| `app.openLink(url)` | Ask the host to open a URL. |
| `app.log(level, message)` | Send a log message to the host (`'info'`, `'warn'`, `'error'`). |

### Host Context & Theming

| Property / Method | Description |
|-------------------|-------------|
| `app.hostContext` | Object with `theme`, `styles`, `locale`, `displayMode`, `containerDimensions`, etc. |
| `app.hostCapabilities` | What the host supports (`openLinks`, `serverTools`, `logging`, ...). |
| `app.hostInfo` | `{ name, version }` of the host. |
| `app.applyHostStyles(element?)` | Inject the host's CSS variables and fonts into the document (or a specific element). |
| `app.applyContainerDimensions(element?)` | Apply the host's sizing constraints. |
| `app.onContextChange(callback)` | Subscribe to host context changes (e.g., theme switch). Returns an unsubscribe function. |

### Display & Sizing

| Method | Description |
|--------|-------------|
| `app.requestDisplayMode(mode)` | Request `'inline'` or `'fullscreen'` display. |
| `app.reportSize(width, height)` | Manually report widget dimensions to the host. |
| `app.autoResize(element?)` | Automatically report size changes via ResizeObserver. Returns a cleanup function. |

### Resources

| Method | Description |
|--------|-------------|
| `app.readResource(uri)` | Read an MCP resource by URI. |

### Vendor Extensions

The SDK auto-detects the host and exposes host-specific APIs when available. These are features that go beyond the MCP standard and are only available in specific hosts.

#### ChatGPT (`app.chatgpt`)

Available only when running inside ChatGPT (`app.chatgpt` is `null` elsewhere):

```javascript
if (app.chatgpt) {
  // Persist widget state across conversation turns
  app.chatgpt.setWidgetState({ selectedTab: 2 });
  const saved = app.chatgpt.widgetState;

  // File operations
  const { fileId } = await app.chatgpt.uploadFile(myFile);
  const { url } = await app.chatgpt.getFileDownloadUrl({ fileId });

  // UI operations
  await app.chatgpt.requestModal({ uri: 'modal://settings' });
  app.chatgpt.requestClose();
  app.chatgpt.setOpenInAppUrl({ url: 'https://example.com/order/123' });
}
```

## Examples

### Product Carousel with "Tell me more" Button

```javascript
import { LLMApp } from '@adobe/llmapps-sdk';

const app = new LLMApp({
  appInfo: { name: 'ProductCarousel', version: '1.0.0' },
});
await app.connect();

const { structuredContent } = await app.toolResult;

structuredContent.products.forEach(product => {
  const card = document.createElement('div');
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>${product.price}</p>
    <button data-id="${product.id}">Tell me more</button>
  `;

  card.querySelector('button').addEventListener('click', () => {
    app.sendMessage(`Show me details for product ${product.id}`);
  });

  document.getElementById('carousel').appendChild(card);
});
```

### Adapting to Host Theme

```javascript
const app = new LLMApp({
  appInfo: { name: 'ThemedWidget', version: '1.0.0' },
});
await app.connect();

// Apply host CSS variables and fonts
app.applyHostStyles();

// React to theme changes (e.g., light → dark)
app.onContextChange(ctx => {
  document.body.dataset.theme = ctx.theme;
});
```

### Standalone / Development Mode

The SDK works outside of any host too. When not embedded in an iframe, `connect()` returns immediately in standalone mode, `isConnected` is `false`, and `toolResult` never resolves. This lets you develop and test your widget in a regular browser:

```javascript
const app = new LLMApp({
  appInfo: { name: 'MyWidget', version: '1.0.0' },
});
await app.connect();

if (app.isConnected) {
  // Running inside a host — use real data
  const { structuredContent } = await app.toolResult;
  render(structuredContent);
} else {
  // Standalone mode — use mock data for development
  render(mockData);
}
```

## Protocol

The SDK implements the [MCP Apps specification](https://modelcontextprotocol.github.io/ext-apps) using JSON-RPC 2.0 over `postMessage`. See the [OpenAI Apps SDK reference](https://developers.openai.com/apps-sdk/reference) for additional protocol details.

## License

Copyright 2026 Adobe. All Rights Reserved.

See [LICENSE](LICENSE) for details.
