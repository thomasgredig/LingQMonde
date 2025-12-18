chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticle") {
        try {
            const title =   document.querySelector("h1.article__title") || document.querySelector("h1.ds-title");


            const description = document.querySelector("p.article__desc");
            let imageElement = document.querySelector("figure.article__media img");
            // ignore embedded images for now
            if (imageElement && !imageElement.src.startsWith("http")) {
              imageElement = null;
            }



            // const contentElements = Array.from(document.querySelectorAll(".article__content h2, .article__content h3, .article__content h4, .article__content p"));
            const contentElements = Array.from(
              document.querySelectorAll(
                ".article__content h2, \
                 .article__content h3, \
                 .article__content h4, \
                 .article__content p.article__paragraph, \
                 .article__stand-first p.article__desc"
              )
            );

            const content = contentElements.map(element => {
              const tagName = element.tagName.toLowerCase();
              const textContent = element.textContent.trim();
        
              return textContent;
            });
        
            const extractedData = {
              title: title ? title.textContent.trim() : "Titre introuvable",
              description: description ? description.textContent.trim() : "Description introuvable",
              image: imageElement ? imageElement.src : "Image introuvable",
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