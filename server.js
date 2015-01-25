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
	cors,

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
cors = require("cors");

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
server.use(cors());
server.options('/api/todo/:id', cors()); // enable pre-flight request for DELETE request

//cors setup
// server.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	res.header("Access-Control-Allow-Credentials: true");
// 	//res.header("Access-Control-Allow-Origin: http://url.com:8080");
// 	res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// 	res.header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");  
// 	next();
// });

//to enable cors for other than http get, on all requests add these headers
// app.all('*', function(req, res,next) {
//     var 
//     	responseSettings = {
//         "AccessControlAllowOrigin": 
//         	req.headers.origin,
//         "AccessControlAllowHeaders": 
//         	"Content-Type,
//         	X-CSRF-Token, 
//         	X-Requested-With, 
//         	Accept, 
//         	Accept-Version, 
//         	Content-Length, 
//         	Content-MD5,  
//         	Date, 
//         	X-Api-Version, 
//         	X-File-Name",
//         "AccessControlAllowMethods": 
//         	"POST, GET, PUT, DELETE, OPTIONS",
//         "AccessControlAllowCredentials": 
//         	true
//     };
//     //headers
//     res.header(
//     	"Access-Control-Allow-Credentials", 
//     	responseSettings.AccessControlAllowCredentials
//     );
//     res.header(
//     	"Access-Control-Allow-Origin",  
//     	responseSettings.AccessControlAllowOrigin
//     );
//     res.header(
//     	"Access-Control-Allow-Headers", 
//     	(req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with"
//     );
//     res.header(
//     	"Access-Control-Allow-Methods", 
//     	(req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods
//     );
//     if ('OPTIONS' == req.method) {
//         res.send(200);
//     }
//     else {
//         next();
//     };
// });

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
	console.log("/getTodosSorted");
	ToDo.find({'email':req.body.email.toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
		res.json(todosList);
	});
});

//for cross origin calls from decoupled client, e.g. angular/bootstrap
//did not work from angular
server.post("/getTodosSortedJsonp", urlencodedParser, function (req, res) {
	console.log("/getTodosSortedJsonp");
	ToDo.find({'email':req.body.email.toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
		res.jsonp(todosList);
	});
});

//for cross origin calls from decoupled client, e.g. angular/bootstrap
server.get("/getTodosSorted.jsonp", urlencodedParser, function (req, res) {
	console.log("/getTodosSorted.jsonp");
	console.log(req.param('callback'));
	//ToDo.find({'email':req.param('email').toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
	ToDo.find({'email':'puneet@email.com','deleted_date':''}).sort('created_date').find(function (err, todosList) {
		res.jsonp(todosList);
	});
});

//for cors calls from decoupled client, e.g. angular/bootstrap
server.get("/getTodosSorted.cors", urlencodedParser, function (req, res) {
	console.log("/getTodosSorted.cors");
	console.log(req.header('Origin'));
	//ToDo.find({'email':req.param('email').toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
	ToDo.find({'email':req.param('email').toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
		res.json(todosList);
	});
});

//======================
//all urls starting with /api are for angular resource calls from decoupled client, e.g. angular/bootstrap

//todo apis
//create
server.post("/api/todo", urlencodedParser, function (req, res) {
	console.log("post /api/todo");
	console.log("description:"+req.param('description'));
	var newTodo = new ToDo({
		"description":req.param('description'),
		"email":req.param('email'),
		"created_date":new Date()
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

//query
server.get("/api/todo", urlencodedParser, function (req, res) {
	console.log("get /api/todo");
	console.log(req.header('Origin'));
	//ToDo.find({'email':req.param('email').toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
	ToDo.find({'email':req.param('email').toLowerCase(),'deleted_date':''}).sort('created_date').find(function (err, todosList) {
		res.send(todosList);
	});
});

//update, mark completed/incomplete
server.put("/api/todo", urlencodedParser, function (req, res) {
	var response = {};
	console.log("put /api/todo");
	console.log("_id:"+req.param('_id'));
	console.log("description:"+req.param('description'));
	console.log("completed_date:"+req.param('completed_date'));
	ToDo.findOne({'_id':req.param('_id')}, function (err, result) {
		if (err !== null) {
			response.error = err;
			console.log(err);
			res.send(result);
			return false;
		} else {
			console.log('findOne result='+result);		
			if (result !== null) {
				result.completed_date = typeof req.param('completed_date') === 'undefined' ? undefined : req.param('completed_date');
				result.description = req.param('description');
				result.save();
				console.log("final result:"+result);
				res.send(result);			
			} else {
				response.error = "Todo not found";
				res.send(response);
			};
		};
	});
});

//remove
server.delete("/api/todo", urlencodedParser, function (req, res) {
	console.log("delete /api/todo id: " + req.param('_id'));
	ToDo.findOne({'_id':req.param('_id')}, function (err, result) {
		if (err !== null) {
			console.log("findOne error:" + err);
			res.send(err);
			return false;
		} else if (result === null) {
			console.log('no result');
			res.send(result);
			return false;
		} else {
			console.log("findOne result:" + result);		
			result.deleted_date = new Date();
			result.save(function(error, response){
				if (error !== null) {
					console.log("save error:" + error);
					res.send(response);
					return true;
				} else {
					console.log("save response:" + response);		
					res.send(response);
					//return true;
				};
			});
		};
	});
});

//==================== user apis
//query
server.get("/api/user", urlencodedParser, function (req, res) {
	console.log("get /api/user");
	User.find({}).sort().find(function (err, usersList) {
		res.send(usersList);
	});
});

//login, update
server.put("/api/user", urlencodedParser, function (req, res) {
	var response = {};
	console.log("put /api/user email: " + req.param('email'));
	//angular $resource expects an object; if you send raw string instead, it will convert to array of char, i.e. garbage
	//console.log("cookies: " + req.Cookies);
	if (!sendEmail(req.param('email').toLowerCase())) {
	//if (!sendEmail(req.body.email.toLowerCase())) {
		response.error = 'Invalid email';
		console.log(response.error);
		res.send(response);
		return false;
	};
	User.findOne({'email':req.param('email').toLowerCase()}, function(err, user) {
	//User.findOne( {'email':req.body.email.toLowerCase()}, function(err, user) {
		if (!user) { //error
			console.log('findOne error:'+err);
			response.error = 'Email not registered';
			console.log(response.error);
			res.send(response);
			return false;
		} else { //success
			console.log("fineOne success: email=" + user.email + ", password=" + user.password);
			//don't encrypt users with email.com test addresses
			if (req.param('email').indexOf("email.com") > 0) {
				if (req.param('password') !== user.password) { //error
					response.error = "Invalid password";
					console.log(response.error);
					res.send(response);		
					return false;
				}
			} else if (!bcrypt.compareSync(req.param('password'), user.password)) { //error
					response.error = "Invalid password";
					console.log(response.error);
					res.send(response);		
					return false;
			};
			user.update({last_login_date:new Date()}, function(update_err, result) {
				if (update_err !== null) { //error
					response.error = update_err;
					console.log(response.error);
					res.send(response);
					return false;
				} else { //success
					response.success = "Updated last login for user: " + user.email + ", Result: " + result
					console.log(response.success);
					res.send(response);
				};			
			});						
		};
	});
});

//register, create
server.post("/api/user", urlencodedParser, function (req, res) {
	console.log("post /api/user request:" + JSON.stringify(req.body));
	console.log("cookies: " + req.Cookies);
	if (!sendEmail(req.param('email').toLowerCase())) {
	//if (!sendEmail(req.body.email.toLowerCase())) {
		console.log('Invalid email');
		res.send("Error: Invalid email");
		return false;
	};
	User.findOne({'email':req.param('email').toLowerCase()}, function(err, user) {
	//User.findOne( {'email':req.body.email.toLowerCase()}, function(err, user) {
		console.log("mongo user="+JSON.stringify(user));
		if (!user) {
			console.log("Email not found, proceeding with registration");
		} else {
			console.log(err);
			res.send("Email already registered");
			return false;
		};
	});
	console.log('2');
	var newUser = new User({
		"email":req.param('email').toLowerCase(),
		"password":req.param('email').indexOf('email.com') > 0 ? req.param('password') : bcrypt.hashSync(req.param('password')),
		"roles":""
	});
	newUser.save(function(err, result) {
		if (err !== null) {
			console.log("error="+err);
			res.send("Error:"+err);
			return false;
		} else {
			//res.cookie('email',req.body.email, {maxAge:3600000*24*14, httpOnly:false});
			res.send("Success");			
		};
	});
});
//====================== end of angular apis

//use http://localhost/alltodos.json
server.get("/alltodos.json", urlencodedParser, function (req, res) {
	ToDo.find({}, function (err, todosList) {
		console.log("sid:" + req.sessionID);
		res.json(todosList);
	});
});

//for cross origin calls from decouple client, e.g. angular/bootstrap
server.get("/alltodos.jsonp", urlencodedParser, function (req, res) {
	ToDo.find({}, function (err, todosList) {
		console.log("/alltodos.jsonp sid:" + req.sessionID);
		res.jsonp(todosList);
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
