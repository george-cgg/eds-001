/*
 * LLM Context Base Class
 * Base class for LLM context implementations (OpenAI, MCP, etc.)
 * Contains all methods with default warning implementations
 * Subclasses override only what they support
 */

/* eslint-disable no-underscore-dangle, class-methods-use-this, no-unused-vars */

/**
 * Base class for LLM Context
 * Provides common interface and event emitter pattern
 */
export default class LLMContext {
  constructor(environment) {
    this.environment = environment;
    this.eventListeners = {};

    // Common properties (initialized to null, set by subclasses)
    this.theme = null;
    this.locale = null;
    this.displayMode = null;
    this.maxWidth = null;
    this.userAgent = null;
    this.toolInput = null;
    this.toolOutput = null;
    this.toolResponseMetadata = null;
    this.subjectId = null;
    this.view = null;
    this.safeArea = null;

    // OpenAI-only properties
    this.widgetState = null;

    // MCP-only properties
    this.availableDisplayModes = null;
    this.toolInfo = null;
  }

  // Event emitter methods

  /**
   * Subscribe to context changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    };
  }

  /**
   * Unsubscribe from context changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event to subscribers (protected, for subclasses)
   * @param {string} event - Event name
   * @param {*} value - Event value
   */
  _emit(event, value) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(value));
    }
  }

  // Shared interface methods

  /**
   * Get the current environment
   * @returns {string} Environment type ('openai' or 'mcp')
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * Get capabilities for current environment
   * Default implementation - subclasses override
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return {
      environment: this.environment,
      widgetState: false,
      fileOperations: false,
      modal: false,
      close: false,
      availableDisplayModes: false,
      toolInfo: false,
      callTool: false,
      sendMessage: false,
      displayMode: false,
    };
  }

  // Capability check helpers (default to false, subclasses override)

  hasWidgetState() {
    return false;
  }

  hasFileOperations() {
    return false;
  }

  hasModal() {
    return false;
  }

  hasClose() {
    return false;
  }

  hasAvailableDisplayModes() {
    return false;
  }

  hasToolInfo() {
    return false;
  }

  // OpenAI-only methods with default warning implementations
  // Subclasses override with real implementations

  /**
   * Set widget state (OpenAI only)
   * @param {*} payload - State to persist
   * @returns {Promise<void>}
   */
  setWidgetState(payload) {
    // eslint-disable-next-line no-console
    console.warn(`setWidgetState is only available in OpenAI Apps, not ${this.environment.toUpperCase()} Apps. Consider using localStorage as an alternative.`);
    return Promise.resolve();
  }

  /**
   * Upload a file (OpenAI only)
   * @param {File} file - File to upload
   * @returns {Promise<Object>}
   */
  uploadFile(file) {
    // eslint-disable-next-line no-console
    console.warn(`uploadFile is only available in OpenAI Apps, not ${this.environment.toUpperCase()} Apps`);
    return Promise.reject(new Error('uploadFile not available'));
  }

  /**
   * Get file download URL (OpenAI only)
   * @param {Object} options - Options with fileId
   * @returns {Promise<Object>}
   */
  getFileDownloadUrl(options) {
    // eslint-disable-next-line no-console
    console.warn(`getFileDownloadUrl is only available in OpenAI Apps, not ${this.environment.toUpperCase()} Apps`);
    return Promise.reject(new Error('getFileDownloadUrl not available'));
  }

  /**
   * Request modal display (OpenAI only)
   * @param {Object} options - Modal options
   * @returns {Promise<void>}
   */
  requestModal(options) {
    // eslint-disable-next-line no-console
    console.warn(`requestModal is only available in OpenAI Apps, not ${this.environment.toUpperCase()} Apps`);
    return Promise.resolve();
  }

  /**
   * Request to close the widget (OpenAI only)
   * @returns {Promise<void>}
   */
  requestClose() {
    // eslint-disable-next-line no-console
    console.warn(`requestClose is only available in OpenAI Apps, not ${this.environment.toUpperCase()} Apps`);
    return Promise.resolve();
  }

  // MCP-only methods with default warning implementations
  // Subclasses override with real implementations

  /**
   * Get available display modes (MCP only)
   * @returns {Array|null}
   */
  getAvailableDisplayModes() {
    // eslint-disable-next-line no-console
    console.warn(`availableDisplayModes is only available in MCP Apps, not ${this.environment.toUpperCase()} Apps`);
    return null;
  }

  /**
   * Get tool info (MCP only)
   * @returns {Object|null}
   */
  getToolInfo() {
    // eslint-disable-next-line no-console
    console.warn(`toolInfo is only available in MCP Apps, not ${this.environment.toUpperCase()} Apps`);
    return null;
  }

  // Shared methods with default implementations
  // Subclasses override with environment-specific implementations

  /**
   * Call a tool
   * @param {string} name - Tool name
   * @param {Object} params - Tool parameters
   * @returns {Promise<*>}
   */
  callTool(name, params) {
    // eslint-disable-next-line no-console
    console.warn('callTool not available in current environment');
    return Promise.reject(new Error('callTool not available'));
  }

  /**
   * Send a follow-up message
   * @param {Object} options - Message options
   * @returns {Promise<void>}
   */
  sendFollowUpMessage(options) {
    // eslint-disable-next-line no-console
    console.warn('sendFollowUpMessage not available in current environment');
    return Promise.resolve();
  }

  /**
   * Request display mode change
   * @param {Object} options - Display mode options
   * @returns {Promise<void>}
   */
  requestDisplayMode(options) {
    // eslint-disable-next-line no-console
    console.warn('requestDisplayMode not available in current environment');
    return Promise.resolve();
  }
}
