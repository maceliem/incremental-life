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