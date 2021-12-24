const rpg = require("../../system")

const firstNames = [
    "Alex", "Alvin", "Anomander", "Arnold", "Baggy", "Ben", "Benedict", "Blaise", "Bob", "Brand", "Brandon", "C. J.", "Cheradenine", "Connor", "Corwin", 
    "Dan", "Daniel", "David", "Delwyn", "Dolph", "Duncan", "Dworkin", "Gerard", "Gideon", "Hank", "Harrison", "Harry", "Henry", "Ian", 
    "Iain", "Jack", "James", "Jaroslav", "Kevin", "Leland", "Liam", "Luke", "Mat", "Maddox", "Matt", "Oberon", "Patrick", "Perrin", "Phillip", 
    "Philodendron", "R. C.","Rand", "Random", "Rob", "Robert", "Sam", "Samuel", "Shep", "Shen", "Stefan", "Stephen", "Steven", "Terry", 
    "Terrence", "Tom", "Tomas", "Wyndham", "Xavier", "Zap", "Zip"
]

const lastNames = [
    "Abnett", "Adler", "Amnell", "Aubrey", "Babbington", "Banks", "Baskerville", "Barimen", "Bennett", "Black", "Butler", 
    "Case", "Cavill", "Clavell", "Cooper", "Damodred", "Dumas", "Flaherty", "Flanagan", "Garnett", "Goodkind", "Hayward", "Haywood", "Hemsworth", "Heyward", "Holmes", 
    "Irenicus", "Jordan", "Li", "Lien", "Lovecraft", "Lynch", "Martell", "Maturin", "Meredith", "Mishima", "Moappit", "Montgomery", 
    "Moriarty", "Mulder", "Mulgrew", "Palmer", "Park", "Patel", "Picard", "Picardo", "Pullings", "Rake", "Ravenscroft", 
    "Rearden", "Reynold", "Roddenberry", "Sanderson", "Senjak", "Stapleton", "Stevens", "Stevenson", "Taggart", "Templeton", 
    "van Damme", "van Diem", "Trakand", "Verne", "Wells", "Woods"
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