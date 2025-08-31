# PostEvaluator Chrome Extension - Installation Guide

## Step-by-Step Installation Instructions

### Step 1: Download/Prepare Extension Files

You should have the following files in your project folder:
```
ChromeExtensionProject/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── content.css
├── background.js
├── create_icons.html (for generating icons)
└── README.md
```

### Step 2: Create Extension Icons

1. **Open the icon generator:**
   - Open `create_icons.html` in your web browser
   - You'll see three icon previews

2. **Download the icons:**
   - Right-click on the first icon (16x16) → "Save image as" → Save as `icon16.png`
   - Right-click on the second icon (48x48) → "Save image as" → Save as `icon48.png`
   - Right-click on the third icon (128x128) → "Save image as" → Save as `icon128.png`

3. **Place icons in your extension folder:**
   - Make sure all three icon files are in the same folder as your other extension files

### Step 3: Get Gemini API Key

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Create API Key"
   - Copy the generated key (you'll need this later)
   - Keep this key secure and don't share it

### Step 4: Install Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar
   - Press Enter

2. **Enable Developer Mode:**
   - Look for "Developer mode" toggle in the top-right corner
   - Turn it ON (toggle should be blue/enabled)

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to your `ChromeExtensionProject` folder
   - Select the folder and click "Select Folder" (or "Open" on Mac)

4. **Verify Installation:**
   - You should see "PostEvaluator" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar (puzzle piece icon area)

### Step 5: Configure the Extension

1. **Open Extension Popup:**
   - Click the PostEvaluator icon in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon and pin PostEvaluator

2. **Enter API Key:**
   - Paste your Gemini API key in the "Gemini API Key" field
   - Click "Save API Key"
   - Wait for the "API key validated successfully!" message

### Step 6: Test the Extension

1. **Go to LinkedIn:**
   - Navigate to https://www.linkedin.com
   - Log in to your account

2. **Scroll Through Feed:**
   - Start scrolling through your LinkedIn feed
   - You should see floating notifications appear on the right side of posts
   - Notifications show "A" (Accuracy) and "O" (Original Thought) scores

3. **Manual Evaluation (Optional):**
   - Look for "📊 Evaluate Post" buttons on posts
   - Click to see detailed evaluation results

## Troubleshooting

### Extension Not Loading
- **Check file structure:** Ensure all files are in the same folder
- **Check manifest.json:** Make sure it's valid JSON (no syntax errors)
- **Check console:** Look for error messages in Chrome's developer console

### No Icons Showing
- **Missing icon files:** Make sure icon16.png, icon48.png, and icon128.png are in your extension folder
- **Wrong file names:** Icon files must be named exactly as specified

### API Key Issues
- **Invalid key:** Double-check you copied the API key correctly
- **No quota:** Ensure your Google AI Studio account has API quota available
- **Network issues:** Check your internet connection

### No Notifications on LinkedIn
- **Wrong page:** Make sure you're on LinkedIn.com (not LinkedIn Learning, etc.)
- **Extension disabled:** Check that the extension is enabled in chrome://extensions/
- **Refresh page:** Try refreshing the LinkedIn page
- **Check console:** Open browser developer tools (F12) and look for error messages

### Performance Issues
- **Too many posts:** The extension processes posts with delays to avoid rate limiting
- **Close other tabs:** Free up browser resources
- **Check API quota:** Ensure you haven't exceeded your Gemini API limits

## File Checklist

Before installing, make sure you have ALL these files:
- [ ] manifest.json
- [ ] popup.html
- [ ] popup.js
- [ ] content.js
- [ ] content.css
- [ ] background.js
- [ ] icon16.png
- [ ] icon48.png
- [ ] icon128.png

## Security Notes

- Your API key is stored locally in Chrome's secure storage
- No data is sent to external servers except Google's Gemini API
- The extension only accesses LinkedIn.com and Google's API endpoints
- Post content is only sent to Gemini for evaluation

## Need Help?

If you encounter issues:
1. Check the browser console for error messages (F12 → Console tab)
2. Verify all files are present and correctly named
3. Ensure your Gemini API key is valid and has quota
4. Try refreshing the LinkedIn page and extension

## Uninstalling

To remove the extension:
1. Go to `chrome://extensions/`
2. Find "PostEvaluator"
3. Click "Remove"
4. Confirm removal

---

**Congratulations!** You now have a working LinkedIn post evaluation extension that automatically scores posts for accuracy and original thought as you scroll through your feed!