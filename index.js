var io = require('socket.io')(process.env.PORT || 80);

//custom classes.
var Player = require('./Classes/Player.js');

var players = [];
var sockets = [];

console.log('Server has started...');

io.on('connection', function(socket) {
    console.log("player connected");

    var player = new Player();
    var thisPlayerID = player.id;

    players[thisPlayerID] = player;
    sockets[thisPlayerID] = socket;

    //Tell the client that this is our id for server.
    socket.emit('register', { id: thisPlayerID });
    socket.emit('spawn', player); // Tell myself I have Spawned.
    socket.broadcast.emit('spawn', player); // Thell other client that I have sapawned.

    //for tell myseld about every other client in the game.
    for (var playerID in players) {
        if (playerID != thisPlayerID) {
            socket.emit('spawn', players[playerID]);
        }
    }

    //Positional update data from client
    socket.on('updatePosition', function(data) {
        player.position.x = data.position.x;
        player.position.y = data.position.y;

        socket.broadcast.emit('updatePosition', player);
    });

    socket.on('updateRotation', function(data) {
        player.tankRotation = data.tankRotation;
        player.barrelRotation = data.barrelRotation;

        socket.broadcast.emit('updateRotation', player);
    });


    socket.on('disconnect', function() {
        console.log("Player Disconnected")
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconnected', player);
    });
});