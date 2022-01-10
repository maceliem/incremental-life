var colors

fetch("colors.json")
    .then(response => {
        return response.json();
    })
    .then(data => colors = data);


function changeColor(color) {
    var scheme = colors[color]
    var style = document.documentElement.style
    for (element of Object.keys(scheme)) {
        style.setProperty(`--${element}`, `rgb(
            ${scheme[element][0]},
            ${scheme[element][1]},
            ${scheme[element][2]}
        )`);
    }
    stats.config.color = color
    saveGame()
}

function updateValues() {
    var pages = document.getElementsByClassName("main")
    for (page of pages) {
        for (child of page.childNodes) {
            if (child.nodeName != "#text") {

                //
                if (child.classList.contains("resourceGen")) {
                    var text = child.childNodes[5]
                    var type = text.id.replace("Counter", "")
                    text.innerHTML = stats.resources[type]
                }

                
            }
        }
    }
}