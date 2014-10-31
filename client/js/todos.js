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
		$buttonLogin,
		$labelOr,
		$buttonRegister,
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
		
		//function names
		addTodo,
		printTodos,
		removeFromTodos,
		initialize,
		getPhotos;
		
	initialize = function() {
		//Create landing page elements
		$divLeft = $("<div class='left'></div>");
		
		$sectionUser = $("<section class='user'></section>");
		$buttonLogin = $("<button class='login'>Login</button>").prop('disabled', true);
		$labelOr = $("<label> or </label>");
		$buttonRegister = $("<button class='register'>Register</button>").prop('disabled', true);
		$sectionUser.append($buttonLogin);
		$sectionUser.append($labelOr);
		$sectionUser.append($buttonRegister);
		
		$sectionPreferences = $("<section class='preferences'></section>");
		$cbShowHistory = $("<input type='checkbox' class='cbShowHistory'>").prop('disabled', true);
		$labelShowHistory = $("<label class='labelShowHistory'> Show History (Completed ToDos)</label>");
		$sectionPreferences.append($cbShowHistory);
		$sectionPreferences.append($labelShowHistory);

		$sectionTodoInput = $("<section class='todoInput'></section>");
		$pAddTodo = $("<p class='app-title'>Add ToDo</p>");
		$inputTodo = $("<input type='text' id='inputTodo'>");
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
			+ "This is v0.1 of an all-JavaScript full-stack SPA POC using HTML5, CSS3, JavaScript, AJAX, JSON, Node.js & Mongo, "
			+ "deployed to the Heroku cloud PaaS (based on Salesforce.com and Amazon's AWS)."
			+ "</p>");
		$pAppTodosHeading = $("<p id='app-todos-heading'>ToDos for this ToDos app (pun intended!)</p>");
		$pAppTodos = $("<p id='app-todos'>" 
			+ "<li>Support a broader range of browsers"
			+	"<li>Improve responsive design"
			+	"<li>Skip images wider than 300 pixels"
			+	"<li>Add persistence (Mongo)"
			+	"<li>Add authentication and authorization"
			+	"<li>Show history of completed to-dos"
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
		console.log("completed todos:"+completedTodosStr);
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
			$(".todoInput input").focus();
		});
	};
		
	initialize();
	getPhotos();
	
	//Event handlers
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
  
};	
  
//Start app once DOM is ready
$(todos);
