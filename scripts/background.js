// LingQ API docs: https://www.lingq.com/apidocs/api-2.0.html


chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['scripts/content.js']
    });
  });

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  console.log("from a content script:" + sender.tab.url);

  fetch('https://www.lingq.com/api/v2/fr/lessons/import/', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    .then(response => response.json())
    .then(response => console.log(JSON.stringify(response)));
})


