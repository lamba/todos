var 
  express,
	bodyParser,
	jsonParser,
	urlencodedParser,
	http,
	mongoose,
	Schema,
	ToDo,
	User,
	passport,
	LocalStrategy,
	bcrypt,
	loginErrorMessage,
	cookieParser,
  port,
	server;

//link required node.js modules  
express = require("express");	
bodyParser = require("body-parser");
http = require("http");
mongoose = require("mongoose");
passport = require("passport");
LocalStrategy = require("passport-local").Strategy;
cookieParser = require("cookie-parser");
port = 80;
server = express();

server.use(express.static(__dirname + "/client"));
server.use(cookieParser());

mongoose.connect('mongodb://localhost/test');

Schema = mongoose.Schema;

ToDo = mongoose.model('ToDo', new Schema({
	description: {
		type:String, 
		required:true,
	},
	email: {
		type:String, 
		lowercase:true, 
		required:true,
	},
	created_date: {
		type:Date,
	},
	completed_date: {
		type:Date,
	}
}, {strict:true}));
//toDo = mongoose.model("toDo", toDoSchema);

User = mongoose.model('User', new Schema({
	email: {
		type:String, 
		lowercase:true, 
		required:true, 
		unique:true,
	},
	password: {
		type:String, 
		required:true,
	},
	created_date: {
		type:Date,
	},
	last_login_date: {
		type:Date,
	}
}, {strict:true}));
//user = mongoose.model("user", userSchema);

jsonParser = bodyParser.json();
urlencodedParser = bodyParser.urlencoded({extended:false});
//server.use(bodyParser.urlencoded());
//server.use(bodyParser.json());

passport.use(new LocalStrategy({
		usernameField:'email'
	},
	function(username, password, done) {
		User.findOne( {email:username}, function(err, user) {
			if (err) { return done(err); };
			if (!user) { return done(null, false, {message:'Incorrect email'} ); };
			if (!user.validPassword(password)) { return done(null, false, {message:'Incorrect password' } ); };
			return done(null, user);
		});
	}
));

http.createServer(server).listen(process.env.PORT || port);
console.log("Server is listening on port " + (process.env.PORT || port));

server.get("/hello",function (req, res) {
	res.send("Hello World!");
});

server.post("/getTodos", urlencodedParser, function (req, res) {
	console.log("/getTodos request: " + req.body);
	ToDo.find({'email':req.body.email.toLowerCase()}, function (err, result) {
		res.send(result);		
	});
});

server.post("/removeTodo", urlencodedParser, function (req, res) {
	console.log("/removeTodo request: " + JSON.stringify(req.body));
	/*
	ToDo.update({'_id':req.body._id}, {'completed_date':req.body.completed_date}, function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send(result);
			return false;
		} else {
			console.log(result);		
			res.sendStatus(result);			
		};
	});
	*/
	
	ToDo.findOne({'_id':req.body._id}, function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send(result);
			return false;
		} else {
			console.log(result);		
			result.completed_date = req.body.completed_date;
			result.save();
			res.send(result);			
		};
	});
	
	/*
	ToDo.find({'_id':req.body._id}, function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send(result);
			return false;
		} else {
			console.log(result);
			result.completed_date = req.body.completed_date;
			//result.save();
			res.send(result);			
		};
	});
	*/
	/*
	ToDo.find({'_id':req.body._id}, function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send(result);
			return false;
		} else {
			console.log('todo to remove: ' + result);		
			//res.send(result);			
			result.update({'_id':req.body._id}, {'completed_date':req.body.completed_date}, function (err, result2) {
				if (err !== null) {
					console.log(err);
					res.send(result2);
					return false;
				} else {
					console.log('update result: ' + result2);		
					res.send(result2);			
				};
			});
		};
	});
	*/
});

server.post("/updateAnonymousTodo", urlencodedParser, function (req, res) {
	console.log("/updateAnonymousTodo request: " + JSON.stringify(req.body));
	ToDo.findOne({'_id':req.body._id}, function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send(result);
			return false;
		} else {
			console.log(result);		
			result.email = req.body.email;
			result.save();
			res.send(result);			
		};
	});
});

server.get("/todos.json", urlencodedParser, function (req, res) {
	ToDo.find({'email':req.query.email.toLowerCase()}, function (err, todosList) {
		res.json(todosList);
	});
});

//use http://localhost/alltodos.json
server.get("/alltodos.json", urlencodedParser, function (req, res) {
	ToDo.find({}, function (err, todosList) {
		res.json(todosList);
	});
});

server.post("/addTodo", urlencodedParser, function (req, res) {
	console.log("/addTodo request: " + req.body);
	var newTodo = new ToDo({
		"description":req.body.description,
		"email":req.body.email,
		"created_date":req.body.created_date
	});
	newTodo.save( function (err, result) {
		if (err !== null) {
			console.log(err);
			console.log(result);
			res.send(result);			
			return false;
		} else {
			console.log(result);
			res.send(result);			
		};
	});
});

server.post("/users", urlencodedParser, function (req, res) {
	console.log("/users request: " + req.body);
	var newUser = new User({
		"email":req.body.email.toLowerCase(),
		"password":req.body.password
	});
	newUser.save( function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send("Error: " + err);
			return false;
		} else {
			res.cookie('email',req.body.email, {maxAge:3600000*24*14, httpOnly:false});
			res.send("Success");			
		};
	});
});

server.get("/cookies", urlencodedParser, function (req, res) {
	console.log("/cookies request: " + req.body);
	res.send(req.Cookies);
});

server.post("/login", urlencodedParser, function (req, res) {
	console.log("/login request: " + req.body);
	console.log("cookies: " + req.Cookies);
	User.findOne( {'email':req.body.email.toLowerCase()}, function(err, user) {
		if (!user) {
			console.log(err);
			res.send("Invalid email");
			return false;
		} else {
			console.log("email:" + user.email + ", password: " + user.password);
		};
		if (req.body.password === user.password) {
			user.update({last_login_date:new Date()}, function(update_err, result) {
				if (update_err !== null) {
					console.log(update_err);
					res.send("Error: " + update_err);
					return false;
				} else {
					console.log("Updated last login for user: " + user.email + ", Result: " + result);
				};			
			});
			//only seems to work if httpOnly is explicitly set
			//browser/jquery only sees it is httpOnly:false
			//maxAge is in milliseconds 60*60*1,000 = 3,600,000
			//res.cookie('email',req.body.email, {maxAge:3600000*24*14, httpOnly:false});
			res.send("Success");
		} else {
			console.log("Invalid password");
			res.send("Invalid password");		
			return false;
		};
	});
});
