# API Key Validation Troubleshooting Guide

## Common Issues and Solutions

### 1. **API Key Format Issues**

**Problem**: "Invalid API key format. Gemini API keys should start with 'AIza'."

**Solution**:
- Make sure you copied the complete API key from Google AI Studio
- Gemini API keys should start with "AIza" followed by 35 characters
- Example: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Don't include any extra spaces or characters

### 2. **Empty API Key**

**Problem**: "API key is empty. Please enter a valid Gemini API key."

**Solution**:
- Make sure you actually entered the API key in the popup
- Check that you didn't accidentally delete it
- Try copying and pasting the key again

### 3. **Invalid or Expired API Key**

**Problem**: "API key is invalid or expired. Please generate a new API key."

**Solutions**:
- Go back to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate a new API key
- Make sure you're using the correct Google account
- Check if the API key was accidentally deleted or regenerated

### 4. **API Access Denied**

**Problem**: "API key access denied. Please check your API key permissions."

**Solutions**:
- Make sure Gemini API is enabled in your Google Cloud project
- Check that your Google account has the necessary permissions
- Verify you're using the correct project's API key

### 5. **Quota Exceeded**

**Problem**: "API quota exceeded. Please check your usage limits."

**Solutions**:
- Check your usage in [Google AI Studio](https://makersuite.google.com/app/apikey)
- Wait for your quota to reset (usually daily)
- Consider upgrading your quota if needed
- Make sure you're not running multiple instances of the extension

### 6. **Network Issues**

**Problem**: "Network error. Please check your internet connection."

**Solutions**:
- Check your internet connection
- Try refreshing the page
- Check if your firewall is blocking the request
- Try using a different network

### 7. **Server Errors**

**Problem**: "Google API server error. Please try again later."

**Solutions**:
- Wait a few minutes and try again
- Check [Google Cloud Status](https://status.cloud.google.com/) for outages
- This is usually temporary

## Step-by-Step Debugging

### Step 1: Verify Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure you can see your API key
3. Copy it again (don't use an old copy)
4. The key should look like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Check API Key Permissions
1. In Google AI Studio, make sure:
   - The API key is active
   - Gemini API is enabled
   - You have the correct permissions

### Step 3: Test API Key Manually
You can test your API key directly in the browser:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Run this test (replace YOUR_API_KEY with your actual key):

```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents: [{parts: [{text: "Hello"}]}]
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### Step 4: Check Extension Console
1. Go to `chrome://extensions/`
2. Find PostEvaluator extension
3. Click "Inspect views: background page"
4. Look for error messages in the console

### Step 5: Reinstall Extension
If nothing else works:
1. Remove the extension from Chrome
2. Reload the extension files
3. Install again
4. Try with a fresh API key

## Getting a New API Key

If you need to generate a new API key:

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the new key** immediately
5. **Paste it in the extension popup**
6. **Click "Save API Key"**

## Still Having Issues?

If you're still getting validation errors:

1. **Check the exact error message** - it should now be more specific
2. **Try a different browser** to rule out browser-specific issues
3. **Check your Google account** - make sure it has access to Gemini API
4. **Contact support** with the specific error message you're seeing

## Quick Checklist

- [ ] API key starts with "AIza"
- [ ] API key is 39 characters long
- [ ] No extra spaces or characters
- [ ] Gemini API is enabled in your Google project
- [ ] You have internet connection
- [ ] You're using the correct Google account
- [ ] API key hasn't expired or been regenerated

---

**Most Common Fix**: Generate a fresh API key from Google AI Studio and try again!