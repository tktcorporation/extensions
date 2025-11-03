<p align="center">
  <img src="./assets/icon.png" height="128">
  <h1 align="center">App Search</h1>
</p>

Find and launch installed applications using AI-powered natural language search.

![screenshot_search-apps-01-ai-coding](./metadata/search-apps-01-ai-coding.png)

## Features

- 🤖 **AI-Powered Search** - Type naturally: "mail app", "browser", "app for editing photos"
- 🔍 **Smart Fuzzy Matching** - Find apps with partial names or acronyms (e.g., "vsc" → Visual Studio Code)
- ⚡ **Instant Launch** - Press Enter to open apps immediately
- 💡 **Smart Suggestions** - Get recommendations based on your search intent

## Usage

1. Open Raycast and type `Search Apps`
2. Type what you're looking for:
   - App name: `chrome`, `vscode`, `slack`
   - Purpose: `email app`, `code editor`, `browser`
   - Natural language: `app for editing photos`
3. Press **Enter** to launch the app

### Pro Tips

- **Short queries** (≤3 chars): Use fuzzy matching, then select "Ask AI" for better results
- **Long queries** (4+ chars): AI automatically helps find apps by purpose
- **No results?**: The "Ask AI" option appears automatically

## Examples

```
"mail"           → Mail, Thunderbird, Spark
"vsc"            → Visual Studio Code
"browser"        → Chrome, Safari, Firefox
"recording"      → QuickTime Player, Screen Studio
"photo editor"   → Photoshop, Preview, Pixelmator
```

## Development

```bash
npm install    # Install dependencies
npm run dev    # Development mode
npm test       # Run tests
npm run lint   # Check code quality
```

## License

MIT
