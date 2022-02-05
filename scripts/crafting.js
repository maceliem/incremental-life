/**
 * begin crafting
 * @param {string} item - name of the item wanted to craft
 * @returns {void}
 */
function craft(item) {
    let curTier = stats.inventory[item]
    let costs = items[item].costs[curTier]
    let progress = document.getElementById(item).getElementsByTagName("progress")[0]

    //stop if already crafting
    if (progress.dataset.active) return

    //check if we can afford to craft
    for ([resource, value] of Object.entries(costs)) {
        if (stats.resources[resource] < value) return alert(`you don't have ${value} of ${resource}`)
    }
    //use resources
    for ([resource, value] of Object.entries(costs)) stats.resources[resource] -= value

    progress.dataset.active = true
    doOftens()
    let timer = setInterval(function () {//interval to animate progress going up
        progress.value += (100 / (calcEffects(stats.speed.crafting, items[item].craftSpeed[curTier]) * 10)) / 10;

        //when progress is done
        if (progress.value == progress.max) {
            progress.value = 0
            progress.dataset.active = false
            craftingDone(item, curTier)
            checkSkillUp("crafting")
            doOftens()
            clearInterval(timer)
        }
    }, 10)


}
/**
 * 
 * @param {string} item - the crafted item
 * @param {number} curTier the  tier of item before crafting
 */
function craftingDone(item, curTier) {
    stats.inventory[item]++ //item level up
    popUp(`done crafting ${item} tier ${stats.inventory[item]}`)

    //apply modifiers from crafted item
    for ([attribute, modified] of Object.entries(items[item].modifier[curTier])) {
        for ([element, value] of Object.entries(modified)) {
            if (attribute != "unlock") {
                return applyEffect({ attribute: attribute, element: element, type: "", change: value }, "items")
            }
            
            //if unlocking new resource
            let resourceGen = Array.from(document.getElementsByClassName("resourceGen")).find(element => {
                return element.getAttribute("name") == modified
            })
            resourceGen.style.display = "flex"
        }
    }
    stats.experience.xp += stats.experience.gain.crafting
    stats.skills.xp[type] += calcEffects(stats.skillGain.crafting)
}
