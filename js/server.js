var 
  express,
	http,
  port,
	server;
  
express = require("express");	
http = require("http");
port = 3000;
server = express();
http.createServer(server).listen(port);
console.log("Server is listening on port " + port);
server.get("/hello",function (req, res) {
	res.send("Hello World!");
});
