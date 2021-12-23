const acceleration = {
    x: 0.023,
    y: 0.023,
    z: 0.153
}

module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let lift = ship.lift
    let world = engine.world
    let vector = ship.movementVector
    let desiredVector = {
        x: vector.x,
        y: vector.y,
        z: engine.ship.secureTied ? 0 : (engine.conf.forceOfGravity * -1)
    }

    const applyToVector = (axis) => {
        if(Math.abs(desiredVector[axis] - vector[axis]) <= acceleration[axis]) {
            vector[axis] = desiredVector[axis]
        } else if(vector[axis] > desiredVector[axis]) {
            vector[axis] -= acceleration[axis]
        } else if(vector[axis] < desiredVector[axis]) {
            vector[axis] += acceleration[axis]
        }
    }


    //apply lift
    let targetLift = (lift.temperature - 11) * 0.354
    targetLift -= (ship.getWeight() * 0.239)
    if(targetLift < 0) targetLift = 0
    desiredVector.z += targetLift

    //gradually approach the desiredVector (clip to it when close)
    applyToVector('x')
    applyToVector('y')
    applyToVector('z')

    //apply movement to ship
    ship.x += vector.x
    ship.y += vector.y
    ship.z += vector.z 
}