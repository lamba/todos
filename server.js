var 
  express,
	http,
  port,
	server;
  
express = require("express");	
http = require("http");
port = 80;
server = express();

server.use(express.static(__dirname + "/client"));
http.createServer(server).listen(process.env.PORT || port);
console.log("Server is listening on port " + process.env.PORT || port);

server.get("/hello",function (req, res) {
	res.send("Hello World!");
});

server.get("/todos.json",function (req, res) {
	res.json(todosList);
});

