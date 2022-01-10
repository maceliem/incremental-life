var stats

fetch("stats.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        stats = data
        loadGame()
    });


function runBar(type) {
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

function updateValues() {
    var pages = document.getElementsByClassName("main")
    for (page of pages) {
        for (child of page.childNodes) {
            if (child.nodeName != "#text") {
                if (child.classList.contains("resourceGen")) {
                    var text = child.childNodes[5]
                    var type = text.id.replace("Counter", "")
                    text.innerHTML = stats.resources[type]
                }
            }
        }
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
    for (page of document.getElementsByClassName("main")){
        page.style.display = "none"
    }
    document.getElementById(id).style.display = "block"
}