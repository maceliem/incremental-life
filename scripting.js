var stats 

fetch("stats.json")
        .then(response => {
            return response.json();
        })
        .then(data => stats = data);

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
                clearInterval(timer)
            }
        }, 10)
    }
}

function updateValues() {
    var main = document.getElementById("main")
    for (child of main.childNodes){
        if(child.nodeName != "#text"){
            if (child.classList.contains("resourceGen")){
                var text = child.childNodes[3]
                var type = text.id.replace("Counter","")
                text.innerHTML = stats.resources[type]
            }
        }
    }
}