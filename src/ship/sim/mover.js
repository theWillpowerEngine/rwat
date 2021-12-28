const acceleration = {
    x: 0.023,
    y: 0.023,
    z: 0.153,
    prop: 0.017,
}

let lastPropForce = 0

module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let lift = ship.lift
    let drive = ship.drive
    let vector = ship.movementVector

    const applyToVector = (axis, amt) => {
        if(Math.abs(amt) <= acceleration[axis]) {
            vector[axis] += amt
        } else if(amt > 0) {
            vector[axis] += acceleration[axis]
        } else {
            vector[axis] -= acceleration[axis]
        }
    }
    const applyToVectorOnHeading = (heading, cappedAmount) => {
        var ratio = engine.headingMaps[heading]
        ship.x += cappedAmount * ratio.x
        ship.y += cappedAmount * ratio.y
    }

    //apply lift
    let targetLift = (lift.temperature - 11) * 0.354
    targetLift -= (ship.getWeight() * 0.239)
    if(targetLift < 0) targetLift = 0
    applyToVector('z', targetLift)

    //prop
    let targetPropForce = (drive.propSpeed * 0.01639)
    if(Math.abs(lastPropForce - targetPropForce) <= acceleration.prop) {
        lastPropForce = targetPropForce
    } else if(targetPropForce > lastPropForce) {
        lastPropForce = (lastPropForce += acceleration.prop)
    } else {
        lastPropForce = (lastPropForce -= acceleration.prop)
    }

    //apply movement to ship
    ship.x += vector.x
    ship.y += vector.y
    ship.z += vector.z
    
    //Apply extra movement vectors
    debugger
    applyToVectorOnHeading(ship.heading, lastPropForce)
    vector.speed = lastPropForce
}