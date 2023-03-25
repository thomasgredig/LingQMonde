document.getElementById("importButton").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: ["scripts/extract.js"]
        },
        () => {
            importButton = document.getElementById('importButton');
            importButton.textContent = "Importing...";
            importButton.disabled = true;

            chrome.tabs.sendMessage(tabs[0].id, { action: "getArticle" }, (response) => {
                //console.log(response);
                const id = +(document.getElementById('courses').value);
                chrome.runtime.sendMessage({ action: "import", article: response, course: id }, (response) => {
                    document.getElementById('importButton').textContent = "Imported!";
                });
            });
        }
        );
    });          
  });

  document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById('courses');

    chrome.runtime.sendMessage({ action: "courses" }, (response) => {
        // for each pk, title pair in response, add a new option to the dropdown
        response.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.title;
            dropdown.appendChild(option);
          });
        //console.log(response);
    });
  });
