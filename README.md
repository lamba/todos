todos
=====

JavaScript app for managing to-dos

This is an all-JavaScript full-stack SPA POC using HTML5, CSS3, JavaScript, SSL, AJAX, JSON, Node.js & Mongo, deployed to the Heroku cloud PaaS (managed by Salesforce.com and based on Amazon's AWS).

Click the link at the top to view a demo.

How do I run this locally?
==========================
	npm run build 
		npm error Missing script: "build"
	npm run
		Lifecycle scripts included in Todos@0.1.12:
  			test
    		echo "Error: no test specified" && exit 1
    1. node server.js
    	if there is a compile error, it will respond with
    		/Users/lamba/Projects/My-Github/todos/server.js:649
				console.log("/register request: " + JSON.stringify(req.body);
	    				                                                   ^
			SyntaxError: missing ) after argument list
		if successful, it will respond with
	    	Server v0.1.12 is listening on port 8085
	    	Connected to Mongo on URI mongodb://localhost/todos
	2. file:///Users/lamba/Projects/My-Github/todos/client/index.html > open with chrome
		NO!
		you will see
			net::ERR_FAILED
		because it cannot find node
	3. browse to localhost:8085 (or whichever port you configured in your server.js)
		it will automatically open your index.html file, assuming it is in the root of a "client" folder that's an immediate child of the folder containing your server.js

To run on Heroku
================
	see heroku-notes.txt, git-notes.txt, todos-notes.txt

To build
========
	only needed if you change dependencies in package.json
	npm install
	npm ci
	should both be needed?
