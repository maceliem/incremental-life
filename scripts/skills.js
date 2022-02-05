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