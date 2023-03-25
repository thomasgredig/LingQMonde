// combine lines into a single string with a newline between each line
function combineLines(lines) {
    var result = "";
    for (var i = 0; i < lines.length; i++) {
        result += lines[i] + "\n";
    }  
    return result;
}

async function fetchLingQCourses(sendResponse) {
    const url = 'https://www.lingq.com/api/v2/fr/collections/my/';
    const headers = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });
  
    fetch(url, { headers })
    .then(response => response.json())
    .then(data => {
            const simplifiedCourses = data.results.map(course => ({
                id: course.id,
                title: course.title,
              }));
            
              //console.log(simplifiedCourses);
              sendResponse(simplifiedCourses);
        });
}

async function importArticle(article, course, sendResponse) {
    request = {
        "collection": course,
        "title": article.title,
        "description": article.description,
        "text": combineLines(article.content),
        "image": article.image,
        // you MUST specify save=true in order for the lesson to be created
        "save": true
    };

    fetch('https://www.lingq.com/api/v2/fr/lessons/import/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })
      .then(response => response.json())
      .then(response => sendResponse(response));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "import") {
        importArticle(request.article, request.course, sendResponse);
    } else if (request.action === "courses") {
        fetchLingQCourses(sendResponse);
    }
    // so sendResponse can be called asynchronously
    return true;
  });

