var stats

fetch("stats.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        stats = data
        loadGame()
    });

var items

fetch("items.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        items = data
    });

function runBar(type, reqirements) {
    for (thing of reqirements) {
        if (stats.inventory[thing] < 1) {
            alert(`You need a ${thing} first`)
            return
        }
    }
    var progress = document.getElementById(`${type}Bar`)
    if (progress.dataset.active == "false") {
        progress.dataset.active = true
        var timer = setInterval(function () {
            progress.value += (100 / stats.speed[type]) / 10;
            if (progress.value == progress.max) {
                progress.value = 0
                progress.dataset.active = false
                stats.resources[type]++
                updateValues()
                saveGame()
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
    updateValues()
    changeColor(stats.config.color)
}

function switchMenu(id) {
    for (page of document.getElementsByClassName("main")) {
        page.style.display = "none"
    }
    document.getElementById(id).style.display = "block"
}

function craft(item) {
    var curTier = stats.inventory[item]
    var costs = items[item].costs[curTier]

    for ([resource, value] of Object.entries(costs)) {
        if (stats.resources[resource] < value) {
            alert(`you don't have ${value} of ${resource}`)
            return
        }
    }
    for ([resource, value] of Object.entries(costs)) {
        stats.resources[resource] -= value
    }
    stats.inventory[item]++
    for ([atribute, modified] of Object.entries(items[item].modifier[curTier])){
        for ([element, value] of Object.entries(modified)){
            stats[atribute][element] += value
        }
    }

    updateValues()
    saveGame()
}

function resetStats(){
    fetch("stats.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        stats = data
        updateValues()
        saveGame()
    });
}