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
		sequenceInt=0,
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
		removeFromTodos,
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
		displayTodos;
		
	//Event handlers
	registerLandingPageEvents = function(){
		$(".todoInput button").on("click", function(event){
			addTodo("");
			$("#inputTodo").focus();
		});
		
		$(".todoInput input").on("keypress", function(event){
			if (event.keyCode === 13) {
				addTodo("");
				$("#inputTodo").focus();
				window.setTimeout(function(){
					$('#inputTodo').focus();
				}, 50);
			}
		});
		
		$(".todos").on('change', 'input[type=checkbox]', function(event){
			idInt = $(event.target).parent().attr("id");
			$(event.target).parent().fadeOut().remove();
			removeFromTodos(idInt);
			printTodos();		
			$("#inputTodo").focus();
		});
		
		$("button.goToLoginPage").on("click", function(event){
			initializeLoginPage();
		});  	

		$("button#buttonLogout").on("click", function(event){
			boolLoggedIn = false;
			initializeLandingPage();
		});  	
	};
	
	registerLoginPageEvents = function(){
		$("button.register").on("click", function(event){
			registerUser();
		});
		
		$("button.login").on("click", function(event){
			loginUser();
		});			

		$("#cbRememberMe").on('click', function(event){
			console.log("cbRememberMe clicked");
			if ($('#cbRememberMe').is(':checked')) {
				boolRememberMe = true;
			} else {
				boolRememberMe = false;
			};
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
	
	getTodos = function() {
		console.log("getTodos");
		$.get('todos.json', {'email':userEmail}, function (response) {
			console.log("todos.json response: " + JSON.stringify(response));
			savedTodos = response;
		});
		/*
		$.post('getTodos', {'email':userEmail}, function (response) {
			console.log("getTodos response: " + JSON.stringify(response));
		});
		*/		
	};
	
	displayTodos = function() {
		console.log("displayTodos");
		printTodos();
		$(".todos").fadeOut();
		$(".completedTodos").fadeOut();				
		if (todosList !== null) { //display todosList
			console.log("displaying todosList");
			todosList.forEach(function(todo){
				$(".todos").append(todo);
			});
		};
		if (completedTodosList !== null) {
			$(".todos").append($h1Separator);
			console.log("displaying completedTodosList");
			completedTodosList.forEach(function(todo){
				$(".completedTodos").append(todo);
			});
		};	
		$(".todos").fadeIn();
		$(".completedTodos").fadeIn();				
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
		//getCookies();
		$("body").empty();
		
		//Create landing page elements
		$divLeft = $("<div class='left'></div>");
		
		$sectionUser = $("<section class='user'></section>");
		$labelWelcome = $("<label id='welcome-label'>Welcome, </label>" + userEmail + "!<br>");
		$buttonLoginPage = $("<button class='goToLoginPage'>Login</button>");
		$labelOr = $("<label> or </label>");
		$buttonRegisterPage = $("<button class='goToLoginPage'>Register</button>");
		$buttonLogout = $("<button id='buttonLogout'>Logout</button>");
		
		$sectionUser.append($labelWelcome);
		if (boolLoggedIn === false) {
			$sectionUser.append($buttonLoginPage);
			$sectionUser.append($labelOr);
			$sectionUser.append($buttonRegisterPage);
		} else {
			$sectionUser.append($buttonLogout);
		};
		//disableLoginRegister();
		
		$sectionPreferences = $("<section class='preferences'></section>");
		$cbShowHistory = $("<input type='checkbox' class='cbShowHistory'>").prop('disabled', true);
		$labelShowHistory = $("<label class='labelShowHistory'> Show History (Completed ToDos)</label>");
		$sectionPreferences.append($cbShowHistory);
		$sectionPreferences.append($labelShowHistory);

		$sectionTodoInput = $("<section class='todoInput'></section>");
		$pAddTodo = $("<p class='app-title'>Add ToDo</p>");
		$inputTodo = $("<input type='text' id='inputTodo' maxlength='35'>");
		$buttonAddTodo = ("<button id='addTodo'>+</button>");
		$sectionTodoInput.append($pAddTodo);
		$sectionTodoInput.append($inputTodo);
		$sectionTodoInput.append($buttonAddTodo);
		
		$sectionTodos = ("<section class='todos'></section>");
		$sectionCompletedTodos = ("<section class='completedTodos'></section>");

		$divLeft.append($sectionUser);
		$divLeft.append($sectionPreferences);
		$divLeft.append($sectionTodoInput);
		$divLeft.append($sectionTodos);
		$divLeft.append($sectionCompletedTodos);
		
		$divRight = $("<div class='right'></div>");

		$sectionPhotos = $("<section class='photos'></section>");				

		$sectionAbout = $("<section class='about'></section>");
		$pAboutHeading = $("<p id='about-heading'>About This App</p>");
		$pAbout = $("<p id='about'>" 
			+ "This is v0.1.1 of an all-JavaScript full-stack SPA POC using HTML5, CSS3, JavaScript, SSL, AJAX, JSON, Node.js & Mongo, "
			+ "deployed to the Heroku cloud PaaS (managed by Salesforce.com and based on Amazon's AWS)."
			+ "</p>");
		$pAppTodosHeading = $("<p id='app-todos-heading'>ToDos for this ToDos app (pun intended!)</p>");
		$pAppTodos = $("<p id='app-todos'>" 
			+ "<li>Add a test framework and suite of tests"
			+	"<li>Improve responsive design"
			+	"<li>Skip images wider than 300 pixels"
			+	"<li>Add persistence (Mongo)"
			+	"<li>Add authentication and authorization"
			+	"<li>Make 'show history' configurable"
			+ "</p>");
		$pEmail = $("<p class='email'>Email: puneet AT inventica DOT com</p>");
			
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
		getTodos();
		displayTodos();
	};
	
	addTodo = function(completed_todo) {
		var $newTodo;
		if ($(".todoInput input").val() !== "" || completed_todo !== "") {
			if ($(".todoInput input").val() !== "") {
				todoStr = $(".todoInput input").val();
			} else {
				todoStr = completed_todo;
			};
			
			$divTodo = $("<div></div>");
			$divTodo.attr('id',sequenceInt);
			
			$cbTodo = $("<input type='checkbox'>");			
			$cbTodo.attr('vertical-align', 'bottom');
			
			$labelTodo = $("<label>");
			$labelTodo.text(" " + todoStr);

			$h1Separator = $("<h1></h1>");
			
			$divTodo.hide();
			
			$divTodo.append($cbTodo);
			$divTodo.append($labelTodo);

			if (completed_todo !== "") {
				$cbTodo.attr('disabled', 'disabled');
				$cbTodo.attr('checked', 'checked');
				$labelTodo.css({'color':'gray'});
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
		}
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
	
	removeFromTodos = function(id_int) {
		var 
			array_index = -1,
			remove_index = -1,
			completed_todo;
		console.log("removing id: " + id_int);
		todosList.forEach(function(todo_div) {
			array_index++;
			if (todo_div.attr("id") === id_int) {
				completed_todo = todo_div.find('label').text().substring(1);
				remove_index = array_index;
				console.log("array index to remove: " + remove_index);
			}
		});
		todosList.splice(remove_index,1);
		addTodo(completed_todo);

		$.post("removeTodo", {"_id":"", "completed_date":new Date()}, function (response) {
			console.log("removeTodo response: " + response);
		});		
	};
	
	initializeLoginPage = function() {
		console.log("initializeLoginPage");
		//getCookies();
		//$divLeft.fadeOut();
		$divLeft.empty();
		
		$inputEmail = $("<input type='text' id='inputEmail' maxlength='35'></input>");
		$labelEmail = $("<label id='labelEmail'>Email</label><br>");
		$inputPassword = $("<input type='text' id='inputPassword' maxlength='35'></input>");
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
					userEmail = $("#inputEmail").val();
					if ($labelLoginPageErrorMessage.text() === "") {
						boolLoggedIn = true;
						manageCookies();
						initializeLandingPage();
						setupSectionUser();
					};
			});		
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
					userEmail = $("#inputEmail").val();
					if ($labelLoginPageErrorMessage.text() === "") {
						boolLoggedIn = true;
						manageCookies();
						initializeLandingPage();
						setupSectionUser();
					};
			});		
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
