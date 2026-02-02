/*
 * LLM Context Helper Functions
 * Utility functions for working with the LLM Context API
 */

import OpenAIContext from './openai-context.js';
import MCPContext from './mcp-context.js';

/**
 * Create LLM Context (factory function)
 * @param {string} env - Environment type ('openai' or 'mcp')
 * @returns {LLMContext} Context instance
 */
export function createLLMContext(env) {
  if (env === 'openai') {
    return new OpenAIContext();
  }
  if (env === 'mcp') {
    return new MCPContext();
  }
  throw new Error(`Unknown environment: ${env}`);
}

/**
 * Format a date according to the user's locale
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale string (e.g., 'en-US', 'es-ES')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'en-US', options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format currency according to the user's locale
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale string (e.g., 'en-US', 'es-ES')
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR')
 * @param {Object} options - Additional Intl.NumberFormat options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, locale = 'en-US', currency = 'USD', options = {}) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(amount);
}

/**
 * Format a number according to the user's locale
 * @param {number} value - The number to format
 * @param {string} locale - The locale string (e.g., 'en-US', 'es-ES')
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number string
 */
export function formatNumber(value, locale = 'en-US', options = {}) {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Check if the device supports touch
 * @param {Object} userAgent - The userAgent object from window.openai
 * @returns {boolean} True if touch is supported
 */
export function isTouchDevice(userAgent) {
  if (!userAgent) {
    // Fallback to browser detection
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }
  return userAgent.capabilities?.touch === true;
}

/**
 * Check if the device supports hover
 * @param {Object} userAgent - The userAgent object from window.openai
 * @returns {boolean} True if hover is supported
 */
export function hasHoverCapability(userAgent) {
  if (!userAgent) {
    // Fallback: assume desktop has hover
    return !isTouchDevice(null);
  }
  return userAgent.capabilities?.hover === true;
}

/**
 * Check if the device is mobile
 * @param {Object} userAgent - The userAgent object from window.openai
 * @returns {boolean} True if mobile device
 */
export function isMobile(userAgent) {
  if (!userAgent) {
    // Fallback to browser detection
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return userAgent.device?.type === 'mobile';
}

/**
 * Check if the device is desktop
 * @param {Object} userAgent - The userAgent object from window.openai
 * @returns {boolean} True if desktop device
 */
export function isDesktop(userAgent) {
  if (!userAgent) {
    return !isMobile(null);
  }
  return userAgent.device?.type === 'desktop';
}

/**
 * Apply safe area insets to an element (useful for mobile)
 * @param {HTMLElement} element - The element to apply insets to
 * @param {Object} safeArea - The safeArea object from window.openai
 */
export function applySafeAreaInsets(element, safeArea) {
  if (!safeArea || !element) return;

  const { insets } = safeArea;
  if (insets) {
    if (insets.top) element.style.paddingTop = `${insets.top}px`;
    if (insets.bottom) element.style.paddingBottom = `${insets.bottom}px`;
    if (insets.left) element.style.paddingLeft = `${insets.left}px`;
    if (insets.right) element.style.paddingRight = `${insets.right}px`;
  }
}

/**
 * Create a state manager for widget state
 * @param {Object} context - The OpenAI Context object
 * @returns {Object} State manager with get, set, update, and clear methods
 */
export function createStateManager(context) {
  return {
    /**
     * Get the current widget state
     * @returns {*} Current widget state
     */
    get() {
      return context.widgetState;
    },

    /**
     * Set the widget state (replaces entire state)
     * @param {*} state - New state
     * @returns {Promise<void>}
     */
    async set(state) {
      return context.setWidgetState(state);
    },

    /**
     * Update the widget state (merges with existing state)
     * @param {Object} updates - Partial state updates
     * @returns {Promise<void>}
     */
    async update(updates) {
      const currentState = this.get() || {};
      const newState = { ...currentState, ...updates };
      return context.setWidgetState(newState);
    },

    /**
     * Clear the widget state
     * @returns {Promise<void>}
     */
    async clear() {
      return context.setWidgetState(null);
    },
  };
}

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function call
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get a translated message based on locale
 * Simple implementation - could be extended with full i18n library
 * @param {string} key - The message key
 * @param {string} locale - The locale string
 * @param {Object} messages - Messages object with locale keys
 * @returns {string} Translated message or key if not found
 */
export function getMessage(key, locale = 'en-US', messages = {}) {
  const [language] = locale.split('-');
  return messages[locale]?.[key] || messages[language]?.[key] || key;
}

/**
 * Create an event listener that auto-unsubscribes when the element is removed
 * @param {HTMLElement} element - The element to watch
 * @param {Function} unsubscribe - The unsubscribe function
 */
export function autoUnsubscribe(element, unsubscribe) {
  if (!element || !unsubscribe) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === element || node.contains(element)) {
          unsubscribe();
          observer.disconnect();
        }
      });
    });
  });

  observer.observe(element.parentElement || document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Wait for data to be available with timeout
 * @param {Promise} dataPromise - The data promise
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<*>} Resolves with data or rejects on timeout
 */
export function waitForData(dataPromise, timeout = 5000) {
  return Promise.race([
    dataPromise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Data loading timeout')), timeout);
    }),
  ]);
}

/**
 * Log analytics event (stub - implement based on your analytics provider)
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 * @param {Object} context - OpenAI context for additional metadata
 */
export function logAnalyticsEvent(eventName, properties = {}, context = null) {
  const metadata = {
    timestamp: new Date().toISOString(),
    locale: context?.locale,
    displayMode: context?.displayMode,
    userAgent: context?.userAgent,
    ...properties,
  };

  // eslint-disable-next-line no-console
  console.log('Analytics Event:', eventName, metadata);

  // TODO: Implement actual analytics tracking
  // Example: window.analytics?.track(eventName, metadata);
}
