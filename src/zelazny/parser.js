function endsWith(check, lookFor) {
    return check[check.length-1] == lookFor
}
function getScopeName(scope) {
    switch(scope.toLowerCase()) {
    case "player":      case "pc":      case "you":     case "i":
    case "player's":    case "pc's":    case "your":    case "my":
        return 'pc'
    case "node":       case "room":    case "page":    case "it":
    case "node's":     case "room's":  case "page's":  case "its":
        return 'node'
    case "story":       case "chapter":   case "area":    case "section":
    case "story's":     case "chapter's": case "area's":  case "section's":
        return 'story'
    default:
        throw 'Unknown scope for getScopeName: ' + scope
    }
}


module.exports = (zelazny) => {
    var that = {
        zelazny: zelazny,
        state: zelazny.state,
        linkIndex: 1,

        ////////////////////////////////////////////////////////////////////////
        evalActions(list) {
            if(!list || !list.length)
                return
            
            var retVal = ''
            var actions = [...list]
            actions = actions.reverse()

            var pop = () => {
                try {
                    var val = actions.pop()
                    if(val[0] == '$') {
                        return that.state.getAttr(val.substr(1))
                    } else
                        return val
                } catch (e) {
                    throw "Unexpected end of code"
                }
            }
            var tryPop = () => {
                if(actions.length)
                    return pop()
                return null
            }
            var peek = () => {
                if(actions.length)
                    return actions[actions.length-1]
                return null
            }
            var expect = (parms, noThrow) => {
                if(!parms.length)
                    throw `No arguments passed to exepct()`
                
                var val = pop()
                if(!parms.includes(val)) {
                    if(noThrow) {
                        actions.push(val)
                        return false
                    }else
                        throw `Found: '${val}';  Expected: ${JSON.stringify(parms)}`
                }
                return true
            }
            
            while(actions.length) {
                var kw = pop().toLowerCase()
            
                switch(kw) {
                    case "write":
                        retVal += that.zelazny.internalParse(tryPop() || '')
                        break

                    case "the":
                        break

                    case "player":      case "pc":      case "you":     case "i":
                    case "node":        case "area":    case "room":    case "page":
                    case "story":       case "chapter": case "area":    case "section":
                        expect(['is', "are", "am"])
                        var val = pop()
                        var not = false
                        if(val == "not") {
                            not = true
                            val = pop()
                        }

                        switch(getScopeName(kw)) {
                            case 'pc':
                                that.zelazny.state.setPCFlag(val, not)
                                break
                            case 'node':
                                that.zelazny.state.setNodeFlag(val, not)
                                break
                            case 'story':
                                that.zelazny.state.setStoryFlag(val, not)
                                break
                        }
                        break

                    case "it":
                        expect(['can', 'could', "should"])
                        expect(['be:'])
                        var enumList = []
                        var item = pop()
                        while(!item.endsWith('.')) {
                            if(item != "or")
                                enumList.push(item)
                            item = pop()
                        }
                        enumList.push(item.substr(0, item.length-1))
                        that.zelazny.state.addEnum(enumList)
                        break

                    case "player's":      case "pc's":      case "your":      case "my":
                    case "node's":        case "area's":    case "room's":    case "page's":
                    case "story's":       case "chapter's": case "area's":    case "section's":
                        var trait = pop()
                        expect(["is", "are", "="])
                        var val = pop()
                        switch(getScopeName(kw)) {
                            case 'pc':
                                that.zelazny.state.setPCAttr(trait, val)
                                break
                            case 'node':
                                that.zelazny.state.setNodeAttr(trait, val)
                                break
                            case 'story':
                                that.zelazny.state.setStoryAttr(trait, val)
                                break
                        }
                        break

                    case "add":
                        var val = parseInt(pop())
                        expect(["to"])
                        var trait = pop()
                        that.zelazny.state.addToAttr(trait, val)
                        break
                    case "subtract":
                    case "minus":
                        var val = parseInt(pop())
                        expect(["to", "from"])
                        var trait = pop()
                        that.zelazny.state.addToAttr(trait, -val)
                        break

                    case "go":
                    case "move":
                        expect("to")
                        var newNode = pop()
                        that.zelazny.state.saveNode(that.zelazny.area, that.zelazny.node)
                        var isArea = false
                        if(actions.length && expect(["in"], true))
                        {
                            isArea = true
                            that.zelazny.state.saveStory(that.zelazny.area)
                            that.zelazny.area = pop()
                            that.zelazny.node = newNode
                            if(!that.zelazny.getNode())
                                throw `Invalid destination area (${that.zelazny.area}) and/or node ${newNode}`
                        } else {
                            that.zelazny.node = newNode
                            if(!that.zelazny.getNode())
                                throw "Invalid destination node: " + newNode
                        }
                        
                        that.zelazny.layers.do("before", "navigate")
                        that.zelazny.state.loadNode(that.zelazny.area, that.zelazny.node)
                        if(isArea)
                            that.zelazny.state.loadStory(that.zelazny.area)
                        var result = that.eval(that.zelazny.getNode())
                        that.zelazny.layers.do("after", "navigate")
                        return retVal + result

                    case "on":
                        var stage = pop()
                        if(!that.zelazny.layers[stage])
                            throw "Unknown stage for 'on' keyword: " + stage
                        var event = pop()
                        event = event.substr(0, event.length-1)
                        if(!that.zelazny.layers[stage][event])
                            throw "Unknown event for 'on' keyword: " + event
                        var code = []
                        while(peek() != "end" && actions[actions.length-2] != stage && actions[actions.length-3] != event)
                            code.push(pop())
                        
                        pop() 
                        pop() 
                        pop()
                        that.zelazny.registerLayer(stage, event, () => {
                            return that.zelazny.parser.evalActions(code)
                        })
                        break

                    default:
                        if(that.zelazny.macros[kw])
                            retVal += that.zelazny.macros[kw](pop, expect, tryPop, peek) || ""
                        else if (expect(["the", "game"], true) && expect(["end", "over"], true)) 
                            that.zelazny.over = kw
                        else 
                            throw "Unknown keyword: " + kw
                }
            }

            return retVal
        },

        ////////////////////////////////////////////////////////////////////////
        eval(tree) {
            var retVal = ''
            if(!tree || !tree.length)
                return ""

            for(var node of tree) {
                switch(node.cmd) {
                    case "text":
                        retVal += node.text
                        break
                
                    case "?":
                        if(this.state.hasFlag(node.text)) {
                            retVal += that.eval(node.yes)
                        } else if(node.no) {
                            retVal += that.eval(node.no)
                        }
                        break
                    case "!":
                        if(!this.state.hasFlag(node.text)) {
                            retVal += that.eval(node.yes)
                        } else if(node.no) {
                            retVal += that.eval(node.no)
                        }
                        break

                    case "first":
                        if(!node.eles || !node.eles.length)
                            break
                        
                        for(var ele of node.eles) {
                            var res = that.eval([ele])
                            if(res) {
                                retVal += res
                                break
                            }
                        }
                        break

                    case ">":
                        var val = that.state.getAttr(node.text)
                        if(val === null)
                            break

                        if(parseInt(val) > node.check) {
                            retVal += that.eval(node.yes)
                            
                        } else if(node.no) {
                            retVal += that.eval(node.no)
                        }
                        break
                    case "<":
                        var val = that.state.getAttr(node.text)
                        if(val === null)
                            break

                        if(parseInt(val) < node.check) {
                            retVal += that.eval(node.yes)
                        } else if(node.no) {
                            retVal += that.eval(node.no)
                        }
                        break
                    case "=":
                        var val = that.state.getAttr(node.text)
                        if(val === null)
                            break

                        if(parseInt(val) == node.check) {
                            retVal += that.eval(node.yes)
                        } else if(node.no) {
                            retVal += that.eval(node.no)
                        }
                        break

                    case "|":
                        console.log(node)
                        break
                    case "&":
                        break
                    
                    case "value":
                        var val = that.state.getAttr(node.text)
                        if(val === null)
                            break
                        retVal += val
                        break

                    case "range":
                        var val = that.state.getAttr(node.text)
                        var set = false
                        if(val === null)
                            break
                        for(var ele of node.range) {
                            if(parseInt(val) <= parseInt(ele.check)) {
                                retVal += that.eval(ele.value)
                                set = true
                                break
                            }
                        }
                        if(node.default && !set)
                            retVal += that.eval(node.default)
                        break                    

                    case "actions":
                        retVal += that.evalActions(node.cmds) || ''
                        break

                    case "link":
                        var id = that.linkIndex++
                        var linkText = node.text
                        if(zelazny.specialLinks[linkText[0]])
                            linkText = linkText.substr(1)                           

                        that.state.setPCAttr("__action", node.code)
                        that.state.setPCAttr("__text", linkText)
                        that.state.setPCAttr("__id", id)

                        var linkText = node.text == linkText ? 
                            zelazny.internalParse(zelazny.linkFormat) :
                            zelazny.internalParse(zelazny.specialLinks[node.text[0]])
                        retVal += linkText

                        that.state.clearAttr("__action")
                        that.state.clearAttr("__text")
                        that.state.clearAttr("__id")
                        break

                    default:
                        throw "Unknown node command: " + node.cmd
                }
            }

            return retVal
        }
    }
    return that
}