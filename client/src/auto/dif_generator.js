
// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["dif_generator"] = {exports: {}};
(function(module){
var U = require('./utils');  

var DifGenerator = function() {

}; 

//@Override
DifGenerator.prototype._createBall = function(id, number, remaining) {
    var translations = {"ca-ES": "El "+number, "es-ES": "El "+number};
    return new U.Bolla(id+1, number, "<span>"+number+"</span>", translations, 20, remaining);
};

module.exports = DifGenerator;
}(window._modules["dif_generator"] ));