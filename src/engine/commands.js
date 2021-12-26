module.exports = (eng) => {
    let engine = eng

    var that = {
        playerCommands: [],
        overrideCommands: [],

        clearOverride() {
            for(var i=0; i<20; i++) {
                that.overrideCommands[i] = null
            }        
        },
        
        async doCommand(index) {
            var cmd = that.overrideCommands[index]
            if(cmd) {
                return cmd(engine)
            }
            if(!cmd) cmd = that.playerCommands[index]
            if(cmd) {
                var ret = cmd(engine)
                if(ret === undefined || ret === null) return true
                return ret
            }
        }
    }

    for(var i=0; i<20; i++) {
        that.playerCommands.push(null)
        that.overrideCommands.push(null)
    }

    return that
}