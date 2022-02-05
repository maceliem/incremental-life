/**
 * run a resource bar
 * @param {string} type - type of resource to run
 * @returns {void}
 */
function runResourceBar(type) {

    //if we need tools first, alert it and stop
    if ((text = checkToolNeed(requirements[type])) != ``) {
        alert(`${text} first`)
        return
    }
    let progress = document.getElementById(`${type}Bar`)

    //don't do anything if already running
    if (progress.dataset.active) return
    progress.dataset.active = true

    //interval to animate progress going up and take time
    let timer = setInterval(function () {
        progress.value += (100 / (calcEffects(stats.speed[type]) * 10)) / 10;

        //when progress is done
        if (progress.value == progress.max) {
            progress.value = 0
            progressDone(progress, type, timer)
        }
    }, 10)

}

/**
 * 
 * @param {Element} progress - the progress bar
 * @param {string} type - tupe of resource to run
 * @param {number} timer - the interval timer for progress
 */
function progressDone(progress, type, timer) {
    //apply changes
    stats.resources[type] += calcEffects(stats.value[type])
    stats.experience.xp += stats.experience.gain[type]
    stats.skills.xp[type] += calcEffects(stats.skillGain[type])

    if (!checkManaging(type)) {
        progress.dataset.active = false
        clearInterval(timer)
    }
    doOftens()
    checkSkillUp(type)
}

/**
 * check all managers if one is assigned to type
 * @param {string} type - type of resource to run
 * @returns {boolean} 
 */
function checkManaging(type) {
    for (house of stats.houses) {
        if (house.occupation != type) continue
        //if can't pay manager
        for ([resource, value] of Object.entries(house.workCost)) if (stats.resources[resource] < value) return false
        //else we pay
        for ([resource, value] of Object.entries(house.workCost)) stats.resources[resource] -= value
        return true
    }
    return false
}

/**
 * check if we have all tools needed for running a resource
 * @param {object} requirement - requirements for running resource
 * @returns {string} missing tools text
 */
function checkToolNeed(requirement) {
    let text = ``
    for ([tool, level] of Object.entries(requirement)) {
        if (stats.inventory[tool] < level) {
            if (text == ``) text = `You need a ${tool} in level ${level}`
            else text += ` and a ${tool} in level ${level}`
        }
    }

    return text
}