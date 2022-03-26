
// Automatically generated on Sat Mar 26 2022 14:53:08 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["eqn_generator"] = {exports: {}};
(function(module){
var U = require('./utils');  

var PRIME_NUMBERS = [2, 3, 5, 7];

var EqnGenerator = function() {
    this.eqnTemplates = [];
    for(var i=0; i < 30; i++) {
        this.eqnTemplates.push(i % 8);
    }
    U.shuffle(this.eqnTemplates);
}; 
 
EqnGenerator.prototype._createBall = function(id, number, remaining) {
    
    var tmpl = this.eqnTemplates[id];
    var eqn = null;
    var translations = null;
    var ttl = 20;

    if(tmpl == 0 || tmpl==1) {
        var a = U.iran(2,10);
        var b = number + a;
        eqn = 'x + ' + a + ' = ' + b;
        translations = {
            "ca-ES": "x més " + a + " és igual a "+ b, 
            "es-ES": "x más " + a + " es igual a "+ b
        };
    } else if(tmpl == 2 || tmpl==3) {
        var rv = U.iran(-5,5);
        while(rv == 0) {
            rv = U.iran(-5,5);
        }
        var a = number + rv;
        var b = a - number;
        eqn = a + '- x = ' + b;
        translations = {
            "ca-ES": a + " menys x és igual a "+ b, 
            "es-ES": a + " menos x es igual a "+ b, 
        };
    } else if(tmpl == 4) {
        var a = U.iran(2,5);
        var b = a*number;
        eqn = a +' x  = ' + b;
        translations = {
            "ca-ES": a + " x és igual a "+ b, 
            "es-ES": a + " x es igual a "+ b
        };
    } else if(tmpl == 5) {
        var b = U.iran(2,4);
        var a = b*U.iran(2,5);
        var c = a*number/b;
        eqn = '\\frac{'+ a +' x}{'+b +'}  = ' + c;
        translations = {
            "ca-ES": a + " x dividit entre "+ b + " és igual a "+ c, 
            "es-ES": a + " x dividido entre  "+ b + " es igual a "+ c
        };
        ttl = 15;
    } else if(tmpl == 6) {
        if(number <= 10) {
            var b = (2*number);
            var c = (number*number) 
            ttl = 30;
            if(U.iran(0,1)) {
                eqn = 'x^2  - '+ b + 'x + ' + c + ' = 0';
                translations = {
                    "ca-ES": "x al quadrat menys " + b + " x més " + c + " igual a zero", 
                    "es-ES": "x al cuadrado menos " + b + " x más " + c + " igual a cero", 
                };
                ttl=60;
            } else {
                eqn = '(x-'+number+')^2 = 0';
                translations = {
                    "ca-ES": "x menys " + number + " al quadrat és igual a zero", 
                    "es-ES": "x menos " + number + " al cuadrado es igual a cero", 
                };
            }
        } else {
            var b = U.iran(2,10);
            var c = U.iran(2,4);
            var a = c*number + b;
            eqn = a + ' - ' + c + ' x = ' + b;
            translations = {
                "ca-ES": a + " menys " + c + " x és igual a "+ b, 
                "es-ES": a + " menos " + c + " x es igual a "+ b
            };
            ttl = 35;
        }
    } else if(tmpl == 7) {
        var l = U.iran(4, 10);
        var s = U.iran(1, 3);
        var b = U.pick(PRIME_NUMBERS);
        while(b == l) {
            b = U.pick(PRIME_NUMBERS);
        }
        var q = U.iran(1, 2);
        var r = U.iran(2, 4);

        if (U.iran(0,9)==0) {
            // El cas més complicat que sigui el menys probable
            var fln = (l+s)*q;
            var fld = b*q;
            var frn = (number+l)*r;
            var frd = b*r;

            eqn =  '\\frac{x - ' + s  + '}{' + b + '} + \\frac{' + fln + '}{' + fld + '} = \\frac{' + frn + '}{' + frd + '}';
            translations = {
                "ca-ES": "x menys " + s + " dividit entre " + b + " més " + fln + " sobre " + fld + " igual a "+ frn + " sobre " + frd, 
                "es-ES": "x menos " + s + " dividido entre " + b + " más " + fln + " sobre " + fld + " igual a "+ frn + " sobre " + frd
            };
            ttl = 60;
        } else { 
            // El cas menys complicat que sigui més probable
            var rr = r;
            if(r==1) {
                rr = "";
            }
            var lr = l*r;
            var br = b*r;
            var frn = number+l;
            var frd = b;
            eqn =  '\\frac{' + rr + 'x + ' + lr + '}{' + br + '}  = \\frac{' + frn + '}{' + frd + '}';
            translations = {
                "ca-ES": rr + " x més " + lr + " dividit entre " + br + " igual a "+ frn + " sobre " + frd, 
                "es-ES": rr + " x más " + lr + " dividido entre " + br + " igual a "+ frn + " sobre " + frd
            };
            ttl = 40;
        }
    } else { 
            var a = U.iran(2,10);
            var b = number + a;
            eqn = 'x + ' + a + ' = ' + b;
            translations = {
                "ca-ES": "x més " + a + " és igual a "+ b, 
                "es-ES": "x más " + a + " es igual a "+ b
            };   
    }
    
    eqn = '<katex>\\displaystyle {' + eqn + '}</katex>';
    return new U.Bolla(id+1, number, eqn, translations, ttl, remaining);
};

module.exports = EqnGenerator;
}(window._modules["eqn_generator"] ));
