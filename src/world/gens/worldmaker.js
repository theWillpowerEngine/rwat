const ds = require('ds-heightmap');
const rpg = require("../../system")

module.exports = (eng) => {
    var c1 = rpg.roll(16) - 8, 
        c2 = rpg.roll(16) - 8, 
        c3 = rpg.roll(16) - 8, 
        c4 = rpg.roll(16) - 8
    
    ds.init(10, {
        corner: [c1, c2, c3, c4], 
        offset: -1,         
        range: 10,             
        rough: 0.9            
    })         
    ds.run()               
    const data = ds.out()

    var retVal = {
        map: data,
    }

    return retVal
}