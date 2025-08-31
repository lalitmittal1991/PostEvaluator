# PostEvaluator Chrome Extension

A Chrome extension that automatically evaluates LinkedIn posts for accuracy and original thought using Google's Gemini AI. The extension provides real-time scoring as you scroll through your LinkedIn feed.

## Features

- **Auto-Evaluation**: Automatically evaluates LinkedIn posts as you scroll
- **Real-time Notifications**: Shows floating score notifications on the right side of posts
- **Dual Scoring System**: 
  - **Accuracy (A)**: Rates factual correctness and research quality (1-10)
  - **Original Thought (O)**: Rates creativity and insightfulness (1-10)
- **Smart Post Detection**: Automatically identifies and tracks posts to avoid duplicate evaluations
- **Manual Evaluation**: Optional manual evaluation button for specific posts
- **API Key Management**: Secure storage of your Gemini API key

## Installation

1. **Download the Extension Files**
   - Clone or download this repository
   - Ensure you have all the required files in a folder

2. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for Gemini
   - Copy the API key (you'll need it for setup)

3. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the extension folder
   - The PostEvaluator icon should appear in your extensions toolbar

4. **Setup API Key**
   - Click the PostEvaluator icon in your toolbar
   - Enter your Gemini API key in the popup
   - Click "Save API Key"
   - The extension will validate your key automatically

## Usage

### Automatic Evaluation
- Navigate to LinkedIn and scroll through your feed
- The extension automatically detects new posts
- Floating notifications appear on the right side showing scores
- Notifications auto-disappear after 8 seconds
- Click the × on notifications to dismiss them early

### Manual Evaluation
- Click the "📊 Evaluate Post" button that appears on posts
- View detailed evaluation results with explanations
- Close results using the × button

### Score Interpretation
- **Green (7-10)**: Excellent content
- **Orange (5-6)**: Good content with room for improvement  
- **Red (1-4)**: Content needs significant improvement

## File Structure

```
ChromeExtensionProject/
├── manifest.json          # Extension configuration
├── popup.html            # Settings popup interface
├── popup.js              # Popup functionality
├── content.js            # Main content script for LinkedIn
├── content.css           # Styling for notifications and UI
├── background.js         # API communication with Gemini
└── README.md            # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: 
  - `activeTab`: Access to current LinkedIn tab
  - `storage`: Store API key securely
  - `scripting`: Inject content scripts
- **Host Permissions**: LinkedIn.com and Google's Gemini API
- **Rate Limiting**: 2-second delay between evaluations to respect API limits

## Privacy & Security

- Your API key is stored locally in Chrome's secure storage
- No data is sent to external servers except Google's Gemini API
- Post content is only sent to Gemini for evaluation
- No personal data is collected or stored

## Troubleshooting

### API Key Issues
- Ensure your Gemini API key is valid and active
- Check that you have sufficient API quota
- Verify the key is correctly entered (no extra spaces)

### No Notifications Appearing
- Make sure you're on LinkedIn.com
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the LinkedIn page
- Ensure posts have sufficient content (minimum 20 characters)

### Performance Issues
- The extension processes posts with a 2-second delay to avoid rate limiting
- Large numbers of posts may take time to process
- Close unnecessary browser tabs to improve performance

## Development

To modify or extend the extension:

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the PostEvaluator extension
4. Test your changes on LinkedIn

## Support

For issues or feature requests, please check the extension's console logs:
1. Right-click on LinkedIn → "Inspect"
2. Go to the "Console" tab
3. Look for PostEvaluator-related messages

## License

This project is open source. Feel free to modify and distribute according to your needs.
