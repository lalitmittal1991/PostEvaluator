document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveApiKey');
  const statusDiv = document.getElementById('status');

  // Load saved API key
  chrome.storage.sync.get(['geminiApiKey'], function(result) {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Save API key
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter a valid API key', 'error');
      return;
    }

    // Save to Chrome storage
    chrome.storage.sync.set({geminiApiKey: apiKey}, function() {
      showStatus('API key saved successfully!', 'success');
      
      // Test the API key by sending a message to background script
      chrome.runtime.sendMessage({
        action: 'testApiKey',
        apiKey: apiKey
      }, function(response) {
        if (response && response.success) {
          showStatus('API key validated successfully!', 'success');
        } else {
          const errorMsg = response?.error || 'API key validation failed. Please check your key.';
          showStatus(errorMsg, 'error');
        }
      });
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Hide status after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});