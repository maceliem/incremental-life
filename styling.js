
/**
 * change colorscheme of everything to color
 * @param {string} color - name of color
 */
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

//update all textvalues !!! mangler at uddeles
function updateValues() {

    //update resource indicators
    for (child of document.getElementsByClassName("resourceGen")) {
        var text = child.childNodes[5]
        var type = text.id.replace("Counter", "")
        text.innerHTML = displayNumber(stats.resources[type])
    }

    //update crafting costs
    for (child of document.getElementsByClassName("craftElement")) {
        var tool = child.id
        var tier = stats.inventory[tool]
        if (items[tool].costs.length <= tier) {
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

    for (let [type, skillList] of Object.entries(skillTree)) {
        let room = Array.from(document.getElementsByClassName("skillRoom")).find(element => {
            return element.getAttribute("name") == type
        })
        for (let [skill, attributes] of Object.entries(skillList)) {
            let button = room.getElementsByClassName(skill + "button")[0]
            if (stats.skills.upgrades[skill] == attributes.max) button.disabled = true
            let cur
            if (stats.skills.upgrades[skill] == undefined) cur = 0
            else cur = stats.skills.upgrades[skill]
            let text = button.getElementsByTagName("span")[0]
            text.innerHTML = `<b>${skill}</b> <br> ${attributes.text} <br> costs: ${attributes.cost} <br> ${cur}/${attributes.max}`
            if (attributes.requirements != null) {
                let i = false
                for (requirement of attributes.requirements) {
                    if (stats.skills.upgrades[requirement] == undefined) {
                        i = true
                        text.innerHTML += `<br> <b>need:</b> ${requirement}`
                    }
                }
                if (cur == attributes.max) i = true
                button.disabled = i
            }
        }
    }
}

/**
 * display number with formatting
 * @param {number} number - number to be displayed
 * @returns {string}
 */
function displayNumber(number) {
    var num = Math.floor(number).toString()
    if (num.length < 7) return num 

    else if (stats.config.numberFormat == "scientific") {
        return `${num.charAt(0)},${num.charAt(1) + num.charAt(2)}E+${num.length - 1}`
    } else if (stats.config.numberFormat == "engineering") {
        var dif = ((num.length - 1) % 3)
        var end = (num.length - 1) - dif
        if (dif == 0) { return `${num.charAt(0)},${num.charAt(1) + num.charAt(2)}E+${end}` }
        if (dif == 1) { return `${num.charAt(0) + num.charAt(1)},${num.charAt(2)}E+${end}` }
        if (dif == 2) { return `${num.charAt(0) + num.charAt(1) + num.charAt(2)}E+${end}` }

    }
}

/**
 * change config value
 * @param {string} config - name of config
 * @param {any} next - new value
 */
function changeConfig(config, next) {
    stats.config[config] = next
    updateValues()
}



