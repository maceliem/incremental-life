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
//when bar is pressed, it will go up and generate a resource of type, if we have requirements in inventory
function runResourceBar(type) {
    var requirement = requirements[type]
    var text = ``
    var i = false
    for ([thing, level] of Object.entries(requirement)) {
        if (stats.inventory[thing] < level) {
            if(text == ``) text = `You need a ${thing} in level ${level}`
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
                progress.dataset.active = false
                stats.resources[type] += calcEffects(stats.value[type])
                stats.experience.xp += stats.experience.gain[type]
                stats.skills.xp[type]++
                doOftens()
                checkSkillUp(type)
                clearInterval(timer)
            }
        }, 10)
    }
}

function saveGame() {
    localStorage.setItem("save", JSON.stringify(stats))
}

function loadGame() {
    var data = JSON.parse(localStorage.getItem("save"))
    for (key of Object.keys(data)) {
        for (element of Object.keys(data[key])) {
            stats[key][element] = data[key][element]
        }
    }
    generateskillTree()
    doOftens()
    changeColor(stats.config.color)
    unlockUnlocked()
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
    var progress = document.getElementById(item).getElementsByTagName("progress")[0]

    if (progress.dataset.active == "false") {
        progress.dataset.active = true
        var timer = setInterval(function () {//interval to animate progress going up
            progress.value += (100 / (items[item].craftSpeed[curTier] * 10)) / 10;

            //when progress is done
            if (progress.value == progress.max) {
                progress.value = 0
                progress.dataset.active = false
                stats.inventory[item]++ //item level up

                //apply modifiers from crafted item
                for ([atribute, modified] of Object.entries(items[item].modifier[curTier])) {
                    for ([element, value] of Object.entries(modified)) {
                        if (atribute != "unlock") {
                            stats[atribute][element].items += value;
                        }
                    }
                }
                stats.experience.xp += stats.experience.gain.crafting
                stats.skills.xp.crafting++
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
    updateValues()
    saveGame()
}

function checkUnlocks() {
    if (!stats.unlocks.crafting) {
        if (stats.resources.wood >= 10) {
            stats.unlocks.crafting = true
            document.getElementById("craftingButton").style.visibility = "visible"
        }
    }
    if (!stats.unlocks.skills) {
        for ([skill, xp] of Object.entries(stats.skills.xp)) {
            if (xp >= 50) {
                stats.unlocks.skills = true
                document.getElementById("skillsButton").style.visibility = "visible"
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
        for (type of ["coal", "gold", "copper", "tin"]) {
            let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
                return element.getAttribute("name") == type
            })

            resourceGen.style.display = "flex"
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

    }
}

function calcEffects(element) {
    return (element.base + element.items + element["skills+"]) * element["skills*"]
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
        stats[effect.attribute][effect.element][category + effect.type] += effect.change
    } else {
        if (effect.element == "ores") {
            stats.unlocks.ores = true
            for (type of ["coal", "gold", "copper", "tin"]) {
                let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
                    return element.getAttribute("name") == type
                })

                resourceGen.style.display = "flex"
            }
        }
    }
}

function checkSkillDisable() {

}