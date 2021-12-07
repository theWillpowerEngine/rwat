module.exports = (eng, sh) => {
    let engine = eng
    let ship = sh

    var that = {
        temperature: 0,
        tempSetting: 0,

        holdGridDistance: false,
        selfWarmCycle: false,

        polish: 10,

        damage(amt) {
            ship.damageModel.damage("lift", amt)
        },
        getDamage() { return ship.damageModel.get("lift").damage },

        onDamage(args) {
            //TODO
        },
        onDestroy(args) {
            //TODO
        },

        cycle() {
            if(this.selfWarmCycle) {
                if(this.temperature > 10) {
                    this.selfWarmCycle = false
                } else {
                    if(ship.drainThaums(this.temperature + 1))
                        this.temperature += 1
                    else {
                        this.temperature = 0
                        this.selfWarmCycle = false
                    }
                }

            //regular cycle
            } else {    
                var delta = Math.abs(this.temperature - this.tempSetting)
                if(this.tempSetting > this.temperature) {
                    if(ship.drainThaums(Math.round(delta / 3) + 7)) {
                        this.temperature += 1
                    }
                } else if(this.tempSetting < this.temperature) {
                    if(delta >= 3)
                        if(ship.drainThaums(Math.round(delta / 2) + 15))
                            this.temperature -= 3
                        else
                            this.temperature -= 1
                } else {
                    if(!ship.drainThaums(3)) {
                        this.temperature -= 1
                    }
                }
            }
        }
    }

    return that
}