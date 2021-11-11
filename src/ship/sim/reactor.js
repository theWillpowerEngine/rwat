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

        breach: 0,

        turbineForce: 0,
        turbineSetting: 1,

        fuel: fuelRodArray,
        
        control: [
            {a: fuelRodArray[0], b: fuelRodArray[1], position: 10},
            {a: fuelRodArray[1], b: fuelRodArray[2], position: 10},
            {a: fuelRodArray[2], b: fuelRodArray[3], position: 10},
            {a: fuelRodArray[3], b: fuelRodArray[0], position: 10},
        ],

        cycle() {
            if(that.coolantPressure < 1 && that.coolantGravityPump)
                that.coolantPressure = 1

            var accCount = 0

            //Control rods "gather" thaums by being retracted
            for(var rod of that.control) {
                var amt = 10 - rod.position
                if(amt) {
                    rod.a.quality -= 1
                    rod.b.quality -= 1
                    if(that.internalTemp > 10) {
                        rod.a.quality -= (that.internalTemp - 10)
                        rod.b.quality -= (that.internalTemp - 10)
                    } 
                    that.internalThaums += Math.round(Math.round((rod.a.quality / 1000) - rod.position) + Math.round((rod.b.quality / 1000)- rod.position) / 5)
                }
            }

            if(that.internalThaums) {
                //Thaums collide, creating heat
                var reactionHeat = Math.floor(that.internalThaums / (that.coolantPressure ? 3 : 2))
                var reactionLoss = Math.floor(that.internalThaums / (that.coolantPressure ? 4 : 3))
                that.internalThaums -= reactionLoss
                that.internalTemp = Math.round((reactionHeat + that.internalTemp + that.internalTemp) / 3)

                engine.log(`T: ${that.internalThaums}, Temp: ${that.internalTemp}`)
            }

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