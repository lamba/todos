var 
  express,
	http,
  port,
	server;
  
express = require("express");	
http = require("http");
port = 80;

server = express();
http.createServer(server).listen(process.env.PORT || port);
console.log("Server is listening on port " + port);
server.get("/",function (req, res) {
	res.send("Hello World!");
});
