const tiles = require("../map/tiles")

const xpCumulativeCosts= [1, 2, 4, 7, 12, 17, 25, 33, 43, 56]

module.exports = (eng) => {
    let engine = eng
    var that = {
        name: "Spatula Fitzsimmons",
        x: 2,
        y: 2,
        tile: tiles.player,
        isPC: true,
        turnValve: 1,
        
        lightOn: false,
        lightFuel: 400,

        zelaznyAttrs: {
            factionSaltrice: 0,
            factionTraven: 0,
        },

        //#region Skills and Trades
        
        airmanship: 0,      airmanshipActual: 0,
        leadership: 0,      leadershipActual: 0,
        negotiation: 0,     negotiationActual: 0,
        manipulation: 0,    manipulationActual: 0,
        strength: 0,        strengthActual: 0,
        intellect: 0,       intellectActual: 0,
        luck: 0,            luckActual: 0,
        reaction: 0,        reactionActual: 0,
        resilience: 0,      resilienceActual: 0,
        
        cooking: 0,         cookingActual: 0,
        appraisal: 0,       appraisalActual: 0,
        medicine: 0,        medicineActual: 0,
        chemistry: 0,       chemistryActual: 0,
        larceny: 0,         larcenyActual: 0,
        barding: 0,         bardingActual: 0,
        gambling: 0,        gamblingActual: 0,
        animals: 0,         animalsActual: 0,
        mining: 0,          miningActual: 0,
        farming: 0,         farmingActual: 0,

        martialArts: 0,     martialArtsActual: 0,
        firearms: 0,        firearmsActual: 0,
        engineering: 0,     engineeringActual: 0,
        divination: 0,      divinationActual: 0,
        fishing: 0,         fishingActual: 0,

        sorcery: 0,         sorceryActual: 0,
        edge: 0,            edgeActual: 0,
        flashSteps: 0,      flashStepsActual: 0,
        knack: 0,           knackActual: 0,

        //#endregion

        incrementSkill(skill, amt) {
            if(!that[skill] && that[skill] !== 0)
                throw "Invalid skill (can't increment): " + skill

            that[skill+"Actual"] += amt
            
            var actual = that[skill+"Actual"]
            var skillVal = that[skill]

            while(skillVal < 10 && actual >= xpCumulativeCosts[skillVal]) {
                skillVal += 1
            }

            that[skill] = skillVal

            return skillVal
        },

        move(dX, dY) {
            if(Math.abs(dX) > 1 || Math.abs(dY) > 1)
                return
            
            var nX = that.x + dX,
                nY = that.y + dY

            var bc = engine.boundsCheck(nX, nY) 
            if(!bc.ib) {
                if(bc.tile?.interactive)
                    engine.interact(false, nX, nY)
                return
            }

            that.x = nX
            that.y = nY
        },

        distToDirect(x, y) {
            return engine.rangeBetween(x, y, that.x, that.y)
        }
    }

    return that
}