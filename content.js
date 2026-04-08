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

  // Inject "Analyze with AI" button into Amazon page
  function injectAnalyzeButton() {
    // Check if button already exists
    if (document.getElementById('ai-analyzer-button')) {
      return;
    }

    // Create button
    const button = document.createElement('button');
    button.id = 'ai-analyzer-button';
    button.className = 'ai-analyzer-button';
    button.innerHTML = '🔍 Analyze with AI';

    // Create results container (hidden initially)
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'ai-analyzer-results';
    resultsContainer.className = 'ai-analyzer-results';
    resultsContainer.style.display = 'none';

    // Find injection point (near product title)
    const titleElement = document.querySelector('#productTitle');
    const priceElement = document.querySelector('#corePrice_feature_div, #priceblock_feature_div');

    let insertionPoint = null;

    if (priceElement) {
      // Insert after price element
      insertionPoint = priceElement;
    } else if (titleElement) {
      // Fallback: insert after title
      insertionPoint = titleElement.parentElement;
    }

    if (insertionPoint) {
      // Create wrapper div for button and results
      const wrapper = document.createElement('div');
      wrapper.id = 'ai-analyzer-wrapper';
      wrapper.style.marginTop = '15px';
      wrapper.style.marginBottom = '15px';

      wrapper.appendChild(button);
      wrapper.appendChild(resultsContainer);

      // Insert after the insertion point
      insertionPoint.insertAdjacentElement('afterend', wrapper);

      // Attach click event
      button.addEventListener('click', handleAnalyzeClick);

      console.log('[Amazon Smart Analyzer] Button injected successfully');
    } else {
      console.error('[Amazon Smart Analyzer] Could not find insertion point for button');
    }
  }

  // Handle analyze button click
  async function handleAnalyzeClick(event) {
    const button = event.target;
    const resultsContainer = document.getElementById('ai-analyzer-results');

    console.log('[Amazon Smart Analyzer] Analyze button clicked');

    // Check if API key is configured
    const apiKey = await getApiKey();
    if (!apiKey) {
      showError('Please configure your Gemini API key in the extension settings.');
      return;
    }

    // Disable button and show loading state
    button.disabled = true;
    button.innerHTML = '⏳ Analyzing...';

    // Show loading message in results
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div class="ai-loading">Analyzing product... This may take 10-20 seconds.</div>';

    // Scrape fresh data
    productData = scrapeProductData();
    const validation = validateProductData(productData);

    if (!validation.valid) {
      showError(validation.error);
      resetButton(button);
      return;
    }

    // Call Gemini API (implemented in next task)
    try {
      const analysis = await analyzeProduct(productData, apiKey);
      displayResults(analysis);
    } catch (error) {
      showError(error.message);
    } finally {
      resetButton(button);
    }
  }

  // Get API key from storage
  function getApiKey() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['geminiApiKey'], function(result) {
        resolve(result.geminiApiKey || null);
      });
    });
  }

  // Reset button to initial state
  function resetButton(button) {
    button.disabled = false;
    button.innerHTML = '🔍 Analyze with AI';
  }

  // Show error message (placeholder - full implementation in next task)
  function showError(message) {
    const resultsContainer = document.getElementById('ai-analyzer-results');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `<div class="ai-error">${escapeHtml(message)}</div>`;
    console.error('[Amazon Smart Analyzer]', message);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Analyze product using Gemini API
  async function analyzeProduct(data, apiKey) {
    const prompt = buildPrompt(data);

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    const url = `${GEMINI_API_ENDPOINT}?key=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return handleApiError(response);
      }

      const result = await response.json();
      return parseGeminiResponse(result);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Analysis timed out. Please try again.');
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Build prompt for Gemini
  function buildPrompt(data) {
    let prompt = `Analyze this Amazon product and provide a buying recommendation:\n\n`;
    prompt += `Product: ${data.title}\n`;
    prompt += `Price: ${data.currency}${data.price}\n`;

    if (data.rating) {
      prompt += `Rating: ${data.rating}/5`;
      if (data.reviewCount) {
        prompt += ` (${data.reviewCount} reviews)`;
      }
      prompt += `\n`;
    }

    if (data.category) {
      prompt += `Category: ${data.category}\n`;
    }

    if (data.reviews && data.reviews.length > 0) {
      prompt += `\nTop Customer Reviews:\n`;
      data.reviews.forEach((review, index) => {
        prompt += `- ${review}\n`;
      });
    }

    prompt += `\nProvide your analysis in this EXACT JSON format:\n`;
    prompt += `{\n`;
    prompt += `  "verdict": "Good Deal" | "Fair" | "Overpriced",\n`;
    prompt += `  "pros": ["point1", "point2", "point3"],\n`;
    prompt += `  "cons": ["point1", "point2", "point3"],\n`;
    prompt += `  "priceAssessment": "Brief paragraph about whether the price is reasonable for this product category, brand, and specifications."\n`;
    prompt += `}\n\n`;
    prompt += `Be concise, honest, and focus on value for money. Ensure your response is valid JSON.`;

    return prompt;
  }

  // Handle API error responses
  function handleApiError(response) {
    const status = response.status;

    if (status === 401 || status === 403) {
      throw new Error('Invalid API key. Please check your settings.');
    } else if (status === 429) {
      throw new Error('Too many requests. Please wait a minute and try again.');
    } else if (status >= 500) {
      throw new Error('Analysis service unavailable. Please try again later.');
    } else {
      throw new Error(`API error (${status}). Please try again.`);
    }
  }

  // Parse Gemini response
  function parseGeminiResponse(result) {
    try {
      // Extract text from Gemini response
      const text = result.candidates[0].content.parts[0].text;

      // Try to extract JSON from response (may have markdown formatting)
      let jsonText = text;

      // Remove markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                       text.match(/```\s*([\s\S]*?)\s*```/) ||
                       text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0];
      }

      // Parse JSON
      const analysis = JSON.parse(jsonText);

      // Validate structure
      if (!analysis.verdict || !analysis.pros || !analysis.cons || !analysis.priceAssessment) {
        throw new Error('Invalid response structure');
      }

      // Ensure arrays
      if (!Array.isArray(analysis.pros)) {
        analysis.pros = [analysis.pros];
      }
      if (!Array.isArray(analysis.cons)) {
        analysis.cons = [analysis.cons];
      }

      return analysis;

    } catch (error) {
      console.error('[Amazon Smart Analyzer] Failed to parse response:', error);
      throw new Error('Failed to parse analysis. Please try again.');
    }
  }

  // Display analysis results
  function displayResults(analysis) {
    const resultsContainer = document.getElementById('ai-analyzer-results');

    // Build HTML for results
    const html = `
      <div class="ai-results-header">
        <h3>AI Analysis</h3>
        <button class="ai-close-btn" onclick="document.getElementById('ai-analyzer-results').style.display='none'">×</button>
      </div>

      <div class="ai-verdict ${getVerdictClass(analysis.verdict)}">
        ${escapeHtml(analysis.verdict)}
      </div>

      <div class="ai-section">
        <h4>✓ Pros</h4>
        <ul class="ai-pros-list">
          ${analysis.pros.map(pro => `<li>${escapeHtml(pro)}</li>`).join('')}
        </ul>
      </div>

      <div class="ai-section">
        <h4>✗ Cons</h4>
        <ul class="ai-cons-list">
          ${analysis.cons.map(con => `<li>${escapeHtml(con)}</li>`).join('')}
        </ul>
      </div>

      <div class="ai-section">
        <h4>💰 Price Assessment</h4>
        <p class="ai-price-assessment">${escapeHtml(analysis.priceAssessment)}</p>
      </div>

      <div class="ai-footer">
        <small>Powered by Google Gemini AI</small>
      </div>
    `;

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';

    console.log('[Amazon Smart Analyzer] Results displayed');
  }

  // Get CSS class for verdict badge
  function getVerdictClass(verdict) {
    const verdictLower = verdict.toLowerCase();
    if (verdictLower.includes('good')) {
      return 'verdict-good';
    } else if (verdictLower.includes('overpriced') || verdictLower.includes('expensive')) {
      return 'verdict-bad';
    } else {
      return 'verdict-fair';
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
