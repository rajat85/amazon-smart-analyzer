// popup.js - Handle API key storage

document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load existing API key on popup open
  chrome.storage.local.get(['geminiApiKey'], function(result) {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Save API key when button clicked
  saveBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    // Basic validation - Gemini API keys start with 'AIza'
    if (!apiKey.startsWith('AIza')) {
      showStatus('Invalid API key format. Google API keys start with "AIza"', 'error');
      return;
    }

    // Save to Chrome storage
    chrome.storage.local.set({ geminiApiKey: apiKey }, function() {
      showStatus('API key saved successfully!', 'success');

      // Clear success message after 3 seconds
      setTimeout(function() {
        statusDiv.style.display = 'none';
      }, 3000);
    });
  });

  // Helper function to show status messages
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }
});
