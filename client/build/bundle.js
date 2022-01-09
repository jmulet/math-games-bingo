
window._modules = {};
window.require = function(modname) {
    modname = modname.replace("./", "");
    return (window._modules[modname] || {}).exports || {};
};


// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["utils"] = {exports: {}};
(function(module){
var extend = function (child, parent) {
    var f = function () {};
    f.prototype = parent.prototype;
    child.prototype = new f();
    child.prototype.constructor = parent;
};

var iran = function (a, b) {
    return Math.round(Math.random() * (b - a)) + a
};

var range = function (a, b) {
    var aList = [];
    for (var i = a; i <= b; i++) {
        aList.push(i);
    }
    return aList;
};

var listClone = function (aList) {
    var clonedList = [];
    for (var i = 0, len = aList.length; i < len; i++) {
        clonedList[i] = aList[i];
    }
    return clonedList;
};

var sort = function (aList, subListLen) {
    var firstElems = aList.splice(0, subListLen);
    firstElems.sort(function (a, b) { return a - b; });
    return firstElems;
};

var shuffle = function (aList) {
    //The Fisher-Yates algorithm
    var cloned = listClone(aList);
    for (var i = cloned.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cloned[i];
        cloned[i] = cloned[j];
        cloned[j] = temp;
    }
    return cloned;
};

var pick = function(lst) {
    var j = Math.floor(Math.random()*lst.length);
    return lst[j];
};

var equalSets = function(l1, l2) {
    if(l1.length != l2.length) {
        return false;
    }
    for(var i=0; i<l1.length; i++) {
        if(l2.indexOf(l1[i])<0) {
            return false;
        }
    }
    for(var i=0; i<l2.length; i++) {
        if(l1.indexOf(l2[i])<0) {
            return false;
        }
    }
    return true;
};

function Bolla(id, number, latex, translations, ttl, remaining) {
    this.id = id;
    this.number = number;
    this.latex = latex;
    this.speech = translations;
    this.ttl = ttl || 15;
    this.remaining = remaining;
}

module.exports = {
    iran: iran,
    pick: pick,
    range: range,
    shuffle: shuffle,
    sort: sort,
    listClone: listClone,
    Bolla: Bolla,
    extend: extend,
    equalSets: equalSets
};
}(window._modules["utils"] ));


// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["timer"] = {exports: {}};
(function(module){
var Timer = function (cb, delay) {
    this.cb = cb;
    this._start = null;
    this.remaining = 1000 * delay;
}
Timer.prototype = {
    play: function (delay2) {
        if (this.id) {
            clearTimeout(this.id);
        }
        if (this._start) {
            this.remaining -= new Date().getTime() - this._start;
        }
        if (delay2) {
            // Redefine the delay
            this.remaining = 1000 * delay2;
        }
        this._start = new Date().getTime();
        this.id = setTimeout(this.cb, this.remaining);
    },
    stop: function () {
        if (this.id) {
            clearTimeout(this.id);
            this.id = null;
        }
        this._start = null;
        this.remaining = 0;
    },
    pause: function () {
        if (this.id) {
            clearTimeout(this.id);
            this.id = null;
        }
        if (this._start) {
            this.remaining -= new Date().getTime() - this._start;
        }
    }
};
module.exports = Timer;
}(window._modules["timer"] ));


// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["bingo_classic"] = {exports: {}};
(function(module){
var NUM_BOLLES = 30;
var NUM_ROWS = 3;
var NUM_COLS = 6;
var NUM_COLS_NB = 3;
var BALL_INTERVAL = 5;
var U = require('./utils');
var Timer = require('./timer');



var BasicGenerator = function() {
}; 
BasicGenerator.prototype._createBall = function(id, number, remaining) {
    var translations = {"ca-ES": "El "+number, "es-ES": "El "+number};
    return new U.Bolla(id+1, number, "<span>"+number+"</span>", translations, 10, remaining);
};


function BingoClassic() {
    this.generator = new BasicGenerator();
    this.isPlaying = false;
    this.askedParticipants = [];
    this.gameoverNotifiers = [];
    this.nextballNotifiers = [];
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
        } else {
            for (var i = 0, ln=self.gameoverNotifiers.length; i < ln; i++) { 
                self.gameoverNotifiers[i](null);
            } 
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
    }
};
BingoClassic.prototype.off = function() {
    this.isPlaying = false;
    this.nextballNotifiers = [];
    this.gameoverNotifiers = [];
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
    if(U.equalSets(this.askedParticipants, currentParticipants)) {
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


// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["eqn_generator"] = {exports: {}};
(function(module){
var U = require('./utils');  

var PRIME_NUMBERS = [2, 3, 5, 7];

var EqnGenerator = function() {
    this.eqnTemplates = [];
    for(var i=0; i < 30; i++) {
        this.eqnTemplates.push(i % 5);
    }
    U.shuffle(this.eqnTemplates);
}; 
 
EqnGenerator.prototype._createBall = function(id, number, remaining) {
    
    var tmpl = this.eqnTemplates[id];
    var eqn = null;
    var translations = null;
    var ttl = 20;

    if(tmpl == 0) {
        var a = U.iran(2,10);
        var b = number + a;
        eqn = 'x + ' + a + ' = ' + b;
        translations = {
            "ca-ES": "x més " + a + " és igual a "+ b, 
            "es-ES": "x más " + a + " es igual a "+ b
        };
    } else if(tmpl == 1) {
        var a = U.iran(2,5);
        var b = a*number;
        eqn = a +' x  = ' + b;
        translations = {
            "ca-ES": a + " x és igual a "+ b, 
            "es-ES": a + " x es igual a "+ b
        };
    } else if(tmpl == 2) {
        var b = U.iran(2,4);
        var a = b*U.iran(2,5);
        var c = a*number/b;
        eqn = '\\frac{'+ a +' x}{'+b +'}  = ' + c;
        translations = {
            "ca-ES": a + " x dividit entre "+ b + " és igual a "+ c, 
            "es-ES": a + " x dividido entre  "+ b + " es igual a "+ c
        };
        ttl = 15;
    } else if(tmpl == 3) {
        if(number <= 10) {
            var b = (2*number);
            var c = (number*number) 
            eqn = 'x^2  - '+ b + 'x + ' + c + ' = 0';
            translations = {
                "ca-ES": "x al quadrat menys " + b + " x més " + c + " igual a zero", 
                "es-ES": "x al cuadrado menos " + b + " x más " + c + " igual a cero", 
            };
            ttl = 30;
        } else {
            var b = U.iran(2,10);
            var c = U.iran(2,4);
            var a = c*number + b;
            eqn = a + ' - ' + c + ' x = ' + b;
            translations = {
                "ca-ES": a + " menys " + c + " x és igual a "+ b, 
                "es-ES": a+ " menos " + c + " x es igual a "+ b
            };
            ttl = 35;
        }
    } else {
        var l = U.iran(4, 10);
        var s = U.iran(1, 3);
        var b = U.pick(PRIME_NUMBERS);
        while(b == l) {
            b = U.pick(PRIME_NUMBERS);
        }
        var q = U.iran(1, 2);
        var r = U.iran(1, 3);

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
    }
    
    eqn = '<katex>\\displaystyle {' + eqn + '}</katex>';
    return new U.Bolla(id+1, number, eqn, translations, ttl, remaining);
};

module.exports = EqnGenerator;
}(window._modules["eqn_generator"] ));


// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["num_generator"] = {exports: {}};
(function(module){
var U = require('./utils');  

var NumGenerator = function() {
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
}(window._modules["num_generator"] ));


// Automatically generated on Wed Jan 05 2022 17:51:25 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
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

/**
 * Utilitats per al joc de Bingo 
 * @author Josep Mulet Pol
 * @date 2021-2022
 */
window._modules["BingoUtils"] = {exports: {}};

(function (module) { 

    var U = require("utils");

    var findVoice = function (lang, voices) {
        lang = (lang || "").toLowerCase();
        var k = 0;
        var voice = null;
        var len = (voices || []).length;
        while (k < len && voice == null) {
            if (voices[k].lang.toLowerCase() == lang) {
                voice = voices[k];
            }
            k++;
        }
        return voice;
    };

    var speak = function(textmap) {
        if(!supported) {
            return;
        }
        var voices = speechSynthesis.getVoices();
        var lang = "ca-ES";
        var voice = findVoice(lang, voices);
        if(!voice) {
            lang = "es-ES";
            voice = findVoice(lang, voices); 
        }
        if(voice) {
            var utterance = new SpeechSynthesisUtterance(textmap[lang]);
            utterance.voice = voice;
            synth.speak(utterance);
        } 
    };

    var synth = window.speechSynthesis;
    var supported = synth != null && window.SpeechSynthesisUtterance != null;
    if (!supported) {
        console.error("Voices not supported");    
    }

    var Cell = function(value, selected) {
        this.value = value;
        this.selected = selected;
    };
    Cell.prototype.clear = function() {
        this.value = null;
        this.selected = false;
    }; 
    Cell.prototype.toggle = function(enabled) {
        console.log("Cell toogle ", enabled);
        if(!enabled) {
            return;
        }
        this.selected = !this.selected;
    }; 

    var Cartro = function () { 
        this.nrows = 3;
        this.ncols = 6;
        this.rows = [];
        for (var i = 0; i < this.nrows; i++) {
            var aRow = [];
            for (var j = 0; j < this.ncols; j++) {
                aRow.push(new Cell(null, false));
            }
            this.rows.push(aRow);     
        }
        this.generate();
    };
    Cartro.prototype = {
        generate: function () { 
            // For every row, must set 3 cells as void
            var void_candidates = [];
            for (var i = 0; i < this.nrows; i++) {
                void_candidates.push(U.sort(U.shuffle(U.range(0, this.ncols - 1)), 3));
            }
            // For every col, up to 3 values in a given range 
            var a = 1;
            for (var j = 0; j < this.ncols; j++) {
                var cols_candidates = U.sort(U.shuffle(U.range(a, a + 4)), this.nrows);
                var posIndx = 0;
                for (var i = 0; i < this.nrows; i++) {
                    var val = null;
                    if (void_candidates[i].indexOf(j) < 0) {
                        val = cols_candidates[posIndx];
                        posIndx++;
                    }
                    this.getCellAt(i, j).value = val;
                }
                a += 5;
            }
        },
        clear: function () {
            for (var i = 0; i < this.nrows; i++) {
                for (var j = 0; j < this.ncols; j++) {
                    this.getCellAt(i, j).clear();
                }
            }
        },
        getRows: function () {
            return this.rows;
        }, 
        getCellAt: function (i, j) {
            return this.rows[i][j];
        },
        list: function() {
            var flatList = [];
            for (var i = 0; i < this.nrows; i++) {
                var aRow = this.rows[i];
                for (var j = 0; j < this.ncols; j++) {
                    var cell = aRow[j];
                    if(cell.value != null) {
                        //non-void cell
                        flatList.push(cell.selected? cell.value: null);
                    }
                }    
            }
            return flatList;
        }
    };

    module.exports = {
        Cartro: Cartro,
        speak: speak
    } 

})(window._modules["BingoUtils"]);

(function(){
(function () {
    var TRANSPORT_DELAY = 100;
    /* FAKE PACKET */
    var PacketLocal = function (fromId, toId, payload) {
        this.fromId = fromId;
        this.toId = toId;
        this.payload = payload;
    };

    var rndId = function () {
        return Math.random().toString(32).substring(2);
    };

    /* FAKE CLIENT */
    var SocketClientLocal = function (socketId) {
        this.id = socketId;
        this._handlers = {};
    };
    SocketClientLocal.prototype = {
        removeAllListeners: function () {
            // Unregister all events
            this._handlers = {};
        },
        on: function (evtname, cb) {
            var lhandlers = this._handlers[evtname];
            if (!lhandlers) {
                lhandlers = [];
                this._handlers[evtname] = lhandlers;
            }
            lhandlers.push(cb);
        },
        emit: function (evtname, data, ack) {
            window.ioServerLocal._deliver(new PacketLocal(this.id, this.id, { evtname: evtname, data: data, ack: ack }));
        },
    };

    window.ioClientLocal = {
        _sockets: {},
        connect: function () {
            var socketId = "s" + rndId() + "-" + rndId();
            var socket = new SocketClientLocal(socketId);
            ioClientLocal._sockets[socketId] = socket;
            window.ioServerLocal._deliver(new PacketLocal(socketId, socketId, { evtname: 'connection', data: socketId }));
            return socket;
        },
        disconnect: function () {
            var lSockets = Object.values(window.ioClientLocal._sockets);
            for (var i = 0, len = lSockets.length; i < len; i++) {
                lSockets[i].off();
            }
        },
        _deliver: function (packet) {
            //invoke all registered handlers in socket toId
            var socket = window.ioClientLocal._sockets[packet.toId];
            console.log("Client want's to deliver ", packet, " to ", socket);
            if (socket) {
                var lhandlers = socket._handlers[packet.payload.evtname];
                if (lhandlers) {
                    setTimeout(function () {
                        for (var i = 0, len = lhandlers.length; i < len; i++) {
                            lhandlers[i](packet.payload.data, packet.payload.cb);
                        }
                    }, TRANSPORT_DELAY);
                }
            }
        }
    };

    var SocketServerLocal = function (socketId) {
        this.id = socketId;
        this._handlers = {};
        this._hasJoined = [];
    }
    SocketServerLocal.prototype = {
        off: function () {
            // Unregister all events
            this._handlers = {};
            this._hasJoined = [];
        },
        emit: function (evtname, data, ack, fromId) {
            // Deliver only to myself
            console.log("Server emitting " + evtname + " to " + this.id);
            window.ioClientLocal._deliver(new PacketLocal(fromId || this.id, this.id, { evtname: evtname, data: data, ack: ack }));
        },
        on: function (evtname, cb) {
            console.log("Client recieve ", evtname);
            var lhandlers = this._handlers[evtname];
            if (!lhandlers) {
                lhandlers = [];
                this._handlers[evtname] = lhandlers;
            }
            lhandlers.push(cb);
        },
        join: function (roomId) {
            if (this._hasJoined.indexOf(roomId) < 0) {
                this._hasJoined.push(roomId);
            }
        },
        leave: function (roomId) {
            var indx = this._hasJoined.indexOf(roomId);
            if (indx >= 0) {
                this._hasJoined.splice(indx, 1);
            }
        }
    };


    window.ioServerLocal = {
        _clients: {},
        _handlers: {},
        _rooms: {},
        _deliver: function (packet) {
            setTimeout(function () {
                console.log("ioServerLocal: _deliver : ", packet);
                var payload = packet.payload;
                // process connection message
                if (payload.evtname === 'connection') {
                    var socketId = payload.data;
                    var socket = window.ioServerLocal._clients[socketId];
                    if (!socket) {
                        socket = new SocketServerLocal(socketId);
                        window.ioServerLocal._clients[socketId] = socket;
                    }
                    console.log("Deliver connection ", socket);
                    var lhandlers = window.ioServerLocal._handlers["connection"];
                    console.log("handlers ", window.ioServerLocal._handlers);
                    if (lhandlers) {
                        for (var i = 0, len = lhandlers.length; i < len; i++) {
                            lhandlers[i](socket);
                        }
                    }
                    return;
                }

                // Deliver other types of messages
                var socket = window.ioServerLocal._clients[packet.toId];
                if (socket) {
                    var lhandlers = socket._handlers[payload.evtname];
                    console.log(payload.evtname, "handlers ", lhandlers);
                    if (lhandlers) {
                        for (var i = 0, len = lhandlers.length; i < len; i++) {
                            lhandlers[i](payload.data, payload.ack);
                        }
                    }
                } else {
                    console.error("cannot deliver to ", packet.toId);
                }
            }, TRANSPORT_DELAY);
        },
        on: function (evtname, cb) {
            var lhandlers = window.ioServerLocal._handlers[evtname];
            if (!lhandlers) {
                lhandlers = [];
                window.ioServerLocal._handlers[evtname] = lhandlers;
            }
            lhandlers.push(cb);
        },
        emit: function (evtname, data, ack) {
            // Emit to all connected clients
            var lClients = Object.values(window.ioServerLocal._clients);
            for (var i = 0; i < lClients.length; i++) {
                lClients[i].emit(evtname, data, ack);
            }
        },
        to: function (roomId) {
            // Emit to all connected clients that belongs to this room
            return {
                emit: function (evtname, data, ack) {
                    // Emit to all connected clients
                    var lClients = Object.values(window.ioServerLocal._clients);
                    for (var i = 0; i < lClients.length; i++) {
                        if (lClients[i]._hasJoined.indexOf(roomId) >= 0) {
                            lClients[i].emit(evtname, data, ack, "global");
                        }
                    }
                }
            };
        },
        in: function (roomId) {
            return this.to(roomId);
        },
        shutdown: function () {
            var lClients = Object.values(ioServerLocal._clients);
            for (var i = 0, len = lClients.length; i < len; i++) {
                lClients[i].off();
            }
            ioServerLocal._clients = {};
            ioServerLocal._handlers = {};
            ioServerLocal._rooms = {};
        }
    };

})();


var BingoClassic = require("bingo_classic");
var DifGenerator = require("dif_generator");
var NumGenerator = require("num_generator");
var EqnGenerator = require("eqn_generator");
var CheGenerator = require("che_generator");


 

var MAX_USER_PER_ROOM = 30;
var MAX_ROOMS_ACTIVE = 10;
var LINEA_CHECK_TIME = 5;
var BINGO_CHECK_TIME = 5;
 
var rooms = {};
var joined = {};
var bingos = {};


var rooms = {
    "Equacions Local": {id:"Equacions Local", idUser:"Admin-local", nick:"Admin-local", type: "eqn", created: new Date()},
    "Clàssic Local": {id:"Clàssic Local", idUser:"Admin-local", nick:"Admin-local", type: "cla", created: new Date()},
    "Numeric Local": {id:"Numeric Local", idUser:"Admin-local", nick:"Admin-local", type: "num", created: new Date()},
    "Derivades Local": {id:"Derivades Local", idUser:"Admin-local", nick:"Admin-local", type: "dif", created: new Date()},
    "Química Local": {id:"Química Local", idUser:"Admin-local", nick:"Admin-local", type: "che", created: new Date()}
};
var joined = {
    "Equacions Local": [{ idUser: "localBot", nick: "Bot local"}],
    "Clàssic Local": [{ idUser: "localBot", nick: "Bot local"}],
    "Numeric Local": [{ idUser: "localBot", nick: "Bot local"}],
    "Derivades Local": [{ idUser: "localBot", nick: "Bot local"}],
    "Química Local": [{ idUser: "localBot", nick: "Bot local"}]
};


ioServerLocal.on("connection", function(socket) {
    console.log("Client connected ");
    
    socket.on("rooms:create", function(k, cb) {
        console.log(k);
        if(Object.keys(rooms).length > MAX_ROOMS_ACTIVE) {
            cb && cb(false, "No hi pot haver més de "+ MAX_ROOMS_ACTIVE + " actives.");
            return;
        }
        // Every user can only create up to 1 room
        var userHasRoom = false;
        var lRooms = Object.values(rooms);
        for(var i=0, len=lRooms.length; i<len; i++) {
            if(lRooms[i].idUser == k.idUser) {
                userHasRoom = true;
                break;
            }
        }
        if(userHasRoom) { 
            cb && cb(false, "Cada usuari pot crear com a molt una sala.");
            return;
        }
        var roomId = "r" + Math.random().toString(32).substring(2);
        joined[roomId] = [];
        // Added type of room (the application decides which type of Bingo wants)
        rooms[roomId] = {id: roomId, idUser: k.idUser, nick: k.nick, type: k.type || 'eqn', created: new Date()};
        ioServerLocal.emit("rooms:available", Object.values(rooms)); 
        cb && cb(true, "S'ha creat la sala amb id "+roomId);
    });

    socket.on("rooms:info", function(k) { 
       socket.emit("rooms:info", rooms[k.id]);
    });

    socket.on("rooms:available", function() {
        console.log("ASKING rooms ", rooms);
        socket.emit("rooms:available", Object.values(rooms));
    });

    socket.on("rooms:participants", function(k) {
        if(!rooms[k.id]) {
            console.log("Asking participants of invalid room"); 
            socket.emit("rooms:participants", "invalid_room");
            return;
        }
        //only to the joined sockets
        ioServerLocal.to(k.id).emit("rooms:participants", joined[k.id]);
    });

    socket.on("rooms:leave", function(k) {
        console.log("rooms:leave", k);
        if(k.id=="*" && k.idUser) {
            //Asked to leave the user from all rooms and keep the rooms intact

            var keys = Object.keys(joined); //all rooms with somebody joined
            var lenk = keys.length;
            for (var j = 0; j < lenk; j++) {
                var roomId = keys[j];
                var croom = joined[roomId];
                var len = croom.length;
                console.log("croom", croom);
                for (var i = len - 1; i >= 0; i--) {
                    console.log("Comparant ", croom[i].idUser , k.idUser)
                    if (croom[i].idUser == k.idUser) {
                        console.log("Removing user ", k.idUser, " from ", roomId);
                        croom.splice(i, 1);
                    }
                }  
                console.log("Check purges in ", roomId);
                // Purge empty rooms (everybody left)
                if(croom.length == 0) {
                        console.log("Purging");
                        console.log("The room croom is empty ")
                        croom = null;
                        delete rooms[roomId];
                        delete joined[roomId];
                        // Must stop any running bingo
                        if(bingos[roomId]) {
                            bingos[roomId].off();
                        }
                        delete bingos[roomId];
                        
                }
            }


            return;
        }  

        if(!rooms[k.id]) {
            console.log("Asking leave of invalid room ", k.id); 
            socket.emit("rooms:leave", "invalid_room");
            return;
        }
        //Remove k.idUser from joined[k.id]
        var croom = joined[k.id];
        var len = croom.length;
        for (var i = len - 1; i >= 0; i--) {
            if (croom[i].idUser === k.idUser) {
                croom.splice(i, 1);
            }
        } 

        console.log("joined now is ", joined[k.id]);
        var hasBot = false;
        // Purge empty rooms (everybody left)
        if(croom.length == 0) {
            console.log("Purging");
            console.log("The room croom is empty ")
            croom = null;
            delete rooms[k.id];
            delete joined[k.id];
            // Must stop any running bingo
            if(bingos[k.id]) {
                bingos[k.id].off();
            }
            delete bingos[k.id];
            //Notify again
            ioServerLocal.emit("rooms:available", Object.values(rooms));
        }
        
        //tell socket not longer in room
        socket.leave(k.id); //it no longer receive messages from this room
        //tell other sockets that list have changed, only to the joined sockets
        ioServerLocal.to(k.id).emit("rooms:participants", joined[k.id]);
    });

    socket.on("rooms:join", function(k, cb) {
        console.log("Passed", k)
        console.log("Current joined ", joined, joined[k.id])
        if(joined[k.id]) { 

            if(bingos[k.id]) {
                cb && cb(false, "La sala està jugant en aquests moments. Esperau que acabi.");
                return;
            }

            if(joined[k.id].length > MAX_USER_PER_ROOM) {
                //users limit per room
                ioServerLocal.to(k.id).emit("rooms:participants", joined[k.id])
                cb && cb(false, "La sala "+k.id+" està plena. Ja conté "+ MAX_USER_PER_ROOM + " jugadors. Creau o entrau a una altra sala.");
                return;
            }
            var found = false;
            var i = 0;
            var len = joined[k.id].length;
            while(i < len && !found) {
                found = joined[k.id][i].idUser == k.idUser;
                i++;
            }
            if(socket.lastRoom) {
                socket.leave(socket.lastRoom);
            }
            socket.lastRoom = k.id; 
            if(!found) { 
                joined[k.id].push({idUser: k.idUser, nick: k.nick});
            } 
            // Join room and send only to the room
            socket.join(k.id);
           
            console.log("Emetent participants ", joined[k.id])
            ioServerLocal.to(k.id).emit("rooms:participants", joined[k.id]);
            cb && cb(true, "T'has unit a la sala " + k.id);
        } else {
            cb && cb(false, "La sala " + k.id + " ja no existeix.");
        }
    });

    socket.on("bingo:start", function(k, cb){
       
        console.log("Bingo start ", k)
        // Some participant of the room id has informed that the game is about to start
        // Create the bingo instance
        var room = rooms[k.id];
        if(!room) {
            cb && cb(false, 'La sala '+ k.id + ' no existeix.' );
            return;
        }

        // Prevent starting a room twice!!!!!
        if(bingos[k.id] && bingos[k.id].isPlaying) {
            cb && cb(false, 'La sala ja està jugant.' );
            return; 
        } 


        var bingo = new BingoClassic();
        var generator = null;
        console.log("ABOUT TO SET THE FLAVOR TO ", room.type);
        if(room.type === 'eqn') {
            generator = new EqnGenerator();
        } else if (room.type === 'dif') {
            generator = new DifGenerator();
        } else if (room.type === 'num') {
            generator = new NumGenerator();
        } else if (room.type === 'che') {
            generator = new CheGenerator();
        } 
        if(generator) {
            bingo.setGenerator(generator);
        }
        // and bind the timer to this bingo instance
        bingos[k.id] = bingo;

        bingo.on("nextball", function(ball){
            console.log("Enviant nova bolla ", ball);
            ioServerLocal.to(k.id).emit("bingo:nextball", ball);
        });

        bingo.on("gameover", function(winner){
            //wait some time to see if somebody claims bingo
            setTimeout(function(){
            ioServerLocal.to(k.id).emit("bingo:gameover", winner);
            // TODO unbind events on bingo
            bingo.off();
            bingo.pause();
            }, 2000*BINGO_CHECK_TIME);
        });

        // Inform to all other participants in the room
        ioServerLocal.to(k.id).emit("bingo:start", k.id);

        // Actually trigger the bingo timer now, with a delay of 2 seconds
        bingo.trigger(2);
    });

    socket.on("bingo:linea", function(k) {
        console.log("bingo:linea", k);
        // Ask for linea check
        var bingo = bingos[k.id];

        //TODO:: concurrent pause and plays CHECK IT!
        bingo.pause();

        // Simulate some time to check the linia
        var testRes = bingo.testLine(k.numbers, k.user);
        console.log("bingo:linea result", testRes);
        var correcte = testRes.length > 0 && testRes[0]===true;
        if(!correcte) {
            //Informa'm només a jo (no molestis als altres)
            socket.emit("bingo:linea", {res: testRes, user: k.user});
            console.log("Notifying to user");
        } else {
            // Inform to all participants in the room that the linia is correct
            ioServerLocal.to(k.id).emit("bingo:linea", {res: testRes, user: k.user});
            console.log("Notifying to all");
        }

        setTimeout(function(){
            // Retake game
            bingo.play();
        }, LINEA_CHECK_TIME*1000);
       
    });

    socket.on("bingo:asknext", function(k, cb) {
        console.log("asknext", k);
        // Asks for the next ball 
        // if all users have asked then timer stops and sends the next ball
        if(bingos[k.id]) {
            var all = joined[k.id];
            var participants = [];
            for(var i=0, len=all.length; i<len; i++) {
                if(participants.indexOf(all[i].idUser)<0) {
                    participants.push(all[i].idUser);
                }
            }
            if(bingos[k.id].canSendNext(k.user.idUser, participants)) {
                console.log("OK. Hauria d'enviar el següent");
                cb && cb(true)
                return;
            }
        }
        cb && cb(false);
    });
  
    socket.on("bingo:bingo", function(k) {
        // Ask for linea check
        var bingo = bingos[k.id];

        //TODO:: concurrent pause and plays CHECK IT!
        bingo.pause();

        // Simulate some time to check the linia
        var testRes = bingo.testBingo(k.numbers, k.user);
        var correcte = testRes.length > 0 && testRes[0]===true;
        if(!correcte) {
            //Informa'm només a jo (no molestis als altres)
            socket.emit("bingo:bingo", {res: testRes, user: k.user});
        } else {
            // Inform to all participants in the room that the linia is correct
            ioServerLocal.to(k.id).emit("bingo:bingo", {res: testRes, user: k.user});
        }
        setTimeout(function(){
            // Retake game
            bingo.play();

        }, BINGO_CHECK_TIME*1000);
       
    });

});


/** 
 * 
 *  A SEPARATE MODULE DECLARING SERVICES
 * 
 * **/
var BingoUtils = require("BingoUtils");

angular.module('bingoApp.services', [])
    .value('version', '0.1')
    .factory('socket', ['$rootScope', '$interval', function($rootScope, $interval) { 
    var socket = null;
    if(window.BINGO_DEV) {
        socket = window.io.connect("http://127.0.0.1:3333");
    } else {
        socket = window.io.connect("https://piworld.es/");
    }
    var socketLocal = ioClientLocal.connect();
    $rootScope.mode = {method: 'remote', hasConnection: true};
    
    //Listen to changes in connection
    /*
    socket.on("connect_error", function() { 
        $rootScope.mode.method = 'offline'; 
        $rootScope.mode.hasConnection = false; 
        $rootScope.$emit('hasConnection', false); 
    });
    */

    return {
        on: function(eventName, callback) {
            // Always bind events on both sockets
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
            socketLocal.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socketLocal, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            // Emit to one or another socket depending on conditions
            var actualSocket = socket;
            if($rootScope.mode.method === 'offline' || !$rootScope.mode.hasConnection) {
                console.log("Offline mode"); 
                actualSocket = socketLocal;
            }
            actualSocket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(actualSocket, args);
                    }
                });
            })
        },
        removeAllListeners: function() {
            // To both sockets 
            socket.removeAllListeners();
            socketLocal.removeAllListeners();
            //Attach error again on remote socket
            socket.on("connect_error", function() {
                console.log("connect error Setting ");
                $rootScope.mode.method = 'offline'; 
                $rootScope.mode.hasConnection = false; 
                $rootScope.$emit('hasConnection', false); 
                console.log("connect error Setting and emitting ", $rootScope.mode);
            });
        }
    };
}])
.service("cfg", function(){
    var IBgames = sessionStorage.getItem("IB.games") || "{}";
    IBgames = JSON.parse(IBgames);
    if(!IBgames.bingo) {
        IBgames.bingo = {};
    }
    return {
        getUser: function() {
            return IBgames.user;
        },
        setNick: function(nick) {
            if(!IBgames.user) {
                IBgames.user = {nick: nick, idUser: "u"+Math.random().toString(32).substring(2)};
            } else {
                IBgames.user.nick = nick;
            }
            sessionStorage.setItem("IB.games", JSON.stringify(IBgames));
            return IBgames.user;
        },
        getBingoFlavor: function() {
            if(window.BINGO_FLAVOR == 'eqn') {
                return 'E q u a c i o n s';
            } else if(window.BINGO_FLAVOR == 'num') {
                    return 'O p e r a c i o n s';  
            } else  if(window.BINGO_FLAVOR == 'dif') {
                return 'D e r i v a d e s';
            } else  if(window.BINGO_FLAVOR == 'che') {
                return 'Q u í m i c a';
            } else {
                window.BINGO_FLAVOR == 'cla'
                return 'C l à s s i c';
            }
        }
    }
})
.directive('katex', [function () {

    var render = function(katex, text, element) {
        try {
            katex.render(text, element[0]);
        }
        catch(err) {
            element.html("<div class='alert alert-danger' role='alert'>" + err + "</div>");
        }
    }

    return {
        restrict: 'AE',
        link: function (scope, element) {
            var text = element.html();
            if (element[0].tagName === 'DIV') { 
                text = '\\displaystyle {' + text + '}';
                element.addClass('katex-outer').html();
            }
            render(katex, text, element);
        }
    };
}])
.directive('unsafeHtml', ['$compile', function($compile) {
    return function($scope, $element, $attrs) {
        var compile = function( newHTML ) { // Create re-useable compile function
            newHTML = $compile(newHTML)($scope); // Compile html
            $element.html('').append(newHTML); // Clear and append it
        };

        var htmlName = $attrs.unsafeHtml; // Get the name of the variable 
                                              // Where the HTML is stored

        $scope.$watch(htmlName, function( newHTML ) { // Watch for changes to 
                                                      // the HTML
            if(!newHTML) return;
            compile(newHTML);   // Compile it
        });

    };
}]);
	

/** 
 * 
 *  THE MAIN APP MODULE AND ITS DEPENDENCIES
 * 
 * **/
var app = angular.module("bingoApp", ['ui.router', 'bingoApp.services', 'angular-growl']);

/** 
 * 
 *  DECLARE HERE ALL DIRECTIVES
 * 
 * **/
app.directive('bingoHeader', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        headerInfo: '=info'
      },
      template:  '<div class="bingo_header">'+
      '<div class="user_ball" ng-click="headerInfo.exit()">'+
      '     <h2 ng-bind="headerInfo.nick | initials" title="{{headerInfo.nick}}"></h2>'+
      '</div>'+
      ' <div>'+
      '     <h2>B I N G O</h2>'+
      '     <h3 ng-bind="headerInfo.typeName"></h3>'+
      ' </div>'+
      '<div class="room_exit" ng-show="headerInfo.id">'+
      '     <p ng-click="headerInfo.exit()">EXIT</p>'+
      '     <p ng-bind="headerInfo.id"></p>'+
      ' </div>'+
      '</div>'
    };
});
 
app.directive('bingoFooter', function() {
    return {
      restrict: 'E', 
      transclude: true,
      template: '<div class="bingo_footer">'+
                '<p>(c) Josep Mulet (2021-2022)</p>'+
                '</div>'
    };
});

app.directive('bingoCartro', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        cartro: '=cartro',
        bingoStarted: '=bingoStarted'
      },
      template:  '<div>'+
      ' <div ng-repeat="row in cartro.rows" class="cartro_row">'+
      '    <div ng-click="cell.toggle(bingoStarted)" '+
      ' ng-repeat="cell in row" class="cartro_cell" ng-class="{\'cartro_cellvoid\': cell.value==null, \'cartro_cellselected\': cell.selected, \'cartro_celledit\': bingoStarted && cell.value!=null}">'+
      '         <span ng-if="cell.value!=null">{{cell.value}}</span>'+
      '    </div>'+
      '  </div>'+
      '</div>'
    };
});

/** 
 * 
 *  DECLARE HERE ALL FILTERS
 * 
 * **/
app.filter('initials', function() {
    return function(input) {
      return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() : "?";
    }
});
app.filter('minsec', function() {
    var str2 = function(x) { 
        if(x < 10) {
            return "0"+x;
        }
        return ""+x;
    }
    return function(seconds) {
        if(!seconds || seconds < 0) {
            return "00:00";
        }
        var min = Math.floor(seconds / 60);
        var sec = seconds % 60;
        return str2(min)+":"+str2(sec);
    }
});

app.run(['$rootScope', 'cfg', 'socket', 'growl', '$state', '$window', '$transitions', 
    function($rootScope, cfg, socket, growl, $state, $window, $transitions) {
 
    // Page unload
    $window.addEventListener('beforeunload', function(e) { 
        var cuser = cfg.getUser();
        if(cuser) { 
            // Ask to leave all rooms where this user is into.
            socket.emit("rooms:leave", {id: '*', idUser: cuser.idUser});
        } 
    }); 

    //Detect offline operation
    $rootScope.$on("hasConnection", function(evt, value) {  
        console.log("on hasConnection ", value);
        if(!value && !$rootScope.methodNotified) {
            $rootScope.methodNotified = true;
            growl.error("Vaja, no hi ha connexió. Estàs en mode fora de línia.", {ttl: -1, referenceId: 1});
        }
    });
 
    //Detect room leave events
    $transitions.onStart({from: 'game'}, function(transition) {
        var previous = transition.from();
        var current = transition.to();
       
        if(current.name != "game") {
             var params = transition.params('from'); 
             var idRoom = params.idroom;
             var cuser = cfg.getUser();
             console.log("Leaving room "+idRoom); 
             socket.emit("rooms:leave", {id:idRoom, idUser: cuser.idUser, nick: cuser.nick});
             $rootScope.currentRoom = null;
         }
    });

    //Force to start from home page when reloading 
    $transitions.onBefore({}, function(transition) {
         var current = transition.to();
         if(!$rootScope.normalInit && current.name!="home") {
            // redirect to the 'login' state
            return transition.router.stateService.target('home');
         }
    });
 
     
}]);
 

/** 
 * 
 *  THE LANDING PAGE CONTROLLER
 *  NICK AND INSTRUCTIONS
 * 
 * **/
var LandingCtrl = function($scope, $rootScope, $state, cfg, socket, growl) {
    $rootScope.normalInit = true;
    socket.removeAllListeners();
    var cuser = cfg.getUser();
    $scope.flavors = [
        {url: './classic.html', name: 'Clàssic', alias: "cla"},
        {url: './operacions.html', name: 'Operacions', alias: "ope"},
        {url: './equacions.html', name: 'Equacions', alias: "eqn"},
        {url: './derivacio.html', name: 'Derivades', alias: "dif"},
        {url: './quimica.html', name: 'Química', alias: "che"},
    ];
    $scope.currentFlavor = window.BINGO_FLAVOR;

    $scope.nick = cuser? cuser.nick : "";
    $scope.headerInfo = {
        nick: $scope.nick,
        id: null,
        typeName: cfg.getBingoFlavor(),
        exit: function() {
            $state.go("home");
        }
    };
    $scope.onKeyUp = function(keyEvent) {
        $scope.headerInfo.nick = $scope.nick;
        if (keyEvent.which === 13) {
          $scope.onsubmit();
        }
    };
    $scope.onsubmit = function(evt, method) {
        if(!$scope.nick.trim().length) {
            growl.warning("Escriviu un pseudònim vàlid.")
            return;
        }
        cfg.setNick($scope.nick);
        if(!$rootScope.mode.hasConnection && method==='online') {
            growl.error("No hi ha connexió per a multi jugador.")
            return;
        }
        // Set the operational method
        $rootScope.mode.method = method;
        
        $state.go('rooms');
    };

};


/** 
 * 
 *  THE ROOMS SELECTOR CONTROLLER
 * 
 * **/
var RoomsCtrl = function($scope, $rootScope, $state, cfg, socket, growl, $timeout) {
    socket.removeAllListeners();

    var cuser = cfg.getUser();
    if(!cuser) {
        $state.go("home");
    } 
    socket.on("rooms:available", function(rooms){
        // Only filter rooms that belong to the same flavor
        console.log(rooms, BINGO_FLAVOR)
        var filteredRooms = [];
        for(var i=0, len=rooms.length; i<len; i++) {
            var room = rooms[i];
            if(room.type == window.BINGO_FLAVOR) {
                filteredRooms.push(room);
            }
        }
        $scope.rooms = filteredRooms;
    }); 


    $timeout(function() {
        socket.emit("rooms:available");
    }, 400);


    $scope.headerInfo = {
        nick: cuser.nick,
        id: null,
        typeName: cfg.getBingoFlavor(),
        exit: function() {
            $state.go("home");
        }
    };

    $scope.joinroom = function(r) { 
        console.log("Attempting join room", r);
        $state.go("game", {idroom: r.id}, {reload: false});
        
    };
    $scope.newroom = function() { 
        //emit the room created
        var cuser = cfg.getUser();
        socket.emit("rooms:create", {nick: cuser.nick, idUser: cuser.idUser, type: window.BINGO_FLAVOR}, function(success, msg) {
            if(!success) {
                console.error(msg);
                growl.error(msg);
            } 
        });
    };

};

/** 
 * 
 *  THE GAME CONTROLLER
 * 
 * **/
var GameCtrl = function($scope, $rootScope, $state, cfg, socket, growl, $interval, $timeout) { 
    socket.removeAllListeners();
    var cuser = cfg.getUser();
    if(!cuser) {
        $state.go("home");
        return;
    } 

    //Every time we land on  ask to update the list of participants in this room
    $rootScope.bingoStarted = false; //Every time we land, we start as non-started game, and must wait for signal to start
    $rootScope.lineaBtnDisabled = false;
    $rootScope.isGameover = false;

   
    var idRoom = $state.params.idroom;
    console.log("Joining room "+idRoom);
   
    var idRoom = $state.params.idroom;
   


    $scope.balls = [];  
    $scope.cartro = new BingoUtils.Cartro(); 
    $scope.mute = false;

    $scope.newCartro = function() {
        $scope.cartro.generate();
    };

     //check if set roomId
    $scope.idRoom = idRoom;
    $scope.participants = [];
    $scope.canSubmitStart = true;
    $scope.headerInfo = {
        idUser: cuser.idUser,
        nick: cuser.nick,
        id: $scope.idRoom,
        typeName: cfg.getBingoFlavor(),
        exit: function() {
            $state.go("home");
        }
    };


    //TO decide who can press submit start game
    // Need to retrieve information about the room
    socket.on("rooms:info", function(roomInfo) { 
        console.log("Received ROOMS:INFO");
        $scope.currentRoom = roomInfo;
    });

   
    // Pregame
    socket.on("rooms:participants", function(participants) {
        if(participants == "invalid_room") {
            console.log("invalid room");
            //invalid room man
            $state.go("rooms");
            return;
        } 
        console.log("Received ROOMS:PARTICIPANTS");
        $scope.participants = participants;
    });

    socket.on("bingo:start", function(idRoom)  {
        // Only listen to changes in the same room
        if(!$scope.currentRoom) {
            console.error("Requires room information before starting bingo");
            return;
        }
        if($scope.currentRoom.id != idRoom) {
            return;
        }
        // Prepare to start the game
        growl.info("La partida està apunt de començar.");
        //TODO Set variables
        $rootScope.bingoStarted = true;
    });

    $scope.onSubmitStart = function() {
        socket.emit("bingo:start", {id: $scope.idRoom}, function(res) {
            if(!res) {
                // Bingo cannot be started
                // TODO tell the other participants
                growl.error("No ha estat possible començar la partida.");
                $state.go("rooms");
            }
        });
    };


    // Game is running
    var timeoutID = null;
    
    //TODO: set according to server
    $scope.remainBalls = 30;
    $scope.nextAsked = true;

    socket.on("bingo:nextball", function(ball) {
        // check if this ball.id is already here
        var found = false;
        var i = 0;
        while(!found && i<$scope.balls) {
            found = $scope.balls[i].id==ball.id;
            i++;
        }
        if(found) {
            return;
        }
        $scope.nextAsked = false;

        //TODO check
        //TODO check the ball.id in order to detect missing balls

        //next ball has arrived!
        //growl.info("Nova bolla: " + ball.latex, {referenceId: 2});
        $scope.balls.unshift(ball);
        if(!$scope.mute) {
            BingoUtils.speak(ball.speech);
        }

        // Comptadors
        console.log(ball);

        $scope.remainBalls = ball.remaining;
        $scope.remainTime = ball.ttl;
        if(timeoutID) {
            $interval.cancel(timeoutID);
        }
        timeoutID = $interval(function() { 
            $scope.remainTime -= 1;
            if($scope.remainTime <= 0 ) {
                $interval.cancel(timeoutID);
            }
        }, 1000);
    });
    socket.on("bingo:gameover", function() {
        //the game has finished
        growl.info("El joc s'ha acabat.");
        //TODO disable everything 
        $rootScope.isGameover = true;
    });
    socket.on("bingo:linea", function(data) {
        //result of the linea test
        if(!data.res.length || $rootScope.isGameover) {
            // Ja ha estat cantat
            return;
        }
        if(data.user.id==cuser.id && data.res[0]===false) {
            growl.warning("La línia no és correcta");
        }
        if(data.res[0]===true) {
            growl.success("Línia correcta de "+data.user.nick);
            $rootScope.lineaBtnDisabled = true;
        }
    });
    socket.on("bingo:bingo", function(data) {
        //TODO:: res should send all balls to check bingo card
        //result of the bingo test
        if(!data.res.length) {
            // Ja ha estat cantat
            return;
        } 
        if(data.res[0] === true) {
            growl.success("Bingo correcte de "+data.user.nick);
            $rootScope.isGameover = true;
        } else if(data.user.id==cuser.id && data.res[0]===false) {
            growl.warning("El bingo no és correcte");
        }
        
    });


    $timeout(function() {

        socket.emit("rooms:join", {id: idRoom, idUser: cuser.idUser, nick: cuser.nick}, function(success, msg){
            console.log("RESULT JOINING ROOM", success, msg);
            if(!success) {
                growl.error(msg);
                $state.go("rooms");
            }  
        });  

        socket.emit("rooms:info", {id: idRoom});

        socket.emit("rooms:participants", {id: idRoom}, function(success, msg) {
            if(!success) {
                console.error(msg);
                growl.error(msg);
                $state.go("rooms");
            }
        }); 

    }, 400);

    $scope.testLinia = function() {
        console.log("Sending bingo:linea");
        console.log("Llista a comprovar ", $scope.cartro.list())
        socket.emit("bingo:linea", {id: $scope.idRoom, numbers: $scope.cartro.list(), user: cuser});
    };
    $scope.testBingo = function() {
        console.log("Sending bingo:bingo");
        console.log("Llista a comprovar ", $scope.cartro.list())
        socket.emit("bingo:bingo", {id: $scope.idRoom, numbers: $scope.cartro.list(), user: cuser});
    };
    $scope.sortirJoc = function() {
        $state.go("home");
    }; 
    $scope.askNext = function() {
        console.log("nextAsked");
        $scope.nextAsked = true;
        socket.emit("bingo:asknext", {id: $scope.idRoom, user: cuser});
    };

};


/** 
 * 
 *  REGISTER CONTROLLERS AND STATE NAVIGATION RULES
 * 
 * **/
LandingCtrl.$inject = ["$scope", "$rootScope", "$state", "cfg", "socket", "growl"];
RoomsCtrl.$inject = ["$scope", "$rootScope", "$state", "cfg", "socket", "growl", "$timeout"];
GameCtrl.$inject = ["$scope", "$rootScope", "$state", "cfg", "socket", "growl", "$interval", "$timeout"]; 

app.controller("LandingCtrl", LandingCtrl);
app.controller("RoomsCtrl", RoomsCtrl);
app.controller("GameCtrl", GameCtrl); 

app.config(['$stateProvider', '$urlRouterProvider', 'growlProvider',
    function config($stateProvider, $urlRouterProvider, growlProvider) {
      $urlRouterProvider.otherwise("/");
      $stateProvider.
        state('home', {
            url: '/',
            templateUrl: 'landing.html',
            controller: 'LandingCtrl',
            reload: false
        }).
        state('rooms', {
            url: '/rooms',
            templateUrl: 'rooms.html',
            controller: 'RoomsCtrl',
            reload: true
        }).
        state('game', {
            url: '/game/:idroom',
            templateUrl: 'game.html',
            controller: 'GameCtrl',
            reload: true
        });

        growlProvider.onlyUniqueMessages(true);
        growlProvider.globalTimeToLive(5000);
        growlProvider.globalPosition('top-right');
        growlProvider.globalDisableCountDown(true);
    }
]);
}());
