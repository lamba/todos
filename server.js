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
	session,
  port,
	server,
	mongoURI,
	nodemailer,
	transporter,
	mailOptions,
	todosVersion = "v0.1.6",
	sid,

	//functions
	sendEmail;

//link required node.js modules  
express = require("express");	
bodyParser = require("body-parser");
http = require("http");
mongoose = require("mongoose");
passport = require("passport");
LocalStrategy = require("passport-local").Strategy;
cookieParser = require("cookie-parser");
session = require("express-session");
bcrypt = require("bcrypt-nodejs");
nodemailer = require("nodemailer");

transporter = nodemailer.createTransport('direct', {
	debug:true
});

port = 80;
mongoURI = 'mongodb://localhost/test';
server = express();

server.use(express.static(__dirname + "/client"));
server.use(cookieParser());
server.use(session({
	secret:'topsecret',
	saveUninitialized:true,
	resave:true
}));

mongoose.connect(process.env.MONGOLAB_URI || mongoURI, function(err) {
	if (err) {
		throw err;
	} else {
		console.log("Connected to Mongo on URI " + (process.env.MONGOLAB_URI || mongoURI));
	};
});

Schema = mongoose.Schema;

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
	},
	roles: {
		type:String,
	},
	sid: {
		type:String,
	}
}, {strict:true}));

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
	},
	deleted_date: {
		type:Date,
	}
}, {strict:true}));

jsonParser = bodyParser.json();
urlencodedParser = bodyParser.urlencoded({extended:false});

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
console.log("Server " + todosVersion + " is listening on port " + (process.env.PORT || port));

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
	ToDo.findOne({'_id':req.body._id}, function (err, result) {
		if (err !== null) {
			console.log("removeTodo findOne error:" + err);
			res.send(result);
			return false;
		} else {
			console.log("removeTodo findOne result:" + result);		
			result.completed_date = req.body.completed_date;
			result.save();
			res.send(result);			
		};
	});
});

server.post("/deleteTodo", urlencodedParser, function (req, res) {
	console.log("/deleteTodo request: " + JSON.stringify(req.body));
	ToDo.findOne({'_id':req.body._id}, function (err, result) {
		if (err !== null) {
			console.log("deleteTodo findOne error:" + err);
			res.send(result);
			return false;
		} else {
			console.log("deleteTodo findOne result:" + result);		
			result.deleted_date = req.body.deleted_date;
			result.save(function(error, response){
				if (error !== null) {
					console.log("deleteTodo save error:" + error);
					res.send(response);
					return false;
				} else {
					console.log("deleteTodo save response:" + response);		
					res.send(response);
					//return true;
				};
			});
		};
	});
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
			if (result !== null) {
				result.email = req.body.email;
				result.save();
				res.send(result);			
			};
		};
	});
});

server.get("/todos.json", urlencodedParser, function (req, res) {
	ToDo.find({'email':req.query.email.toLowerCase()}, function (err, todosList) {
		res.json(todosList);
	});
}); 

server.get("/sorted_todos.json", urlencodedParser, function (req, res) {
	ToDo.find({'email':req.query.email.toLowerCase()}).sort({created_date:'ascending'}).exec(function (err, todosList) {
		res.json(todosList);
	});
});

server.post("/getTodosSorted", urlencodedParser, function (req, res) {
	ToDo.find({'email':req.body.email.toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
		res.json(todosList);
	});
});

//use http://localhost/alltodos.json
server.get("/alltodos.json", urlencodedParser, function (req, res) {
	ToDo.find({}, function (err, todosList) {
		console.log("sid:" + req.sessionID);
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

server.post("/register", urlencodedParser, function (req, res) {
	console.log("/register request: " + req.body);
	if (!sendEmail(req.body.email.toLowerCase())) {
		console.log('Invalid email');
		res.send("Error: Invalid email");
		return false;
	};
	var newUser = new User({
		"email":req.body.email.toLowerCase(),
		"password":req.body.password,
		"roles":""
	});
	newUser.save( function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send("Error: " + err);
			return false;
		} else {
			//res.cookie('email',req.body.email, {maxAge:3600000*24*14, httpOnly:false});
			res.send("Success");			
		};
	});
});

server.post("/registerEncrypted", urlencodedParser, function (req, res) {
	console.log("/registerEncrypted request: " + req.body);
	if (!sendEmail(req.body.email.toLowerCase())) {
		console.log('Could not send email to confirm registration');
		res.send("Error: Could not send email to confirm registration");
		return false;
	};
	var newUser = new User({
		"email":req.body.email.toLowerCase(),
		"password":bcrypt.hashSync(req.body.password),
		"roles":""
	});
	newUser.save( function (err, result) {
		if (err !== null) {
			console.log(err);
			res.send("Error: " + err);
			return false;
		} else {
			//res.cookie('email',req.body.email, {maxAge:3600000*24*14, httpOnly:false});
			res.send("Success");			
		};
	});
});

sendEmail = function (email) {
	console.log('sendEmail');
	return true;
	//var atPos = email.indexOf('@');
  //var dotPos = email.lastIndexOf('.');
  //return (atPos > 0 && atPos < dotPos && email.indexOf('@@') === -1 && dotPos > 2 && (email.length - dotPos) > 2);
  /*
  mailOptions = {
    from: 'pslamba@gmail.com',
    to: email,
    subject: 'lamba-todos registration code',
    text: 'Please enter this code on the registration page to complete your registration: ' + ''
	};
  transporter.sendMail(mailOptions, function(error, info) {
  	if (error) {
  		console.log(error);
  		return false;
  	} else {
  		console.log(info.response);
  		return true;
  	};
  });
	*/
};

server.get("/cookies", urlencodedParser, function (req, res) {
	console.log("/cookies request: " + req.body);
	res.send(req.Cookies);
});

server.post("/login", urlencodedParser, function (req, res) {
	console.log("/login request: " + req.body);
	console.log("cookies: " + req.Cookies);
	if (!sendEmail(req.body.email.toLowerCase())) {
		console.log('Invalid email');
		res.send("Error: Invalid email");
		return false;
	};
	User.findOne( {'email':req.body.email.toLowerCase()}, function(err, user) {
		if (!user) {
			console.log(err);
			res.send("Email not registered");
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
					console.log("session:" + JSON.stringify(req.session));
					console.log("sid:" + req.sessionID);
				};			
			});
			res.send("Success");
		} else {
			console.log("Invalid password");
			res.send("Invalid password");		
			return false;
		};
	});
});

server.post("/loginEncrypted", urlencodedParser, function (req, res) {
	console.log("/loginEncrypted request: " + req.body);
	console.log("cookies: " + req.Cookies);
	if (!sendEmail(req.body.email.toLowerCase())) {
		console.log('Invalid email');
		res.send("Error: Invalid email");
		return false;
	};
	User.findOne( {'email':req.body.email.toLowerCase()}, function(err, user) {
		if (!user) {
			console.log(err);
			res.send("Email not registered");
			return false;
		} else {
			console.log("email:" + user.email + ", password: " + user.password);
		};
		if (bcrypt.compareSync(req.body.password, user.password)) {
			user.update({last_login_date:new Date()}, function(update_err, result) {
				if (update_err !== null) {
					console.log(update_err);
					res.send("Error: " + update_err);
					return false;
				} else {
					console.log("Updated last login for user: " + user.email + ", Result: " + result);
				};			
			});
			res.send("Success");
		} else {
			console.log("Invalid password");
			res.send("Invalid password");		
			return false;
		};
	});
});

//Redirect "soft" history pages to Home ("/") if user clicks refresh button
server.get("/:var(Home|Storyboard|Features|TechStack)", urlencodedParser, function (req, res) {
	//console.log("GET /Home");
	res.redirect("/");
});
