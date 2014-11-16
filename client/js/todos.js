//Written by Puneet Singh Lamba
//Inspiration by Michael Mikowski, Josh Powell, Semmy Purewal, and many others

/*jslint
  browser:true,
  continue:true,
  devel:true,
  indent:2,
  maxerr:50,
  newcap:true,
  nomen:true,
  plusplus:true,
  regexp:true,
  sloppy:true,
  vars:false,
  white:true
*/

//Module /todos/
var todos = function() {
  "use strict";
  
  //Module scope variables
  var
    //Constants		
		url = "https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=?",
		tag = "&tags=nature",
    
		//General variables
		todosList = [],
		todosStr,
		completedTodosList = [],
		completedTodosStr,
		todoStr,
		idInt,
		sequenceInt=0, //used for tracking id on the client side, in the arrays
		boolCompletedTodos=false,
		boolShowHistory,
		userEmail = "Anonymous",
		boolRememberMe = false,
		boolLoggedIn = false,
		savedTodos,
				
		//jQuery elements
		//landing page containers
		$divLeft,
		$divRight,
		$sectionUser,
		$sectionPreferences,
		$sectionTodoInput,
		$sectionTodos,
		$sectionCompletedTodos,
		$sectionPhotos,
		$sectionAbout,
		
		//landing page widgets
		$labelWelcome,		
		$buttonLoginPage,
		$labelOr,
		$buttonRegisterPage,
		$cbShowHistory,
		$labelShowHistory,
		$pAddTodo,
		$inputTodo,
		$buttonAddTodo,
		$cbTodo,
		$labelTodo,
		$divTodo,
		$h1Separator,
		$imgTodos = $("<img>"),
		$pAboutHeading,
		$pAbout,
		$pAppTodosHeading,
		$pAppTodos,
		$pEmail,
		$buttonLogout,
		$iconDelete,
		
		//landing page widget definitions (for recurring elements)
		$divTodoStr,
		$labelTodoStr,
		$cbTodoStr,
		$iconDeleteStr,

		//login/register page widgets
		$inputEmail,
		$labelEmail,
		$inputPassword,
		$labelPassword,
		$cbRememberMe,
		$labelRememberMe,
		$buttonLogin,
		$buttonRegister,
		$labelLoginPageErrorMessage,
		
		//function names
		getCookies,
		addTodo,
		printTodos,
		removeTodo,
		initializeLandingPage,
		registerLandingPageEvents,
		getPhotos,
		disableLoginRegister,
		initializeLoginPage,
		loginUser,
		registerUser,
		registerLoginPageEvents,
		manageCookies,
		getTodos,
		displayTodos,
		updateAnonymousTodos,
		buildListsFromSavedTodos,
		registerEncrypted,
		loginEncrypted,
		register,
		login,
		getTodosJSON,
		registerTodoEvents,
		initElements;

	initElements = function() {
		//Create base landing page elements	
		$divLeft = $("<div class='left'></div>");		
		$sectionUser = $("<section class='user'></section>");
		$labelWelcome = $("<label id='welcome-label'>Welcome, </label>");
		$buttonLoginPage = $("<button class='goToLoginPage'>Login</button>");
		$labelOr = $("<label id='labelOr'> or </label>");
		$buttonRegisterPage = $("<button class='goToLoginPage'>Register</button>");
		$buttonLogout = $("<button id='buttonLogout'>Logout</button>");
		$sectionPreferences = $("<section class='preferences'></section>");
		$cbShowHistory = $("<input type='checkbox' class='cbShowHistory'>").prop('disabled', true);
		$labelShowHistory = $("<label class='labelShowHistory'> Show History (Completed ToDos)</label>");
		$sectionTodoInput = $("<section class='todoInput'></section>");
		$pAddTodo = $("<p class='app-title'>Add ToDo</p>");
		$inputTodo = $("<input type='text' id='inputTodo' maxlength='40'>");
		$buttonAddTodo = ("<button id='addTodo'>+</button>");
		$sectionTodos = ("<section class='todos'></section>");
		$sectionCompletedTodos = ("<section class='completedTodos'></section>");
	
		$divRight = $("<div class='right'></div>");
		$sectionPhotos = $("<section class='photos'></section>");				
		$sectionAbout = $("<section class='about'></section>");
		$pAboutHeading = $("<p id='about-heading'>About This App</p>");
		$pAbout = $("<p id='about'>" 
			+ "This is v0.1.3 of an all-JavaScript full-stack SPA POC using HTML5, CSS3, JavaScript, SSL, AJAX, JSON, Node.js & Mongo, "
			+ "deployed to the Heroku cloud PaaS (managed by Salesforce.com and based on Amazon's AWS)."
			+ "</p>");
		$pAppTodosHeading = $("<p id='app-todos-heading'>ToDos for this ToDos app (pun intended!)</p>");
		$pAppTodos = $("<p id='app-todos'>" 
			+ "<li>Add a test framework and suite of tests"
			+	"<li>Improve responsive design"
			+	"<li>Leverage HTML5 History API"
			+	"<li>Manage content overflow"
			+	"<li>Make 'show history' configurable"
			+	"<li>Allow inline editing of todos"
			+ "</p>");
		$pEmail = $("<p class='email'>Email: puneet AT inventica DOT com</p>");

		//Create todo landing page elements
		$divTodo = $("<div></div>");
		$cbTodo = $("<input type='checkbox' id='cbTodo' title='Mark Completed'></input>");			
		$cbTodo.attr('vertical-align', 'bottom');			
		$labelTodo = $("<label></label>");
		$h1Separator = $("<h1></h1>");
		$iconDelete = $('<span class="icon-delete ui-icon ui-icon-circle-close" title="Delete"></span>');

		//Definitions for recurring elements that must be recreated on the fly
		$divTodoStr = "<div></div>";
		$labelTodoStr = "<label></label>";
		$cbTodoStr = "<input type='checkbox' id='cbTodo' title='Mark Completed'></input>";
		$iconDeleteStr = '<span class="icon-delete ui-icon ui-icon-circle-close" title="Delete"></span>';
	};

	//Event handlers
	registerLandingPageEvents = function() {
		$(".todoInput button").on("click", function(event) {
			addTodo("");
			$("#inputTodo").focus();
		});
		
		$(".todoInput input").on("keypress", function(event) {
			if (event.keyCode === 13) {
				addTodo("");
				$("#inputTodo").focus();
				window.setTimeout(function() {
					$('#inputTodo').focus();
				}, 50);
			}
		});
		
		$(".todos").on('change', 'input[type=checkbox]', function(event) {
			idInt = $(event.target).parent().attr("id");
			$(event.target).parent().fadeOut().remove();
			removeTodo(idInt);				
			printTodos();		
			$("#inputTodo").focus();
		});
		
		$("button.goToLoginPage").on("click", function(event) {
			initializeLoginPage();
		});  	

		$("button#buttonLogout").on("click", function(event) {
			boolLoggedIn = false;
			initializeLandingPage();
		});  	
	};
	
	registerLoginPageEvents = function() {
		$("button.register").on("click", function(event) {
			register();
		});
		
		$("button.login").on("click", function(event) {
			login();
		});			

		$("#cbRememberMe").on('click', function(event) {
			console.log("cbRememberMe clicked");
			if ($('#cbRememberMe').is(':checked')) {
				boolRememberMe = true;
			} else {
				boolRememberMe = false;
			};
		});			
	};
	
	registerTodoEvents = function() {
		console.log('registerTodoEvents');
		$(".icon-delete").on('mouseover', function() {
				console.log('.icon-delete mouseover')
				//$(this).addClass('ui-state-hover');
				$(this).css({
					'background-image':'url(img/jquery-ui/ui-icons_cd2626_256x240.png)'
				});		
		});
		$(".icon-delete").on('mouseout', function() {
				console.log('.icon-delete mouseout')
				//$(this).removeClass("ui-state-hover");
				$(this).css({
					'background-image':'url(img/jquery-ui/ui-icons_a9a9a9_256x240.png)'
				});		
		});
	};

	disableLoginRegister = function() {
		$buttonLoginPage.prop('disabled', true);		
		$buttonRegisterPage.prop('disabled', true);
	};
	
	getCookies = function() {
		console.log("getCookies");
		console.log("cookie: " + $.cookie('email'));
		if ($.cookie('email') !== undefined) {
			boolRememberMe = true;
			userEmail = $.cookie('email');
		} else {
			boolRememberMe = false;
			userEmail = 'Anonymous';		
		};
		//$.get("cookies", {}, function (response) {
			//console.log("Cookies: " + response.cookies);
		//});	
	};
	
	getTodosJSON = function() {
		var dfd = new $.Deferred();
		console.log("getTodosJSON");
		//was calling todos.json
		$.get("todos.json", {'email':userEmail}, function (response) {
		})
			.done(function(response){
				console.log("getTodosJSON done");
				console.log("getTodosJSON response: " + JSON.stringify(response));
				savedTodos = response;
				dfd.resolve();
			});
		/*
		$.post('getTodos', {'email':userEmail}, function (response) {
			console.log("getTodos response: " + JSON.stringify(response));
		});
		*/		
		return dfd.promise(); //return the promise, awaiting resolve
	};
	
	getTodos = function() {
		//note: when a todo is marked completed, it is simply added to the bottom of the display
		//			but a new fetch from db returns in created order, not completed order
		var dfd = new $.Deferred();
		console.log("getTodosSorted");
		//was calling todos.json
		console.log("userEmail:" + userEmail);
		$.post("getTodosSorted", {'email':userEmail}, function (response) {
		})
			.done(function(response){
				console.log("getTodosSorted done");
				console.log("getTodosSorted response: " + JSON.stringify(response));
				savedTodos = response;
				dfd.resolve();
			});
		/*
		$.post('getTodos', {'email':userEmail}, function (response) {
			console.log("getTodos response: " + JSON.stringify(response));
		});
		*/		
		return dfd.promise(); //return the promise, awaiting resolve
	};
	
	displayTodos = function() {
		console.log("displayTodos");
		printTodos();
		//$(".todos").fadeOut();
		//$(".completedTodos").fadeOut();				
		if (todosList.length > 0) { //display todosList
			console.log("displaying todosList");
			todosList.forEach(function(todo){
				$(".todos").append(todo);
			});
		};
		if (completedTodosList.length > 0) {
			$(".todos").append($h1Separator);
			console.log("displaying completedTodosList");
			completedTodosList.forEach(function(todo){
				$(".completedTodos").append(todo);
			});
		};	
		//$(".todos").fadeIn();
		//$(".completedTodos").fadeIn();				
	};
	
	manageCookies = function() {
		console.log("manageCookies");
		console.log("boolRememberMe: " + boolRememberMe);
		if (boolRememberMe) {
			//if expires/maxAge is omitted it results in a session cookie (deleted upon browser close)
			$.cookie('email', userEmail, {expires:365,httpOnly:false});
		} else {
			$.removeCookie('email');			
		};
		console.log("cookie: " + $.cookie('email'));
	};
		
	initializeLandingPage = function() {
		console.log("initializeLandingPage");
		initElements();
		$("body").empty();		
		$labelWelcome.append(userEmail + "!<br>");
		
		$sectionUser.append($labelWelcome);

		if (boolLoggedIn === false) {
			$sectionUser.append($buttonLoginPage);
			$sectionUser.append($labelOr);
			$sectionUser.append($buttonRegisterPage);
		} else {
			$sectionUser.append($buttonLogout);
		};
		
		$sectionPreferences.append($cbShowHistory);
		$sectionPreferences.append($labelShowHistory);

		$sectionTodoInput.append($pAddTodo);
		$sectionTodoInput.append($inputTodo);
		$sectionTodoInput.append($buttonAddTodo);
		
		$divLeft.append($sectionUser);
		$divLeft.append($sectionPreferences);
		$divLeft.append($sectionTodoInput);
		$divLeft.append($sectionTodos);
		$divLeft.append($sectionCompletedTodos);
		
		$sectionAbout.append($pAboutHeading);
		$sectionAbout.append($pAbout);
		$sectionAbout.append($pAppTodosHeading);
		$sectionAbout.append($pAppTodos);
		$sectionAbout.append($pEmail);
		
		$divRight.append($sectionPhotos);		
		$divRight.append($sectionAbout);
		
		$("body").append($divLeft);
		$("body").append($divRight);
		
		registerLandingPageEvents();
		$(".todoInput input").focus();

		//if there are any todos (todosList) mapped to "anonymous", update email to logged in user's email
		//use promises/deferreds to sequence
		$.when(updateAnonymousTodos())
			.then(getTodos)
			.then(buildListsFromSavedTodos) 
			.then(displayTodos)
			.then(registerTodoEvents);
	};

	//if completed_todo_str is supplied, then removeTodo already marked the todo as completed in the db
	//	i.e. add the completed todo to the completedTodosList array	and display it
	addTodo = function(completed_todo_str, mongo_id) {
		var add_response;
		initElements();
		if ($(".todoInput input").val() !== "" || completed_todo_str !== "") {
			if ($(".todoInput input").val() !== "") {
				todoStr = $(".todoInput input").val();
			} else {
				todoStr = completed_todo_str;
			};

			$divTodo = $($divTodoStr);			
			$divTodo.attr('id',sequenceInt);
			
			if (completed_todo_str === "") {
				$.post("addTodo", {'email':userEmail, 'description':todoStr, 'created_date':new Date()}, function (response) {
					console.log("addTodo response: " + JSON.stringify(response));
					add_response = response;
				})
					.error(function(){
					})
					.done(function(){
						console.log('id for added todo: ' + add_response._id);
						$divTodo.attr('data-mongoid',add_response._id);
					})
				;					
			};
			
			$labelTodo.text(" " + todoStr);
			$divTodo.hide();
			$divTodo.append($cbTodo);
			$divTodo.append($labelTodo);

			if (completed_todo_str !== "") {
				$cbTodo.attr('disabled', 'disabled');
				$cbTodo.attr('checked', 'checked');
				$cbTodo.prop('title','');
				$labelTodo.css({'color':'gray'});
				$divTodo.attr('data-mongoid', mongo_id);
				$divTodo.prepend($iconDelete);
				completedTodosList.push($divTodo);
				$(".completedTodos").append($divTodo);
				boolCompletedTodos = true;
			} else {
				$(".todos").append($divTodo);
				todosList.push($divTodo);
			};
			
			if (boolCompletedTodos) {
				$(".todos").find("h1").remove();
				$(".todos").append($h1Separator);
			}

			$divTodo.fadeIn();
			
			$(".todoInput input").val("");
			
			console.log("todos array size = " + todosList.length);
			printTodos();
			sequenceInt = sequenceInt + 1;			
			registerTodoEvents();
		};
	};
	
	printTodos = function() {
		todosStr = "";
		completedTodosStr = "";
		todosList.forEach(function(todo_div){
			todosStr += todo_div.find("label").text() + ",";
		});
		console.log("todos:"+todosStr);
		completedTodosList.forEach(function(todo_div){
			completedTodosStr += todo_div.find("label").text() + ",";
		});
		console.log("completed todos:" + completedTodosStr);
	};

	buildListsFromSavedTodos = function() {
		var dfd = new $.Deferred();
		console.log("buildListsFromSavedTodos");
		initElements();
		todosList = [];
		completedTodosList = [];
		if (savedTodos !== undefined) {
			console.log("savedTodos:" + savedTodos);
			$.each(savedTodos, function(key, value) {
				console.log(JSON.stringify(key) + ":" + JSON.stringify(value));
				todoStr = value['description'];
				$divTodo = $($divTodoStr);
				$labelTodo = $($labelTodoStr);
				$cbTodo = $($cbTodoStr);
				$iconDelete = $($iconDeleteStr);
				$divTodo.attr('data-mongoid',value['_id']);
				$divTodo.attr('id',value['_id']); // populate id as well, to keep event logic simple
				$labelTodo.text(" " + todoStr);
				$divTodo.append($cbTodo);
				$divTodo.append($labelTodo);

				if (!value.hasOwnProperty('completed_date')) {
					console.log("active todo found");
					todosList.push($divTodo);
				} else {
					console.log("completed todo found");
					boolCompletedTodos = true;
					$divTodo.prepend($iconDelete);
					$cbTodo.attr('disabled', 'disabled');
					$cbTodo.attr('checked', 'checked');
					$cbTodo.prop('title','');
					$labelTodo.css({'color':'gray'});
					completedTodosList.push($divTodo);
				};
			});	
			console.log('todosList=' + todosList.length + " completedTodosList=" + completedTodosList.length);		
		} else {
			console.log("savedTodos is undefined!");
		};
		dfd.resolve();
		return dfd.promise();
	};
	
	removeTodo = function(id_int) { //mark todo as completed
		var 
			array_index = -1,
			remove_index = -1,
			completed_todo_str,
			todo_div,
			todo;
		console.log("removing id: " + id_int);
		todosList.forEach(function(todo_div) {
			array_index++;
			if (todo_div.attr("id") === id_int) {
				todo = todo_div;
				completed_todo_str = todo_div.find('label').text().substring(1);
				remove_index = array_index;
				console.log("array index to remove: " + remove_index);
			}
		});
		todosList.splice(remove_index,1);

		//use method overloading to add the removed todo as a completed todo to the array and display
		addTodo(completed_todo_str, todo.data('mongoid'));

		console.log('todo id to remove: ' + todo.data('mongoid'));
		$.post("removeTodo", {"_id":todo.data('mongoid'), "completed_date":new Date()}, function (response) {
			console.log("removeTodo response: " + JSON.stringify(response));
		});					
	};
	
	updateAnonymousTodos = function() {
		var promises = [];
		console.log("updateAnonymousTodos");
		todosList.forEach(function(todo_div) {
			var dfd = new $.Deferred();
			$.post("updateAnonymousTodo", {"_id":todo_div.data('mongoid'), "email":userEmail}, function (response) {
			})		
				.done(function(response){
					console.log("updateAnonymousTodos done");					
					console.log("updateAnonymousTodo response: " + JSON.stringify(response));
					dfd.resolve();
				});		
			promises.push(dfd);
		});
		completedTodosList.forEach(function(todo_div) {
			var dfd = new $.Deferred();
			$.post("updateAnonymousTodo", {"_id":todo_div.data('mongoid'), "email":userEmail}, function (response) {
			})
				.done(function(response){
					console.log("updateAnonymousTodos done");					
					console.log("updateAnonymousTodo response: " + JSON.stringify(response));
					dfd.resolve();
				});		
			promises.push(dfd);
		});
		return $.when.apply(undefined, promises).promise(); //return promise, awaiting resolve
	};
	
	initializeLoginPage = function() {
		console.log("initializeLoginPage");
		//getCookies();
		//$divLeft.fadeOut();
		$divLeft.empty();
		
		$inputEmail = $("<input type='text' id='inputEmail' maxlength='40' style='width:12em'></input>");
		$labelEmail = $("<label id='labelEmail'>Email</label><br>");
		$inputPassword = $("<input type='password' id='inputPassword' maxlength='40' style='width:12em'></input>");
		$labelPassword = $("<label id='labelPassword'>Password</label><br>");
		$cbRememberMe = $("<input type='checkbox' id='cbRememberMe'>");
		$labelRememberMe = $("<label id='labelRememberMe'>Remember Email</label><br>");
		$buttonLogin = $("<button class='login'>Login</button>");
		$buttonRegister = $("<button class='register'>Register</button>");
		$labelLoginPageErrorMessage = $("<br><label id='labelLoginPageErrorMessage'></label>");
		$sectionUser.empty();
		$sectionUser.append($inputEmail);
		$sectionUser.append($labelEmail);
		$sectionUser.append($inputPassword);
		$sectionUser.append($labelPassword);
		$sectionUser.append($cbRememberMe);
		$sectionUser.append($labelRememberMe);
		$sectionUser.append($buttonLogin);
		$sectionUser.append($labelOr);
		$sectionUser.append($buttonRegister);
		$sectionUser.append($labelLoginPageErrorMessage);
		
		getCookies();
		console.log('boolRememberMe: ' + boolRememberMe);
		if (boolRememberMe) {
			$cbRememberMe.prop('checked', true);
			$inputEmail.val(userEmail);
			$("#inputPassword").focus();
			window.setTimeout(function(){
				$('#inputPassword').focus();
			}, 50);
		} else {
			$cbRememberMe.prop('checked', false);		
			$inputEmail.val('');		
			$("#inputEmail").focus();
		};
		$divLeft.append($sectionUser);
		//$divLeft.fadeIn; //fadeIn seems to flicker or execute twice
		
		registerLoginPageEvents();
		$("#inputEmail").focus();
	};

	login = function() {
		if ($("#inputEmail").val().indexOf("email.com") === -1) {
			loginEncrypted();
		} else {
			loginUser();				
		};
	};

	register = function() {
		if ($("#inputEmail").val().indexOf("email.com") === -1) {
			registerEncrypted();
		} else {
			registerUser();				
		};
	};
	
	loginUser = function(){
		console.log("loginUser");
		$labelLoginPageErrorMessage.text("");
		if ($("#inputEmail").val() !== "" && $("#inputPassword").val() !== "") {
			$.post("login", {"email":$("#inputEmail").val(), "password":$("#inputPassword").val()}, function (response) {
				console.log("loginUser response: " + response);
				if (response.indexOf("Success") === -1) {
					boolLoggedIn = false;
					$labelLoginPageErrorMessage.text(response);
				};
			})
				.error(function(){
					boolLoggedIn = false;
					console.log("login request failed");
					$labelLoginErrorMessage.text(response);
				})
				.done(function(){
					console.log("login request completed");
					if ((userEmail !== 'Anonymous') && (userEmail !== $("#inputEmail").val())) {
						todosList = [];
						completedTodosList = [];
						$(".todos").empty();
					}; 
					userEmail = $("#inputEmail").val();
					if ($labelLoginPageErrorMessage.text() === "") {
						boolLoggedIn = true;
						manageCookies();
						initializeLandingPage();
					};
				})
			;		
		} else {
			boolLoggedIn = false;
			$labelLoginPageErrorMessage.text("Supply both email and password");
		};
	};
	
	loginEncrypted = function(){
		console.log("loginEncrypted");
		$labelLoginPageErrorMessage.text("");
		if ($("#inputEmail").val() !== "" && $("#inputPassword").val() !== "") {
			$.post("loginEncrypted", {"email":$("#inputEmail").val(), "password":$("#inputPassword").val()}, function (response) {
				console.log("loginEncrypted response: " + response);
				if (response.indexOf("Success") === -1) {
					boolLoggedIn = false;
					$labelLoginPageErrorMessage.text(response);
				};
			})
				.error(function(){
					boolLoggedIn = false;
					console.log("login request failed");
					$labelLoginErrorMessage.text(response);
				})
				.done(function(){
					console.log("login request completed");
					if ((userEmail !== 'Anonymous') && (userEmail !== $("#inputEmail").val())) {
						todosList = [];
						completedTodosList = [];
						$(".todos").empty();
					}; 
					userEmail = $("#inputEmail").val();
					if ($labelLoginPageErrorMessage.text() === "") {
						boolLoggedIn = true;
						manageCookies();
						initializeLandingPage();
					};
				})
			;		
		} else {
			boolLoggedIn = false;
			$labelLoginPageErrorMessage.text("Supply both email and password");
		};
	};
	
	registerUser = function(){
		console.log("registerUser");
		$labelLoginPageErrorMessage.text("");
		if ($("#inputEmail").val() !== "" && $("#inputPassword").val() !== "") {
			$.post("users", {"email":$("#inputEmail").val(), "password":$("#inputPassword").val()}, function (response) {
				console.log("registerUser response: " + response);
				if (response.indexOf("duplicate key error") > -1) {
					boolLoggedIn = false;
					$labelLoginPageErrorMessage.text("This email is already registered");
				};
			})
				.error(function(){
					boolLoggedIn = false;
					console.log("registration request failed");
					$labelLoginErrorMessage.text(response);
				})
				.done(function(){
					console.log("registration request completed");
					if ((userEmail !== 'Anonymous') && (userEmail !== $("#inputEmail").val())) {
						todosList = [];
						completedTodosList = [];
						$(".todos").empty();
					}; 
					userEmail = $("#inputEmail").val();
					if ($labelLoginPageErrorMessage.text() === "") {
						boolLoggedIn = true;
						manageCookies();
						initializeLandingPage();
					};
				})
			;		
		} else {
			boolLoggedIn = false;
			$labelLoginPageErrorMessage.text("Supply both email and password");
		};
	};
	
	registerEncrypted = function(){
		console.log("registerEncrypted");
		$labelLoginPageErrorMessage.text("");
		if ($("#inputEmail").val() !== "" && $("#inputPassword").val() !== "") {
			$.post("registerEncrypted", {"email":$("#inputEmail").val(), "password":$("#inputPassword").val()}, function (response) {
				console.log("registerEncrypted response: " + response);
				if (response.indexOf("duplicate key error") > -1) {
					boolLoggedIn = false;
					$labelLoginPageErrorMessage.text("This email is already registered");
				};
			})
				.error(function(){
					boolLoggedIn = false;
					console.log("registration request failed");
					$labelLoginErrorMessage.text(response);
				})
				.done(function(){
					console.log("registration request completed");
					if ((userEmail !== 'Anonymous') && (userEmail !== $("#inputEmail").val())) {
						todosList = [];
						completedTodosList = [];
						$(".todos").empty();
					}; 
					userEmail = $("#inputEmail").val();
					if ($labelLoginPageErrorMessage.text() === "") {
						boolLoggedIn = true;
						manageCookies();
						initializeLandingPage();
					};
				})
			;		
		} else {
			boolLoggedIn = false;
			$labelLoginPageErrorMessage.text("Supply both email and password");
		};
	};
	
	getPhotos = function(todo) {
		if (todo != null) {
			tag = "&tags=" + todo;
		};
		url = url + tag;
		$.getJSON(url, function(flickrResponse) {
			var size = flickrResponse.items.length;
			console.log("Size = " + size);
			console.log(JSON.stringify(flickrResponse));
			var display_photo = function (photo_index){
				$imgTodos.hide();
				$imgTodos.attr("src", flickrResponse.items[photo_index].media.m);
				$(".photos").append($imgTodos);
				$imgTodos.fadeIn();
				setTimeout(function() {
					photo_index = photo_index + 1;
					if (photo_index > size - 1) {
						photo_index = 0;
						console.log("Reset index");
					}
					display_photo(photo_index);
				}, 2000);
			};
			display_photo(0);		
		});
	};
		
	getCookies();	
	initializeLandingPage();
	getPhotos();
	
};	
  
//Start app once DOM is ready
$(todos);
