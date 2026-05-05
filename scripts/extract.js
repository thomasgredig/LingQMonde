// meta-tag fallbacks (og:title, og:description, og:image), 
// expanding selectors (.ds-chapo, picture.article__media img), and 
// waiting for the DOM (MutationObserver)
const first = (selectors, root = document) =>
  selectors.map(s => root.querySelector(s)).find(Boolean) || null;

const meta = (namesOrProps) => {
  for (const key of namesOrProps) {
    const el =
      document.querySelector(`meta[property="${key}"]`) ||
      document.querySelector(`meta[name="${key}"]`);
    const v = el?.getAttribute("content")?.trim();
    if (v) return v;
  }
  return null;
};

const cleanText = (s) => (s || "").replace(/\s+/g, " ").trim();

const waitForAny = (selectors, timeoutMs = 4000) =>
  new Promise((resolve) => {
    if (first(selectors)) return resolve(true);

    const obs = new MutationObserver(() => {
      if (first(selectors)) {
        obs.disconnect();
        resolve(true);
      }
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });

    setTimeout(() => {
      obs.disconnect();
      resolve(false);
    }, timeoutMs);
  });

const pickImageUrl = () => {
  // Prefer canonical/share image (often https://... even in MHTML)
  const og = meta(["og:image", "twitter:image"]);
  if (og) return og;

  // Otherwise try common DOM locations
  const img =
    first([
      "figure.article__media img",
      "picture.article__media img",
      "figure img",
      "article img"
    ]);

  if (!img) return null;
  return (
    img.getAttribute("src") ||
    img.getAttribute("data-src") ||
    img.getAttribute("data-lazy") ||
    img.getAttribute("data-lazy-retina") ||
    null
  );
};

const extractMainContent = () => {
  const container =
    first([
      "article.article__content",
      "article.article__content.old__article-content-single",
      "section.article__wrapper article",
      "main article",
      "article"
    ]) || document.body;

  const EXCLUDE = "nav, footer, aside, .share-btns, .meta, .lmd-dropdown";
  const nodes = Array.from(
    container.querySelectorAll(
      // Le Monde paragraphs + some generic fallbacks
      "h2, h3, h4, p.article__paragraph, p, li"
    )
  ).filter((n) => !n.closest(EXCLUDE));

  const lines = nodes
    .map((n) => cleanText(n.textContent))
    .filter((t) => t && t.length > 0);

  // de-dup consecutive duplicates
  const content = [];
  for (const t of lines) {
    if (content.length === 0 || content[content.length - 1] !== t) content.push(t);
  }

  return content;
};

// ---- listener ----
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "getArticle") return;

  (async () => {
    try {
      // Wait for key markers to exist (handles client-rendered pages)
      await waitForAny(
        [
          "h1.ds-title",
          ".ds-article__heading h1",
          ".ds-article__heading .ds-title",
          "h1.article__title",
          "article.article__content",
          "p.article__paragraph"
        ],
        10000
      );

      const titleEl = first(["h1.article__title", "h1.ds-title"]);
      const title =
        cleanText(titleEl?.textContent) ||
        meta(["og:title", "twitter:title"]) ||
        cleanText(document.title) ||
        "Titre introuvable";

      const descEl = first(["p.article__desc", "span.ds-chapo", ".ds-description .ds-chapo"]);
      const description =
        cleanText(descEl?.textContent) ||
        meta(["og:description", "description", "twitter:description"]) ||
        "Description introuvable";

      const image = pickImageUrl() || "Image introuvable";

      const content = extractMainContent();

      sendResponse({ title, description, image, content });
    } catch (error) {
      console.error("Error extracting the article:", error);
      sendResponse({ error: String(error?.message || error) });
    }
  })();

  return true; // keep the message channel open for async sendResponse
});
