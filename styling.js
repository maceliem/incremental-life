var colors 

fetch("colors.json")
        .then(response => {
            return response.json();
        })
        .then(data => colors = data);


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

   
    