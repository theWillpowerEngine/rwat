const makeState = require('./state')
const scanner = require("./scanner")
const makeParser = require("./parser")

module.exports = (eng, state, game) => {
    let engine = eng

    var that = {
        state: makeState(state, engine),
        parser: null,

        htmlFormat: true,
        linkFormat: `<a class='action-link' data-action='[v __id]'>[v __text]</a><span class='action-span' data-id='[v __id]'>[v __action]</span>`,

        area: "base",
        node: "0",

        getNode(area, node) {
            return that.nodes[area || that.area][node || that.node]
        },
        nodes: {
            base: {}
        },

        layers: {
            after: {
                action: []
            },
            before: {
                action: []
            },
            do(stage, trigger) {
                retVal = ''
                if(that.layers[stage][trigger])
                    for(var handler of that.layers[stage][trigger])
                        retVal += handler() ?? ""
    
                return retVal
            }
        },

        macros: {},
        specialLinks: {},

        action(action) {
            let oldA = that.area,
                oldN = that.node
            if(action) {
                var retVal = that.layers.do("before", "action")
                retVal += that.internalParse(`{ ${action} }`)
                retVal += that.layers.do("after", "action")
            }

            if(that.node !== oldN || that.area !== oldA) {
                return (retVal || "")
            } else {
                return (retVal || "") + that.parser.eval(that.nodes[that.area][that.node])
            }
        },
    
        registerLayer(stage, trigger, handler) {
            that.layers[stage][trigger].push(handler)
        },

        parse(code, append) {
            if(that.parser == null)
                that.parser = makeParser(that)

            if(!append)
                that.nodes = scanner.scan(that, code)
            else {
                var newNodes = scanner.scan(that, code).base
                that.nodes.base = {
                    ...that.nodes.base,
                    ...newNodes
                }
            }
                
            var baseZeroParsed = that.parser.eval(that.nodes.base[0])
            return baseZeroParsed
        },
        internalParse(code) {
            if(that.parser == null)
                that.parser = makeParser(that)

            var nodes = scanner.scan(that, code)
            var parsed  = that.parser.eval(nodes.base[0])
            return parsed
        },

        done() {
            that.over = false
            that.area = "base",
            that.node = "0",
            that.nodes = {
                base: {}
            }
            that.state.flags.story = []
            that.state.attrs.story = {}
        },

        ...game,

        over: false,
    }
    return that
}