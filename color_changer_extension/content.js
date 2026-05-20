browser.runtime.onMessage.addListener((request) => {
    if (request.type === "body_color") {
        document.body.style.backgroundColor = request.color;
    } else if (request.type === "text_color") {
        document.body.style.color = request.color;
    } else if (request.type === "div_color") {
        const divs = document.getElementsByTagName('div');
        for (let i = 0; i < divs.length; i++) {
            divs[i].style.backgroundColor = request.color;
        }
    }
});
