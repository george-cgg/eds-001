/*
 * MCP Context Implementation
 * Extends LLMContext with MCP-specific functionality
 */

/* eslint-disable no-underscore-dangle, class-methods-use-this */

import LLMContext from './llm-context-base.js';

/**
 * MCP Context implementation
 * Handles window.mcpApp integration and MCP-specific features
 */
export default class MCPContext extends LLMContext {
  constructor() {
    super('mcp');
    this._initializeMCP();
  }

  /**
   * Initialize MCP context
   * @private
   */
  _initializeMCP() {
    // Set defaults
    this.theme = 'light';
    this.locale = 'en-US';
    this.displayMode = 'inline';
    this.maxWidth = 768;

    if (window.mcpApp) {
      this._setupExistingMCPApp();
    } else {
      this._setupNewMCPApp();
    }
  }

  /**
   * Set up existing MCP app instance
   * @private
   */
  _setupExistingMCPApp() {
    const app = window.mcpApp;
    const hostContext = app.getHostContext();

    if (hostContext) {
      this.theme = hostContext.theme || 'light';
      this.locale = hostContext.locale || 'en-US';
      this.displayMode = hostContext.displayMode || 'inline';
      this.availableDisplayModes = hostContext.availableDisplayModes || null;
      this.toolInfo = hostContext.toolInfo || null;
    }

    // Set up MCP tool result handler
    app.ontoolresult = (params) => {
      // eslint-disable-next-line no-console
      console.log('MCP Apps tool result', params);
      this.toolOutput = params;
      this._emit('toolOutput', params);
      this._emit('data', params);
    };

    // Set up host context change handler
    app.onhostcontextchanged = (newHostContext) => {
      if (newHostContext.theme !== undefined && newHostContext.theme !== this.theme) {
        this.theme = newHostContext.theme;
        this._emit('theme', newHostContext.theme);
      }

      if (newHostContext.locale !== undefined && newHostContext.locale !== this.locale) {
        this.locale = newHostContext.locale;
        this._emit('locale', newHostContext.locale);
      }

      const newDisplayMode = newHostContext.displayMode;
      if (newDisplayMode !== undefined && newDisplayMode !== this.displayMode) {
        this.displayMode = newDisplayMode;
        this._emit('displayMode', newDisplayMode);
      }

      if (newHostContext.availableDisplayModes !== undefined) {
        this.availableDisplayModes = newHostContext.availableDisplayModes;
        const modes = newHostContext.availableDisplayModes;
        this._emit('availableDisplayModes', modes);
      }

      if (newHostContext.toolInfo !== undefined) {
        this.toolInfo = newHostContext.toolInfo;
        this._emit('toolInfo', newHostContext.toolInfo);
      }
    };
  }

  /**
   * Set up new MCP app instance by importing SDK
   * @private
   */
  _setupNewMCPApp() {
    // Import and create App instance
    // eslint-disable-next-line import/no-unresolved
    import('https://cdn.jsdelivr.net/npm/@modelcontextprotocol/ext-apps@1.0.1/+esm').then(({ App }) => {
      const app = new App({ name: 'AEMEmbed', version: '1.0.0' });
      window.mcpApp = app;

      app.ontoolresult = (params) => {
        // eslint-disable-next-line no-console
        console.log('MCP Apps tool result', params);
        this.toolOutput = params;
        this._emit('toolOutput', params);
        this._emit('data', params);
      };

      app.connect().catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to connect MCP App:', err);
      });
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load MCP Apps SDK:', err);
    });
  }

  // Override capability detection

  getCapabilities() {
    return {
      environment: 'mcp',
      widgetState: false, // OpenAI only
      fileOperations: false, // OpenAI only
      modal: false, // OpenAI only
      close: false, // OpenAI only
      availableDisplayModes: !!window.mcpApp?.getHostContext,
      toolInfo: !!window.mcpApp?.getHostContext,
      callTool: !!window.mcpApp?.callServerTool,
      sendMessage: !!window.mcpApp?.sendMessage,
      displayMode: !!window.mcpApp?.requestDisplayMode,
    };
  }

  hasAvailableDisplayModes() {
    return !!window.mcpApp?.getHostContext;
  }

  hasToolInfo() {
    return !!window.mcpApp?.getHostContext;
  }

  // Override MCP-only methods with real implementations

  getAvailableDisplayModes() {
    if (window.mcpApp?.getHostContext) {
      return window.mcpApp.getHostContext()?.availableDisplayModes || null;
    }
    return super.getAvailableDisplayModes();
  }

  getToolInfo() {
    if (window.mcpApp?.getHostContext) {
      return window.mcpApp.getHostContext()?.toolInfo || null;
    }
    return super.getToolInfo();
  }

  // Override shared methods with MCP-specific implementations

  callTool(name, params) {
    if (window.mcpApp?.callServerTool) {
      return window.mcpApp.callServerTool({ name, arguments: params });
    }
    return super.callTool(name, params);
  }

  sendFollowUpMessage(options) {
    if (window.mcpApp?.sendMessage) {
      // MCP uses structured content format
      return window.mcpApp.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: options.message || options.prompt }],
      });
    }
    return super.sendFollowUpMessage(options);
  }

  requestDisplayMode(options) {
    if (window.mcpApp?.requestDisplayMode) {
      return window.mcpApp.requestDisplayMode(options);
    }
    return super.requestDisplayMode(options);
  }

  // OpenAI-only methods NOT overridden - base class warnings apply automatically
  // - setWidgetState() → warns "only available in OpenAI Apps"
  // - uploadFile() → warns "only available in OpenAI Apps"
  // - getFileDownloadUrl() → warns "only available in OpenAI Apps"
  // - requestModal() → warns "only available in OpenAI Apps"
  // - requestClose() → warns "only available in OpenAI Apps"
}
