const skillList = ["airmanship", "leadership", "negotiation", "manipulation", "strength", "intellect", "luck", "reaction",
                   "resilience", "cooking", "appraisal", "medicine", "chemistry", "larceny", "barding", "gambling", 
                   "animals", "mining", "farming", "martialArts", "firearms", "fishing", "engineering", "divination", 
                   "sorcery", "edge", "flashSteps", "knack", "navigation"]

module.exports = (seed, eng) => {
    let engine = eng
    var that = {
        flags: {
            pc: [],
            story: [],
            node: [],
            historic: {}
        },

        enums: [],

        attrs: {
            pc: {},
            story: {},
            node: {},
            historic: {}
        },

        ...seed,
        
        addEnum(vals) {
            for(var val of vals)
                if(that.isEnum(val))
                    throw `Value ${val} is already in an enum and cannot be added to enum "${JSON.stringify(vals)}"`

            that.enums.push(vals)
        },
        isEnum(val) {
            for(var en of that.enums) {
                for(var v of en)
                    if(v.toLowerCase() == val.toLowerCase())
                        return true
            }
            
            return false
        },
        getEnumVals(val) {
            for(var en of that.enums) {
                for(var v of en)
                    if(v.toLowerCase() == val.toLowerCase())
                        return en
            }
            return null
        },
        clearEnum(flagType, val) {
            if(!that.isEnum(val))
                return

            var vals = that.getEnumVals(val)
            for(var val of vals)
                that.flags[flagType].splice(that.flags[flagType].indexOf(val.toLowerCase()))
        },

        hasFlag(flag) {
            return that.hasPCFlag(flag) ||
                    that.hasStoryFlag(flag) ||
                    that.hasNodeFlag(flag) 
        },
        hasPCFlag(flag) {
            return that.flags.pc.includes(flag.toLowerCase())
        },
        hasStoryFlag(flag) {
            return that.flags.story.includes(flag.toLowerCase())
        },
        hasNodeFlag(flag) {
            return that.flags.node.includes(flag.toLowerCase())
        },
        setPCFlag(flag, unset) {
            if(!unset) {
                if(!that.hasPCFlag(flag)) {
                    if(that.isEnum(flag))
                        that.clearEnum("pc", flag)
                    that.flags.pc.push(flag.toLowerCase())
                }
            } else {
                if(that.hasPCFlag(flag))
                    that.flags.pc.splice(that.flags.pc.indexOf(flag.toLowerCase()))
            }
        },
        setStoryFlag(flag, unset) {
            if(!unset) {
                if(!that.hasStoryFlag(flag)) {
                    if(that.isEnum(flag))
                        that.clearEnum("story", flag)
                    that.flags.story.push(flag.toLowerCase())
                }
            } else {
                if(that.hasStoryFlag(flag))
                    that.flags.story.splice(that.flags.pc.indexOf(flag.toLowerCase()))
            }
        },
        setNodeFlag(flag, unset) {
            if(!unset) {
                if(!that.hasNodeFlag(flag)) {
                    if(that.isEnum(flag))
                        that.clearEnum("node", flag)
                    that.flags.node.push(flag.toLowerCase())
                }
            } else {
                if(that.hasNodeFlag(flag))
                    that.flags.node.splice(that.flags.pc.indexOf(flag.toLowerCase()))
            }
        },
        saveNode(area, node) {
            if(!that.flags.historic[area])
                that.flags.historic[area] = {}
            that.flags.historic[area][node] = that.flags.node

            if(!that.attrs.historic[area])
                that.attrs.historic[area] = {}
            that.attrs.historic[area][node] = that.flags.node
        },
        saveStory(area) {
            if(!that.flags.historic[area])
                that.flags.historic[area] = {}
            that.flags.historic[area]["__AREA_FLAGS__"] = that.flags.story

            if(!that.attrs.historic[area])
                that.attrs.historic[area] = {}
            that.attrs.historic[area]["__AREA_FLAGS__"] = that.flags.story
        },
        loadNode(area, node) {
            that.flags.node = (that.flags.historic[area] || {})[node] || []
            that.attrs.node = (that.flags.historic[area] || {})[node] || {}
        },
        loadStory(area) {
            that.flags.story = (that.flags.historic[area] || {})["__AREA_FLAGS__"] ?? []
            that.attrs.story = (that.flags.historic[area] || {})["__AREA_FLAGS__"] ?? {}
        },

        getAttr(attr) {
            if(skillList.includes(attr))
                return engine.player[attr]
            if(Object.keys(engine.player.zelaznyAttrs).includes(attr))
                return engine.player.zelaznyAttrs[attr] 
            if(that.attrs.pc[attr.toLowerCase()] !== undefined)
                return that.attrs.pc[attr.toLowerCase()]
            if(that.attrs.story[attr.toLowerCase()] !== undefined)
                return that.attrs.story[attr.toLowerCase()]
            if(that.attrs.node[attr.toLowerCase()] !== undefined)
                return that.attrs.node[attr.toLowerCase()]
            
            return null
        },
        addToAttr(attr, val) {
            if(skillList.includes(attr))
                engine.player.incrementSkill(attr, val)
            if(Object.keys(engine.player.zelaznyAttrs).includes(attr))
                engine.player.zelaznyAttrs[attr] += val
            else if(that.attrs.pc[attr.toLowerCase()] !== undefined)
                that.setPCAttr(attr, parseInt(that.getAttr(attr)) + val)    
            else if(that.attrs.story[attr.toLowerCase()] !== undefined)
                that.setStoryAttr(attr, parseInt(that.getAttr(attr)) + val)
            else if(that.attrs.node[attr.toLowerCase()] !== undefined)
                that.setNodeAttr(attr, parseInt(that.getAttr(attr)) + val)
        },
        setPCAttr(attr, val) {
            that.attrs.pc[attr.toLowerCase()] = val
        },
        setStoryAttr(attr, val) {
            that.attrs.story[attr.toLowerCase()] = val
        },
        setNodeAttr(attr, val) {
            that.attrs.node[attr.toLowerCase()] = val
        },
        clearAttr(attr) {
            if(that.attrs.pc[attr.toLowerCase()] !== undefined)
                delete that.attrs.pc[attr.toLowerCase()]
            if(that.attrs.story[attr.toLowerCase()] !== undefined)
                delete that.attrs.pc[attr.toLowerCase()]
            if(that.attrs.node[attr.toLowerCase()] !== undefined)
                delete that.attrs.pc[attr.toLowerCase()]
        },
    }
    return that
}