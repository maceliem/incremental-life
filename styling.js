var colors

fetch("colors.json")
    .then(response => {
        return response.json();
    })
    .then(data => colors = data);


//change colorscheme of everything to color
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

//update all textvalues
function updateValues() {
    var pages = document.getElementsByClassName("main")
    for (page of pages) {
        for (child of page.childNodes) {
            if (child.nodeName != "#text") {
                
                //update resource indicators
                if (child.classList.contains("resourceGen")) {
                    var text = child.childNodes[5]
                    var type = text.id.replace("Counter", "")
                    text.innerHTML = stats.resources[type]
                }
                
                //update crafting costs
                if (child.classList.contains("craftElement")) {
                    for (node of child.childNodes) {
                        if (node.nodeName == "UL"){
                            while(node.firstChild) { //remove old list elements
                                node.removeChild(node.lastChild)
                            }
                            var tool = child.id
                            var tier = stats.inventory[tool]
                            var costs = items[tool].costs[tier]

                            //add new list elements
                            for ([type, value] of Object.entries(costs)){
                                var li = document.createElement("li")
                                li.innerHTML = `${type} ${value}`
                                node.appendChild(li)
                            }
                        }
                    }
                }
            }
        }
    }
}