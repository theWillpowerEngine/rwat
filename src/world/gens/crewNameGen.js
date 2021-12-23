const rpg = require("../../system.js")

const firstNames = [
    "Alex", "Alvin", "Anomander", "Benedict", "Blaise", "Bob", "Brand", "Brandon", "Corwin", "David", "Delwyn", "Dworkin", 
    "Gerard", "Ian", "Iain", "Jack", "Jams", "Luke", "Mat", "Maddox", "Matt", "Oberon", "Perrin", "Philodendron", "Rand", 
    "Random", "Robert", "Stephen", "Steven", "Terry",  "Terrence", "Tom", "Tomas", "Wyndham"
]

const lastNames = [
    "Abnett", "Aubrey", "Babbington", "Banks", "Barimen", "Bennett", "Case", "Damodred", "Goodkind", "Holmes", "Jordan", 
    "Lynch", "Maturin", "Mishima", "Moappit", "Montgomery", "Patel", "Pullings", "Rake", "Reynold", "Roddenberry", 
    "Sanderson", "Senjak", "Trakand", "Verne", "Wells"
]

module.exports = {
    getName(eng) {
        let name = {
            name: '',
            first: '',
            last: ''
        }
        do {
            name.first = rpg.pickOne(firstNames)
            name.last = rpg.pickOne(lastNames)
            name.name = name.first + " " + name.last
        } while(eng.crew.find(c => c.name == name.name))

        return name
    }
}