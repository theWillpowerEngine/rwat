function createScanNode(cmd, text, data) {
    return {
        cmd,
        text,
        ...data
    }
}

const ScanNodeType = {
    Text: "text",
    Range: "range",
    First: "first",
    Actions: "actions",
    Link: "link",
    Value: "value",
    Node: "node",
    Area: "area"
}

var that = module.exports = {
    scanMerge(zelazny, tag, existsAtRoot) {
        var eles = []
        var cmd = tag[0], sub = ''
        var rest = tag.substr(1).trimLeft()
        var yes = '', no = ''

        switch(cmd) {
            //<cmd> <param>[|<param>]
            case '?':
            case '!':
                sub = rest.split(' ')[0]
                rest = rest.substr(sub.length).trimLeft()

                var pos = existsAtRoot(rest, '[', ']', '|')
                if(pos >= 0) {
                    yes = that.scan(zelazny, rest.substr(0, pos).trimLeft()).base[0]
                    no = that.scan(zelazny, rest.substr(pos+1).trimLeft()).base[0]
                } else{
                    yes = that.scan(zelazny, rest).base[0]
                    no = []
                }

                eles.push(createScanNode(cmd, sub, {
                    yes,
                    no
                }))
                break

            //<compound-op><cmd>,<cmd>... <text>
            case '&':
            case '|':
                sub = rest.split(' ')[0]   //sub is condition-block
                rest = rest.substr(sub.length).trimLeft()
                
                var condTexts = sub.split(',')
                var conds = []
                for(var ci in condTexts) {
                    var cond = condTexts[ci]
                    var toke = that.scanMerge(zelazny, cond + " 1", existsAtRoot)[0]
                    conds.push(toke)
                }
                
                var pos = existsAtRoot(rest, '[', ']', '|')
                if(pos >= 0) {
                    yes = that.scan(zelazny, rest.substr(0, pos).trimLeft()).base[0]
                    no = that.scan(zelazny, rest.substr(pos+1).trimLeft()).base[0]
                } else 
                    yes = that.scan(zelazny, rest).base[0]

                eles.push(createScanNode(cmd, null, {
                    conds: conds,
                    yes: yes,
                    no: no
                }))
                break

            //:<trait> <val>:<text>[|...][|<text>]
            case ':':
                sub = rest.split(' ')[0]   //sub is trait
                rest = rest.substr(sub.length).trimLeft()
                var rangeLines = rest.split('|')
                var range = []
                var defEle = null
                for(var ri in rangeLines) {
                    var rl = rangeLines[ri]
                    if(rl) {
                        var reles = rl.split(':')
                        if(reles.length > 2)
                            throw "Too many parts to range-element: " + rl
                        
                        if(reles.length == 1) {
                            if(defEle)
                                throw "Default result already set for range, cannot set again.  Second one was: " + rl
                            defEle = that.scan(zelazny, reles[0].trimLeft()).base[0]
                        } else {
                            for(var stinkfist in range)
                                if(range[stinkfist].value == reles[0])
                                    throw "Duplicate value in range: " + reles[0]
                            range.push({
                                check: reles[0],
                                value: that.scan(reles[1].trimLeft()).base[0]
                            })
                        }
                    }
                }
                range.sort(function(a, b){
                    if(!isNaN(a.check) && !isNaN(b.check))
                        return a.check-b.check
                    else
                        return (a.check>b.check) ? 1 : ((a.check==b.check) ? 0 : -1)
                })
                eles.push(createScanNode(ScanNodeType.Range, sub, {
                    range: range,
                    default: defEle
                }))
                break

            //<cmd>:arg <param>[|<param>]
            case '>':
            case '<':
            case '=':
                sub = rest.split(' ')[0]
                rest = rest.substr(sub.length).trimLeft()

                var pos = existsAtRoot(rest, '[', ']', '|')
                if(pos >= 0) {
                    yes = that.scan(zelazny, rest.substr(0, pos).trimLeft()).base[0]
                    no = that.scan(zelazny, rest.substr(pos+1).trimLeft()).base[0]
                } else {
                    yes = that.scan(zelazny, rest).base[0]
                    no = []
                }

                var split = sub.split(':')
                if(split.length != 2)
                    throw "Invalid value for GT/LT"

                eles.push(createScanNode(cmd, split[0], {
                    check: parseInt(split[1]),
                    yes: yes,
                    no: no
                }))
                break
        
            case '1':
                eles.push(createScanNode(ScanNodeType.First, "", {
                    cmd: 'first',
                    eles: that.scan(rest.trim()).base[0]
                }))
                break

            case "v":
                eles.push(createScanNode(ScanNodeType.Value, rest.trim()))
                break

            default:
                throw "Unknown merge command: " + cmd
        }

        return eles
    },

    /////////////////////////////////////////////////////////////////////////////
    scanCommand(cmd) {
        if(!cmd)
            return []
        var retVal = []
        var quoteStr = null
        var work = ''

        var addWork = () => {
            if(work) {
                retVal.push(work)
                work = ''
            }
        }

        for(var c of cmd.trim()) {
            switch(c) {
                case '"':
                case "'":
                    if(work && !quoteStr) {
                        work += c
                        break
                    }
                    if(quoteStr == c) {
                        quoteStr = null
                        addWork()
                    } else if (quoteStr) {
                        work += c
                    } else {
                        quoteStr = c
                        addWork()
                    }
                    break

                case ' ':
                case "\t":
                    if(quoteStr)
                        work += c
                    else 
                        addWork()
                    break

                case '\r':
                case "\n":
                    if(quoteStr)
                        throw "Newline in string: " + work

                    addWork()
                    break

                default:
                    work += c
                    break
            }
        }
        
        if(quoteStr) 
            throw "Unterminated string: " + work

        addWork()
        return retVal
    },
    
    /////////////////////////////////////////////////////////////////////////////
    scan(zelazny, code) {
        if(!code)
            return {}

        var eles = []
        var blocks = {
            base: {}
        }
        var i = 0
        var work = ''
        var layerState = {
            star: false,
            us: false,
            slash: false
        }

        var area = 'base'
        var node = 0

        var scanTo = (start, end) => {
            var skip = 1
            var ret = ''
            while(code[i] != end || skip > 0) {
                if(++i == code.length)
                    throw "Missing " + end + " before end of code"
                
                ret += code[i]

                if(code[i] == start)
                    skip += 1
                if(code[i] == end)
                    skip -= 1
            }

            return ret.substr(0,ret.length-1)
        }

        var existsAtRoot = (check, start, end, c) => {
            var skip = 0
            var ii = 0
            while(check[ii] != c || skip > 0) {
                if(check[ii] == start)
                    skip += 1
                if(check[ii] == end)
                    skip -= 1

                if(++ii == check.length)
                    return -1
            }

            return ii
        }
        var expected = (str, dec) => {
            idx = 0
            while(true) {
                if(++i == code.length)
                    throw "Expected " + str + " before end of code"
                
                var c = code[i]
                if(idx == 0) {
                    if(c == ' ' || c == '\t' || c == '\r' || c=='\n')
                        continue
                }
                if(c == str[idx++]) {
                    if(idx == str.length) {
                        if(dec) i -= 1
                        return true
                    } else 
                        continue
                }

                return false
            }
        }

        var addWork = () => {
            if(work) {
                eles.push(createScanNode(ScanNodeType.Text, work))
                work = ''
            }
        }

        for(i=0; i<code.length; i++) {
            var c = code[i]
            switch(c) {

            //Merge Tags
            case '[':
                addWork(true)
                var tag = scanTo('[', ']')
                eles = eles.concat(that.scanMerge(zelazny, tag, existsAtRoot))
                break

            case ']':
                throw "Too many ]'s, at '" + code.substr(0, i) + "'"

            //Command tags
            case '{':
                addWork(true)
                var tag = scanTo('{', '}')
                eles = eles.concat(createScanNode(ScanNodeType.Actions, "", {
                    cmds: that.scanCommand(tag) 
                }))
                break

            case '}':
                throw "Too many }'s, at '" + code.substr(0, i) + "'"

            //links
            case '`':
                addWork()
                var linkText = scanTo('\0', '`')
                if(!expected('=>'))
                    throw("Link must have destination: " + linkText)
                if(!expected('{'))
                    throw("Link must be followed by command tag: " + linkText)

                var ct = scanTo('{', '}')

                eles.push(createScanNode(ScanNodeType.Link, linkText, {
                    code: ct
                }))
                break

            //Formatting
            case '*':
                if(zelazny.htmlFormat)
                    work += (layerState.star ? "</b>" : "<b>")
                else
                    work += '*'
                layerState.star = !layerState.star
                break
            case '_':
                try {
                    if(code[i+1] == '\r' || code[i+1] == '\n')
                    {
                        i += 1
                        var whitespace = [' ', '\t', '\r', '\n']
                        while(whitespace.includes(code[i++])) {

                        }
                        i -= 2
                        break
                    }
                } catch(e) { }

                if(zelazny.htmlFormat)
                    work += (layerState.us ? "</u>" : "<u>")
                else
                    work += '_'
                layerState.us = !layerState.us
                break
            case '\\':
                if(zelazny.htmlFormat)
                    work += (layerState.slash ? "</i>" : "<i>")
                else
                    work += "\\"
                layerState.slash = !layerState.slash
                break
            
            case '@':
                var block = scanTo(null, '\n')
                if(block[block.length-1] == '\r')
                    block = block.substr(0, block.length - 1)
                block = block.trim()
                if(block[0] == '@') {
                    block = block.substr(1)
                    blocks[area][node] = eles
                    eles = []
                    area = block
                    if(!blocks[area])
                        blocks[area] = {}
                    node = 0
                } else {
                    blocks[area][node] = eles
                    eles = []
                    node = block
                }
                break

            case '%':
                var char = code[++i]
                work += char
                break

            case '\n':
                if(!zelazny.htmlFormat)
                    work += "\n"
                else {
                    work += "<br />"
                }
                break

            case '\r':
                break

            case ' ':
            case '\t':
                if(work.endsWith(' ') && zelazny.htmlFormat)
                    work = work.substr(0,work.length-1) + "&nbsp; "
                else if(work.endsWith('>') && !(work.endsWith("/b>") || work.endsWith("/i>") || work.endsWith("/u>") || work.endsWith("/div>"))) {}
                else
                    work += ' '
                break

            default:
                work += c
                break
            }

        }
        addWork()
        blocks[area][node] = eles
        return blocks
    }
}