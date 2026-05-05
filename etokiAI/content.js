function extractReadableContent() {
  const preferredSelectors = [
    "article",
    "main",
    "[role='main']"
  ];

  let root = null;

  for (const selector of preferredSelectors) {
    const found = document.querySelector(selector);
    if (found) {
      root = found;
      break;
    }
  }

  if (!root) {
    root = document.body;
  }

  const clone = root.cloneNode(true);

  const junkSelectors = [
    "nav",
    "header",
    "footer",
    "aside",
    "script",
    "style",
    "noscript",
    "form"
  ];

  junkSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  const text = clone.innerText
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 12000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_PAGE_CONTENT") {
    try {
      const content = extractReadableContent();

      sendResponse({
        success: true,
        title: document.title,
        url: window.location.href,
        content
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: "Failed to extract page content."
      });
    }

    return true;
  }
});