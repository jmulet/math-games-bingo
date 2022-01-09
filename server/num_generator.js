const U = require('./utils');  

const NumGenerator = function() {
    this.myTemplates = [];
    for(var i=0; i < 30; i++) {
        this.myTemplates.push(i % 2);
    }
    U.shuffle(this.myTemplates);
    this.cache = {};
}; 

//@Override
NumGenerator.prototype._createBall = function(id, number, remaining) {
    if(this.cache[id]) {
        return this.cache[id];
    }
    var translations = null;
    var theOperation = null;
    var ttl = 25;
    var tmpl = this.myTemplates[id];

    if(tmpl === 0) {
        if(number < 10) {
            // Resta
            var y = U.iran(2, 20);
            var x = number + y;
            theOperation = x + " - " + y;
            translations = {"ca-ES": x + " menys "+y, "es-ES": x + " menos "+ y};
        } else {
            // Suma
            var y = U.iran(1, number-1);
            var x = number - y;
            theOperation = x + " + " + y;
            translations = {"ca-ES": x + " més "+y, "es-ES": x + " más "+ y};
        }
    } else {
        if(number > 20) {
            // Suma
            var y = U.iran(0, 30-number);
            var x = number - y;
            theOperation = x + " + " + y;
            translations = {"ca-ES": x + " més "+y, "es-ES": x + " más "+ y};
        } else {
            // Resta
            var y = U.iran(1, number-1);
            var x = number + y;
            theOperation = x + " - " + y;
            translations = {"ca-ES": x + " menys " + y, "es-ES": x + " menos "+ y};
        }
    }
    


    var bolla = new U.Bolla(id+1, number, "<katex>"+theOperation+"</katex>", translations, ttl, remaining);
    this.cache[id] = bolla;
    return bolla;
};

module.exports = NumGenerator;