module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let lift = ship.lift
    let world = engine.world
    let vector = ship.movementVector

    //gravity
    let targetFall = ship.weight / 2.369
    targetFall = targetFall * -1
    if(vector.z > targetFall) {
        vector.z -= eng.conf.forceOfGravity
        if(vector.z < targetFall)
            vector.z = targetFall 
    }

    //lift
    let targetLift = (lift.temperature - 11) * 1.239
    if(targetLift < 0)
        targetLift = 0
    vector.z += targetLift

    //TODO:  apply movement and limit based on tie
}