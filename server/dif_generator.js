const U = require('./utils');  

const DifGenerator = function() {

}; 

//@Override
DifGenerator.prototype._createBall = function(id, number, remaining) {
    var translations = {"ca-ES": "El "+number, "es-ES": "El "+number};
    return new U.Bolla(id+1, number, "<span>"+number+"</span>", translations, 20, remaining);
};

module.exports = DifGenerator;