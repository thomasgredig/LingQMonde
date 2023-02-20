

function getTitle() {
    return document.querySelector('h1.article__title').innerText + "\n";
}

function getDescription() {
    return document.querySelector('p.article__desc').innerText;
}

function getImg() {
    const media = document.querySelector('figure.article__media');
    const imgUrl = media.querySelector('img').src;
    return imgUrl;
}

function getText() {
    const wrapper = document.querySelector('section.article__wrapper');
    const pieces = wrapper.querySelectorAll('p.article__paragraph', 'h2.article__sub-title');

    var text = "<p>" + getDescription() + "</p>";

    pieces.forEach((piece) => {
        text += "<p>" + piece.innerText + "</p>";
    });

    return text;
}

async function report() {
    const response = chrome.runtime.sendMessage({
        "collection": 1030396,
        "title": getTitle(),
        "description": getDescription(),
        "text": getText(),
        "image": getImg(),
        // you MUST specify save=true in order for the lesson to be created
        "save": true
    });

    console.log(response)
}

report();
