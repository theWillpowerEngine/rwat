module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let lift = ship.lift
    let world = engine.world
    let vector = ship.movementVector

    //gravity + lift
    let targetFall = -1 * (ship.weight / 2.369)
    let targetLift = (lift.temperature - 11) * 1.239
    if(targetLift < 0)  targetLift = 0
    let deltaZ = targetLift + targetFall

    if(engine.conf.debug) debugger

    //going down?
    if(deltaZ < vector.z) {
        if(deltaZ < engine.conf.forceOfGravity)
            vector.z = deltaZ
        else
            vector.z -= eng.conf.forceOfGravity 
    
    //going up
    } else if(deltaZ > vector.z) {
        let maxLiftTolerance = (25 - lift.getDamage()) / 5
        if(deltaZ > maxLiftTolerance) {
            lift.damage(Math.round(deltaZ - maxLiftTolerance))
            deltaZ = deltaZ / 10
        }
        vector.z = deltaZ   //Check for jerking around damage
    }

    //TODO:  apply movement, limit based on tie, check for crash landing and gridsplash
}