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

    var that = {
        coolantFlow: 0,
        coolantTemp: 0,
        internalTemp: 0,
        internalPressure: 0,
        outgoingCoolantPressure: 0,
        outgoingCoolantTemp: 0,
        breach: 0,
        internalThaums: 0,
        turbineForce: 0,
        turbineSetting: 1,

        rods: [
            [makeRod("F"), makeRod("C"), makeRod("F")],
            [makeRod("C"), makeRod("A"), makeRod("C")],
            [makeRod("F"), makeRod("C"), makeRod("F")]
        ],

        cycle() {
            var outputs = { 
                heat: that.internalTemp, 
                pressure: 0,
                thaums: 0, paradox: 0, antimagic: 0 
            }
            var accRods = []

            //Step 1 - Cycle rods to generate heat, paradox and thaums
            for(var x=0; x<3; x++)
                for(var y=0; y<3; y++) {
                    var rod = that.rods[x][y]
                    switch(rod.type) {
                        case 'F':
                            rod.quality -= 1
                            if(outputs.heat > 10)
                                rod.quality -= (outputs.heat - 10)
                            var amt = Math.floor(rod.quality/1000)
                            if(amt == 0 && rod.quality > 300) amt += 1
                            outputs.thaums += amt
                            break

                        case 'C':
                            outputs.thaums -= rod.position
                            if(outputs.thaums) {
                                outputs.heat += 10 - rod.position
                                outputs.paradox += Math.floor((10 - rod.position) / 2)
                            }
                            break
                        
                        case 'A':
                            accRods.push(rod)
                            break
                    }
                }

            //Step 2 - Apply modifiers
            //Finalize heat
            if(outputs.heat >= that.internalTemp)
                outputs.heat = Math.floor((outputs.heat + outputs.heat + that.internalTemp) / 3)
            else if(outputs.heat > 0)
                outputs.heat -= 1
            
            //Calc pressure and modify temperature
            if(outputs.heat > 1) {
                if(that.coolantFlow > that.internalPressure)
                    outputs.pressure = Math.floor((that.coolantFlow + that.internalPressure) / 2)
                else if(that.coolantFlow > that.internalPressure)
                    outputs.pressure = Math.floor((that.coolantFlow + that.internalPressure + that.internalPressure) / 3)
                else
                    outputs.pressure = that.internalPressure
            }

            //Apply coolant to internal temperature
            if(that.coolantFlow) {
                var coolantEffectiveness = Math.floor(that.coolantFlow / 3) + 1
                if(that.coolantTemp > outputs.heat)
                    outputs.heat = Math.floor((outputs.heat + (that.coolantTemp * coolantEffectiveness)) / (coolantEffectiveness+1))
                else if(that.coolantTemp < outputs.heat)
                    outputs.heat = Math.floor((that.coolantTemp + (outputs.heat * coolantEffectiveness)) / (coolantEffectiveness+1))
            }

            //2.3:  Apply low/high heat/pressure effects
            //Meltdown
            if(outputs.heat > 11) {
                engine.log("Meltdown!")
                outputs.heat += 2
                outputs.thaums += outputs.heat - 10
                outputs.paradox += outputs.heat - 10
                if(outputs.pressure > 0)
                    outputs.pressure += Math.floor((outputs.heat - 10) / 2)
            }

            //Containment Breach
            if(outputs.pressure > 12) {
                engine.log("Breach!  Amount: " + that.breach)
                that.breach += 1
                outputs.pressure -= that.breach
                outputs.paradox += that.breach
            }

            //Reactor Poisoning
            if(outputs.pressure < 3) {
                if(outputs.thaums > 3)
                    outputs.antimagic += (outputs.thaums - 3)
                if(outputs.heat > 5)
                    outputs.heat += 1 + outputs.antimagic
            }

            //Step 3 - Cancel paradox/antimagic and accumulate thaums
            if(outputs.antimagic) {
                outputs.antimagic -= outputs.thaums
                if(outputs.antimagic < 0) {
                    outputs.thaums = Math.abs(outputs.antimagic)
                    outputs.antimagic = 0
                } else {
                    outputs.thaums = 0
                }
            }

            if(outputs.paradox) {
                if(outputs.thaums < 5)
                    outputs.paradox -= 1
                if(outputs.thaums < 3)
                    outputs.paradox -= 1
                if(outputs.thaums < 2)
                    outputs.paradox -= 1
                if(outputs.thaums == 0)
                    outputs.paradox -= 1
            }

            //Accumulate
            that.internalThaums += outputs.thaums
            var fifthThaums = Math.floor(outputs.thaums / 5)
            if(fifthThaums == 0)  fifthThaums = 1
            outputs.thaums = accRods.length * fifthThaums
            that.internalThaums -= outputs.thaums

            //Extract values
            that.internalPressure = Math.round(outputs.pressure)
            that.outgoingCoolantTemp = that.internalTemp = Math.round(outputs.heat)
            
            if(outputs.pressure > that.turbineSetting) {
                that.turbineForce = that.turbineSetting
                outputs.pressure -= that.turbineSetting
            } else {
                that.turbineForce = outputs.pressure
                outputs.pressure = 0
            }
 
            that.outgoingCoolantPressure = Math.round(outputs.pressure)
 
            return outputs
        }
    }
    
    return that
}