var colors

fetch("colors.json")
.then(response => {
   return response.json();
})
.then(data => colors = data);

function changeColor(color) {
    var scheme = colors[color]
    var style = document.documentElement.style
    style.setProperty("--main-color", `rgb(
        ${scheme["main-color"][0]},
        ${scheme["main-color"][1]},
        ${scheme["main-color"][2]}
    )`);
    style.setProperty("--element-color", `rgb(
        ${scheme["element-color"][0]},
        ${scheme["element-color"][1]},
        ${scheme["element-color"][2]}
    )`);
    style.setProperty("--hover-element-color", `rgb(
        ${scheme["hover-element-color"][0]},
        ${scheme["hover-element-color"][1]},
        ${scheme["hover-element-color"][2]}
    )`);
    style.setProperty("--clicked-element-color", `rgb(
        ${scheme["clicked-element-color"][0]},
        ${scheme["clicked-element-color"][1]},
        ${scheme["clicked-element-color"][2]}
    )`);
    
}
