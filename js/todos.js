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

//Module /main/
//
var main = function() {
  "use strict";
  
  //Module scope variables
  var
    //Set constants
		url = "https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=?",
		tag = "&tags=nature",
    //Declare all other module scope variables
	
		$img = $("<img>"),
				
		sleep = function (milliseconds) {
			console.log("Start sleeping");
			var start = new Date().getTime();
			for (var i = 0; i < 1e7; i++) {
				if ((new Date().getTime() - start) > milliseconds){
					break;
				}
			}
			console.log("End sleeping");
		},
		
		addTodo = function() {
			var $newTodo;
			if ($(".todoInput input").val() !== "") {
				$newTodo = $("<p>").text($(".todoInput input").val());
				$newTodo.hide();
				$(".todos").append($newTodo);
				$newTodo.fadeIn();
				$(".todoInput input").val("");
			}
		},
		
		getPhotos = function(todo) {
			if (todo != null) {
				tag = "&tags=" + todo;
			};
			url = url + tag;
			$.getJSON(url, function(flickrResponse) {
				var size = flickrResponse.items.length;
				console.log("Size = " + size);
				console.log(JSON.stringify(flickrResponse));
				var displayPhoto = function (photoIndex){
					$img.hide();
					$img.attr("src", flickrResponse.items[photoIndex].media.m);
					$("main .photos").append($img);
					$img.fadeIn();
					setTimeout(function() {
						photoIndex = photoIndex + 1;
						if (photoIndex > size - 1) {
							photoIndex = 0;
							console.log("Reset index");
						}
						displayPhoto(photoIndex);
					}, 2000);
				};
				displayPhoto(0);		
			});
		};
		
	console.log("DOM is ready!");
	getPhotos();
	
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
  
};	
  
//Start app once DOM is ready
$(document).ready(main);
