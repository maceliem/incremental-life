var items

fetch("data/items.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        items = data
    });

var stats

fetch("stats.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        stats = data
        loadGame()
    });

var requirements

fetch("data/resourceNeeds.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        requirements = data
    });

var comitted = false
//when bar is pressed, it will go up and generate a resource of type, if we have requirements in inventory
function runResourceBar(type) {
    var requirement = requirements[type]
    var text = ``
    var i = false
    for ([thing, level] of Object.entries(requirement)) {
        if (stats.inventory[thing] < level) {
            if (text == ``) text = `You need a ${thing} in level ${level}`
            else text += ` and a ${thing} in level ${level}`
            i = true
        }
    }
    if (i) {
        alert(`${text} first`)
        return
    }
    var progress = document.getElementById(`${type}Bar`)
    if (progress.dataset.active == "false") {
        progress.dataset.active = true
        var timer = setInterval(function () {//interval to animate progress going up
            progress.value += (100 / (calcEffects(stats.speed[type]) * 10)) / 10;

            //when progress is done
            if (progress.value == progress.max) {
                progress.value = 0
                stats.resources[type] += calcEffects(stats.value[type])
                stats.experience.xp += stats.experience.gain[type]
                stats.skills.xp[type] += calcEffects(stats.skillGain[type])


                var manager = false
                for (house of stats.houses) {
                    if (house.occupation == type) {
                        manager = true
                        var poor = false
                        //if can't pay manager
                        for ([resource, value] of Object.entries(house.workCost)) {
                            if (stats.resources[resource] < value) {
                                poor = true
                            }
                        }
                        if (!poor) {
                            for ([resource, value] of Object.entries(house.workCost)) {
                                stats.resources[resource] -= value
                            }
                        }

                    }
                }
                if (poor || !manager) {
                    progress.dataset.active = false
                    clearInterval(timer)
                }
                doOftens()
                checkSkillUp(type)
            }
        }, 10)
    }
}

function saveGame() {
    localStorage.setItem("save", JSON.stringify(stats))
}

function loadGame() {
    loadElement(stats, JSON.parse(localStorage.getItem("save")))
    generateskillTree()
    doOftens()
    changeColor(stats.config.color)
    generateHousing()
    unlockUnlocked()
}

function loadElement(pos, data) {
    for (let [key, value] of Object.entries(data)) {
        if (key == "houses" || key == "upgrades" || key == "perks" || key == "gain") pos[key] = value
        else if (typeof value == "object") loadElement(pos[key], value)
        else pos[key] = value
    }
}

//switch main thing to the one with id
function switchMenu(id) {
    for (page of document.getElementsByClassName("main")) {
        page.style.display = "none"
    }
    var page = document.getElementById(id)
    page.style.display = page.dataset.type
}

//craft item, if we have the resources needed
function craft(item) {
    var curTier = stats.inventory[item]
    var costs = items[item].costs[curTier]
    var progress = document.getElementById(item).getElementsByTagName("progress")[0]

    if (progress.dataset.active == "false") {

        //check if we can afford to craft
        for ([resource, value] of Object.entries(costs)) {
            if (stats.resources[resource] < value) {
                alert(`you don't have ${value} of ${resource}`)
                return
            }
        }
        //use resources
        for ([resource, value] of Object.entries(costs)) {
            stats.resources[resource] -= value
        }
        progress.dataset.active = true
        doOftens()
        var timer = setInterval(function () {//interval to animate progress going up
            progress.value += (100 / (calcEffects(stats.speed.crafting, items[item].craftSpeed[curTier]) * 10)) / 10;

            //when progress is done
            if (progress.value == progress.max) {
                progress.value = 0
                progress.dataset.active = false
                stats.inventory[item]++ //item level up
                popUp(`done crafting ${item} tier ${stats.inventory[item]}`)

                //apply modifiers from crafted item
                for ([attribute, modified] of Object.entries(items[item].modifier[curTier])) {
                    for ([element, value] of Object.entries(modified)) {
                        if (attribute != "unlock") {
                            applyEffect({ attribute: attribute, element: element, type: "", change: value }, "items")
                        }
                        else {
                            let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
                                return element.getAttribute("name") == modified
                            })
                            resourceGen.style.display = "flex"
                        }
                    }
                }
                stats.experience.xp += stats.experience.gain.crafting
                stats.skills.xp[type] += calcEffects(stats.skillGain.crafting)
                checkSkillUp("crafting")
                doOftens()
                clearInterval(timer)
            }
        }, 10)
    }

}

function resetStats() {
    if (confirm("Are you sure you want to do this?")) {
        fetch("stats.json")
            .then(response => {
                return response.json();
            })
            .then(data => {
                stats = data
                saveGame()
                location.reload()
            });
    }
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

function SkillTotalXpToLevel(level) {
    return Math.floor(Math.pow(level, 1.2) * 50)
}

function SkillXpToNextLevel(level) {
    return SkillTotalXpToLevel(level) - SkillTotalXpToLevel(level - 1)
}

function checkSkillUp(skillName) {
    var required = SkillXpToNextLevel(stats.skills.level[skillName])
    if (stats.skills.xp[skillName] >= required) {
        stats.skills.level[skillName]++
        stats.skills.xp[skillName] -= required
        stats.skills.points[skillName]++
        popUp(`+1 ${skillName} skill point`)

    }
}

function levelTotalXpToLevel(level) {
    return Math.floor(Math.pow(2, level) * 500)
}

function checkLevelUp() {
    let required = levelTotalXpToLevel(stats.experience.level)
    if (stats.experience.xp >= required) {
        if (!stats.unlocks.rebirth) {
            stats.unlocks.rebirth = true
            document.getElementById("rebirthScreenButton").style.visibility = "visible"
        }
        stats.experience.level++
        stats.experience.pp++
        popUp(`Level up. Rebirth to buy new perks`)
    }
}

function calcEffects(element, baseTime = 0) {
    return (element.base + baseTime + element.items + element["skills+"] + element["perks+"]) * element["skills*"] * element["perks*"]
}

function skillMenuSwap(dir) {
    var rooms = document.getElementById("skills").children
    for (i in rooms) {
        if (rooms[i].dataset.active == "true") {
            rooms[i].style.display = "none"
            rooms[i].dataset.active = "false"
            var room
            if (dir == -1 && i == 0) {
                room = rooms[rooms.length - 2]
            } else {
                room = rooms[(parseInt(i) + dir) % (rooms.length - 1)]
            }
            var menuTitle = document.getElementById("skillSelect").getElementsByTagName("p")[0]
            if (room.getAttribute("name") == "skills") menuTitle.innerHTML = `${room.getAttribute("name")}`
            else menuTitle.innerHTML = `${room.getAttribute("name")} - points available: ${stats.skills.points[room.getAttribute("name")]}`
            room.style.display = room.dataset.type
            room.dataset.active = "true"
            return
        }
    }
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

function beginRebirth() {
    if (confirm("Are you sure you want to restart your game?") || comitted) {
        comitted = false
        fetch("stats.json")
            .then(response => {
                return response.json();
            })
            .then(data => {
                for (let [resource, amount] of Object.entries(stats.resources)) {
                    if (amount > stats.keepers.resources) stats.resources[resource] = stats.keepers.resources
                }
                for (attribute of ["speed", "value", "skillGain"]) {
                    for (element of Object.keys(stats.resources)) {
                        stats[attribute][element].base = data[attribute][element].base
                        stats[attribute][element].items = data[attribute][element].items
                        if (!stats.keepers.skills) {
                            stats[attribute][element]["skills+"] = data[attribute][element]["skills+"]
                            stats[attribute][element]["skills*"] = data[attribute][element]["skills*"]
                        }
                    }
                }
                stats.inventory = data.inventory
                if (!stats.keepers.skills) {
                    stats.skills = data.skills
                    stats.unlocks.ores = data.unlocks.ores
                    stats.unlocks.housing = data.unlocks.housing
                }
                stats.houses = data.houses
                switchMenu('resource')
                doOftens()
            });
    }
}

function goBack() {
    if (!comitted) switchMenu('resource')
    else alert("Sorry kiddo, buy you're already comitted")
}