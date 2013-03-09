var port= process.env.PORT || 3000;
var app = require('express').createServer()
var io = require('socket.io').listen(app);

	io.configure(function () { 
  		io.set("transports", ["xhr-polling"]); 
  		io.set("polling duration", 10); 
	});


app.listen(port);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var usersockets= {};
var openConnections = new Object();

io.sockets.on('connection', function (socket) {

	socket.on('getusernames',function() {
		return usernames;
	})

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', username, data);

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
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
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

	// when 'sendprivatechat' is emitted, this will pick it
	socket.on('sendprivatechat', function(receiverId, senderId, msg) {
		
		//find correct client socket (receiver's socket)
		var clientSocket = usersockets[receiverId];		
		
		//check to see if receiver is present
		if (clientSocket == null){
			//send "could not connect message"
			return;
		} 

		//if client is present, check to see if there is already a "connection"
		if (openConnections[receiverId+senderId] != null) {
			Console.log("r: "+receiverId+"  s: "+senderId+"  m: "+msg);
		}
		else if (openConnections[senderId+receiverId] != null) {
				Console.log("s: "+senderId+"  r: "+receiverId+"  m: "+msg);
		}
		else {
			//if no connection, create a connection
			openConnections[senderId+receiverId] = "hello";
			Console.log("Creating Connection");
		}
		//if socket does exist, emit to clientsocket, getprivatemessage command
		clientSocket.emit('getprivatemsg', socket.username, receiverId, "<b>"+socket.username+"</b>"+msg);
	});
});