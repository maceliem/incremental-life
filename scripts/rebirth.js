var comitted = false

/**
 * find xp needed to reach level
 * @param {number} level - level wanted
 * @returns {number}
 */
function levelTotalXpToLevel(level) {
    return Math.floor(Math.pow(2, level) * 500)
}

/**
 * check if we can level up
 */
function checkLevelUp() {
    let required = levelTotalXpToLevel(stats.experience.level)
    if (stats.experience.xp < required) return

    if (!stats.unlocks.rebirth) {
        stats.unlocks.rebirth = true
        document.getElementById("rebirthScreenButton").style.visibility = "visible"
    }
    stats.experience.level++
    stats.experience.pp++
    popUp(`Level up. Rebirth to buy new perks`)

}

/**
 * start the process of rebirthing
 */
function beginRebirth() {
    //if not ready and haven't comitted, they can go back
    if (!confirm("Are you sure you want to restart your game?") && !comitted) return
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

                    //don't reset if keepers
                    if (stats.keepers.skills) continue
                    stats[attribute][element]["skills+"] = data[attribute][element]["skills+"]
                    stats[attribute][element]["skills*"] = data[attribute][element]["skills*"]

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
/**
 * opt out of rebirth
 */
function goBack() {
    if (!comitted) switchMenu('resource')
    else alert("Sorry kiddo, buy you're already comitted")
}
/**
 * create the perk tree
 */
function generateRebirthScreen() {
    let rb = document.getElementById("rebirthScreen")
    let divs = rb.getElementsByTagName("div")

    //numbers part
    divs[1].innerHTML = `
    <b>Current level:</b> ${stats.experience.level} <br> <br>
    <b>Curent xp:</b> ${displayNumber(stats.experience.xp)} <br> <br>
    <b>Available perk points:</b> ${stats.experience.pp} <br> <br>
    <b>Xp needed until next level:</b> ${displayNumber(levelTotalXpToLevel(stats.experience.level))} <br> <br>
    `

    //tree part
    while (divs[2].firstChild) { //clean up last tree
        divs[2].removeChild(divs[2].lastChild)
    }
    let locked = false
    let tierLock = 0
    for (let [tier, perks] of Object.entries(perksList)) {
        if (stats.perks[tier] == undefined) stats.perks.push([])
        let tierBox = document.createElement("div")
        tierBox.classList.add("tierBox")
        let label = document.createElement("label")
        label.classList.add("tierLabel")
        label.innerHTML = `Tier ${parseInt(tier) + 1}`
        if (locked) label.innerHTML += `- locked`
        tierBox.appendChild(label)
        for (let [perkName, perk] of Object.entries(perks)) {
            let upgrade = document.createElement("button")
            upgrade.innerHTML = perkName
            let buyable = locked

            upgrade.addEventListener("click", function () {
                if (buyable && tier != tierLock) return alert("sorry you can't buy this curently")

                if (stats.experience.pp <= 0) return alert("sorry, but you don't have any perk points left")

                if (comitted || confirm("Are you sure you want to restart your game?")) {
                    comitted = true
                    stats.experience.pp--
                    stats.perks[tier].push(perkName)
                    if (tier > 0) for (let i = 0; i < tier; i++) {
                        for (let perkName of Object.keys(perksList[i])) {
                            removePerk(i, perkName)
                            stats.perks[i] = stats.perks[i].filter(e => e != perkName)
                        }
                    }
                    applyPerk(tier, perkName)

                    generateRebirthScreen()
                }
            })

            let text = document.createElement("span")
            text.classList.add("perkToolTip")
            text.innerHTML = perk.text
            if (stats.perks[tier].includes(perkName)) upgrade.disabled = true
            else {
                locked = true
                tierLock = tier
            }
            upgrade.appendChild(text)
            tierBox.appendChild(upgrade)
        }
        divs[2].appendChild(tierBox)
    }
}

/**
 * apply effect of perk
 * @param {number} tier - tier of perk
 * @param {string} perkName - name of perk
 */
function applyPerk(tier, perkName) {
    for (effect of perksList[tier][perkName].effects) {
        if (effect.attribute == "value" || effect.attribute == "speed" || effect.attribute == "skillGain") {
            if (effect.element == "all") for (element of Object.keys(stats.resources)) {
                stats[effect.attribute][element][`perks${effect.type}`] += effect.change
            }
        }
        if (effect.attribute == "keep") {
            if (effect.element == "resources") {
                stats.keepers[effect.element] = Math.max(stats.keepers[effect.element], effect.amount)
            }
            else stats.keepers[effect.element] = true
        }
        if (effect.attribute == "unlock") stats.unlocks[effect.element] = true
    }
}
/**
 * remove effect of perk
 * @param {number} tier - tier of perk
 * @param {string} perkName - name of perk
 */
function removePerk(tier, perkName) {
    for (effect of perksList[tier][perkName].effects) {
        if (effect.attribute == "value" || effect.attribute == "speed" || effect.attribute == "skillGain") {
            if (effect.element == "all") for (element of Object.keys(stats.resources)) {
                stats[effect.attribute][element][`perks${effect.type}`] -= effect.change
            }
        }
        if (effect.attribute == "keep") {
            if (effect.element == "resources") {
                if (stats.keepers[effect.element] == effect.amount) stats.keepers[effect.element] = 0
            }
            else stats.keepers[effect.element] = false
        }
        if (effect.attribute == "unlock") stats.unlocks[effect.element] = false
    }
}