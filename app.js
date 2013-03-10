//declare port number based on environment necessary for heroku deployment
var port = process.env.PORT || 3000;

//create express application
var app = require('express').createServer()

//require socket.io
var io = require('socket.io').listen(app);

//socket configuration for Heroku.  Defined by Heroku itself
io.configure(function () { 
  	io.set("transports", ["xhr-polling"]); 
  	io.set("polling duration", 10); 
});

//app will listen on port specified above
app.listen(port);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var usersockets= {};

//on receiving socket "connection, anonymous function called"
io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		//first parameter is the socket emiiting, second is the data itself
		io.sockets.emit('updatechat', socket.username, data);

	});

	socket.on('getusername', function(){
		socket.emit('sendusername', socket.username);
	});

	socket.on('privatechat', function (data, RSname) {
		Receiver = usersockets[RSname];
		if (Receiver != null){
			recName = Receiver.username;
			Receiver.emit('myprivatechat', socket.username, recName, data);
			socket.emit('myprivatechat', socket.username, 'You', data);
		}
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username =  username;
		// add the client's username to the global list
		usernames[username] = username;
		// add socket to usersockets
		usersockets[socket.username] = socket;
		// echo to client they've connected
		// just emitting to "local" socket
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		//emitting to everything but local socket
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has connected');
		// update the list of users in chat, client-side
		socket.emit('updatename', socket.username);
		//update all
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});

});