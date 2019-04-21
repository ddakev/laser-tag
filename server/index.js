const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const spawn = require('child_process').spawn;
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const PORT = 8080;

const xbee = new SerialPort('/dev/ttyS0', {baudRate: 9600});

const lineStream = xbee.pipe(new Readline());

//const proc = spawn('./xbee');

/*proc.on('exit', function(code) {
    console.log('xbee process closed');
});*/

var playerCount = 0;
var players = [];
var timeRemaining = 0;

const GameMode = {
    NOT_STARTED: "NOT_STARTED",
    STARTING: "STARTING",
    RUNNING: "RUNNING",
    ENDED: "ENDED",
};

var gameMode = GameMode.NOT_STARTED;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function Player(id, name, score, kills, deaths, shots) {
    this.id = id;
    this.name = name || "";
    this.score = score || 0;
    this.kills = kills || 0;
    this.deaths = deaths || 0;
    this.shots = shots || 0;
}

lineStream.on('data', function(data) {
    console.log(data);
    if(data[0] == 'n') {
	if(gameMode !== GameMode.NOT_STARTED) return;
	if(data[1] == 'r') {
	    if(data[2] == 'j') {
		//players.push({id: playerCount++, name: ""});
		players.push(new Player(playerCount++));
		io.emit('new player', {players: players});
		xbee.write(Buffer.from("ni" + (playerCount-1) + "\n"), err => {
		    if(err) console.log(err);
		});
	    }
	}
    }
    if(data[0] == 'g') {
	if(gameMode !== GameMode.RUNNING) return;
	if(data[1] == 'k') {
	    let ids = data.substr(2).split('s');
	    let shooter = players.find(player => player.id === parseInt(ids[0]));
	    let shootee = players.find(player => player.id === parseInt(ids[1]));
	    if(shooter && shootee) {
		shooter.kills ++;
		shootee.deaths ++;
		shooter.score += 200;
		shootee.score = Math.max(0, shootee.score - 100);
		console.log("gi" + ids[0] + shooter.name + ids[1] + shootee.name);
		xbee.write(Buffer.from("gi" + ids[0] + shooter.name + ids[1] + shootee.name + "\n"), err => {
		    if(err) console.log(err);
		});
		io.emit('new player', {players: players});
	    }
	}
	if(data[1] == 'h') {
	    let id = parseInt(data.substr(2));
	    let shooter = players.find(player => player.id === id);
	    shooter.shots ++;
	    io.emit('new player', {players: players});
	}
    }
});

io.on('connection', function(socket) {
    console.log('web app connected');
    
    io.emit('new player', {players: players});
    io.emit('gamestate', {gameState: gameMode});
    
    socket.on('add player', data => {
	for(let i=0; i<players.length; i++) {
	    if(players[i].name !== data.players[i].name) {
		xbee.write(Buffer.from("nn" + i + data.players[i].name + "\n"), err => {
		    if(err) console.log(err);
		});
		players[i].name = data.players[i].name;
	    }
	}
	console.log(players);
    });
    
    socket.on('start game', data => {
	xbee.write(Buffer.from("gs" + data.duration + "\n"), err => {
	    if(err) console.log(err);
	});
	timeRemaining = data.duration;
	gameMode = GameMode.STARTING;
	console.log("Game Starting");
	setTimeout(() => {gameMode = GameMode.RUNNING;}, 3000);
	setTimeout(() => {gameMode = GameMode.ENDED;}, 3000 + timeRemaining * 1000);
    });
    
    socket.on('restart game', () => {
	xbee.write(Buffer.from("gr\n"), err => {
	    if(err) console.log(err);
	});
	gameMode = GameMode.NOT_STARTED;
	players = [];
	playerCount = 0;
	io.emit('gamestate', {gameState: gameMode});
	io.emit('new player', {players: players});
    });
    
    /*proc.stdin.setEncoding('utf-8');
    proc.stdout.on('data', function(data) {
        console.log(`${data}`);
	if(`${data}` === 'nrj') {
	  console.log('new player');
	  io.emit('new player', {
	    playerId: playerCount++
          });
          socket.on('add player', (data) => {
            proc.stdin.write(data.name);
            proc.stdin.end();
          });
	}
    });
    
    proc.stderr.on('data', function(data) {
        console.log(`${data}`);
    });*/
});

server.listen(PORT);
console.log("Socket.io listening on " + PORT);
