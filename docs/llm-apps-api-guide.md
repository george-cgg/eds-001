# LLM Apps API Integration Guide

Complete guide for building blocks that leverage the LLM Apps API (supporting both OpenAI Apps SDK and MCP Apps) in AEM Edge Delivery Services.

## Table of Contents

- [Overview](#overview)
  - [Environment Compatibility](#environment-compatibility)
- [Quick Start](#quick-start)
- [LLM Context API](#llm-context-api)
  - [Properties](#properties)
  - [Capability Detection](#capability-detection)
  - [Event Subscriptions](#event-subscriptions)
  - [Interactive Methods](#interactive-methods)
- [Helper Functions](#helper-functions)
- [Common Patterns](#common-patterns)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The LLM Context API provides blocks with access to all LLM Apps features (supporting both OpenAI Apps SDK and MCP Apps) including:

- **Data Loading**: Reactive tool output data
- **Theme Support**: Automatic light/dark theme switching
- **Localization**: User's language and region preferences
- **Display Modes**: Inline, PiP, and fullscreen layouts
- **Widget State**: Persistent state across sessions (OpenAI only)
- **Interactive Methods**: Tool calling, follow-ups, file uploads (file ops OpenAI only)
- **Device Detection**: Touch, mobile, desktop capabilities
- **Capability Detection**: Check which features are available in current environment

### Environment Compatibility

The LLM Context API abstracts both OpenAI Apps SDK and MCP Apps, but some features are currently only available in OpenAI:

| Feature | OpenAI Apps | MCP Apps | Notes |
|---------|-------------|----------|-------|
| Data loading | ✅ | ✅ | Both support tool output |
| Theme/Locale | ✅ | ✅ | Both support context properties |
| Display modes | ✅ | ✅ | Both support mode requests |
| Widget state | ✅ | ❌ | Use `hasWidgetState()` to check |
| File upload | ✅ | ❌ | Use `hasFileOperations()` to check |
| File download | ✅ | ❌ | Use `hasFileOperations()` to check |
| Modal requests | ✅ | ❌ | Use `hasModal()` to check |
| Close widget | ✅ | ❌ | Use `hasClose()` to check |
| Available display modes | ❌ | ✅ | Use `hasAvailableDisplayModes()` to check |
| Tool info | ❌ | ✅ | Use `hasToolInfo()` to check |

## Quick Start

### Basic Block Structure

```javascript
export default async function decorate(block, llmContext) {
  // Check environment capabilities
  const capabilities = llmContext.getCapabilities();
  console.log('Running in:', capabilities.environment); // 'openai' or 'mcp'

  // Set initial theme
  block.setAttribute('data-theme', llmContext.theme || 'light');

  // Subscribe to theme changes
  llmContext.on('theme', (theme) => {
    block.setAttribute('data-theme', theme);
  });

  // Load and render data using event pattern
  llmContext.on('toolOutput', (data) => {
    if (!data) return;
    // Render your block with data
    renderContent(block, data);
  });
}
```

## LLM Context API

### Properties

All properties are automatically updated when values change in the host environment.

| Property | Type | Description | Availability |
|----------|------|-------------|--------------|
| `theme` | string | Current theme ('light' or 'dark') | Both |
| `locale` | string | User's locale (e.g., 'en-US', 'es-ES') | Both |
| `displayMode` | string | Current display mode ('inline', 'pip', 'fullscreen') | Both |
| `maxWidth` | number | Maximum widget width in pixels | Both |
| `userAgent` | object | Device type and capabilities | Both |
| `toolInput` | object | Input parameters sent to the tool | Both |
| `toolOutput` | object | Current tool output data | Both |
| `toolResponseMetadata` | object | Tool response metadata | OpenAI only |
| `widgetState` | any | Persisted widget state | OpenAI only |
| `subjectId` | string | Conversation context identifier | Both |
| `view` | object | View parameters and mode | Both |
| `safeArea` | object | Safe area insets for mobile | Both |
| `availableDisplayModes` | array | Display modes supported by host | MCP only |
| `toolInfo` | object | Tool metadata during call | MCP only |

### Capability Detection

Check which features are available before using them:

```javascript
// Get all capabilities
const capabilities = llmContext.getCapabilities();
console.log(capabilities);
// OpenAI environment:
// {
//   environment: 'openai',
//   widgetState: true,
//   fileOperations: true,
//   modal: true,
//   close: true,
//   availableDisplayModes: false,
//   toolInfo: false,
//   callTool: true,
//   sendMessage: true,
//   displayMode: true
// }
// MCP environment:
// {
//   environment: 'mcp',
//   widgetState: false,
//   fileOperations: false,
//   modal: false,
//   close: false,
//   availableDisplayModes: true,
//   toolInfo: true,
//   callTool: true,
//   sendMessage: true,
//   displayMode: true
// }

// Check individual capabilities
if (llmContext.hasWidgetState()) {
  // Use widget state persistence
  llmContext.setWidgetState({ currentStep: 2 });
}

if (llmContext.hasFileOperations()) {
  // Show file upload UI
  showFileUploadButton();
}

if (llmContext.hasModal()) {
  // Can request modal display
  llmContext.requestModal({ title: 'Settings' });
}

// Check MCP-only features
if (llmContext.hasAvailableDisplayModes()) {
  const modes = llmContext.getAvailableDisplayModes();
  console.log('Host supports:', modes); // ['inline', 'pip', 'fullscreen']
}

if (llmContext.hasToolInfo()) {
  const info = llmContext.getToolInfo();
  console.log('Tool metadata:', info);
}
```

**Important**: Attempting to use environment-specific features will log warnings:

```javascript
// In MCP environment - this will warn
llmContext.setWidgetState({ step: 2 });
// Warning: "setWidgetState is only available in OpenAI Apps, not MCP Apps"

// In OpenAI environment - this will warn
const modes = llmContext.getAvailableDisplayModes();
// Warning: "availableDisplayModes is only available in MCP Apps, not OpenAI Apps"
```

### Event Subscriptions

Subscribe to property changes using the `on` method:

```javascript
// Subscribe to a single event
llmContext.on('theme', (newTheme) => {
  console.log('Theme changed to:', newTheme);
});

// Subscribe to multiple events
llmContext.on('locale', (newLocale) => {
  // Re-render with new locale
  renderContent(block, currentData, newLocale);
});

llmContext.on('displayMode', (mode) => {
  block.setAttribute('data-display-mode', mode);
});
```

### Unsubscribe from Events

```javascript
// Method 1: Using the unsubscribe function
const unsubscribe = llmContext.on('theme', callback);
unsubscribe(); // Stop listening

// Method 2: Using off method
const callback = (theme) => console.log(theme);
llmContext.on('theme', callback);
llmContext.off('theme', callback);
```

### Interactive Methods

#### Set Widget State

Persist data and expose it to ChatGPT:

```javascript
await llmContext.setWidgetState({
  userPreference: 'dark',
  scrollPosition: 120,
  selectedItems: ['item1', 'item2'],
});
```

#### Call MCP Tools

Execute tools from within your widget:

```javascript
try {
  await llmContext.callTool('search_products', {
    query: 'coffee',
    category: 'beverages',
  });
} catch (error) {
  console.error('Tool call failed:', error);
}
```

#### Send Follow-Up Messages

Trigger conversational follow-ups:

```javascript
await llmContext.sendFollowUpMessage({
  prompt: 'Tell me more about this product',
});
```

#### Upload Files

Upload images for processing:

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const { fileId } = await llmContext.uploadFile(file);
console.log('Uploaded file ID:', fileId);
```

#### Download Files

Get temporary URLs for uploaded files:

```javascript
const { downloadUrl } = await llmContext.getFileDownloadUrl({ fileId });
img.src = downloadUrl;
```

#### Request Display Mode

Change the widget layout:

```javascript
// Request fullscreen for immersive experience
await llmContext.requestDisplayMode({ mode: 'fullscreen' });

// Request picture-in-picture
await llmContext.requestDisplayMode({ mode: 'pip' });

// Return to inline
await llmContext.requestDisplayMode({ mode: 'inline' });
```

#### Request Modal

Open a modal with custom UI:

```javascript
await llmContext.requestModal({
  template: 'ui://widget/checkout.html',
});
```

#### Close Widget

Programmatically close the widget:

```javascript
llmContext.requestClose();
```

## Helper Functions

Import helper functions from `llm-helpers.js`:

```javascript
import {
  formatCurrency,
  formatDate,
  formatNumber,
  isTouchDevice,
  isMobile,
  isDesktop,
  createStateManager,
  debounce,
  throttle,
} from '../../scripts/llm-helpers.js';
```

### Locale-Aware Formatting

```javascript
// Format currency
formatCurrency(1234.56, 'en-US', 'USD'); // "$1,234.56"
formatCurrency(1234.56, 'es-ES', 'EUR'); // "1.234,56 €"

// Format dates
formatDate(new Date(), 'en-US'); // "January 30, 2026"
formatDate(new Date(), 'fr-FR'); // "30 janvier 2026"

// Format numbers
formatNumber(1234567.89, 'en-US'); // "1,234,567.89"
formatNumber(1234567.89, 'de-DE'); // "1.234.567,89"
```

### Device Detection

```javascript
// Check device capabilities
if (isTouchDevice(llmContext.userAgent)) {
  // Enable touch-specific features
}

if (isMobile(llmContext.userAgent)) {
  // Use mobile-optimized layout
}

if (isDesktop(llmContext.userAgent)) {
  // Enable desktop features
}
```

### Widget State Management

```javascript
const stateManager = createStateManager(llmContext);

// Get current state
const state = stateManager.get();

// Set entire state
await stateManager.set({ key: 'value' });

// Update partial state
await stateManager.update({ newKey: 'newValue' });

// Clear state
await stateManager.clear();
```

## Common Patterns

### Locale-Reactive Rendering

Re-render content when locale changes:

```javascript
export default async function decorate(block, llmContext) {
  let currentData = null;
  const currentLocale = llmContext.locale || 'en-US';

  const renderContent = (data, locale) => {
    block.innerHTML = '';
    // Render with locale-aware formatting
    data.items.forEach(item => {
      const price = formatCurrency(item.price, locale, 'USD');
      // ... render item with formatted price
    });
  };

  // Subscribe to locale changes
  llmContext.on('locale', (newLocale) => {
    if (currentData) {
      renderContent(currentData, newLocale);
    }
  });

  // Load data using event pattern
  llmContext.on('toolOutput', (data) => {
    if (!data) return;
    currentData = data;
    renderContent(data, currentLocale);
  });
}
```

### State Persistence

Save user progress across sessions:

```javascript
export default async function decorate(block, llmContext) {
  const stateManager = createStateManager(llmContext);

  // Restore previous state
  const savedState = stateManager.get();
  if (savedState) {
    currentStep = savedState.currentStep || 1;
    selectedOptions = savedState.selectedOptions || [];
  }

  // Save state on changes
  const saveState = async () => {
    await stateManager.update({
      currentStep,
      selectedOptions,
      timestamp: Date.now(),
    });
  };

  // Save after user interactions
  button.addEventListener('click', async () => {
    currentStep++;
    await saveState();
  });
}
```

### Responsive Display Modes

Adapt to different display modes:

```javascript
export default async function decorate(block, llmContext) {
  const applyDisplayMode = (mode) => {
    block.classList.remove('mode-inline', 'mode-pip', 'mode-fullscreen');
    block.classList.add(`mode-${mode}`);
  };

  // Initial mode
  applyDisplayMode(llmContext.displayMode);

  // React to mode changes
  llmContext.on('displayMode', (mode) => {
    applyDisplayMode(mode);
  });

  // Request fullscreen for complex interactions
  complexButton.addEventListener('click', () => {
    llmContext.requestDisplayMode({ mode: 'fullscreen' });
  });
}
```

### Interactive Follow-Ups

Trigger conversational actions:

```javascript
const askMoreButton = document.createElement('button');
askMoreButton.textContent = 'Learn More';
askMoreButton.addEventListener('click', () => {
  llmContext.sendFollowUpMessage({
    prompt: `Tell me more about ${product.name}`,
  });
});
```

## Examples

### Complete Example: Product Catalog

```javascript
import {
  formatCurrency,
  createStateManager,
  isMobile,
} from '../../scripts/llm-helpers.js';

export default async function decorate(block, llmContext) {
  const locale = llmContext.locale || 'en-US';
  const stateManager = createStateManager(llmContext);

  // Set theme
  block.setAttribute('data-theme', llmContext.theme || 'light');

  // Subscribe to theme changes
  llmContext.on('theme', (theme) => {
    block.setAttribute('data-theme', theme);
  });

  // Restore favorites from state
  const savedState = stateManager.get();
  let favorites = savedState?.favorites || [];

  const renderProducts = (products, locale) => {
    block.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = isMobile(llmContext.userAgent)
      ? 'product-grid-mobile'
      : 'product-grid-desktop';

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const title = document.createElement('h3');
      title.textContent = product.name;

      const price = document.createElement('div');
      price.textContent = formatCurrency(product.price, locale, 'USD');

      const favoriteBtn = document.createElement('button');
      favoriteBtn.textContent = favorites.includes(product.id) ? '★' : '☆';
      favoriteBtn.addEventListener('click', async () => {
        if (favorites.includes(product.id)) {
          favorites = favorites.filter(id => id !== product.id);
        } else {
          favorites.push(product.id);
        }
        await stateManager.update({ favorites });
        favoriteBtn.textContent = favorites.includes(product.id) ? '★' : '☆';
      });

      const askBtn = document.createElement('button');
      askBtn.textContent = 'Ask about this';
      askBtn.addEventListener('click', () => {
        llmContext.sendFollowUpMessage({
          prompt: `Tell me about ${product.name}`,
        });
      });

      card.append(title, price, favoriteBtn, askBtn);
      grid.appendChild(card);
    });

    block.appendChild(grid);
  };

  // Subscribe to locale changes
  let currentData = null;
  llmContext.on('locale', (newLocale) => {
    if (currentData) {
      renderProducts(currentData.products, newLocale);
    }
  });

  // Load data using event pattern
  llmContext.on('toolOutput', (data) => {
    if (!data) {
      console.error('Error: no data received');
      return;
    }
    currentData = data;
    renderProducts(data.products, locale);
  });
}
```

## Best Practices

### 1. Check Capabilities Before Using Features

Always check if a feature is available before using it:

```javascript
// Bad: Assuming feature is available
await llmContext.setWidgetState({ step: 2 }); // May fail silently in MCP

// Good: Check capability first
if (llmContext.hasWidgetState()) {
  await llmContext.setWidgetState({ step: 2 });
} else {
  // Use alternative approach (e.g., localStorage)
  localStorage.setItem('widgetState', JSON.stringify({ step: 2 }));
}
```

### 2. Always Handle Missing Data

```javascript
llmContext.on('toolOutput', (data) => {
  if (!data) {
    console.error('Failed to load data: no data received');
    block.innerHTML = '<p>Unable to load content</p>';
    return;
  }
  // Process data
});
```

### 3. Provide Fallback Values

```javascript
const theme = llmContext.theme || 'light';
const locale = llmContext.locale || 'en-US';
```

### 4. Clean Up Event Listeners

```javascript
const unsubscribe = llmContext.on('theme', callback);

// Clean up when block is removed
const observer = new MutationObserver(() => {
  if (!document.body.contains(block)) {
    unsubscribe();
    observer.disconnect();
  }
});
```

### 5. Keep Widget State Focused (OpenAI Only)

```javascript
// Good: Small, focused state
await llmContext.setWidgetState({
  currentPage: 2,
  selectedFilter: 'active',
});

// Bad: Large, complex state
await llmContext.setWidgetState({
  entireDataset: [...], // Don't store large data
  complexObject: {...}, // Keep it simple
});
```

### 6. Use Debouncing for Frequent Updates

```javascript
import { debounce } from '../../scripts/llm-helpers.js';

const saveState = debounce(async () => {
  await stateManager.update({ scrollPosition });
}, 500);

container.addEventListener('scroll', saveState);
```

### 7. Test in Multiple Environments

Always test your blocks in both OpenAI and MCP environments to ensure graceful degradation:

```javascript
// Check environment and adapt
const env = llmContext.getEnvironment(); // 'openai' or 'mcp'
console.log('Running in:', env);

// Gracefully handle missing features
if (llmContext.hasWidgetState()) {
  // Use widget state (OpenAI)
  restoreWidgetState();
} else {
  // Fallback to localStorage (MCP)
  restoreLocalState();
}

// Adapt UI based on capabilities
if (!llmContext.hasFileOperations()) {
  // Hide file upload UI in MCP
  document.querySelector('.file-upload').style.display = 'none';
}
```

## Troubleshooting

### Data Not Loading

**Problem**: `toolOutput` event never fires

**Solution**:
```javascript
// Add timeout for data loading
let dataReceived = false;
llmContext.on('toolOutput', (data) => {
  dataReceived = true;
  if (!data) {
    console.error('Data loading failed: no data');
    block.innerHTML = '<p>Unable to load content</p>';
    return;
  }
  // Handle data
});

// Set timeout fallback
setTimeout(() => {
  if (!dataReceived) {
    console.error('Data loading timed out');
    block.innerHTML = '<p>Loading timed out</p>';
  }
}, 5000);
```

### Theme Not Updating

**Problem**: Theme changes don't reflect in UI

**Solution**:
```javascript
// Make sure to set data-theme attribute
llmContext.on('theme', (theme) => {
  block.setAttribute('data-theme', theme);
  // Force repaint if needed
  block.style.display = 'none';
  block.offsetHeight; // Trigger reflow
  block.style.display = '';
});
```

### Widget State Not Persisting

**Problem**: State is lost between sessions

**Solution**:
```javascript
// Always await setWidgetState
await llmContext.setWidgetState(state);

// Verify state was saved
const savedState = stateManager.get();
console.log('Saved state:', savedState);
```

### Tool Calls Failing

**Problem**: `callTool` throws errors

**Solution**:
```javascript
try {
  await llmContext.callTool('toolName', params);
} catch (error) {
  if (error.message.includes('not available')) {
    console.warn('Tool not accessible in this environment');
  } else {
    console.error('Tool call failed:', error);
  }
}
```

## See Also

- [OpenAI Apps SDK Reference](https://developers.openai.com/apps-sdk/build/chatgpt-ui)
- [Helper Functions Source](../scripts/llm-helpers.js)
