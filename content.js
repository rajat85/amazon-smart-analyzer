// content.js - Main content script for Amazon Smart Analyzer

(function() {
  'use strict';

  // Configuration
  const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const API_TIMEOUT = 30000; // 30 seconds

  // State
  let isProductPage = false;
  let productData = null;

  // Initialize extension
  function init() {
    console.log('[Amazon Smart Analyzer] Content script loaded');

    if (detectProductPage()) {
      console.log('[Amazon Smart Analyzer] Product page detected');
      isProductPage = true;
      injectAnalyzeButton();
    } else {
      console.log('[Amazon Smart Analyzer] Not a product page');
    }
  }

  // Detect if current page is an Amazon product page
  function detectProductPage() {
    // Check URL pattern for product pages
    const url = window.location.href;

    // Amazon product URLs contain /dp/ or /gp/product/
    const isProductURL = url.includes('/dp/') || url.includes('/gp/product/');

    // Also check for ASIN in URL (10-character alphanumeric code)
    const asinPattern = /\/([A-Z0-9]{10})/;
    const hasASIN = asinPattern.test(url);

    // Verify product title exists on page
    const productTitle = document.querySelector('#productTitle');

    return (isProductURL || hasASIN) && productTitle !== null;
  }

  // Placeholder for button injection (implemented in next task)
  function injectAnalyzeButton() {
    console.log('[Amazon Smart Analyzer] Would inject button here');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
