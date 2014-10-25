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
    //Set constants		
		url = "https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=?",
		tag = "&tags=nature",
    
		//Declare all other module scope variables
		//jQuery
		$imgElement = $("<img>"),
		$todosList = [],
		$todosStr,
		$checkboxElement,
		$labelElement,
		$todoDiv,
		
		//Regular
		todoStr,
		idInt,
		sequenceInt=0,
		
		//Module scope function names
		addTodo,
		printTodos,
		removeFromTodos,
		getPhotos;
		
	addTodo = function() {
		var $newTodo;
		if ($(".todoInput input").val() !== "") {
			todoStr = $(".todoInput input").val();
			
			$todoDiv = $("<div></div>");
			$todoDiv.attr('id',sequenceInt);
			
			$pElement = $("<p>");
			
			$checkboxElement = $("<input type='checkbox'>");
			
			$labelElement = $("<label>");
			$labelElement.text(" " + todoStr);
			
			$todoDiv.hide();
			
			$todoDiv.append($checkboxElement);
			$todoDiv.append($labelElement);
			$(".todos").append($todoDiv);

			$todoDiv.fadeIn();
			
			$(".todoInput input").val("");
			
			$todosList.push($todoDiv);
			console.log("todos array size = " + $todosList.length);
			printTodos();
			sequenceInt = sequenceInt + 1;
		}
	};
	
	printTodos = function() {
		$todosStr = "";
		$todosList.forEach(function(todo_div){
			$todosStr += todo_div.find("label").text() + ",";
		});
		console.log("todos:"+$todosStr);
	};
	
	removeFromTodos = function(id_int) {
		var 
			array_index = -1,
			remove_index = -1;
		console.log("removing id: " + id_int);
		$todosList.forEach(function(todo_div) {
			array_index++;
			if (todo_div.attr("id") === id_int) {
				remove_index = array_index;
				console.log("array index to remove: " + remove_index);
			}
		});
		$todosList.splice(remove_index,1);
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
				$imgElement.hide();
				$imgElement.attr("src", flickrResponse.items[photo_index].media.m);
				$("main .photos").append($imgElement);
				$imgElement.fadeIn();
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
		
	getPhotos();
	
	//Event handlers
  $(".todoInput button").on("click", function(event){
		addTodo();
		$(".todoInput input").focus();
  });
  
  $(".todoInput input").on("keypress", function(event){
		if (event.keyCode === 13) {
			addTodo();
			$(".todoInput input").focus();
		}
	});
  
  $(".todos").on('change', 'input[type=checkbox]', function(event){
		idInt = $(event.target).parent().attr("id");
		$(event.target).parent().fadeOut().remove();
		removeFromTodos(idInt);
		printTodos();		
		$(".todoInput input").focus();
	});
  
};	
  
//Start app once DOM is ready
$(todos);
