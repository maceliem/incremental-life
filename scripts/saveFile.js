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