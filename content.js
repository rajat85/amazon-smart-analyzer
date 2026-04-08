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

      productData = scrapeProductData();
      const validation = validateProductData(productData);

      if (validation.valid) {
        console.log('[Amazon Smart Analyzer] Product data scraped:', productData);
        injectAnalyzeButton();
      } else {
        console.error('[Amazon Smart Analyzer] Invalid product data:', validation.error);
      }
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

  // Extract product data from Amazon page
  function scrapeProductData() {
    const data = {
      title: '',
      price: '',
      currency: '',
      rating: '',
      reviewCount: '',
      reviews: [],
      category: '',
      asin: ''
    };

    try {
      // Extract title
      const titleElement = document.querySelector('#productTitle');
      if (titleElement) {
        data.title = titleElement.textContent.trim();
      }

      // Extract price and currency
      const priceWhole = document.querySelector('.a-price .a-price-whole');
      const priceFraction = document.querySelector('.a-price .a-price-fraction');
      const priceSymbol = document.querySelector('.a-price .a-price-symbol');

      if (priceWhole && priceSymbol) {
        const whole = priceWhole.textContent.replace(/[,\.]/g, '');
        const fraction = priceFraction ? priceFraction.textContent : '00';
        data.price = whole + '.' + fraction;
        data.currency = priceSymbol.textContent.trim();
      }

      // Alternative price selector (for different Amazon layouts)
      if (!data.price) {
        const altPrice = document.querySelector('#priceblock_ourprice, #priceblock_dealprice, .a-price-whole');
        if (altPrice) {
          data.price = altPrice.textContent.replace(/[^0-9.,]/g, '').replace(/,/g, '');
        }
      }

      // Extract currency symbol if not found
      if (!data.currency && data.price) {
        const priceText = document.querySelector('.a-price')?.textContent || '';
        const currencyMatch = priceText.match(/[$£€¥₹]/);
        data.currency = currencyMatch ? currencyMatch[0] : '$';
      }

      // Extract rating
      const ratingElement = document.querySelector('[data-hook="rating-out-of-text"], .a-icon-alt');
      if (ratingElement) {
        const ratingText = ratingElement.textContent;
        const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*out of/i);
        if (ratingMatch) {
          data.rating = ratingMatch[1];
        }
      }

      // Extract review count
      const reviewCountElement = document.querySelector('#acrCustomerReviewText, [data-hook="total-review-count"]');
      if (reviewCountElement) {
        const reviewText = reviewCountElement.textContent;
        const countMatch = reviewText.match(/(\d+(?:,\d+)*)/);
        if (countMatch) {
          data.reviewCount = countMatch[1].replace(/,/g, '');
        }
      }

      // Extract top review snippets (first 3-5 reviews)
      const reviewElements = document.querySelectorAll('[data-hook="review-body"] span');
      for (let i = 0; i < Math.min(5, reviewElements.length); i++) {
        const reviewText = reviewElements[i].textContent.trim();
        if (reviewText.length > 20) { // Skip very short snippets
          // Take first 200 characters
          const snippet = reviewText.substring(0, 200);
          data.reviews.push(snippet);
        }
      }

      // Extract category from breadcrumbs
      const breadcrumbs = document.querySelectorAll('#wayfinding-breadcrumbs_container a, .a-breadcrumb a');
      if (breadcrumbs.length > 0) {
        // Get the last breadcrumb (most specific category)
        data.category = breadcrumbs[breadcrumbs.length - 1].textContent.trim();
      }

      // Extract ASIN from URL
      const asinMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/);
      if (asinMatch) {
        data.asin = asinMatch[1];
      }

    } catch (error) {
      console.error('[Amazon Smart Analyzer] Error scraping product data:', error);
    }

    return data;
  }

  // Validate scraped data
  function validateProductData(data) {
    if (!data.title) {
      return { valid: false, error: 'Could not extract product title' };
    }
    if (!data.price) {
      return { valid: false, error: 'Could not extract product price' };
    }
    return { valid: true };
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
