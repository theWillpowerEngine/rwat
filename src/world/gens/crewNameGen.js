const rpg = require("../../system.js")

const firstNames = [
    "Alex", "Alvin", "Anomander", "Arnold", "Baggy", "Benedict", "Blaise", "Bob", "Brand", "Brandon", "Connor", "Corwin", 
    "Dan", "Daniel", "David", "Delwyn", "Dolph", "Duncan", "Dworkin", "Gerard", "Hank", "Harrison", "Harry", "Henry", "Ian", 
    "Iain", "Jack", "James", "Kevin", "Leland", "Luke", "Mat", "Maddox", "Matt", "Oberon", "Perrin", "Phillip", 
    "Philodendron", "Rand", "Random", "Rob", "Robert", "Sam", "Samuel", "Shep", "Shen", "Stephen", "Steven", "Terry", 
    "Terrence", "Tom", "Tomas", "Wyndham"
]

const lastNames = [
    "Abnett", "Adler", "Amnell", "Aubrey", "Babbington", "Banks", "Barimen", "Bennett", "Black", "Butler", "Case", "Clavell", 
    "Cooper", "Damodred", "Dumas", "Goodkind", "Hayward", "Haywood", "Heyward", "Holmes", "Jordan", "Li", "Lien", "Lovecraft", 
    "Lynch", "Martell", "Maturin", "Meredith", "Mishima", "Moappit", "Montgomery", "Moriarty", "Mulder", "Mulgrew", 
    "Palmer", "Park", "Patel", "Picard", "Picardo", "Pullings", "Rake", "Ravenscroft", "Rearden", "Reynold", "Roddenberry", 
    "Sanderson", "Senjak", "Stevens", "Stevenson", "Taggart", "van Damme", "van Diem", "Trakand", "Verne", "Wells", "Woods"
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