var colors

fetch("colors.json")
    .then(response => {
        return response.json();
    })
    .then(data => colors = data);

var stats
fetch("stats.json")
    .then(response => {
        return response.json();
    })
    .then(data => stats = data);

function changeColor(color) {
    var scheme = colors[color]
    var style = document.documentElement.style
    for (element of Object.keys(scheme)) {
        style.setProperty(`--${element}`, `rgb(
            ${scheme[element][0]},
            ${scheme[element][1]},
            ${scheme[element][2]}
        )`);
    }

}

function runBar(bar) {
    var progress = document.getElementById(bar)
    console.log(progress.dataset.active)
    if (progress.dataset.active == "false") {
        progress.dataset.active = true
        var timer = setInterval(function () {
            progress.value += (100 / stats.speed[bar]) / 100;
            if (progress.value == progress.max) {
                progress.value = 0
                progress.dataset.active = false
                clearInterval(timer)
            }
        }, 10)
    }
}