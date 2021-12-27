const ds = require('ds-heightmap');
const rpg = require("../../system")

const cityNames = ["Saltrice", "Straylight", "Traven", "Pelial", "Shosan"]
const bonusCities = ["Gharinport", "Valesburg", "Tiendang"] 

function getLongestFrom(pts, current) {
    var lpt = null
    var ldist = 0

    for(var pt2 of pts) {
        if(current.find(p => p.x == pt2.x && p.y == pt2.y))
            continue

        var sdist = 999999
        for(var pt3 of current) {
            if(pt3.x == pt2.x && pt3.y == pt2.y) 
                continue
            
            var dist = engine.detector.dist2D(pt3.x, pt3.y, pt2.x, pt2.y)
            if(dist < sdist)
                sdist = dist
        }

        if(sdist > ldist) {
            ldist = sdist
            lpt = pt2
        }
    }

    return lpt
}

function pickSettlementPoints(map, borderSize) {
    if(!borderSize)
        borderSize = 60
    var pts = []
    for(var x=borderSize; x<map.length-(borderSize*2); x++) {
        for(var y=borderSize; y < map[x].length-(borderSize*2); y++)
        {
            var terxel = map[x][y]
            if(terxel >= 10)
                pts.push({x, y})
        }
    }
    return pts
}

//Dis gonna be slow
function placeCities(map, pts, count) {
    if(!count)
        count = 6

    var longest = {
        pt: null,
        pt2: null,
        dist: 0
    }

    for(var pt of pts) {
        for(var pt2 of pts) {
            var dist = engine.detector.dist2D(pt.x, pt.y, pt2.x, pt2.y)
            if(dist > longest.dist)
                longest = {pt, pt2, dist}
        }
    }

    var cities = [ longest.pt, longest.pt2 ]
    while(cities.length < count) {
        var city = getLongestFrom(pts, cities)
        if(!city)
            break
        cities.push(city)
    }
    
    return cities
}

var worldmaker = module.exports = (eng) => {
    var c1 = rpg.roll(10), 
        c2 = rpg.roll(10), 
        c3 = rpg.roll(10), 
        c4 = rpg.roll(10),
        rough = (rpg.roll(4) + 6) / 10
    
    ds.init(10, {
        corner: [c1, c2, c3, c4], 
        offset: 0, //-0.1,         
        range: 10,             
        rough
    })         
    ds.run()               
    const map = ds.out()

    var spts = pickSettlementPoints(map)
    if(spts.length < 10) {
        console.log("Insufficient potential settlement points rerolling map")
        return worldmaker(eng)
    }

    var extraCities = Math.round(rpg.roll(5) / 2)
    if(extraCities == 0) extraCities = 1

    var cities = placeCities(map, spts, 5+extraCities)
    for(var i=0; i<5; i++) {
        cities[i]["name"] = cityNames[i]
        cities[i]["index"] = i+1
    }
    
    var tempBonus = [...bonusCities]
    for(var i=0; i<extraCities; i++) {
        cities[5+i]["name"] = rpg.pickOne(tempBonus)
        cities[5+i]["index"] = i+6
    }
        
    var retVal = {
        map,
        cities
    }

    return retVal
}