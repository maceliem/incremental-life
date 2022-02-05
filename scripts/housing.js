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
            text.innerHTML += `${type} ${displayNumber(value * Math.pow(4, number))} <br>`
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
            text.innerHTML += `${type} ${displayNumber(value * Math.pow(4, number))} <br>`
        }
        text.innerHTML += `<b>next work cost:</b>`
        for ([type, value] of Object.entries(housingCosts[tier + 1].workCost)) {
            text.innerHTML += `${type} ${value} <br>`
        }
    }
    button.addEventListener('click', function () {
        doOftens()
        let text = button.getElementsByTagName("span")[0]
        if (stats.houses[button.dataset.number] == undefined) {
            for ([type, value] of Object.entries(housingCosts[0].buildCost)) {
                text.innerHTML += `${type} ${displayNumber(value * Math.pow(4, number))} <br>`
            }
            let i = false
            let missingText = ``
            for ([resource, value] of Object.entries(housingCosts[0].buildCost)) {
                if (stats.resources[resource] < value * Math.pow(4, number)) {
                    i = true
                    missingText += `You need at least ${displayNumber(value * Math.pow(4, number))} of ${resource}`
                }
                if (i) {
                    alert(missingText)
                    return
                } else {
                    stats.resources[resource] -= value * Math.pow(4, number)
                    stats.houses.push({
                        "number": stats.houses.length,
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
                        text.innerHTML += `${type} ${displayNumber(value * Math.pow(4, number))} <br>`
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
                if (stats.resources[resource] < value * Math.pow(4, number)) {
                    i = true
                    missingText += `You need at least ${displayNumber(value * Math.pow(4, number))} of ${resource}`
                }
                if (i) {
                    alert(missingText)
                    return
                } else {
                    stats.resources[resource] -= value * Math.pow(4, number)
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
                            text.innerHTML += `${type} ${displayNumber(value * Math.pow(4, number))} <br>`
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
            generateHousingDropdown(resourceGen.getElementsByTagName("select")[0], resourceGen.getAttribute("name"))
        }
        saveGame()
    })
    button.innerHTML += `House #${number}`
    button.appendChild(text)
    room.appendChild(button)
}

function generateHousingDropdown(select, type) {
    while (select.firstChild) { //remove old list elements
        select.removeChild(select.lastChild)
    }
    for (house of stats.houses) {
        if (house.occupation == type) {
            var i = 0
            for (key of Object.keys(stats.resources)) {
                if (key == type && house.tier >= i) {
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
            for (key of Object.keys(stats.resources)) {
                if (key == type && house.tier >= i) {
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