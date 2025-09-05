// Content script for LinkedIn post evaluation
(function() {
  'use strict';

  let evaluatedPosts = new Set(); // Track evaluated posts to avoid duplicates
  let postButtons = new Map(); // Track buttons for each post

  // Function to create the evaluation button for a specific post
  function createEvaluationButton(postId, postContent) {
    const button = document.createElement('button');
    button.id = `post-evaluator-btn-${postId}`;
    button.innerHTML = '📊 Evaluate';
    button.className = 'post-evaluator-button';
    button.dataset.postId = postId;
    button.dataset.postContent = postContent;
    
    button.addEventListener('click', (e) => handleEvaluation(e, postId, postContent));
    
    return button;
  }

  // Function to find all LinkedIn posts on the page
  function findAllPosts() {
    const postSelectors = [
      '[data-test-id="main-feed-activity-card"]',
      '.feed-shared-update-v2'
    ];

    const posts = [];
    const processedIds = new Set();
    
    for (const selector of postSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const content = extractPostContent(element);
        if (content && content.length > 20) {
          const postId = generatePostId(content);
          
          // Skip if already processed, evaluated, or has a button
          if (processedIds.has(postId) || evaluatedPosts.has(postId) || postButtons.has(postId)) {
            return;
          }
          
          // Check if button already exists in DOM
          if (document.getElementById(`post-evaluator-btn-${postId}`)) {
            return;
          }
          
          processedIds.add(postId);
          posts.push({
            element: element,
            content: content,
            id: postId
          });
        }
      });
    }
    return posts;
  }

  // Function to extract content from a post element
  function extractPostContent(element) {
    const contentSelectors = [
      '.feed-shared-text',
      '.attributed-text-segment-list__content',
      '.feed-shared-update-v2__description',
      '.feed-shared-text__text-view'
    ];

    for (const selector of contentSelectors) {
      const contentElement = element.querySelector(selector);
      if (contentElement && contentElement.textContent.trim()) {
        return contentElement.textContent.trim();
      }
    }
    return null;
  }

  // Function to generate a unique ID for a post
  function generatePostId(content) {
    // Create a simple hash of the content for identification
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  // Function to find LinkedIn post content (legacy function for manual evaluation)
  function findPostContent() {
    const posts = findAllPosts();
    return posts.length > 0 ? posts[0].content : null;
  }

  // Function to add evaluation button to a specific post
  function addButtonToPost(post) {
    const postId = post.id;
    
    // Skip if already has a button or is already evaluated
    if (postButtons.has(postId) || evaluatedPosts.has(postId)) {
      return;
    }

    const button = createEvaluationButton(postId, post.content);
    
    // Find the best place to insert the button for this specific post
    const insertionPoint = findInsertionPointForPost(post.element);
    
    if (insertionPoint) {
      insertionPoint.appendChild(button);
      postButtons.set(postId, { button, element: post.element });
    }
  }

  // Function to find insertion point for a specific post
  function findInsertionPointForPost(postElement) {
    // Try to find the post actions area or create a suitable insertion point
    const selectors = [
      '.feed-shared-control-menu',
      '.feed-shared-actor',
      '.feed-shared-update-v2__description-wrapper',
      '.feed-shared-update-v2__main'
    ];

    for (const selector of selectors) {
      const element = postElement.querySelector(selector);
      if (element) {
        return element;
      }
    }

    // If no specific area found, try to find a good spot within the post
    const descriptionWrapper = postElement.querySelector('.feed-shared-update-v2__description-wrapper');
    if (descriptionWrapper) {
      return descriptionWrapper;
    }

    return postElement;
  }

  // Function to find the best place to insert the button
  function findInsertionPoint() {
    // Try to find the post actions area or create a suitable insertion point
    const selectors = [
      '.feed-shared-control-menu',
      '.feed-shared-actor',
      '.feed-shared-update-v2__description-wrapper',
      '[data-test-id="main-feed-activity-card"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }

    return document.body;
  }

  // Function to handle post evaluation
  async function handleEvaluation(event, postId, postContent) {
    const button = event.target;
    
    if (button.disabled) return;

    if (!postContent) {
      showNotification('No post content found. Please make sure you are on a LinkedIn post.', 'error');
      return;
    }

    if (postContent.length < 10) {
      showNotification('Post content is too short to evaluate.', 'error');
      return;
    }

    // Show loading state
    button.disabled = true;
    button.innerHTML = '<span class="loader"></span> Evaluating...';

    try {
      // Send message to background script for evaluation
      const response = await chrome.runtime.sendMessage({
        action: 'evaluatePost',
        content: postContent
      });

      if (response && response.success) {
        // Mark as evaluated
        evaluatedPosts.add(postId);
        
        // Show evaluation results with detailed reasoning
        showEvaluationResultsForPost(response.scores, postId, postContent, response.reasoning);
        
        // Update button to show completed state
        button.innerHTML = '✅ Evaluated';
        button.style.background = '#10b981';
        
        // Remove button after a delay
        setTimeout(() => {
          if (button.parentElement) {
            button.remove();
            postButtons.delete(postId);
          }
        }, 3000);
        
      } else {
        showNotification(response?.error || 'Evaluation failed. Please check your API key.', 'error');
        // Reset button on error
        button.disabled = false;
        button.innerHTML = '📊 Evaluate';
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      showNotification('An error occurred during evaluation.', 'error');
      // Reset button on error
      button.disabled = false;
      button.innerHTML = '📊 Evaluate';
    }
  }

  // Function to show evaluation results for a specific post
  function showEvaluationResultsForPost(scores, postId, postContent, reasoning = null) {
    const resultsDiv = document.createElement('div');
    resultsDiv.id = `post-evaluator-results-${postId}`;
    resultsDiv.className = 'post-evaluator-results';
    
    // Create detailed reasoning section if available
    let reasoningHtml = '';
    if (reasoning && reasoning.accuracy && reasoning.originality) {
      reasoningHtml = `
        <div class="evaluation-reasoning">
          <h4>📝 Detailed Analysis</h4>
          <div class="reasoning-section">
            <div class="reasoning-item">
              <div class="reasoning-header">
                <span class="reasoning-label">Accuracy Analysis</span>
                <span class="reasoning-score">${scores.accuracy}/10</span>
              </div>
              <div class="reasoning-text">${reasoning.accuracy}</div>
            </div>
            <div class="reasoning-item">
              <div class="reasoning-header">
                <span class="reasoning-label">Originality Analysis</span>
                <span class="reasoning-score">${scores.originality}/10</span>
              </div>
              <div class="reasoning-text">${reasoning.originality}</div>
            </div>
          </div>
        </div>
      `;
    }
    
    resultsDiv.innerHTML = `
      <div class="evaluation-header">
        <h3>📊 Post Evaluation Results</h3>
        <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="evaluation-scores">
        <div class="score-item">
          <span class="score-label">Accuracy:</span>
          <div class="score-bar">
            <div class="score-fill" style="width: ${scores.accuracy * 10}%"></div>
            <span class="score-value">${scores.accuracy}/10</span>
          </div>
        </div>
        <div class="score-item">
          <span class="score-label">Original Thought:</span>
          <div class="score-bar">
            <div class="score-fill" style="width: ${scores.originality * 10}%"></div>
            <span class="score-value">${scores.originality}/10</span>
          </div>
        </div>
      </div>
      <div class="evaluation-summary">
        <p><strong>Overall Assessment:</strong> ${getOverallAssessment(scores)}</p>
      </div>
      ${reasoningHtml}
    `;

    // Remove existing results for this post
    const existingResults = document.getElementById(`post-evaluator-results-${postId}`);
    if (existingResults) {
      existingResults.remove();
    }

    // Find the post element and insert results
    const postData = postButtons.get(postId);
    if (postData) {
      const insertionPoint = postData.element;
      insertionPoint.appendChild(resultsDiv);
    } else {
      // Fallback to document body
      document.body.appendChild(resultsDiv);
    }
  }

  // Function to show evaluation results (legacy function for manual evaluation)
  function showEvaluationResults(scores) {
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'post-evaluator-results';
    resultsDiv.className = 'post-evaluator-results';
    
    resultsDiv.innerHTML = `
      <div class="evaluation-header">
        <h3>📊 Post Evaluation Results</h3>
        <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="evaluation-scores">
        <div class="score-item">
          <span class="score-label">Accuracy:</span>
          <div class="score-bar">
            <div class="score-fill" style="width: ${scores.accuracy * 10}%"></div>
            <span class="score-value">${scores.accuracy}/10</span>
          </div>
        </div>
        <div class="score-item">
          <span class="score-label">Original Thought:</span>
          <div class="score-bar">
            <div class="score-fill" style="width: ${scores.originality * 10}%"></div>
            <span class="score-value">${scores.originality}/10</span>
          </div>
        </div>
      </div>
      <div class="evaluation-summary">
        <p><strong>Overall Assessment:</strong> ${getOverallAssessment(scores)}</p>
      </div>
    `;

    // Remove existing results
    const existingResults = document.getElementById('post-evaluator-results');
    if (existingResults) {
      existingResults.remove();
    }

    // Insert results near the evaluation button
    document.body.appendChild(resultsDiv);
  }


  // Function to get overall assessment
  function getOverallAssessment(scores) {
    const avgScore = (scores.accuracy + scores.originality) / 2;
    
    if (avgScore >= 8) return 'Excellent post with high accuracy and originality';
    if (avgScore >= 6) return 'Good post with solid content';
    if (avgScore >= 4) return 'Average post with room for improvement';
    return 'Post needs significant improvement';
  }

  // Function to show notifications
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `post-evaluator-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Function to scan for new posts and add evaluation buttons
  function scanForNewPosts() {
    const posts = findAllPosts();
    
    posts.forEach(post => {
      addButtonToPost(post);
    });
  }

  // Function to add evaluation button to posts (legacy function)
  function addEvaluationButton() {
    scanForNewPosts();
  }

  // Throttled scroll handler
  let scrollTimeout;
  function handleScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scanForNewPosts();
    }, 1000); // Wait 1 second after scrolling stops
  }

  // Observer to watch for dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Debounce the scanning
        setTimeout(scanForNewPosts, 1000);
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Add scroll listener for auto-evaluation
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initial scan for posts
  setTimeout(scanForNewPosts, 3000);

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'addEvaluationButton') {
      addEvaluationButton();
      sendResponse({success: true});
    }
    if (request.action === 'scanForPosts') {
      scanForNewPosts();
      sendResponse({success: true});
    }
  });
})();