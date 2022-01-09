

const BingoClassic = require("./bingo_classic");
const DifGenerator = require("./dif_generator");
const NumGenerator = require("./num_generator");
const EqnGenerator = require("./eqn_generator");
const CheGenerator = require("./che_generator");

//!!start:nodist!!
const createServer = require("http").createServer; 
const Socketio = require("socket.io");
const httpServer = createServer();
const io = new Socketio.Server(httpServer, { 
  cors: {origin: 'http://localhost:3000', method: ["GET", "POST"]}
});
//!!end:nodist!!
 

const MAX_USER_PER_ROOM = 30;
const MAX_ROOMS_ACTIVE = 10;
const LINEA_CHECK_TIME = 5;
const BINGO_CHECK_TIME = 5;
 
let rooms = {};
let joined = {};
const bingos = {};

//!!start:onlydist!!
//var rooms = {
//    "Equacions Local": {id:"Equacions Local", idUser:"Admin-local", nick:"Admin-local", type: "eqn", created: new Date()},
//    "Clàssic Local": {id:"Clàssic Local", idUser:"Admin-local", nick:"Admin-local", type: "cla", created: new Date()},
//    "Numeric Local": {id:"Numeric Local", idUser:"Admin-local", nick:"Admin-local", type: "num", created: new Date()},
//    "Derivades Local": {id:"Derivades Local", idUser:"Admin-local", nick:"Admin-local", type: "dif", created: new Date()},
//    "Química Local": {id:"Química Local", idUser:"Admin-local", nick:"Admin-local", type: "che", created: new Date()}
//};
//var joined = {
//    "Equacions Local": [{ idUser: "localBot", nick: "Bot local"}],
//    "Clàssic Local": [{ idUser: "localBot", nick: "Bot local"}],
//    "Numeric Local": [{ idUser: "localBot", nick: "Bot local"}],
//    "Derivades Local": [{ idUser: "localBot", nick: "Bot local"}],
//    "Química Local": [{ idUser: "localBot", nick: "Bot local"}]
//};
//!!end:onlydist!!

io.on("connection", function(socket) {
    console.log("Client connected ");
    
    socket.on("rooms:create", function(k, cb) {
        console.log(k);
        if(Object.keys(rooms).length > MAX_ROOMS_ACTIVE) {
            cb && cb(false, "No hi pot haver més de "+ MAX_ROOMS_ACTIVE + " actives.");
            return;
        }
        // Every user can only create up to 1 room
        let userHasRoom = false;
        const lRooms = Object.values(rooms);
        for(let i=0, len=lRooms.length; i<len; i++) {
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
        io.emit("rooms:available", Object.values(rooms)); 
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
        io.to(k.id).emit("rooms:participants", joined[k.id]);
    });

    socket.on("rooms:leave", function(k) {
        console.log("rooms:leave", k);
        if(k.id=="*" && k.idUser) {
            //Asked to leave the user from all rooms and keep the rooms intact

            let keys = Object.keys(joined); //all rooms with somebody joined
            const lenk = keys.length;
            for (let j = 0; j < lenk; j++) {
                const roomId = keys[j];
                let croom = joined[roomId];
                const len = croom.length;
                console.log("croom", croom);
                for (let i = len - 1; i >= 0; i--) {
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
        let croom = joined[k.id];
        const len = croom.length;
        for (let i = len - 1; i >= 0; i--) {
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
            io.emit("rooms:available", Object.values(rooms));
        }
        
        //tell socket not longer in room
        socket.leave(k.id); //it no longer receive messages from this room
        //tell other sockets that list have changed, only to the joined sockets
        io.to(k.id).emit("rooms:participants", joined[k.id]);
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
                io.to(k.id).emit("rooms:participants", joined[k.id])
                cb && cb(false, "La sala "+k.id+" està plena. Ja conté "+ MAX_USER_PER_ROOM + " jugadors. Creau o entrau a una altra sala.");
                return;
            }
            let found = false;
            let i = 0;
            const len = joined[k.id].length;
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
            io.to(k.id).emit("rooms:participants", joined[k.id]);
            cb && cb(true, "T'has unit a la sala " + k.id);
        } else {
            cb && cb(false, "La sala " + k.id + " ja no existeix.");
        }
    });

    socket.on("bingo:start", function(k, cb){
       
        console.log("Bingo start ", k)
        // Some participant of the room id has informed that the game is about to start
        // Create the bingo instance
        const room = rooms[k.id];
        if(!room) {
            cb && cb(false, 'La sala '+ k.id + ' no existeix.' );
            return;
        }

        // Prevent starting a room twice!!!!!
        if(bingos[k.id] && bingos[k.id].isPlaying) {
            cb && cb(false, 'La sala ja està jugant.' );
            return; 
        } 


        const bingo = new BingoClassic();
        let generator = null;
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
            io.to(k.id).emit("bingo:nextball", ball);
        });

        bingo.on("gameover", function(winner){
            //wait some time to see if somebody claims bingo
            setTimeout(function(){
            io.to(k.id).emit("bingo:gameover", winner);
            // TODO unbind events on bingo
            bingo.off();
            bingo.pause();
            }, 2000*BINGO_CHECK_TIME);
        });

        // Inform to all other participants in the room
        io.to(k.id).emit("bingo:start", k.id);

        // Actually trigger the bingo timer now, with a delay of 2 seconds
        bingo.trigger(2);
    });

    socket.on("bingo:linea", function(k) {
        console.log("bingo:linea", k);
        // Ask for linea check
        const bingo = bingos[k.id];

        //TODO:: concurrent pause and plays CHECK IT!
        bingo.pause();

        // Simulate some time to check the linia
        const testRes = bingo.testLine(k.numbers, k.user);
        console.log("bingo:linea result", testRes);
        const correcte = testRes.length > 0 && testRes[0]===true;
        if(!correcte) {
            //Informa'm només a jo (no molestis als altres)
            socket.emit("bingo:linea", {res: testRes, user: k.user});
            console.log("Notifying to user");
        } else {
            // Inform to all participants in the room that the linia is correct
            io.to(k.id).emit("bingo:linea", {res: testRes, user: k.user});
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
        const bingo = bingos[k.id];

        //TODO:: concurrent pause and plays CHECK IT!
        bingo.pause();

        // Simulate some time to check the linia
        const testRes = bingo.testBingo(k.numbers, k.user);
        const correcte = testRes.length > 0 && testRes[0]===true;
        if(!correcte) {
            //Informa'm només a jo (no molestis als altres)
            socket.emit("bingo:bingo", {res: testRes, user: k.user});
        } else {
            // Inform to all participants in the room that the linia is correct
            io.to(k.id).emit("bingo:bingo", {res: testRes, user: k.user});
        }
        setTimeout(function(){
            // Retake game
            bingo.play();

        }, BINGO_CHECK_TIME*1000);
       
    });

});

//!!start:nodist!!
console.log("Bingo server listening on port 3333");
httpServer.listen(3333);
//!!end:nodist!!