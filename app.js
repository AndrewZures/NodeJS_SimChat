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
var usernames = {}; //stores usernames
var usersockets= {};  //stores user sockets

//on receiving socket "connection, anonymous function called"
io.sockets.on('connection', function (socket) {

	//socketname getter
	socket.on('getusername', function(){
		socket.emit('sendusername', socket.username);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (chat) {
		// we tell the client to execute 'updategroupchat' with 2 parameters
		//first parameter is the socket emiiting, second is the data itself
		io.sockets.emit('updategroupchat', socket.username, chat);

	});

	
	socket.on('privatechat', function (data, target) {
		targetSocket = usersockets[target]; //get user socket

		//determine if user socket exists
		if (targetSocket != null){

			//if user socket exists, get the socket's username
			confirmedTarget = TargetSocket.username;

			//emit chat to target socket with sender's name, target's name, and data
			targetSocket.emit('myprivatechat', socket.username, confirmedTarget, data);
		}
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		socket.username =  username;  //assign username to socket
		usernames[username] = username;  //store username is username hash
		usersockets[socket.username] = socket; //store socket is socket.hash

		//send to connected client that they have connected
		socket.emit('updateserverchat', 'SERVER', 'you have connected');

		//broadcast new user to all current sockets
		socket.broadcast.emit('updateserverchat', 'SERVER', socket.username + ' has connected');

		//update all users newly changed user list
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		delete usernames[socket.username]; //remove username from username array
		delete usersockets[socket.usernae]; //remove socket from sockets array

		//update all users with newly updated user list
		io.sockets.emit('updateusers', usernames);

		// echo globally that user has left on server chat
		socket.broadcast.emit('updateserverchat', 'SERVER', socket.username + ' has disconnected');
	});

});