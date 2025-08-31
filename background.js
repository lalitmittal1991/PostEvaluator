// Background script for API communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'testApiKey') {
    testApiKey(request.apiKey)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'evaluatePost') {
    evaluatePost(request.content)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Keep message channel open for async response
  }
});

// Function to test API key
async function testApiKey(apiKey) {
  try {
    // Validate API key format
    if (!apiKey || apiKey.trim().length === 0) {
      return {success: false, error: 'API key is empty. Please enter a valid Gemini API key.'};
    }

    if (!apiKey.startsWith('AIza')) {
      return {success: false, error: 'Invalid API key format. Gemini API keys should start with "AIza".'};
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello, this is a test message. Please respond with 'API key is working' if you can read this."
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      // Provide specific error messages based on status codes
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid API key format or request. Please check your API key.';
          break;
        case 401:
          errorMessage = 'API key is invalid or expired. Please generate a new API key.';
          break;
        case 403:
          errorMessage = 'API key access denied. Please check your API key permissions.';
          break;
        case 429:
          errorMessage = 'API quota exceeded. Please check your usage limits.';
          break;
        case 500:
          errorMessage = 'Google API server error. Please try again later.';
          break;
        default:
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
      }
      
      return {success: false, error: errorMessage};
    }

    const data = await response.json();
    
    // Check if the response contains valid data
    if (!data.candidates || !data.candidates[0]) {
      return {success: false, error: 'Invalid response from Gemini API. Please try again.'};
    }

    return {success: true, message: 'API key is valid and working!'};
  } catch (error) {
    console.error('API key test failed:', error);
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {success: false, error: 'Network error. Please check your internet connection.'};
    }
    
    return {success: false, error: `Connection failed: ${error.message}`};
  }
}

// Function to evaluate post content
async function evaluatePost(content) {
  try {
    // Get API key from storage
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    const apiKey = result.geminiApiKey;
    
    if (!apiKey) {
      throw new Error('API key not found. Please set your Gemini API key in the extension popup.');
    }

    const prompt = `Please evaluate the following LinkedIn post on two parameters: Accuracy and Original Thought. Rate each parameter on a scale of 1-10 where:
- Accuracy (1-10): How factually correct and well-researched the content appears. Consider: factual claims, statistics, references, logical consistency, and evidence provided.
- Original Thought (1-10): How original, creative, and insightful the ideas are. Consider: unique perspectives, innovative thinking, personal insights, creative solutions, and fresh approaches.

Post content: "${content}"

Please respond with ONLY a JSON object in this exact format:
{
  "accuracy": [number between 1-10],
  "originality": [number between 1-10],
  "reasoning": {
    "accuracy": "[detailed explanation of accuracy score - mention specific factual issues, missing evidence, or strong points. Keep it concise but informative, max 100 words]",
    "originality": "[detailed explanation of originality score - mention what makes it unique or generic, creative elements, or lack thereof. Keep it concise but informative, max 100 words]"
  }
}

Do not include any other text, explanations, or formatting outside the JSON object.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from API');
    }

    const responseText = data.candidates[0].content.parts[0].text.trim();
    
    // Try to parse the JSON response
    let evaluation;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse evaluation response:', responseText);
      throw new Error('Failed to parse evaluation response. The AI response was not in the expected format.');
    }

    // Validate the response structure
    if (typeof evaluation.accuracy !== 'number' || typeof evaluation.originality !== 'number') {
      throw new Error('Invalid evaluation format received from AI');
    }

    // Ensure scores are within valid range
    evaluation.accuracy = Math.max(1, Math.min(10, Math.round(evaluation.accuracy)));
    evaluation.originality = Math.max(1, Math.min(10, Math.round(evaluation.originality)));

    return {
      success: true,
      scores: {
        accuracy: evaluation.accuracy,
        originality: evaluation.originality
      },
      reasoning: evaluation.reasoning || {
        accuracy: 'No detailed reasoning provided',
        originality: 'No detailed reasoning provided'
      }
    };

  } catch (error) {
    console.error('Post evaluation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}