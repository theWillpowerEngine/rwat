module.exports = (eng, sh) => {
    let engine = eng
    let ship = sh
    

    var that = {
        lubrication: 0,
        lubricant: 100,

        transmission: 0,
        transmissionSpeed: 0,

        propSpeed: 0,

        onDamage(args) {
            throw "drive damaged (TODO: remove this)"
        },
        onDestroy(args) {
            throw "drive destroyed (TODO: remove this)"
        },

        cycle() {
            if(ship.turbineForce == 0 && that.propSpeed == 0)
                return


            //Check for dry run damage
            if(that.transmissionSpeed > 0 && that.lubrication < 10) {
                
            }            
        }
    }

    return that
}