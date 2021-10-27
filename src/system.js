var random = require( 'rng' )
var R = new random.MT()     //note:  can pass seed here

var that = module.exports = {
    roll(max) {
        return R.range(1, max+1)
    }
}