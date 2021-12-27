const ds = require('ds-heightmap');
const rpg = require("../../system")

module.exports = (eng) => {
    var c1 = rpg.roll(10), 
        c2 = rpg.roll(10), 
        c3 = rpg.roll(10), 
        c4 = rpg.roll(10),
        rough = (rpg.roll(5) + 5) / 10
    
    ds.init(10, {
        corner: [c1, c2, c3, c4], 
        offset: -0.1,         
        range: 10,             
        rough
    })         
    ds.run()               
    const data = ds.out()

    var retVal = {
        map: data,
    }

    return retVal
}