function makeDamageArea(name, health, notifiers, kids) {
    let da = {
        name,
        health,
        damage: 0,
        notifiers,
        children: kids,
        notify(isDestroyed, args) {
            var name = isDestroyed ? "destroy" : "damage"
            if(da.notifiers[name])
                da.notifiers[name](args)
        }
    }

    return da
}

let that = module.exports = {
    areas: {},
    make: makeDamageArea,
    addArea(a) {
        that.areas[a.name] = a
    },
    get(name) {
        return that.areas[name]
    },

    damage(name, amt) {
        var area = that.get(name)
        if(!area)
            throw "Unknown damage area: " + name

        area.damage += amt
        area.notify(area.damage >= area.health, { amount: amt, health: area.health, damage: area.damage })
    }
}