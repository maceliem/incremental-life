var items

fetch("items.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        items = data
    });

var stats

fetch("stats.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        stats = data
        loadGame()
    });

//when bar is pressed, it will go up and generate a resource of type, if we have requirements in inventory
function runResourceBar(type, reqirements) {
    for (reqirement of reqirements) {
        for ([thing, level] of Object.entries(reqirement)) {
            if (stats.inventory[thing] < level) {
                alert(`You need a ${thing} in level ${level} first`)
                return
            }
        }
    }
    var progress = document.getElementById(`${type}Bar`)
    if (progress.dataset.active == "false") {
        progress.dataset.active = true
        var timer = setInterval(function () {//interval to animate progress going up
            progress.value += (100 / (stats.speed[type]*10)) / 10;

            //when progress is done
            if (progress.value == progress.max) {
                progress.value = 0
                progress.dataset.active = false
                stats.resources[type]++
                stats.experience.xp += stats.experience.gain[type] 
                stats.skills.xp[type]++
                doOftens()
                checkSkillUp(type)
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
    doOftens()
    changeColor(stats.config.color)
    unlockUnlocked()
}

//switch main thing to the one with id
function switchMenu(id) {
    for (page of document.getElementsByClassName("main")) {
        page.style.display = "none"
    }
    var page = document.getElementById(id)
    page.style.display = page.dataset.type
}

//craft item, if we have the resources needed
function craft(item) {
    var curTier = stats.inventory[item]
    var costs = items[item].costs[curTier]

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
    var progress = document.getElementById(item).getElementsByTagName("progress")[0]
    
    if (progress.dataset.active == "false") {
        progress.dataset.active = true
        var timer = setInterval(function () {//interval to animate progress going up
            progress.value += (100 / (items[item].craftSpeed[curTier]*10)) / 10;

            //when progress is done
            if (progress.value == progress.max) {
                progress.value = 0
                progress.dataset.active = false
                stats.inventory[item]++ //item level up
            
                //apply modifiers from crafted item
                for ([atribute, modified] of Object.entries(items[item].modifier[curTier])) {
                    for ([element, value] of Object.entries(modified)) {
                        if (atribute != "unlock") {
                            stats[atribute][element] += value;
                        }
                    }
                }
                stats.experience.xp += stats.experience.gain.crafting
                stats.skills.xp.crafting++
                checkSkillUp("crafting")
                clearInterval(timer)
            }
        }, 10)
    }
    
    doOftens()
}

function resetStats() {
    if(confirm("Are you sure you want to do this?")){
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
}

function doOftens(){
    checkUnlocks()
    updateValues()
    saveGame()
}

function getLevel() {
    return Math.floor(Math.sqrt(stats.experience.xp/500))
}

function checkUnlocks(){
    if(!stats.unlocks.crafting){
        if(stats.resources.wood >= 10){
            stats.unlocks.crafting = true
            document.getElementById("craftingButton").style.visibility = "visible"
        }
    }
    if(!stats.unlocks.skills){
        for([skill, xp] of Object.entries(stats.skills.xp)){
            if (xp >= 100){
                stats.unlocks.skills = true
                document.getElementById("skillsButton").style.visibility = "visible"
            }
        }
    }
}

function unlockUnlocked(){
    if(stats.unlocks.crafting){
        document.getElementById("craftingButton").style.visibility = "visible"
    }
    if(stats.unlocks.skills){
        document.getElementById("skillsButton").style.visibility = "visible"
    }
}

function SkillTotalXpToLevel(level){
    return Math.floor(Math.pow(level, 1.5)*100)
}

function SkillXpToNextLevel(level){
    return SkillTotalXpToLevel(level) - SkillTotalXpToLevel(level-1)
}

function checkSkillUp(skillName) {
    var required = SkillXpToNextLevel(stats.skills.level[skillName])
    if(stats.skills.xp[skillName] >= required){
        stats.skills.level[skillName]++
        stats.skills.xp[skillName] -= required
    }
}