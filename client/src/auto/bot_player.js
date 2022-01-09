
// Automatically generated on Sun Jan 09 2022 19:24:40 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
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
    if (self.lineAllowed) {
        var teLinea = self.cartro.testLine(flatten, nombresTrets);
        if(teLinea) {
            self.lineAllowed = false;
        }
        resCode = teLinea ? 1 : 0;
    } else if (self.bingoAllowed) {
        var teBingo = self.cartro.tetBingo(flatten, nombresTrets);
        if(teBingo) {
            self.lineAllowed = false;
        }
        resCode = teBingo ? 2 : 0;
    }
    window.setTimeout(function() {
        cbResponse(resCode);
    }, 700 * ball.ttl)

};


module.exports = BotPlayer;
}(window._modules["bot_player"] ));
