document.addEventListener("DOMContentLoaded", async () => {
  const pageTitle = document.getElementById("page-title");
  const summarizeBtn = document.getElementById("summarize-btn");
  const status = document.getElementById("status");
  const spinner = document.getElementById("spinner");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const wordCount = document.getElementById("word-count");
  const threePoints = document.getElementById("three-points");

  const summaryLayout = document.getElementById("summary-layout");
  const summarySection = document.getElementById("summary-section");
  const insightsSection = document.getElementById("insights-section");
  const readingTime = document.getElementById("reading-time");

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  pageTitle.textContent = tab.title || "Untitled page";

  function setLoading(isLoading) {
    spinner.classList.toggle("hidden", !isLoading);
    summarizeBtn.disabled = isLoading;
  }

  function setError(message) {
    status.textContent = message;
    status.classList.add("error");
  }

  function clearError() {
    status.classList.remove("error");
  }

  function clearSummary() {
    summarySection.innerHTML = "";
    insightsSection.innerHTML = "";
    readingTime.textContent = "";
    wordCount.textContent = "";
    summaryLayout.classList.add("hidden");
  }

  function renderSummary(data) {
    summarySection.innerHTML = (data.summary || [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    insightsSection.innerHTML = (data.insights || [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    readingTime.textContent = data.readingTime || "";

    const wordTotal = (data.summary || []).join(" ").split(/\s+/).length;

    wordCount.textContent = `${wordTotal} words`;

    summaryLayout.classList.remove("hidden");
  }

  summarizeBtn.addEventListener("click", async () => {
    clearError();
    clearSummary();
    setLoading(true);

    status.textContent = "Extracting page content...";

    try {
      const extraction = await chrome.tabs.sendMessage(tab.id, {
        type: "EXTRACT_PAGE_CONTENT"
      });

      if (!extraction?.success || !extraction.content) {
        throw new Error("Could not extract page content");
      }

      status.textContent = "Summarizing page...";

      const mode = threePoints.checked ? "3-bullets" : "default";

      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE_PAGE",
        url: extraction.url,
        content: extraction.content,
        mode
      });

      if (!response?.success) {
        throw new Error(response?.error || "Summarization failed");
      }

      renderSummary(response.data);

      status.textContent = response.cached
        ? "Loaded from cache"
        : "Summary generated";
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  });

  clearBtn.addEventListener("click", () => {
    clearSummary();
    status.textContent = "";
    clearError();
  });

  copyBtn.addEventListener("click", async () => {
    const summaryText = summarySection.innerText;
    const insightsText = insightsSection.innerText;
    const reading = readingTime.textContent;

    if (!summaryText.trim()) return;

    const text = `Summary:\n${summaryText}\n\nKey Insights:\n${insightsText}\n\nEstimated Reading Time:\n${reading}`;

    await navigator.clipboard.writeText(text);

    status.textContent = "Summary copied";
  });
});