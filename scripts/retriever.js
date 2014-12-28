$( document ).ready(function() {
  console.log("ready");
	$.ajax({
	    url : "http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=wikiData&continue=&page=Copenhagen",
	    data: {
	    	format: 'json'
	    },
	    dataType: 'jsonp',
	    success : function(result){
	        console.log("success");
	        console.log(result);
	    }
	})
	.done(function(data) {
		console.log("done");
		console.log(data);
		$( "#articleTitle" ).append( data.parse.displaytitle );
		$( "#results" ).append( data.parse.text['*'] );
	});  
});

wikiData = function(data) {
	alert("wikiData");
	console.log("wikiData");
	console.log(data);
	$( "#results" ).append( data.parse.text );
}