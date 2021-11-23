module.exports = (eng, sh) => {
    let engine = eng
    let ship = sh
    

    var that = {
        lubrication: 0,
        lubricant: 100,

        transmission: 0,
        transmissionSpeed: 0,

        propSpeed: 0,
        clutch: true,
        propConnect: true,

        damage(amt) {
            ship.damageModel.damage("transmission", amt)
        },
        getDamage() { return ship.damageModel.get("transmission").damage },

        onDamage(args) {
            that.lubricant -= args.amt
            if(that.lubricant < 0)
                that.lubricant = 0
            engine.log("The ship shudders slightly in a way that doesn't feel entirely healthy.")
        },
        onDestroy(args) {
            engine.log("For a moment you believe the ship has exploded, but once the shock wears off you realize the sound came from the ship's engines and that they are likely destroyed.")
        },

        cycle() {
            if(ship.turbineForce == 0 && that.transmissionSpeed == 0 && that.propSpeed == 0)
                return

            if(that.lubricant < that.lubrication)
                that.lubrication = that.lubricant

            if(that.clutch) {
                if(that.transmissionSpeed) {
                    that.transmissionSpeed -= 1
                }
            } else {
                if(ship.reactor.turbineForce) {
                    if(that.lubrication < 10 && that.lubricant) that.lubrication += 1
                    if(that.lubrication > 10) {
                        that.lubrication -= 1
                        if(that.lubricant) that.lubricant -= 1
                    }
                }

                var desiredTransmissionSpeed = 3
                if(that.transmissionSpeed > desiredTransmissionSpeed) {
                    that.transmissionSpeed -= 1
                } else if(that.transmissionSpeed < desiredTransmissionSpeed) {
                    that.transmissionSpeed += 1
                }
            }

            var desiredPropSpeed = that.transmission * ship.reactor.turbineForce
            if(!that.propConnect)
                desiredPropSpeed = 0

            if(desiredPropSpeed != that.propSpeed) {
                var positiveDelta = desiredPropSpeed > that.propSpeed
                var wasStill = that.propSpeed == 0

                if(Math.abs(positiveDelta) > that.lubrication) {
                    that.damage(Math.abs(positiveDelta))
                }

                that.propSpeed += 1 * (positiveDelta ? 1 : -1)
                if(that.propSpeed && wasStill)
                    engine.log("A gentle vibration can be felt beneath your feet as the ship's engine engages.")
                else if(!that.propSpeed && !wasStill)
                    engine.log("The seemingly-omnipresent vibration of the ship's engine fades away.")
            }
    
            //Check for dry run damage
            if(that.propSpeed > 0 && that.lubrication < 10) {
                that.damage(10 + that.propSpeed - that.lubrication)
            }          
            
            //Emits for damage and other conditions
            if(that.propSpeed) {
                var dmg = that.getDamage()
                if(dmg > 100) {
                    engine.log("There is a hideous grinding sound from below and the entire ship seems to be trying to shake itself apart.")
                    that.propSpeed = 0
                } else if (dmg > 50) {
                    engine.log("The entire ship reverberates with the sound of gears stripping and skipping.  The engines are horribly damaged.")
                    if(that.transmissionSpeed == 3) {
                        that.transmissionSpeed = 2
                        that.propSpeed -= 3
                        if(that.propSpeed < 0) that.propSpeed = 0
                    } else if (that.transmissionSpeed == -3) {
                        that.transmissionSpeed = -2
                        that.propSpeed += 3
                        if(that.propSpeed > 0) that.propSpeed = 0
                    }
                }
                else if(dmg > 20)
                    engine.log("The normally faint vibration of the ship's engine seems heavier and less rhythmic than usual.")
            }
        }
    }

    return that
}