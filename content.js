// Content script for LinkedIn post evaluation
(function() {
  'use strict';

  let evaluationButton = null;
  let isEvaluating = false;
  let evaluatedPosts = new Set(); // Track evaluated posts to avoid duplicates
  let evaluationQueue = []; // Queue for pending evaluations
  let isProcessingQueue = false;

  // Function to create the evaluation button
  function createEvaluationButton() {
    if (evaluationButton) {
      evaluationButton.remove();
    }

    evaluationButton = document.createElement('button');
    evaluationButton.id = 'post-evaluator-btn';
    evaluationButton.innerHTML = '📊 Evaluate Post';
    evaluationButton.className = 'post-evaluator-button';
    
    evaluationButton.addEventListener('click', handleEvaluation);
    
    return evaluationButton;
  }

  // Function to find all LinkedIn posts on the page
  function findAllPosts() {
    const postSelectors = [
      '[data-test-id="main-feed-activity-card"]',
      '.feed-shared-update-v2',
      '.feed-shared-update-v2__description-wrapper'
    ];

    const posts = [];
    for (const selector of postSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const content = extractPostContent(element);
        if (content && content.length > 20) {
          const postId = generatePostId(content);
          if (!evaluatedPosts.has(postId)) {
            posts.push({
              element: element,
              content: content,
              id: postId
            });
          }
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
  async function handleEvaluation() {
    if (isEvaluating) return;

    const postContent = findPostContent();
    if (!postContent) {
      showNotification('No post content found. Please make sure you are on a LinkedIn post.', 'error');
      return;
    }

    if (postContent.length < 10) {
      showNotification('Post content is too short to evaluate.', 'error');
      return;
    }

    isEvaluating = true;
    evaluationButton.disabled = true;
    evaluationButton.innerHTML = '⏳ Evaluating...';

    try {
      // Send message to background script for evaluation
      const response = await chrome.runtime.sendMessage({
        action: 'evaluatePost',
        content: postContent
      });

      if (response && response.success) {
        showEvaluationResults(response.scores);
      } else {
        showNotification(response?.error || 'Evaluation failed. Please check your API key.', 'error');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      showNotification('An error occurred during evaluation.', 'error');
    } finally {
      isEvaluating = false;
      evaluationButton.disabled = false;
      evaluationButton.innerHTML = '📊 Evaluate Post';
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
    const insertionPoint = evaluationButton.parentElement || document.body;
    insertionPoint.appendChild(resultsDiv);
  }

  // Function to show floating notification for auto-evaluation
  function showFloatingNotification(scores, postElement, reasoning = null) {
    const notification = document.createElement('div');
    notification.className = 'post-evaluator-floating-notification';
    
    const avgScore = (scores.accuracy + scores.originality) / 2;
    const scoreColor = avgScore >= 7 ? '#10b981' : avgScore >= 5 ? '#f59e0b' : '#ef4444';
    
    // Create detailed explanation if reasoning is available
    let explanationHtml = '';
    if (reasoning && reasoning.accuracy && reasoning.originality) {
      explanationHtml = `
        <div class="floating-explanation">
          <div class="explanation-section">
            <div class="explanation-header">
              <span class="explanation-label">Accuracy</span>
              <span class="explanation-score" style="color: ${scoreColor}">${scores.accuracy}/10</span>
            </div>
            <div class="explanation-text">${reasoning.accuracy}</div>
          </div>
          <div class="explanation-section">
            <div class="explanation-header">
              <span class="explanation-label">Originality</span>
              <span class="explanation-score" style="color: ${scoreColor}">${scores.originality}/10</span>
            </div>
            <div class="explanation-text">${reasoning.originality}</div>
          </div>
        </div>
      `;
    }
    
    notification.innerHTML = `
      <div class="floating-notification-content">
        <div class="floating-scores">
          <div class="floating-score">
            <span class="floating-score-label">A</span>
            <span class="floating-score-value" style="color: ${scoreColor}">${scores.accuracy}</span>
          </div>
          <div class="floating-score">
            <span class="floating-score-label">O</span>
            <span class="floating-score-value" style="color: ${scoreColor}">${scores.originality}</span>
          </div>
        </div>
        <div class="floating-close" onclick="this.parentElement.parentElement.remove()">×</div>
      </div>
      ${explanationHtml}
    `;

    // Position the notification relative to the post
    const rect = postElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    notification.style.position = 'absolute';
    notification.style.top = (rect.top + scrollTop + 10) + 'px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';

    // Add to document
    document.body.appendChild(notification);

    // Auto-remove after 12 seconds (longer for detailed explanations)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 12000);

    return notification;
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

  // Function to auto-evaluate a post
  async function autoEvaluatePost(post) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'evaluatePost',
        content: post.content
      });

      if (response && response.success) {
        // Mark as evaluated
        evaluatedPosts.add(post.id);
        
        // Show floating notification with reasoning
        showFloatingNotification(response.scores, post.element, response.reasoning);
        
        console.log(`Auto-evaluated post: A${response.scores.accuracy} O${response.scores.originality}`);
      } else {
        console.error('Auto-evaluation failed:', response?.error);
      }
    } catch (error) {
      console.error('Auto-evaluation error:', error);
    }
  }

  // Function to process evaluation queue
  async function processEvaluationQueue() {
    if (isProcessingQueue || evaluationQueue.length === 0) {
      return;
    }

    isProcessingQueue = true;
    
    while (evaluationQueue.length > 0) {
      const post = evaluationQueue.shift();
      await autoEvaluatePost(post);
      
      // Add delay between evaluations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    isProcessingQueue = false;
  }

  // Function to scan for new posts and add to evaluation queue
  function scanForNewPosts() {
    const posts = findAllPosts();
    
    posts.forEach(post => {
      if (!evaluatedPosts.has(post.id) && !evaluationQueue.find(p => p.id === post.id)) {
        evaluationQueue.push(post);
      }
    });
    
    // Process queue if there are new posts
    if (evaluationQueue.length > 0) {
      processEvaluationQueue();
    }
  }

  // Function to add evaluation button to posts (legacy function)
  function addEvaluationButton() {
    const postContent = findPostContent();
    if (!postContent || postContent.length < 10) {
      return;
    }

    // Check if button already exists
    if (document.getElementById('post-evaluator-btn')) {
      return;
    }

    const button = createEvaluationButton();
    const insertionPoint = findInsertionPoint();
    
    if (insertionPoint) {
      insertionPoint.appendChild(button);
    }
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