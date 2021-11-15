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
        {quality: 10000},
        {quality: 10000},
        {quality: 10000},
        {quality: 10000}
    ]

    var that = {
        coolantGravityPump: false,
        coolantPressure: 0,
        coolantTemp: 0,

        internalTemp: 0,
        internalPressure: 0,
        internalThaums: 0,
        internalParadox: 0,
        internalAntimagic: 0,

        breach: 0,

        turbineForce: 0,
        turbineSetting: 1,
        boilerSetting: 1,
        boilerHeat: 0,

        fuel: fuelRodArray,
        control: [
            {a: fuelRodArray[0], b: fuelRodArray[1], position: 10},
            {a: fuelRodArray[1], b: fuelRodArray[2], position: 10},
            {a: fuelRodArray[2], b: fuelRodArray[3], position: 10},
            {a: fuelRodArray[3], b: fuelRodArray[0], position: 10},
        ],

        _previousCycleNewThaums: 0,
        cycle() {
            if(that.coolantPressure < 1 && that.coolantGravityPump)
                that.coolantPressure = 1
            if(that.coolantPressure < 0 || ! that.coolantPressure)
                that.coolantPressure = 0

            var accCount = 0

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
                    amt = Math.round(Math.round((rod.a.quality / 1000) - rod.position) + Math.round((rod.b.quality / 1000)- rod.position) / 5)

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

            that._previousCycleNewThaums = newThaums

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

            //Heat burns off Antimagic
            if(that.internalHeat > 5) {
                that.internalAntimagic -= (that.internalHeat - 5)
                if(that.internalAntimagic < 0) that.internalAntimagic = 0
            }

            //Excess Pressure/Paradox/Heat all represent different problems
            

            
            //Pressure is expended to turns the turbines
            var overPressure = that.internalPressure - 1
            if(that.turbineSetting && overPressure) {
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

            that.coolantPressure = that.internalPressure
            that.coolantTemp -= 1
            if(that.coolantTemp < 0)
                that.coolantTemp = 0

            engine.log(`Th: ${that.internalThaums}, Temp: ${that.internalTemp}, P: ${that.internalPressure}, Pd: ${that.internalParadox}, AM: ${that.internalAntimagic}, TF: ${that.turbineForce}, BH: ${that.boilerHeat}`)

            // //Apply coolant to internal temperature
            // if(that.coolantFlow) {
            //     outputs.heat -= that.coolantFlow / 3
            //     outputs.heat = Math.round(outputs.heat)
            //     if(outputs.heat < 0)
            //         outputs.heat = 0
            // }

            // //Finalize heat
            // outputs.heat = Math.round((outputs.heat + outputs.heat + that.internalTemp) / 3)

            // //Calc pressure
            // if(outputs.heat > 1 && that.coolantFlow > 0) {                    
            //     outputs.pressure += outputs.heat / 2

            //     if(that.coolantFlow < outputs.pressure)
            //         outputs.pressure -= (reactor.internalPressure - that.coolantFlow)

            //     if(outputs.pressure < 0)
            //         outputs.pressure = 0
            //     if(outputs.pressure > outputs.heat * 2)
            //         outputs.pressure = outputs.heat * 2
            // }

            // //2.3:  Apply low/high heat/pressure effects
            // //Meltdown
            // if(outputs.heat > 14) {
            //     engine.log("Meltdown!")
            //     outputs.heat += 2
            //     outputs.thaums += outputs.heat - 10
            //     outputs.paradox += outputs.heat - 10
            //     if(outputs.pressure > 0)
            //         outputs.pressure += Math.floor((outputs.heat - 10) / 2)
            // }

            // //Containment Breach
            // if(outputs.pressure > 14) {
            //     engine.log("Breach!  Amount: " + that.breach)
            //     that.breach += 1
            //     outputs.pressure -= that.breach
            //     outputs.paradox += that.breach
            // }

            // //Reactor Poisoning
            // if(outputs.pressure < 3) {
            //     if(outputs.thaums > 3)
            //         outputs.antimagic += (outputs.thaums - 3)
            //     if(outputs.heat > 5)
            //         outputs.heat += 1 + outputs.antimagic
            // }

            // //Step 3 - Cancel paradox/antimagic and accumulate thaums
            // if(outputs.antimagic) {
            //     outputs.antimagic -= outputs.thaums
            //     if(outputs.antimagic < 0) {
            //         outputs.thaums = Math.abs(outputs.antimagic)
            //         outputs.antimagic = 0
            //     } else {
            //         outputs.thaums = 0
            //     }
            // }

            // if(outputs.paradox) {
            //     if(outputs.thaums < 5)
            //         outputs.paradox -= 1
            //     if(outputs.thaums < 3)
            //         outputs.paradox -= 1
            //     if(outputs.thaums < 2)
            //         outputs.paradox -= 1
            //     if(outputs.thaums == 0)
            //         outputs.paradox -= 1
            // }

            // //Accumulate
            // that.internalThaums += outputs.thaums
            // var fifthThaums = Math.floor(outputs.thaums / 5)
            // if(fifthThaums == 0)  fifthThaums = 1
            // outputs.thaums = accRods.length * fifthThaums
            // that.internalThaums -= outputs.thaums

            // //Extract values
            // that.internalPressure = Math.round(outputs.pressure)
            // that.outgoingCoolantTemp = that.internalTemp = Math.round(outputs.heat)
            
            // if(outputs.pressure > that.turbineSetting) {
            //     that.turbineForce = that.turbineSetting
            //     outputs.pressure -= that.turbineSetting
            // } else {
            //     that.turbineForce = outputs.pressure
            //     outputs.pressure = 0
            // }
 
            // that.outgoingCoolantPressure = Math.round(outputs.pressure)
 
            // return outputs
        }
    }
    
    return that
}