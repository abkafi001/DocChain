const hash = require('./hash');

var url = 'qwert';

(async function (){
    var x = await hash.hashPassword(url)
    console.log(x)
})()