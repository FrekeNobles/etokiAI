chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "SUMMARIZE_PAGE") {
    return;
  }

  handleSummarize(message)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        success: false,
        error: error.message || "Unexpected error"
      });
    });

  return true;
});

async function handleSummarize(message) {
  const { url, content, mode } = message;

  if (!url || !content) {
    throw new Error("Missing required data");
  }

  const cacheKey = `summary:${url}:${mode || "default"}`;

  const cached = await chrome.storage.local.get(cacheKey);

  if (cached[cacheKey]) {
    return {
      success: true,
      cached: true,
      data: cached[cacheKey]
    };
  }

  const response = await fetch("http://localhost:3000/summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content,
      mode
    })
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();

  await chrome.storage.local.set({
    [cacheKey]: data
  });

  return {
    success: true,
    cached: false,
    data
  };
}