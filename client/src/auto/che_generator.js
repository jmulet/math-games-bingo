
// Automatically generated on Sat Mar 26 2022 15:07:45 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["che_generator"] = {exports: {}};
(function(module){
var U = require('./utils');  

var CheGenerator = function() {

}; 

//@Override
CheGenerator.prototype._createBall = function(id, number, remaining) {
    var translations = {"ca-ES": "El "+number, "es-ES": "El "+number};
    return new U.Bolla(id+1, number, "<span>"+number+"</span>", translations, 20, remaining);
};

module.exports = CheGenerator;
}(window._modules["che_generator"] ));
