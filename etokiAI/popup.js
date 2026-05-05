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

  function renderStructuredSummary(text) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));

    wordCount.textContent = `${words} words`;

    const sentences = text
      .split(".")
      .map((s) => s.trim())
      .filter(Boolean);

    const summaryLimit = threePoints.checked ? 3 : 4;

    const summaryPoints = sentences.slice(0, summaryLimit);
    const insightPoints = sentences.slice(summaryLimit, summaryLimit + 3);

    summarySection.innerHTML = summaryPoints
      .map((point) => `<li>${point}.</li>`)
      .join("");

    insightsSection.innerHTML = insightPoints
      .map((point) => `<li>${point}.</li>`)
      .join("");

    readingTime.textContent = `${readingMinutes} min read`;

    summaryLayout.classList.remove("hidden");
  }

  summarizeBtn.addEventListener("click", async () => {
    clearError();
    clearSummary();
    setLoading(true);

    status.textContent = "Summarizing page...";

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "EXTRACT_PAGE_CONTENT"
      });

      if (!response?.success || !response.content) {
        throw new Error("No meaningful content found.");
      }

      renderStructuredSummary(response.content);
      status.textContent = "Done";
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

    const text = `Summary:\n${summaryText}\n\nKey Insights:\n${insightsText}\n\nEstimated Reading Time:\n${reading}`;

    if (!summaryText.trim()) return;

    await navigator.clipboard.writeText(text);
    status.textContent = "Summary copied";
  });
});