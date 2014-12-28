$( document ).ready(function() {
  console.log("ready");
  loadPageIntoElement("Copenhagen", "#page1");
  loadPageIntoElement("Amadeus", "#page2");
});

function loadPageIntoElement(page, element) {
	$.ajax({
	    url : "http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?&continue=&page=" + page,
	    data: {
	    	format: 'json'
	    },
	    dataType: 'jsonp',
	    success : function(result){
	        console.log("success");
	    }
	})
	.done(function(data) {
		console.log("injecting into " + element);
		console.log(data);
		$( element + " > .pre-content > h1" ).append( data.parse.displaytitle );
		$( element + " > .content" ).append( data.parse.text['*'] );
	});  
}