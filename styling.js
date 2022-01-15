var css = document.styleSheets[0]
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

    //update resource indicators
    for (child of document.getElementsByClassName("resourceGen")) {
        var text = child.childNodes[5]
        var type = text.id.replace("Counter", "")
        text.innerHTML = stats.resources[type]
    }

    //update crafting costs
    for (child of document.getElementsByClassName("craftElement")) {
        var tool = child.id
        var tier = stats.inventory[tool]
        if (items[tool].costs.length == tier) {
            child.style.display = "none"
        }
        else {

            child.getElementsByTagName("h1")[0].innerHTML = `${child.id} - ${tier + 1}`
            for (node of child.getElementsByTagName("UL")) {
                while (node.firstChild) { //remove old list elements
                    node.removeChild(node.lastChild)
                }


                //add new list elements
                if (node.classList.contains("cost")) {
                    var costs = items[tool].costs[tier]
                    for ([type, value] of Object.entries(costs)) {
                        var li = document.createElement("li")
                        li.innerHTML = `${type} ${value}`
                        node.appendChild(li)
                    }
                } else if (node.classList.contains("reward")) {
                    var reward = items[tool].modifier[tier]
                    for ([type, value] of Object.entries(reward)) {
                        if (type == "unlock") {
                            var li = document.createElement("li")
                            li.innerHTML = `${type} ${value}`
                            node.appendChild(li)
                        } else if (type == "speed") {
                            for ([type2, value2] of Object.entries(value)) {
                                var li = document.createElement("li")
                                var time = "seconds"
                                if (value2 == -1) { time = "second" }
                                li.innerHTML = `${type2} will complete in ${-1 * value2} less ${time}`
                                node.appendChild(li)
                            }
                        }
                    }
                }
            }
            child.getElementsByTagName("p")[0].innerHTML = `${items[child.id].craftSpeed[stats.inventory[child.id]]}s`
        }
    }

    for (skill of document.getElementsByClassName("skillProgress")) {
        var progress = skill.getElementsByTagName("progress")[0]
        progress.value = stats.skills.xp[progress.getAttribute("name")]
        progress.max = SkillXpToNextLevel(stats.skills.level[progress.getAttribute("name")])
        skill.getElementsByTagName("p")[0].innerHTML = stats.skills.level[progress.getAttribute("name")]
    }
}
