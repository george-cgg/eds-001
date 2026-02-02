/*
 * OpenAI Context Implementation
 * Extends LLMContext with OpenAI-specific functionality
 */

/* eslint-disable no-underscore-dangle, class-methods-use-this */

import LLMContext from './llm-context-base.js';

/**
 * OpenAI Context implementation
 * Handles window.openai integration and OpenAI-specific features
 */
export default class OpenAIContext extends LLMContext {
  constructor() {
    super('openai');
    this._initializeOpenAI();
  }

  /**
   * Initialize OpenAI context
   * @private
   */
  _initializeOpenAI() {
    if (!window.openai) {
      // eslint-disable-next-line no-console
      console.warn('window.openai not available');
      return;
    }

    // Set initial properties from window.openai
    this.theme = window.openai.theme || 'light';
    this.locale = window.openai.locale || 'en-US';
    this.displayMode = window.openai.displayMode || 'inline';
    this.maxWidth = window.openai.maxWidth || 768;
    this.userAgent = window.openai.userAgent || null;
    this.toolInput = window.openai.toolInput || null;
    this.toolOutput = window.openai.toolOutput || null;
    this.toolResponseMetadata = window.openai.toolResponseMetadata || null;
    this.widgetState = window.openai.widgetState || null;
    this.subjectId = window.openai.subjectId || null;
    this.view = window.openai.view || null;
    this.safeArea = window.openai.safeArea || null;

    // Set up data loading
    this._setupDataLoading();

    // Set up reactive event listeners
    this._setupEventListeners();
  }

  /**
   * Set up initial data loading
   * @private
   */
  _setupDataLoading() {
    // Check if data is already available at initialization
    const existingData = window.openai.toolOutput || window.openai?.widget?.props;
    if (existingData) {
      // Data already available, emit event on next tick to allow blocks to set up listeners first
      setTimeout(() => {
        this.toolOutput = existingData;
        this._emit('toolOutput', existingData);
        this._emit('data', existingData);
      }, 0);
    }
    // Otherwise, _setupEventListeners will handle it when openai:set_globals fires
  }

  /**
   * Set up reactive event listeners for global changes
   * @private
   */
  _setupEventListeners() {
    // Listen for all global changes (for reactive updates and initial load)
    window.addEventListener('openai:set_globals', async (event) => {
      const globals = event.detail?.globals || {};

      // Update each property and emit events for changes
      if (globals.theme !== undefined && globals.theme !== this.theme) {
        this.theme = globals.theme;
        this._emit('theme', globals.theme);
      }

      if (globals.locale !== undefined && globals.locale !== this.locale) {
        this.locale = globals.locale;
        this._emit('locale', globals.locale);
      }

      if (globals.displayMode !== undefined && globals.displayMode !== this.displayMode) {
        this.displayMode = globals.displayMode;
        this._emit('displayMode', globals.displayMode);
      }

      if (globals.maxWidth !== undefined && globals.maxWidth !== this.maxWidth) {
        this.maxWidth = globals.maxWidth;
        this._emit('maxWidth', globals.maxWidth);
      }

      if (globals.userAgent !== undefined) {
        this.userAgent = globals.userAgent;
        this._emit('userAgent', globals.userAgent);
      }

      if (globals.toolInput !== undefined) {
        this.toolInput = globals.toolInput;
        this._emit('toolInput', globals.toolInput);
      }

      // Handle toolOutput with polling support for initial load
      if (globals.toolOutput !== undefined) {
        let { toolOutput } = globals;

        // If toolOutput is null on first event, poll for it to become available
        if (!toolOutput && !this.toolOutput && window.openai?.widget?.props) {
          // eslint-disable-next-line no-console
          console.log('toolOutput is null, polling for up to 1 second...');
          const startTime = Date.now();
          const maxWaitTime = 1000; // 1 second
          const pollInterval = 50; // Check every 50ms

          // Poll until toolOutput is available or timeout
          while (!toolOutput && (Date.now() - startTime) < maxWaitTime) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => { setTimeout(r, pollInterval); });
            toolOutput = window.openai?.toolOutput;
          }

          if (toolOutput) {
            // eslint-disable-next-line no-console
            console.log(`toolOutput populated after ${Date.now() - startTime}ms`);
          } else {
            // eslint-disable-next-line no-console
            console.log('toolOutput still null after timeout, using widget.props fallback');
            toolOutput = window.openai?.widget?.props;
          }
        } else if (!toolOutput && !this.toolOutput) {
          // No widget.props either, use whatever is available
          toolOutput = window.openai?.widget?.props;
        }

        // Update property and emit events
        this.toolOutput = toolOutput;
        this._emit('toolOutput', toolOutput);
        this._emit('data', toolOutput);
      }

      if (globals.toolResponseMetadata !== undefined) {
        this.toolResponseMetadata = globals.toolResponseMetadata;
        this._emit('toolResponseMetadata', globals.toolResponseMetadata);
      }

      if (globals.widgetState !== undefined) {
        this.widgetState = globals.widgetState;
        this._emit('widgetState', globals.widgetState);
      }

      if (globals.subjectId !== undefined) {
        this.subjectId = globals.subjectId;
        this._emit('subjectId', globals.subjectId);
      }

      if (globals.view !== undefined) {
        this.view = globals.view;
        this._emit('view', globals.view);
      }

      if (globals.safeArea !== undefined) {
        this.safeArea = globals.safeArea;
        this._emit('safeArea', globals.safeArea);
      }
    }, { passive: true });
  }

  // Override capability detection

  getCapabilities() {
    return {
      environment: 'openai',
      widgetState: !!window.openai?.setWidgetState,
      fileOperations: !!(window.openai?.uploadFile && window.openai?.getFileDownloadUrl),
      modal: !!window.openai?.requestModal,
      close: !!window.openai?.requestClose,
      availableDisplayModes: false, // MCP only
      toolInfo: false, // MCP only
      callTool: !!window.openai?.callTool,
      sendMessage: !!window.openai?.sendFollowUpMessage,
      displayMode: !!window.openai?.requestDisplayMode,
    };
  }

  hasWidgetState() {
    return !!window.openai?.setWidgetState;
  }

  hasFileOperations() {
    return !!(window.openai?.uploadFile && window.openai?.getFileDownloadUrl);
  }

  hasModal() {
    return !!window.openai?.requestModal;
  }

  hasClose() {
    return !!window.openai?.requestClose;
  }

  // Override OpenAI-only methods with real implementations

  setWidgetState(payload) {
    if (window.openai?.setWidgetState) {
      return window.openai.setWidgetState(payload);
    }
    return super.setWidgetState(payload);
  }

  uploadFile(file) {
    if (window.openai?.uploadFile) {
      return window.openai.uploadFile(file);
    }
    return super.uploadFile(file);
  }

  getFileDownloadUrl(options) {
    if (window.openai?.getFileDownloadUrl) {
      return window.openai.getFileDownloadUrl(options);
    }
    return super.getFileDownloadUrl(options);
  }

  requestModal(options) {
    if (window.openai?.requestModal) {
      return window.openai.requestModal(options);
    }
    return super.requestModal(options);
  }

  requestClose() {
    if (window.openai?.requestClose) {
      return window.openai.requestClose();
    }
    return super.requestClose();
  }

  // Override shared methods with OpenAI-specific implementations

  callTool(name, params) {
    if (window.openai?.callTool) {
      return window.openai.callTool(name, params);
    }
    return super.callTool(name, params);
  }

  sendFollowUpMessage(options) {
    if (window.openai?.sendFollowUpMessage) {
      return window.openai.sendFollowUpMessage(options);
    }
    return super.sendFollowUpMessage(options);
  }

  requestDisplayMode(options) {
    if (window.openai?.requestDisplayMode) {
      return window.openai.requestDisplayMode(options);
    }
    return super.requestDisplayMode(options);
  }

  // MCP-only methods NOT overridden - base class warnings apply automatically
  // - getAvailableDisplayModes() → warns "only available in MCP Apps"
  // - getToolInfo() → warns "only available in MCP Apps"
}
