/**
 * find total xp needed to reach skill level
 * @param {number} level - level wanted
 * @returns {number}
 */
function SkillTotalXpToLevel(level) {
    return Math.floor(Math.pow(level, 1.2) * 50)
}
/**
 * find relative xp needed to reach skill level from last level
 * @param {number} level - level wanted
 * @returns {number}
 */
function SkillXpToNextLevel(level) {
    return SkillTotalXpToLevel(level) - SkillTotalXpToLevel(level - 1)
}

/**
 * check if skill can level up
 * @param {string} skillName - name of skill
 */
function checkSkillUp(skillName) {
    var required = SkillXpToNextLevel(stats.skills.level[skillName])
    if (stats.skills.xp[skillName] < required) return
    stats.skills.level[skillName]++
    stats.skills.xp[skillName] -= required
    stats.skills.points[skillName]++
    popUp(`+1 ${skillName} skill point`)
}

/**
 * change skill page
 * @param {(-1|1)} dir - the direction to move
 */
function skillMenuSwap(dir) {
    var rooms = document.getElementById("skills").children
    for (i in rooms) {
        if (rooms[i].dataset.active == "false") return

        rooms[i].style.display = "none"
        rooms[i].dataset.active = "false"
        var room
        if (dir == -1 && i == 0) room = rooms[rooms.length - 2]
        else room = rooms[(parseInt(i) + dir) % (rooms.length - 1)]

        var menuTitle = document.getElementById("skillSelect").getElementsByTagName("p")[0]
        if (room.getAttribute("name") == "skills") menuTitle.innerHTML = `${room.getAttribute("name")}`
        else menuTitle.innerHTML = `${room.getAttribute("name")} - points available: ${stats.skills.points[room.getAttribute("name")]}`
        room.style.display = room.dataset.type
        room.dataset.active = "true"
        return
    }

}

/**
 * create the skill tree
 */
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
                if (stats.skills.points[type] < attributes.cost) return alert(`You need to have at least ${attributes.cost} skill points in ${type} first`)
                stats.skills.points[type] -= attributes.cost
                for (effect of attributes.effects) { applyEffect(effect, "skills") }
                if (stats.skills.upgrades[skill] == undefined) stats.skills.upgrades[skill] = 1
                else stats.skills.upgrades[skill]++
                if (stats.skills.upgrades[skill] == attributes.max) button.disabled = true
                updateValues()
                document.getElementById("skillSelect").getElementsByTagName("p")[0].innerHTML = `${type} - points available: ${stats.skills.points[type]}`
                saveGame()

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