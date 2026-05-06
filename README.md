# etokiAI — AI Page Summarizer Chrome Extension

etokiAI is a Chrome Extension (Manifest V3) that extracts readable content from webpages and generates structured AI-style summaries, key insights, and estimated reading time.

It is built as a real-world browser tool with a secure backend proxy architecture.

---

## Features

- Extracts main article content from webpages
- Generates structured summaries (bullet points)
- Extracts key insights
- Estimates reading time
- “3 bullet summary” mode option
- Copy summary to clipboard
- Clear output functionality
- Loading and error states
- Caching using chrome.storage to avoid repeated requests

---

## Tech Stack

- Vanilla JavaScript
- Chrome Extension (Manifest V3)
- Node.js + Express (Proxy Server)

---

## Project Structure

```text
project-root/
├── etokiAI/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── content.js
│   └── background.js
│
├── proxy-server/
│   ├── server.js
│   ├── package.json
│   └── .env
```

---

## Setup Instructions

### Clone the repository

```bash
git clone <your-repo-url>
cd project-root
```

### Setup Proxy Server

```bash
cd proxy-server
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=3000
GEMINI_API_KEY=your_api_key_here
```

### Load the Extension Locally

This is a local extension and is not intended for the Chrome Web Store.

1. Open Chrome
2. Go to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the `etokiAI` folder

---

## Architecture Explanation

### Content Script
Extracts readable content from the webpage and removes obvious clutter like navbars, footers, and scripts.

### Popup UI
Handles user interaction and displays the summary, key insights, and reading time.

### Background Service Worker
Receives requests from the popup, calls the proxy server, and caches summaries per URL using `chrome.storage`.

### Proxy Server
Receives extracted content, calls the AI provider, and returns structured JSON. API keys remain server-side.

---

## AI Integration Explanation

The extension uses a secure proxy server instead of calling the AI provider directly from the frontend.

Flow:

1. Popup requests extracted page content
2. Content script returns clean page text
3. Popup sends content to background script
4. Background script sends content to proxy server
5. Proxy server calls the AI provider
6. Structured summary is returned to the popup

---

## Security Decisions

- API keys are stored only in the proxy server `.env`
- No secrets are exposed in popup, content script, or background script
- Minimal Chrome permissions are used
- Summaries are cached locally with `chrome.storage`

---

## Trade-offs

### Proxy Server
Using a proxy adds setup complexity but keeps API keys secure.

### Content Extraction
The current extraction is lightweight and fast, though not perfect for every site.

### AI Provider Dependence
Summarization quality depends on external provider availability and quota.

---

## Usage

1. Open an article page
2. Click the etokiAI extension icon
3. Click **Summarize Page**
4. View:
   - Summary
   - Key Insights
   - Estimated Reading Time
