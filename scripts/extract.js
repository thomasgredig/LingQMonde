chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticle") {
        try {
            let titleElement = document.querySelector("h1.article__title");

            if (!titleElement || !titleElement.textContent.trim()) {
              titleElement = document.querySelector("h1.ds-title");
            }

            const title = titleElement ? titleElement.textContent.trim() : "";

            const description = document.querySelector("p.article__desc");
            const imageElement = document.querySelector("figure.article__media img");
            // ignore embedded images for now
            if (!imageElement.src.startsWith("http")) {
                imageElement = null;
            }

            const contentElements = Array.from(document.querySelectorAll(".article__content h2, .article__content h3, .article__content h4, .article__content p"));
        
            const content = contentElements.map(element => {
              const tagName = element.tagName.toLowerCase();
              const textContent = element.textContent.trim();
        
              if (tagName === "h2" || tagName === "h3" || tagName === "h4") {
                return `[${tagName}] ${textContent}`;
              }
              return textContent;
            });
        
            const extractedData = {
              title: title ? title.textContent.trim() : "Title not found",
              description: description ? description.textContent.trim() : "Description not found",
              image: imageElement ? imageElement.src : "Image not found",
              content
            };
        
            console.log(extractedData);
            sendResponse(extractedData);
          } catch (error) {
            console.error("Error extracting the article:", error);
          }
    }
    return true;
  });