/** 
 * 
 *  A SEPARATE MODULE DECLARING SERVICES
 * 
 * **/
var BingoUtils = require("BingoUtils");
var Cartro = require("cartro");

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
      '     <p ng-click="headerInfo.exit()" title="Sortir de la sala"><span class="pwi-exit"></span></p>'+
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
        //{url: './classic.html', name: 'Clàssic', alias: "cla"},
        //{url: './operacions.html', name: 'Operacions', alias: "ope"},
        {url: './equacions.html', name: 'Equacions', alias: "eqn"}
        //{url: './derivacio.html', name: 'Derivades', alias: "dif"},
        //{url: './quimica.html', name: 'Química', alias: "che"},
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
    $scope.cartro = new Cartro(); 
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