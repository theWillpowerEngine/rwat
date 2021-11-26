module.exports = (eng, sh) => {
    let engine = eng
    let ship = sh

    var that = {
        temperature: 0,
        lift: -100,

        tempSetting: 0,

        holdGridDistance: false,
        selfWarmCycle: false,

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
            }
        }
    }

    return that
}