function switchMenu(id) {
    for (page of document.getElementsByClassName("main")) {
        page.style.display = "none"
    }
    var page = document.getElementById(id)
    page.style.display = page.dataset.type
}

function doOftens() {
    checkUnlocks()
    checkLevelUp()
    updateValues()
    saveGame()
}

function checkUnlocks() {
    if (!stats.unlocks.crafting) {
        if (stats.resources.wood >= 10) {
            stats.unlocks.crafting = true
            document.getElementById("craftingButton").style.visibility = "visible"
            popUp(`Unlocked Crafting`)
        }
    }
    if (!stats.unlocks.skills) {
        for ([skill, xp] of Object.entries(stats.skills.xp)) {
            if (xp >= 50) {
                stats.unlocks.skills = true
                document.getElementById("skillsButton").style.visibility = "visible"
                popUp(`Unlocked skills`)
            }
        }
    }
}

function unlockUnlocked() {
    if (stats.unlocks.crafting) {
        document.getElementById("craftingButton").style.visibility = "visible"
    }
    if (stats.unlocks.skills) {
        document.getElementById("skillsButton").style.visibility = "visible"
    }
    if (stats.unlocks.ores) {
        for (type of ["coal", "gold"]) {
            let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
                return element.getAttribute("name") == type
            })
            resourceGen.style.display = "flex"

            let skillProgress = Array.from(document.getElementsByClassName("skillProgress")).find(element => {
                return element.getAttribute("name") == type
            })
            skillProgress.style.display = "grid"
        }
        for (item of ["torch"]) {
            document.getElementById(item).style.display = "block"
        }
    }
    if (stats.unlocks.housing) {
        document.getElementById("housingButton").style.visibility = "visible"
        for (let resourceGen of document.getElementsByClassName("resourceGen")) {
            if (resourceGen.getElementsByTagName("select")[0] == undefined) {

                let select = document.createElement("select")
                generateHousingDropdown(select, resourceGen.getAttribute("name"))
                select.addEventListener("change", function () {
                    let val = select.value
                    if (val == "none") {
                        let house = stats.houses.find(element => {
                            return element.occupation == resourceGen.getAttribute("name")
                        })
                        house.occupation = val
                    }
                    else stats.houses[val].occupation = resourceGen.getAttribute("name")
                    generateHousingDropdown(select, resourceGen.getAttribute("name"))
                })
                resourceGen.appendChild(select)
            }
        }
    }
    if (stats.inventory.torch > 0) {
        let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
            return element.getAttribute("name") == "copper"
        })
        resourceGen.style.display = "flex"
    }
    if (stats.inventory.torch > 1) {
        let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
            return element.getAttribute("name") == "tin"
        })
        resourceGen.style.display = "flex"
    }
    if (stats.unlocks.rebirth) {
        document.getElementById("rebirthScreenButton").style.visibility = "visible"
    }

    if (stats.unlocks.advancedTools) {
        for (item of ["drill", "detector"]) {
            document.getElementById(item).style.display = "block"
        }
    }
}

function calcEffects(element, baseTime = 0) {
    return (element.base + baseTime + element.items + element["skills+"] + element["perks+"]) * element["skills*"] * element["perks*"]
}

function applyEffect(effect, category) {
    if (effect.attribute != "unlock") {
        if (effect.element == "mining") {
            for (element of ["stone", "iron", "coal", "gold", "copper", "tin"]) {
                stats[effect.attribute][element][category + effect.type] += effect.change
            }
        } else {
            stats[effect.attribute][effect.element][category + effect.type] += effect.change
        }
    } else {
        stats.unlocks[effect.element] = true
        unlockUnlocked()
    }
}

function popUp(text) {
    let popUp = document.createElement("div")
    popUp.innerHTML = text
    popUp.classList.add("popUp")
    popUp.style.opacity = 5.0
    let con = document.getElementById("popupContainer")
    con.appendChild(popUp)
    let timer = setInterval(function () {
        popUp.style.opacity -= 0.1
        if (popUp.style.opacity == 0) {
            con.removeChild(popUp)
            clearInterval(timer)
        }
    }, 100)
}


