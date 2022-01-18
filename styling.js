var css = document.styleSheets[0]
var colors

fetch("data/colors.json")
    .then(response => {
        return response.json();
    })
    .then(data => colors = data);

var skillTree

fetch("data/skillTree.json")
    .then(response => {
        return response.json();
    })
    .then(data => skillTree = data);

var housingCosts

fetch("data/housing.json")
    .then(response => {
        return response.json();
    })
    .then(data => housingCosts = data);

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
            var text = button.getElementsByTagName("span")[0]
            text.innerHTML = `<b>${skill}</b> <br> ${attributes.text} <br> costs: ${attributes.cost} <br> ${cur}/${attributes.max}`
            if (attributes.requirements != null) {
                var i = false
                for (requirement of attributes.requirements) {
                    if (stats.skills.upgrades[requirement] == undefined) {
                        i = true
                        text.innerHTML += `<br> <b>need:</b> ${requirement}`
                    }
                }
                button.disabled = i
            }
        }
    }
}

function generateskillTree() {
    for (let [type, skillList] of Object.entries(skillTree)) {
        let room = Array.from(document.getElementsByClassName("skillRoom")).find(element => {
            return element.getAttribute("name") == type
        })
        for (let [skill, attributes] of Object.entries(skillList)) {
            let button = document.createElement("button")
            button.classList.add(skill + "button")
            button.innerHTML = `${skill}`
            button.addEventListener('click', function () {
                if (stats.skills.points[type] >= attributes.cost) {
                    stats.skills.points[type] -= attributes.cost
                    for (effect of attributes.effects) { applyEffect(effect, "skills") }
                    if (stats.skills.upgrades[skill] == undefined) stats.skills.upgrades[skill] = 1
                    else stats.skills.upgrades[skill]++
                    if (stats.skills.upgrades[skill] == attributes.max) button.disabled = true
                    updateValues()
                    document.getElementById("skillSelect").getElementsByTagName("p")[0].innerHTML = `${type} - points available: ${stats.skills.points[type]}`
                    saveGame()
                }
                else {
                    alert(`You need to have at least ${attributes.cost} skill points in ${type} first`)
                }
            }, false)
            let text = document.createElement("span")
            text.classList.add("skillTooltip")
            let cur
            if (stats.skills.upgrades[skill] == undefined) cur = 0
            else cur = stats.skills.upgrades[skill]
            text.innerHTML = `<b>${skill}</b> <br> ${attributes.text} <br> costs: ${attributes.cost} <br> ${cur}/${attributes.max}`
            if (attributes.requirements != null) {
                for (requirement of attributes.requirements) {
                    if (stats.skills.upgrades[requirement] == undefined) {
                        button.disabled = true
                        text.innerHTML += `<br> <b>need:</b> ${requirement}`
                    }
                }
            }
            button.appendChild(text)
            room.appendChild(button)
        }
    }
}

function generateHousing() {
    for (house in stats.houses) {
        makeHouse(house)
    }
    makeHouse(stats.houses.length)
}

function makeHouse(number) {
    var room = document.getElementById("housing")
    let button = document.createElement("button")
    let text = document.createElement("span")
    button.dataset.number = number
    if (stats.houses[button.dataset.number] == undefined) {
        text.innerHTML = `Build a new house to get a new worker <br> <b>Build cost:</b><br>`
        for ([type, value] of Object.entries(housingCosts[0].buildCost)) {
            text.innerHTML += `${type} ${displayNumber(value*Math.pow(4,number))} <br>`
        }
    } else if (stats.houses[number].tier + 1 == housingCosts.length) {
        var tier = stats.houses[button.dataset.number].tier
        text.innerHTML = `<b>Max Tier</b><br><b>Current work cost:</b>`
        for ([type, value] of Object.entries(housingCosts[tier].workCost)) {
            text.innerHTML += `${type} ${value} <br>`
        }
    } else {
        var tier = stats.houses[button.dataset.number].tier
        text.innerHTML = `<b>Current house tier:</b> ${tier}<br><b>Current work cost:</b>`
        for ([type, value] of Object.entries(housingCosts[tier].workCost)) {
            text.innerHTML += `${type} ${value} <br>`
        }
        text.innerHTML += `<b>upgrade cost:</b>`
        for ([type, value] of Object.entries(housingCosts[tier + 1].buildCost)) {
            text.innerHTML += `${type} ${displayNumber(value*Math.pow(4,number))} <br>`
        }
        text.innerHTML += `<b>next work cost:</b>`
        for ([type, value] of Object.entries(housingCosts[tier + 1].workCost)) {
            text.innerHTML += `${type} ${value} <br>`
        }
    }
    button.addEventListener('click', function () {
        let text = button.getElementsByTagName("span")[0]
        if (stats.houses[button.dataset.number] == undefined) {
            for ([type, value] of Object.entries(housingCosts[0].buildCost)) {
                text.innerHTML += `${type} ${displayNumber(value*Math.pow(4,number))} <br>`
            }
            let i = false
            let missingText = ``
            for ([resource, value] of Object.entries(housingCosts[0].buildCost)) {
                if (stats.resources[resource] < value*Math.pow(4,number)) {
                    i = true
                    missingText += `You need at least ${displayNumber(value*Math.pow(4,number))} of ${resource}`
                }
                if (i) {
                    alert(missingText)
                    return
                } else {
                    stats.resources[resource] -= value*Math.pow(4,number)
                    stats.houses.push({
                        "number":stats.houses.length,
                        "tier": 0,
                        "workCost": housingCosts[0].workCost,
                        "occupation": "none"
                    })
                    makeHouse(stats.houses.length)
                    let tier = stats.houses[button.dataset.number].tier
                    text.innerHTML = `<b>Current house tier:</b> ${tier}<br><b>Current work cost:</b>`
                    for ([type, value] of Object.entries(housingCosts[tier].workCost)) {
                        text.innerHTML += `${type} ${value} <br>`
                    }
                    text.innerHTML += `<b>upgrade cost:</b>`
                    for ([type, value] of Object.entries(housingCosts[tier + 1].buildCost)) {
                        text.innerHTML += `${type} ${displayNumber(value*Math.pow(4,number))} <br>`
                    }
                    text.innerHTML += `<b>next work cost:</b>`
                    for ([type, value] of Object.entries(housingCosts[tier + 1].workCost)) {
                        text.innerHTML += `${type} ${value} <br>`
                    }
                }
            }
        } else {
            let i = false
            let missingText = ``
            let newTier = stats.houses[number].tier + 1
            if (newTier == housingCosts.length) {
                return
            }
            for ([resource, value] of Object.entries(housingCosts[newTier].buildCost)) {
                if (stats.resources[resource] < value*Math.pow(4,number)) {
                    i = true
                    missingText += `You need at least ${displayNumber(value*Math.pow(4,number))} of ${resource}`
                }
                if (i) {
                    alert(missingText)
                    return
                } else {
                    stats.resources[resource] -= value*Math.pow(4,number)
                    stats.houses[number].tier = newTier
                    stats.houses[number].workCost = housingCosts[newTier].workCost
                    if (stats.houses[number].tier + 1 == housingCosts.length) {
                        text.innerHTML = `<b>Max Tier</b>`
                    } else {
                        let tier = stats.houses[button.dataset.number].tier
                        text.innerHTML = `<b>Current house tier:</b> ${tier}<br><b>Current work cost:</b>`
                        for ([type, value] of Object.entries(housingCosts[tier].workCost)) {
                            text.innerHTML += `${type} ${value} <br>`
                        }
                        text.innerHTML += `<b>upgrade cost:</b>`
                        for ([type, value] of Object.entries(housingCosts[tier + 1].buildCost)) {
                            text.innerHTML += `${type} ${displayNumber(value*Math.pow(4,number))} <br>`
                        }
                        text.innerHTML += `<b>next work cost:</b>`
                        for ([type, value] of Object.entries(housingCosts[tier + 1].workCost)) {
                            text.innerHTML += `${type} ${value} <br>`
                        }
                    }
                }
            }
        } 
        for (let resourceGen of document.getElementsByClassName("resourceGen")) {
            generateHousingDropdown(resourceGen.getElementsByTagName("select")[0],resourceGen.getAttribute("name"))
        }
        saveGame()
    })
    button.innerHTML += `House #${number}`
    button.appendChild(text)
    room.appendChild(button)
}

function displayNumber(number) {
    var num = number.toString()
    if (num.length < 7) { return num }

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

function changeConfig(config, next) {
    stats.config[config] = next
    updateValues()
}

function generateHousingDropdown(select, type) {
    while (select.firstChild) { //remove old list elements
        select.removeChild(select.lastChild)
    }
    for (house of stats.houses) {
        if (house.occupation == type) {
            var i = 0
            for(key of Object.keys(stats.resources)){
                if(key == type && house.tier >= i){
                    let option = document.createElement("option")
                    option.value = house.number
                    option.innerHTML = `Manager #${house.number}`
                    select.appendChild(option)
                }
                i++
            }
        }
    }
    let firstOption = document.createElement("option")
    firstOption.innerHTML = "none"
    firstOption.value = "none"
    select.appendChild(firstOption)
    for (house of stats.houses) {
        if (house.occupation == "none") {
            var i = 0
            for(key of Object.keys(stats.resources)){
                if(key == type && house.tier >= i){
                    let option = document.createElement("option")
                    option.value = house.number
                    option.innerHTML = `Manager #${house.number}`
                    select.appendChild(option)
                }
                i++
            }
        }
    }
}