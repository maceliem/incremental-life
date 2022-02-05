let items
let stats
let requirements
let css = document.styleSheets[0]
let colors
let skillTree
let housingCosts
let perksList


fetch("data/items.json")
    .then(response => { return response.json() })
    .then(data => items = data)

fetch("data/resourceNeeds.json")
    .then(response => { return response.json() })
    .then(data => requirements = data)

fetch("data/colors.json")
    .then(response => { return response.json() })
    .then(data => colors = data)

fetch("data/skillTree.json")
    .then(response => { return response.json() })
    .then(data => skillTree = data)

fetch("data/housing.json")
    .then(response => { return response.json() })
    .then(data => housingCosts = data)

fetch("data/perks.json")
    .then(response => { return response.json() })
    .then(data => perksList = data)

fetch("stats.json")
    .then(response => { return response.json() })
    .then(data => {
        stats = data
        loadGame()
    })