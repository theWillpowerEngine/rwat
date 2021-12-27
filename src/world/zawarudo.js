const wm = require("./gens/worldmaker")

module.exports = (eng) => {
    let engine = eng

    //Time
    let dateMonth = 3
    let dateDay = 9
    let dateYear = 0    //Player relative 
    let dateHour = 9
    let dateMinutes = 30  

    const getDaySuffix = (d) => {
        switch(d+1) {
            case 1:
            case 21:
            case 31:
                return 'st'

            case 2:
            case 22:
            case 32:
                return "nd"

            case 3:
            case 23:
            case 33:
                return "rd"
            
            default:
                return 'th'
        }
    }

    var that = {
        terrainMap: [],
        generateNewWorld() {
            var newWorld = wm(engine)
            that.terrainMap = newWorld.map
        },

        addTime (m, h, d) {
            if(!m) m = 0
            if(!h) h = 0
            if(!d) d = 0
    
            h += d * 25
            m += (h * 60)
    
            dateMinutes += m
            while(dateMinutes >= 60) {
                dateMinutes -= 60
                dateHour += 1
            }
    
            while(dateHour >= 25) {
                dateHour -= 25
                dateDay += 1
            }
            
            while(dateDay >= 33) {
                dateDay -= 33
                dateMonth += 1
            }
    
            while(dateMonth >= 10) {
                dateMonth -= 10
                dateYear += 1
            }
        },

        getDateTime() {
            var ret = ''

            switch(dateMonth) {
                case 0:
                    ret += 'Vasiki'
                    break
                case 1:
                    ret += 'Malfeas'
                    break
                case 2:
                    ret += 'Fratri'
                    break
                case 3:
                    ret += 'Iskard'
                    break
                case 4:
                    ret += 'Mok'
                    break
                case 5:
                    ret += 'Sund'
                    break
                case 6:
                    ret += 'Ortear'
                    break
                case 7:
                    ret += 'Ovurse'
                    break
                case 8:
                    ret += 'Glitte'
                    break
                case 9:
                    ret += 'Tiligh'
                    break
            }

            ret += ` ${dateDay}${getDaySuffix(dateDay)} ${9363 + dateYear},`
            
            if(dateHour < 4)
                ret += " Early Morning"
            else if(dateHour < 12)
                ret += " Morning"
            else if(dateHour == 12)
                ret += " Burn"
            else if (dateHour < 16)
                ret += ` Afternoon`
            else if (dateHour < 20)
                ret += " Evening"
            else if (dateHour < 23)
                ret += " Night"
            else
                ret += " Late Night"

            return ret
        },

        getAmbientLight() {

        },

        tick() {
            that.addTime(1)
        }
    }

    return that
}