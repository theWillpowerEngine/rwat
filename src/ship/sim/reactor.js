let nextRodIndex = 1
function makeRod(type, opts) {
    return {
        type,
        position: 10,
        quality: 10000,
        number: nextRodIndex++,

        ...opts
    }
}

module.exports = (eng, sh) => {
    let engine = eng
    let ship = sh

    var fuelRodArray = [
        {quality: 100000},
        {quality: 100000},
        {quality: 100000},
        {quality: 100000}
    ]

    var that = {
        limits: {
            pressure: 15,
            heat: 20,
            paradox: 10000,

            capFlow: 20
        },
        coolantGravityPump: false,
        capacitorCharge: false,

        coolantPressure: 0,
        coolantTemp: 0,

        internalTemp: 0,
        internalPressure: 0,
        internalThaums: 0,
        internalParadox: 0,
        internalAntimagic: 0,

        breach: 0,

        turbineForce: 0,
        turbineSetting: 0,
        boilerSetting: 0,
        boilerHeat: 0,

        fuel: fuelRodArray,
        control: [
            {a: fuelRodArray[0], b: fuelRodArray[1], position: 10},
            {a: fuelRodArray[1], b: fuelRodArray[2], position: 10},
            {a: fuelRodArray[2], b: fuelRodArray[3], position: 10},
            {a: fuelRodArray[3], b: fuelRodArray[0], position: 10},
        ],

        info: {
            previousNewThaums: 0,
            newThaums: 0,
            previousThaums: 0
        },

        cycle() {
            if(that.coolantPressure < 1 && that.coolantGravityPump)
                that.coolantPressure = 1
            if(that.coolantPressure < 0 || ! that.coolantPressure)
                that.coolantPressure = 0

            that.info.previousThaums = that.internalThaums
            
            //Control rods "gather" thaums by being retracted
            var newThaums = 0
            for(var rod of that.control) {
                var amt = 10 - rod.position
                if(amt) {
                    rod.a.quality -= 1
                    rod.b.quality -= 1
                    if(that.internalTemp > 10) {
                        rod.a.quality -= (that.internalTemp - 10)
                        rod.b.quality -= (that.internalTemp - 10)
                    } 
                    amt = Math.round(Math.round((rod.a.quality / 10000) - rod.position) + Math.round((rod.b.quality / 10000)- rod.position) / 5)

                    if(that.internalTemp < 4)
                        amt -= 1
                    else if(that.internalTemp > 7)
                        amt += (that.internalTemp - 7)

                    if(amt < 0)
                        amt = 0
                    newThaums += amt
                }
            }
            that.internalThaums += newThaums
            
            //Thaums collide, creating heat and paradox
            if(newThaums) {    
                var reactionHeat = Math.round(Math.sqrt(that.internalThaums))
                that.internalTemp = Math.round((reactionHeat + (that.internalTemp * 4)) / 5)
                that.internalParadox += newThaums
            } else {
                that.internalThaums -= 1
                that.internalTemp -= 1 + that.coolantPressure
                that.internalParadox -= 1
                if(that.internalThaums < 0) that.internalThaums = 0
                if(that.internalTemp < 0) that.internalTemp = 0
                if(that.internalParadox < 0) that.internalParadox = 0
            }

            that.info.previousNewThaums = that.info.newThaums
            that.info.newThaums = newThaums

            //Coolant lowers heat and produces pressure
            if(that.internalTemp && that.coolantPressure) {
                that.internalPressure = that.coolantPressure
                var coolingDelta = that.internalTemp - that.coolantTemp
                if(coolingDelta > 0)
                {
                    that.internalTemp = Math.round(((that.coolantTemp * 2) + (that.internalTemp * 3)) / 5)
                    if(newThaums) {
                        that.internalPressure = Math.round(((that.coolantPressure * 2) + (that.internalTemp * 3)) / 5)
                        that.coolantTemp = Math.round(((that.coolantTemp * 3) + (that.internalTemp * 2)) / 5)
                    } else {
                        that.coolantTemp = Math.round(((that.coolantTemp * 9) + (that.internalTemp * 1)) / 10)
                    }
                }
            }

            //Pressure + Paradox creates Antimagic
            if(that.internalPressure && that.internalParadox) {
                if(that.internalParadox >= that.internalPressure) {
                    that.internalAntimagic += (that.internalPressure)
                    that.internalParadox -= (that.internalPressure)
                } else {
                    that.internalAntimagic += that.internalParadox
                    that.internalParadox = 0
                }
            }

            //Heat burns off Antimagic
            if(that.internalTemp > 5) {
                that.internalAntimagic -= (that.internalTemp - 5)
                if(that.internalAntimagic < 0) that.internalAntimagic = 0
            }

            //Antimagic reduces Thaums
            if(that.internalAntimagic) {
                if(that.internalThaums >= that.internalAntimagic) {
                    that.internalThaums -= that.internalAntimagic
                    that.internalAntimagic = 0
                } else {
                    that.internalAntimagic -= that.internalThaums
                    that.internalThaums = 0
                }
            }

            //Excess Pressure/Paradox/Heat all represent different problems
            if(that.internalPressure > that.limits.pressure) {
                that.breach += that.internalPressure - that.limits.pressure
            }

            if(that.internalTemp > that.limits.heat) {
                engine.gameOver = "The reactor melted down"
            }

            if(that.internalParadox > that.limits.paradox) {
                engine.gameOver = "The reactor created a paradox event"
            }
            
            if(that.breach) {
                that.internalPressure -= that.breach
                if(that.breach > 5)
                    engine.gameOver = "A reactor breach caused the ship to come apart"
            }

            //Pressure is expended to turns the turbines
            var overPressure = that.internalPressure - 1
            if(that.turbineSetting && overPressure > 0) {
                if(overPressure > that.turbineSetting) {
                    that.turbineForce = that.turbineSetting
                    that.internalPressure -= that.turbineSetting
                } else if(overPressure > 0) {
                    that.turbineForce = overPressure
                    that.internalPressure = 1
                }
            }

            //Coolant Heat is expended to heat the boilers
            if(that.boilerSetting) {
                if(that.coolantTemp > that.boilerSetting) {
                    that.boilerHeat = that.boilerSetting
                    that.coolantTemp -= that.boilerHeat
                } else {
                    that.boilerHeat = that.coolantTemp
                    that.coolantTemp = 0
                }
            }

            //Thaumatic Capacitor Charge
            if(that.internalThaums && that.capacitorCharge && ship.thaumaticCapacitorThaums < 1000) {
                var amt = that.limits.capFlow
                
                if(amt > that.internalThaums) {
                    amt = that.internalThaums - 1
                }

                if(amt > 0) {
                    if(ship.thaumaticCapacitorThaums + amt <= 1000) {
                        ship.thaumaticCapacitorThaums += amt
                    } else {
                        ship.thaumaticCapacitorThaums = 1000
                    }
                }
            }
            
            that.coolantPressure = that.internalPressure
            that.coolantTemp -= 1
            if(that.coolantTemp < 0)
                that.coolantTemp = 0
       }
    }
    
    return that
}