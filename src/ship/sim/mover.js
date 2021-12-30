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

    const shiftVectorTowards = (axis, amt) => {
        if(Math.abs(vector[axis] - amt) <= acceleration[axis]) {
            vector[axis] = amt
        } else if(amt > vector[axis]) {
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

    //apply gravity
    var forceOfGravity = 0
    if(vector.z > -1 * engine.conf.forceOfGravity) {
        if(vector.z > 0)
            forceOfGravity = (-1 * engine.conf.forceOfGravity)
        else
            forceOfGravity = (-1 * engine.conf.forceOfGravity) - vector.z
    }    

    //apply lift
    let targetLift = (lift.temperature - (10 + (ship.getWeight() * 0.239))) * 0.0748
    if(targetLift < 0) targetLift = 0
    
    vector.effectiveLift = targetLift + forceOfGravity
    shiftVectorTowards('z', vector.effectiveLift)

    //prop
    let weightScaleFactor = 120 - ship.getWeight()
    weightScaleFactor *= 0.0154
    let targetPropForce = ((drive.propSpeed * 0.01639) * weightScaleFactor)

    if(Math.abs(lastPropForce - targetPropForce) <= acceleration.prop) {
        lastPropForce = targetPropForce
    } else if(targetPropForce > lastPropForce) {
        lastPropForce = (lastPropForce += acceleration.prop)
    } else {
        lastPropForce = (lastPropForce -= acceleration.prop)
    }

    //apply movement to ship
    if(ship.secureTied && vector.z < 0)
        vector.z = 0

    ship.x += vector.x
    ship.y += vector.y
    ship.z += vector.z
    
    //Apply extra movement vectors
    applyToVectorOnHeading(ship.heading, lastPropForce)
    vector.speed = lastPropForce

    //Collision detection
    let sX = Math.floor(ship.x),
        sY = Math.floor(ship.y)
    var alt = engine.world.terrainMap[sX][sY]
    if(ship.z <= alt) {
        engine.gameOver = "Your Ship + The Ground = GG"
    }

    if(ship.z >= engine.world.gridHeightFor(sX, sY)) {
        engine.gameOver = "A piece of your ship touches the Grid.  The result is a catastrophic, multicolored explosion.  You're dead."
    }
}