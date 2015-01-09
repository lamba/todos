//Authored by Puneet Singh Lamba
//Inspiration by Semmy Purewal, Michael Mikowski, Josh Powell, and many others

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
		todosVersion = "v0.1.6",
		numTodos = 0,
		maxTodos = 20,
		mqSmall = window.matchMedia("(max-width:600px)"),
		mqPrevious, 
		historySupported = false,
		state = "Home",

		//sticky note options
		note = { //prototype
			"id": -1,
		  "text": "",
			"pos_x": 5,
			"pos_y": 5,	
			"width": 120,							
			"height": 60,													
		},
		stickyNoteOptions = {
			notes:[],
			resizable: true,
			controls: true, 
			editCallback: noteEdited,
			createCallback: noteCreated,
			deleteCallback: noteDeleted,
			moveCallback: noteMoved,					
			resizeCallback: noteResized					
		},
		notesCount,
		notesMaxPerColumnCount = 7,
		notesMaxColumnCount = 3,
		notesMoveTargetAccuracy = 10,
		notesMaxPerColumnCountLarge = 7,
		notesMaxColumnCountLarge = 3,
		notesMaxPerColumnCountSmall = 10,
		notesMaxColumnCountSmall = 2,

		//jQuery elements
		//landing page containers
		$divLeft,
		$divRight,
		$divFooter,
		$sectionUser,
		$sectionPreferences,
		$sectionTodoInput,
		$sectionTodos,
		$sectionCompletedTodos,
		$sectionPhotos,
		$sectionAbout,
		$sectionFooter,

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
		$labelNumTodos,
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
		$pGitHub,

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

		//storyboard page widgets
		$sectionStoryBoard,
		$pStoryBoardHeading,
		$pStoryBoardSubheading,
		$pStoryBoard,
		$divStickyNote,

		//feature page widgets
		$sectionFeatures,
		$pFeaturesHeading,
		$pFeatures,

		//tech stack page widgets
		$sectionTechStack,
		$pTechStackHeading,
		$pTechStack,

		//footer widgets
		$buttonHome,
		$buttonStoryBoard,
		$buttonFeatures,
		$buttonTechStack,
		$buttonContact,

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
		initElements,
		deleteTodo,
		initializeFeaturesPage,
		initializeTechStackPage,
		registerFeaturesPageEvents,
		initializeTestStoryBoardPage,
		initializeStoryBoardPage,
		registerStoryBoardPageEvents,
		enforceMaxTodos,
		makeFooterButtonActive,
		isFooterButtonActive,
		isSupportedBrowserHistory,
		init,
		updateHistory,

		//sticky note functions
		makeNote, //constructor
		addNote, //add note to stickyNoteOptions
		findNearest,

		//sticky note callback functions
		noteEdited,
		noteCreated,
		noteDeleted,
		noteMoved,					
		noteMoving,
		noteResized;					

	isSupportedBrowserHistory = function() {
		return !!(window.history && window.history.pushState);
	};

	initElements = function() {
		console.log("initElements");
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
		$buttonAddTodo = $("<button id='addTodo'>+</button>");
		$labelNumTodos = $('<label id="labelNumTodos"></label>');
		$sectionTodos = $("<section class='todos'></section>");
		$sectionCompletedTodos = $("<section class='completedTodos'></section>");
	
		$divRight = $("<div class='right'></div>");
		$sectionPhotos = $("<section class='photos'></section>");				
		$sectionAbout = $("<section class='about'></section>");
		$pAboutHeading = $("<p id='about-heading'>About This App</p>");
		$pAbout = $("<p id='about'>" 
			+ "This is " + todosVersion + " of an all-JavaScript full-stack SPA POC using HTML5, CSS3, JavaScript, SSL, AJAX, JSON, Node.js & Mongo, "
			+ "deployed to the Heroku cloud PaaS (managed by Salesforce.com and based on Amazon's AWS)."
			+ "</p>");
		$pAppTodosHeading = $("<p id='app-todos-heading'>ToDos for this ToDos app (pun intended!)</p>");
		$pAppTodos = $("<p id='app-todos'>" 
			+ "<li>Add a test framework and suite of tests"
			+	"<li>Manage content overflow"
			+	"<li>Make 'show history' configurable"
			+	"<li>Allow inline editing & sequencing of todos"
			+ "<li>RD, Hist, Caching"
			+ "</p>");
		$pEmail = $("<p class='email'>Email: puneet AT inventica DOT com</p>");
		$pGitHub = $("<p id='pGitHub'>GitHub: github DOT com SLASH lamba</p>");

		$divFooter = $('<div class="divFooter"></div>');
		$sectionFooter = $('<section id="sectionFooter"></section>');

		//Create todo landing page elements
		$divTodo = $("<div></div>");
		$cbTodo = $("<input type='checkbox' id='cbTodo' title='Mark Completed'></input>");			
		$cbTodo.attr('vertical-align', 'bottom');			
		$labelTodo = $("<label></label>");
		$h1Separator = $("<h1></h1>");
		$iconDelete = $('<span class="icon-delete ui-icon ui-icon-circle-close" title="Delete"></span>');

		//Initialize login page elements
		$inputEmail = $("<input type='text' id='inputEmail' maxlength='40' style='width:12em'></input>");
		$labelEmail = $("<label id='labelEmail'>Email</label><br>");
		$inputPassword = $("<input type='password' id='inputPassword' maxlength='40' style='width:12em'></input>");
		$labelPassword = $("<label id='labelPassword'>Password</label><br>");
		$cbRememberMe = $("<input type='checkbox' id='cbRememberMe'>");
		$labelRememberMe = $("<label id='labelRememberMe'>Remember Email</label><br>");
		$buttonLogin = $("<button class='login'>Login</button>");
		$buttonRegister = $("<button class='register'>Register</button>");
		$labelLoginPageErrorMessage = $("<br><label id='labelLoginPageErrorMessage'></label>");

		//Definitions for recurring elements that must be recreated on the fly
		$divTodoStr = "<div></div>";
		$labelTodoStr = "<label></label>";
		$cbTodoStr = "<input type='checkbox' id='cbTodo' title='Mark Completed'></input>";
		$iconDeleteStr = '<span class="icon-delete ui-icon ui-icon-circle-close" title="Delete"></span>';

		//Create storyboard page elements
		$sectionStoryBoard = $("<section id='sectionStoryBoard'></section>");
		$pStoryBoardHeading = $("<p id='pStoryBoardHeading'>Storyboard</p>");
		$pStoryBoardSubheading = $("<p id='pStoryBoardSubheading'> (database integration pending)</p>");
		$pStoryBoard = $("<p id='pStoryBoard'></p>");
		$divStickyNote = $("<div id='divStickyNote'></div>");

		//Initialize feature page elements
		$sectionFeatures = $("<section id='sectionFeatures'></section>");
		$pFeaturesHeading = $("<p id='pFeaturesHeading'>Features</p>");
		$pFeatures = $("<p id='pFeatures'>" 
			+ "<ul>"
			+		"<li>v0.1.6</li>"
			+ 	"<ul>"
			+			"<li>Made storyboard stickies draggable on iOS</li>"
			+			"<li>Basic responsive design and use of history API</li>"
			+ 	"</ul>"
			+		"<li>v0.1.5</li>"
			+ 	"<ul>"
			+			"<li>Display storyboard version of todos</li>"
			+			"<li>Display active/selected footer button</li>"
			+ 	"</ul>"
			+		"<li>v0.1.4</li>"
			+ 	"<ul>"
			+			"<li>Footer w/ Home, Features, & Contact buttons</li>"
			+			"<li>Limit todos to 20</li>"
			+ 	"</ul>"
			+		"<li>v0.1.3</li>"
			+ 	"<ul>"
			+			"<li>Ability to delete completed undo</li>"
			+			"<li>Password encryption</li>"
			+			"<li>Added README.md</li>"
			+ 	"</ul>"
			+		"<li>v0.1.2</li>"
			+ 	"<ul>"
			+			"<li>Persistence via MongoDB</li>"
			+			"<li>Security (authentication and authorization)</li>"
			+ 	"</ul>"
			+		"<li>v0.1.1</li>"
			+ 	"<ul>"
			+			"<li>Cross-browser compatibility fixes</li>"
			+ 	"</ul>"
			+		"<li>v0.1.0</li>"
			+ 	"<ul>"
			+			"<li>Initial release</li>"
			+ 	"</ul>"
			+ "</ul>"
			+ "</p>");

		//Initialize tech stack page elements
		$sectionTechStack = $("<section id='sectionTechStack'></section>");
		$pTechStackHeading = $("<p id='pTechStackHeading'>Tech Stack</p>");
		$pTechStack = $("<p id='pTechStack'>" 
			+ "<ul>"
			+		"<li>HTML (51 lines)</li>"
			+		"<li>CSS (43 lines)</li>"
			+		"<li>JavaScript (1,400 lines)</li>"
			+		"<li>jQuery/AJAX/JSON</li>"
			+		"<li>jQueryUI</li>"
			+		"<li>Touch Punch</li>"
			+		"<li>Sticky Notes Module (300 lines)</li>"
			+		"<li>Node.js (400 lines)</li>"
			+		"<li>BCrypt</li>"
			+		"<li>Mongoose</li>"
			+		"<li>MongoDB</li>"
			+		"<li>Heroku PaaS/SSL</li>"
			+		"<li>===</li>"
			+		"<li>Total (2,200 lines)</li>"
			+ "</ul>"
			+ "</p>");

		//Initialize footer elements
		$buttonHome = $("<button class='buttonFooter buttonFooterActive' id='buttonHome'>Home</button>");
		$buttonStoryBoard = $("<button class='buttonFooter' id='buttonStoryBoard'>Storyboard</button>");
		$buttonFeatures = $("<button class='buttonFooter' id='buttonFeatures'>Features</button>");
		$buttonTechStack = $("<button class='buttonFooter' id='buttonTechStack'>Tech Stack</button>");
		$buttonContact = $("<button class='buttonFooter' id='buttonContact'>Contact</button>");
	};

	//Event handlers
	registerLandingPageEvents = function() {
		console.log("registerLandingPageEvents");
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
			initializeLoginPage(true);
		});  	

		$("button#buttonLogout").on("click", function(event) {
			boolLoggedIn = false;
			initializeLandingPage(true,true);
		});  	

		$('button').hover(
			function(event) {
				console.log('buttonHover mouseover');
				$(this).addClass('buttonHover');			
			}, 
			function(event) {
				console.log('buttonHover mouseout');
				$(this).removeClass('buttonHover');			
			}
		);

		$('button#buttonStoryBoard').on("click", function(event) {
			if (boolLoggedIn) {
				initializeStoryBoardPage(true);			
			} else {
				initializeTestStoryBoardPage(true);			
			};
		});

		$('button#buttonFeatures').on("click", function(event) {
			initializeFeaturesPage(true);			
		});

		$('button#buttonTechStack').on("click", function(event) {
			initializeTechStackPage(true);			
		});

		$("#buttonHome").on('click', function(event) {
			initializeLandingPage(true, true);
		});

		$("#buttonContact").on('click', function(event) {
			initializeLandingPage(true, true, true);
		});

		$(window).on('popstate', function(e) {
			console.log('popstate event='+JSON.stringify(window.event.state)); //{"stateId":2}
			console.log('history='+JSON.stringify(window.history));
			switch (window.event.state.state) {
				case "Home":
					initializeLandingPage(true, true, false);
					break;
				case "Login":
					initializeLoginPage(false);
					break;
				case "Storyboard":
					if (boolLoggedIn) {
						initializeStoryBoardPage(false);			
					} else {
						initializeTestStoryBoardPage(false);			
					};
					break;
				case "Features":
					initializeFeaturesPage(false);
					break;
				case "TechStack":
					initializeTechStackPage(false);
					break;
				default:
					console.log('State not recognized');
					break;
			};
		});
	};
	
	registerLoginPageEvents = function() {
		console.log('registerLoginPageEvents');
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
		$(".icon-delete").on('click', function(event) {
				event.stopImmediatePropagation(); //deleteTodo was getting called twice on occasion, although delete is idempotent...
				console.log('.icon-delete click')
				idInt = -1;
				idInt = $(event.target).parent().attr("id");
				deleteTodo(idInt); //if user doesn't cancel deletion
				$(event.target).parent().fadeOut().remove();
				printTodos();		
				$("#inputTodo").focus();
		});
	};

	registerStoryBoardPageEvents = function() {
		$(window).resize(function() {
			console.log("storyboard resized");
			//only call initializeStoryBoardPage if switching between mqSmall to mqLarge to keep browsers from going crazy
			if (isFooterButtonActive($buttonStoryBoard) && (((mqPrevious === 'mqSmall') && !mqSmall.matches) || (((mqPrevious === 'mqLarge') && mqSmall.matches)))) {
				initializeStoryBoardPage();
			} else {
				console.log('no need to call initializeStoryBoardPage');
			};
		});
	};

	registerFeaturesPageEvents = function() {
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
	
	init = function()	 {
		historySupported = isSupportedBrowserHistory();
		if (historySupported) {
			console.log('history supported');
		} else {
			console.log('history NOT supported');
		};
	};

	initializeLandingPage = function(left, right, history) {
		console.log("initializeLandingPage");
		init();
		initElements();
		$("body").empty();		
		if (left) {
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
			$sectionTodoInput.append($labelNumTodos);

			$divLeft.append($sectionUser);
			$divLeft.append($sectionPreferences);
			$divLeft.append($sectionTodoInput);
			$divLeft.append($sectionTodos);
			$divLeft.append($sectionCompletedTodos);			
	
			enforceMaxTodos();
			$("body").append($divLeft);

			//if there are any todos (todosList) mapped to "anonymous", update email to logged in user's email
			//use promises/deferreds to sequence
			$.when(updateAnonymousTodos())
				.then(getTodos)
				.then(buildListsFromSavedTodos)
				.then(enforceMaxTodos) 
				.then(displayTodos)
				.then(registerTodoEvents);
		};

		if (right) {
			$sectionAbout.append($pAboutHeading);
			$sectionAbout.append($pAbout);
			$sectionAbout.append($pAppTodosHeading);
			$sectionAbout.append($pAppTodos);
			$sectionAbout.append($pEmail);
			$sectionAbout.append($pGitHub);
			
			$divRight.append($sectionPhotos);		
			$divRight.append($sectionAbout);			
			$("body").append($divRight);
		};
		
		//Footer
		$sectionFooter.append($buttonHome);
		$sectionFooter.append($buttonStoryBoard);
		$sectionFooter.append($buttonFeatures);
		$sectionFooter.append($buttonTechStack);
		$sectionFooter.append($buttonContact);
		$divFooter.append($sectionFooter);
		$("body").append($divFooter);

		$(".todoInput input").focus();
		registerLandingPageEvents();

		if (left && right) {
			makeFooterButtonActive($buttonHome);
			updateHistory(history);
		};
	};

	updateHistory = function(history) {
		console.log('history='+history)
		if (historySupported) {
			$('.buttonFooter').each(function(index, footerButton) {
				if ($(this).hasClass('buttonFooterActive')) {
					state = $(this).text().split(" ").join("");
					//window.history.pushState((history ? {'state':state} : null), null, state);					
					if (history) {
						window.history.pushState({'state':state}, null, state);					
					} else {
						window.history.replaceState({'state':state}, null, state);					
					};
					console.log("updateHistory - state set to: " + state);
				};
			});
		};
	};

	//if completed_todo_str is supplied, then removeTodo already marked the todo as completed in the db
	//	i.e. add the completed todo to the completedTodosList array	and display it
	addTodo = function(completed_todo_str, mongo_id) {
		var add_response;
		if ($(".todoInput input").val() !== "" || completed_todo_str !== "") {
			initElements();
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
			enforceMaxTodos();
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
			enforceMaxTodos();					
		});
	};
	
	deleteTodo = function(id_int) { //mark todo as deleted
		var 
			array_index = -1,
			delete_index = -1,
			todo_div,
			todo,
			ids = '';
		console.log("deleting id: " + id_int);
		completedTodosList.forEach(function(todo_div) {
			array_index++;
			ids += todo_div.attr("id") + ',';
			if (todo_div.attr("id") === id_int) {
				todo = todo_div;
				delete_index = array_index;
				console.log("array index to delete: " + delete_index);
			}
		});
		console.log('completedTodosList ids:' + ids);
		completedTodosList.splice(delete_index,1);

		//use method overloading to add the removed todo as a completed todo to the array and display
		//addTodo(completed_todo_str, todo.data('mongoid'));

		console.log('todo id to delete: ' + todo.data('mongoid'));
		$.post("deleteTodo", {"_id":todo.data('mongoid'), "deleted_date":new Date()}, function (response) {
			console.log("deleteTodo response: " + JSON.stringify(response));
			enforceMaxTodos();
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
		//how to return multiple promises
		//perhaps the most awesome/complex javascript i've ever used in a real program
		//apply let's us call a function with our choice of caller and arguments
		//apply takes two parameters: (1) the value that should be bound to 'this' (caller) (2) an array of parameters
		return $.when.apply(undefined, promises).promise(); //return promise, awaiting resolve
	};
	
	initializeLoginPage = function(history) {
		console.log("initializeLoginPage");
		$("body").empty();		

		initElements();
		initializeLandingPage(false,true);

		$divLeft.empty();		
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
		$("body").prepend($divLeft);
		registerLoginPageEvents();
		$("#inputEmail").focus();
		updateHistory(history);
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
					console.log("lfplaplogin request failed");
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
						initializeLandingPage(true,true);
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
						initializeLandingPage(true,true);
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
			$.post("register", {"email":$("#inputEmail").val(), "password":$("#inputPassword").val()}, function (response) {
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
						initializeLandingPage(true,true);
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
						initializeLandingPage(true,true);
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

	makeNote = function(id, text, pos_y, pos_x) { //factory pattern from Mikowski (2014), page 39
		console.log("makeNote "+id);
		var newNote = Object.create(note);
		newNote.id = id;
		newNote.text = text;
		newNote.pos_y = pos_y;
		newNote.pos_x = pos_x;
		return newNote;
	};

	addNote = function(notesCnt, text) {
		var 
			new_pos_y = null,
			new_pos_x = null;
		//notesCount => new_pos_y
		//0 => 5 + ((60 + 5) * 0) = 5
		//1 => 5 + ((60 + 5) * 1) = 70
		//2 => 5 + ((60 + 5) * 2) = 135
		//notesCount new_pos_x
		//0 => 5 + ((120 + 5) * 0) = 5
		//7 => 5 + ((120 + 5) * 1) = 130
		console.log("notesMaxColumnCount="+notesMaxColumnCount);
		console.log("notesMaxPerColumnCount="+notesMaxPerColumnCount);			
		new_pos_y = note.pos_y + ((note.height + note.pos_y) * (notesCnt % notesMaxPerColumnCount));					
		console.log('new_pos_y='+new_pos_y);
		new_pos_x = note.pos_x + ((note.width + note.pos_x) * (Math.floor(notesCnt/notesMaxPerColumnCount)));					
		console.log('new_pos_x='+new_pos_x);
		stickyNoteOptions.notes.push(makeNote(
			notesCnt, 
			text,
			new_pos_y,
			new_pos_x
		));
	};

	initializeStoryBoardPage = function(history) {
		console.log("initializeStoryBoardPage");
		var 
			new_pos_y = null,
			new_pos_x = null,
			notesColumnCount = 1;
		if (mqSmall.matches) {
			console.log("mqSmall.matches=true");
			mqPrevious = 'mqSmall';
			notesMaxColumnCount = notesMaxColumnCountSmall;
			notesMaxPerColumnCount = notesMaxPerColumnCountSmall;
			console.log("notesMaxColumnCount="+notesMaxColumnCount);
			console.log("notesMaxPerColumnCount="+notesMaxPerColumnCount);			
		} else {
			console.log("mqSmall.matches=false");
			mqPrevious = 'mqLarge';
			notesMaxColumnCount = notesMaxColumnCountLarge;
			notesMaxPerColumnCount = notesMaxPerColumnCountLarge;
			console.log("notesMaxColumnCount="+notesMaxColumnCount);
			console.log("notesMaxPerColumnCount="+notesMaxPerColumnCount);			
		};
		stickyNoteOptions.notes.length = 0; //empty out notes array
		$("body").empty();		
		initElements();
		initializeLandingPage(false,true);
		$divLeft.empty();		
		$sectionStoryBoard.append($pStoryBoardHeading);
		$sectionStoryBoard.append($pStoryBoardSubheading);
		$sectionStoryBoard.append($pStoryBoard);
		$sectionStoryBoard.append($divStickyNote);
		$divLeft.append($sectionStoryBoard);
		$("body").prepend($divLeft);

		todosStr = "";
		completedTodosStr = "";
		notesCount = 0;

		todosList.forEach(function(todo_div){
			console.log("forEach notesCount="+notesCount);
			if (notesCount <= (notesMaxPerColumnCount * notesMaxColumnCount) - 1) {  
				todosStr += todo_div.find("label").text() + ",";
				addNote(notesCount, todo_div.find("label").text());
				console.log('notesCount='+notesCount)
				notesCount = notesCount + 1;
				console.log("notesCount incremented to="+notesCount);
			};
		});
		console.log("notes created for todos:" + todosStr);

		completedTodosList.forEach(function(todo_div){
			if (notesCount <= (notesMaxPerColumnCount * notesMaxColumnCount) - 1) {  
				completedTodosStr += todo_div.find("label").text() + ",";
				addNote(notesCount, todo_div.find("label").text());
				console.log('notesCount='+notesCount)
				notesCount = notesCount + 1;
				console.log("notesCount incremented to="+notesCount);
			};
		});
		console.log("notes created for completed todos:" + completedTodosStr);

		$("#divStickyNote").stickyNotes(stickyNoteOptions);
		makeFooterButtonActive($buttonStoryBoard);
		registerStoryBoardPageEvents();
		updateHistory(history);
	};

	isFooterButtonActive = function(button) {
		if (button.hasClass('buttonFooterActive')) {
			return true;
		} else {
			return false;
		};
	};

	makeFooterButtonActive = function(button) {
		console.log('makeFooterButtonActive');
		$buttonHome.removeClass('buttonFooterActive');
		$buttonStoryBoard.removeClass('buttonFooterActive');
		$buttonFeatures.removeClass('buttonFooterActive');
		$buttonTechStack.removeClass('buttonFooterActive');
		$buttonContact.removeClass('buttonFooterActive');

		button.addClass('buttonFooterActive');
	};

	initializeTestStoryBoardPage = function(history) {
		console.log("initializeTestStoryBoardPage");
		var new_pos_y = null;
		stickyNoteOptions.notes.length = 0; //empty out notes array
		$("body").empty();		
		initElements();
		initializeLandingPage(false,true);
		$divLeft.empty();		
		$sectionStoryBoard.append($pStoryBoardHeading);
		$sectionStoryBoard.append($pStoryBoardSubheading);
		$sectionStoryBoard.append($pStoryBoard);
		$sectionStoryBoard.append($divStickyNote);
		$divLeft.append($sectionStoryBoard);
		$("body").prepend($divLeft);
		stickyNoteOptions.notes.push(makeNote(
			0, 
			'Testing: One Two Three Four Five Six ...',
			note.pos_y,
			note.pos_x
		));
		$("#divStickyNote").stickyNotes(stickyNoteOptions);
		makeFooterButtonActive($buttonStoryBoard);
		//registerStoryBoardPageEvents();
		updateHistory(history);
	};

	initializeFeaturesPage = function(history) {
		console.log("initializeFeaturesPage");
		$("body").empty();		
		initElements();
		initializeLandingPage(false,true);
		$divLeft.empty();		
		$sectionFeatures.append($pFeaturesHeading);
		$sectionFeatures.append($pFeatures);
		$divLeft.append($sectionFeatures);
		$("body").prepend($divLeft);
		makeFooterButtonActive($buttonFeatures);
		//registerFeaturePageEvents();
		updateHistory(history);
	};

	initializeTechStackPage = function(history) {
		console.log("initializeTechStackPage");
		$("body").empty();		
		initElements();
		initializeLandingPage(false,true);
		$divLeft.empty();		
		$sectionTechStack.append($pTechStackHeading);
		$sectionTechStack.append($pTechStack);
		$divLeft.append($sectionTechStack);
		$("body").prepend($divLeft);
		makeFooterButtonActive($buttonTechStack);
		//registerFeaturePageEvents();
		updateHistory(history);
	};

	enforceMaxTodos = function() {
		console.log('enforceMaxTodos');
		numTodos = todosList.length + completedTodosList.length;
		console.log('numTodos=' + numTodos);
		if (numTodos >= maxTodos) {
			$('#inputTodo').attr('disabled', true);
			$('#labelNumTodos').css({
				'color':'#f00'
			});
		} else {
			$('#inputTodo').attr('disabled', false);
			$("#inputTodo").focus();
			$('#labelNumTodos').css({
				'color':'#000'
			});			
			
		};
		$('#labelNumTodos').text(numTodos + '/' + maxTodos);
		//$sectionTodoInput.find('label').remove();
		//$sectionTodoInput.append($labelNumTodos);
	};

	noteEdited = function(note) {
		console.log("Edited note with id " + note.id + ", new text is: " + note.text);
	};

	noteCreated = function(note) {
		console.log("Created note with id " + note.id + ", text is: " + note.text);
	};
	
	noteDeleted = function(note) {
		console.log("Deleted note with id " + note.id + ", text is: " + note.text);
	};

	noteMoved = function(note) {
		console.log("Moved note with id " + note.id + ", text is: " + note.text);
		var 
			nearest_x,
			nearest_y,
			nearest;
		nearest = findNearest(note);
		if (nearest) {
			//console.log('processing nearest ' + 'id: ' + nearest.id + ' text: ' + nearest.text);
			//$('#note-'+note.id).find('textarea').css({'background':'#aaa'});
			//$('#note-'+note.id).find('textarea').css({'color':'#cba'});
			//$('#note-'+note.id).find('p').css({'background-color':'#abc'});
		};
	};

	noteMoving = function(note) {
		console.log("Moving note with id " + note.id + ", text is: " + note.text);
		var	nearest  = findNearest(note);
		if (nearest) {
			console.log('processing nearest ' + 'id: ' + nearest.id + ' text: ' + nearest.text);
			//$('#note-'+note.id).find('textarea').addClass('foundTarget');
			$('#p-note-'+note.id).addClass('foundTarget');
			//$('#note-'+note.id).addClass('foundTarget');
			//$('#note-'+note.id).parent().find('.background').addClass('foundTarget');
		} else {
			//$('#note-'+note.id).find('textarea').removeClass('foundTarget');
			$('#p-note-'+note.id).removeClass('foundTarget');
			//$('#note-'+note.id).removeClass('foundTarget');
		};
	};

	noteResized = function(note) {
		console.log("Resized note with id " + note.id + ", text is: " + note.text);
	};					
		
	findNearest = function(note) { 
		console.log('findNearest');
		var match = null;
		stickyNoteOptions.notes.forEach(function(candidate){
			if ((Math.abs(note.pos_x - candidate.pos_x) < notesMoveTargetAccuracy) && (Math.abs(note.pos_y - candidate.pos_y) < notesMoveTargetAccuracy)) {
				if (note.id !== candidate.id) { //don't match the note being moved
					match = candidate;
					console.log('found nearest ' + 'id: ' + candidate.id + ' text: ' + candidate.text);
				};
			};
		});		
		if (match === null) {
			console.log('did not find nearest');
			return false;				
		} else {
			return match;
		};
	};

	getCookies();	
	initializeLandingPage(true,true);
	getPhotos();
	
	return {
		noteMoved: noteMoved,
		noteMoving: noteMoving
	};

//adding these round brackets at the end, below, turns the function declaration into a function expression 
//the result of which is stored in the variable todos as a closure created by the returned function noteMoved 
//accessed from the sticky note jQuery plugin using the syntax todos.noteMoved()
//-what causes a reference to the variable todos to be retained? see Mikowski page 54
//-what's the difference between (a) and (b)? see ppt or http://benalman.com/news/2010/11/immediately-invoked-function-expression/
//	(a)
//		var a = function foo() {}();
//	(b)
//		(function bar() {})(...);	
//
//option (a) seems to work fine if i hard code the callback in the jquery plugin
//passing in the callback to the jquery plugin as part of options doesn't seem to work no matter what i try
}(); 
  
//Start app once DOM is ready
$(todos);
