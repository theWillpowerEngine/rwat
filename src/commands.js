module.exports = (eng) => {
    let engine = eng

    var that = {
        playerCommands: [],
        overrideCommands: [],

        async doCommand(index) {
            var cmd = that.overrideCommands[index]
            if(!cmd) cmd = that.playerCommands[index]
            if(cmd)
                cmd(engine)
        }
    }

    for(var i=0; i<20; i++) {
        that.playerCommands.push(null)
        that.overrideCommands.push(null)
    }

    return that
}