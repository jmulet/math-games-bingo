
// Automatically generated on Sun Jan 09 2022 19:24:40 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["bingo_classic"] = {exports: {}};
(function(module){
var NUM_BOLLES = 30;
var NUM_ROWS = 3;
var NUM_COLS = 6;
var NUM_COLS_NB = 3;
var BALL_INTERVAL = 5;
var U = require('./utils');
var Timer = require('./timer');
var BotPlayer = require('./bot_player');


var BasicGenerator = function() {
}; 
BasicGenerator.prototype._createBall = function(id, number, remaining) {
    var translations = {"ca-ES": "El "+number, "es-ES": "El "+number};
    return new U.Bolla(id+1, number, "<span>"+number+"</span>", translations, 10, remaining);
};


function BingoClassic() {
    // All bingos have a bot player
    this.bot = new BotPlayer();
    this.generator = new BasicGenerator();
    this.isPlaying = false;
    this.askedParticipants = [];
    this.gameoverNotifiers = [];
    this.nextballNotifiers = [];
    this.botNotifiers = [];
    this.timer = null;
    this.lineaOwner = null;
    this.winner = null;
    this.itera = 0;

    //Define the timer
    var self = this;
    this.timer = new Timer(function() {
        var nextBall = self.next();
        if(nextBall) {
            for (var i = 0, ln=self.nextballNotifiers.length; i < ln; i++) { 
                self.nextballNotifiers[i](nextBall);
            }
            // launch next interval
            self.timer.play(nextBall.ttl || BALL_INTERVAL);
            // notify the bot 
            self.bot.receiveBall(nextBall, self.nombres_trets, function(resCode){
                // receive news from bot and notify to the bingo_server
                for (var i = 0, ln=self.botNotifiers.length; i < ln; i++) { 
                    self.botNotifiers[i](resCode);
                }
            });
        } else {
            for (var i = 0, ln=self.gameoverNotifiers.length; i < ln; i++) { 
                self.gameoverNotifiers[i](null);
            } 
            self.bot.disableBingo();
            self.bot.disableLine();
        }
    }, BALL_INTERVAL);
};
BingoClassic.prototype.init = function() {
    var self = this;
    this.itera = 0;
    this.askedParticipants = [];
    this.nombres = U.shuffle(U.range(1, NUM_BOLLES));
    this.nombres_trets = [];
    // Prepara objectes per a cada bolla
    this.bolles = [];
    for (var i = 0; i < NUM_BOLLES; i++) { 
        // Bingo classic, únicament la bolla
        this.bolles.push(this.generator._createBall(i, this.nombres[i], NUM_BOLLES-i-1));
    }
    // start the timer
    this.isPlaying = true;
    this.timer && this.timer.play();
};
BingoClassic.prototype.next = function() {
    this.askedParticipants = [];
    if(this.itera >= NUM_BOLLES || this.winner != null) {
        for (var i = 0, ln=this.gameoverNotifiers.length; i < ln; i++) { 
            this.gameoverNotifiers[i](this.winner);
        } 
        this.isPlaying = false;
        return null;
    }
    var bolla = this.bolles[this.itera];
    this.nombres_trets.push(this.nombres[this.itera]);
    this.itera++;
    return bolla;
};
BingoClassic.prototype.testLine = function(userNumbers, user) {
    // User numbers is a list 3x3, null indicate that is not selected
    var firstWrong = -1;
    for (var i = 0; i < NUM_ROWS; i++) {
        var teLinia = true;
        for (var j = 0; j < NUM_COLS_NB; j++) {
            var indx = i*NUM_COLS_NB+j;
            var valor = userNumbers[indx];
            if (valor == null) {
                // Not set --> this is not a line 
                teLinia = false;
                break;
            }
            teLinia = this.nombres_trets.indexOf(valor)>=0;
            if (!teLinia) {
                firstWrong = indx;
                break;
            }
        }
        if (teLinia) {
            if(this.lineaOwner!=null) {
                //No more than one linea is allowed
                return [];
            }
            this.lineaOwner = user;
            return [true];
        }
    }
    return [false, firstWrong];
};
BingoClassic.prototype.testBingo = function(userNumbers, user) {
    var self = this;
    // User numbers is a list 3x3, null indicate that is not selected
    // if a null is found, must return false
    for (var i = 0; i < NUM_ROWS; i++) {
        for (var j = 0; j < NUM_COLS_NB; j++) {
            var indx = i*NUM_COLS_NB+j;
            var valor = userNumbers[indx];
            if (valor == null || this.nombres_trets.indexOf(valor)<0) {
               return [false, indx];
            } 
        }
    }
    //somebody call for bingo before me! We cannot assign more than one bingo
    if(this.winner != null) {
        return [];
    }
    this.winner = user;
    // We can stop the timer since no more balls are required
    this.timer && this.timer.pause();
    this.timer = null;
    for (var i = 0, ln=self.gameoverNotifiers.length; i < ln; i++) { 
        self.gameoverNotifiers[i](this.winner);
    } 
    this.isPlaying = false;
    return [true];
};

BingoClassic.prototype.on = function(evtname, cb) {
    if(evtname === "nextball") {
        this.nextballNotifiers.push(cb);
    } else if(evtname === "gameover") {
        this.gameoverNotifiers.push(cb);
    } else if(evtname === "bot") {
        this.botNotifiers.push(cb);
    }
};
BingoClassic.prototype.off = function() {
    this.isPlaying = false;
    this.nextballNotifiers = [];
    this.gameoverNotifiers = [];
    this.botNotifiers = [];
    this.timer && this.timer.pause();
    this.timer = null;
};
BingoClassic.prototype.trigger = function(delay) {
    var self = this;
    setTimeout(function(){
        self.init();
    }, delay*1000);
};
BingoClassic.prototype.pause = function() {
    this.timer && this.timer.pause();
};
BingoClassic.prototype.play = function() {
    this.timer && this.timer.play();
};
BingoClassic.prototype.canSendNext = function(idUser, currentParticipants) {
    if(this.askedParticipants.indexOf(idUser) < 0) {
        this.askedParticipants.push(idUser);
    }
    if(currentParticipants == null || U.equalSets(this.askedParticipants, currentParticipants)) {
        this.timer && this.timer.pause();
        this.timer && this.timer.play(1);
        this.askedParticipants = []; 
        return true;
    }
    return false;
};

BingoClassic.prototype.setGenerator = function(generator) {
    if(generator) {
        this.generator = generator;
    } else {
        this.generator = new BasicGenerator();
    }
}
 


// Expose class
module.exports = BingoClassic;
}(window._modules["bingo_classic"] ));
