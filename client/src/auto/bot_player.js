
// Automatically generated on Sat Mar 26 2022 15:07:45 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["bot_player"] = {exports: {}};
(function(module){
// The bingo_server communicates with the bot player
var Cartro = require("cartro");

var BotPlayer = function () {
    this.lineAllowed = true;
    this.bingoAllowed = true;
    this.cartro = new Cartro();
    this.cartro.generate();
};
BotPlayer.prototype.disableLine = function () {
    this.lineAllowed = false;
};
BotPlayer.prototype.disableBingo = function () {
    this.bingoAllowed = false;
};
BotPlayer.prototype.receiveBall = function (ball, nombresTrets, cbResponse) {
    // Notify with a promise to mimic delays
    // 0 --> I have nothing
    // 1 --> I have line
    // 2 --> I have bingo
    var self = this;
    this.cartro.mark(ball.number);
    var resCode = 0;
    var flatten = self.cartro.list();
    console.log("Flatten", flatten, " Nombres trets", nombresTrets);
    if (self.lineAllowed) {
        var teLinea = self.cartro.testLine(flatten, nombresTrets)[0];
        if(teLinea) {
            self.lineAllowed = false;
        }
        resCode = teLinea ? 1 : 0;
    } else if (self.bingoAllowed) {
        var teBingo = self.cartro.testBingo(flatten, nombresTrets)[0];
        if(teBingo) {
            self.lineAllowed = false;
            self.bingoAllowed = false;
        }
        resCode = teBingo ? 2 : 0;
    }
    setTimeout(function() {
        cbResponse(resCode);
    }, 700 * ball.ttl)

};


module.exports = BotPlayer;
}(window._modules["bot_player"] ));
