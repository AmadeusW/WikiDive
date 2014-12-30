var pageIndex = 0;

$( document ).ready(function() {
  //loadPageIntoElement("JSONP", addPage());
  //loadPageIntoElement("Copenhagen", addPage());
  //addSearchPage();
  setUpSearch();
});

function addPage() {
	var pageId = "page" + pageIndex++;

	var tempContainer = document.createElement("div");
	tempContainer.innerHtml = 
'			<div class="wikibrowser-page-host wikibrowser-page-shadow">' +
'				<div class="wikibrowser-page ps-container ps-active-y" id="' + pageId + '">'+
'					<div class="pre-content">'+
'						<h1 id="section_0"></h1>'+
'					</div>'+
'					<div id="content" class="content"></div>'+
'				</div>'+
'			</div>';

	$(".wikibrowser-host").append(tempContainer.innerHtml);

	// Scroll to reveal the new pane
	var newPageOffset = $("#" + pageId).offset().left;
	$(".wikibrowser-host").animate({scrollLeft: newPageOffset}, 400);

	return pageId;
}

function addSearchPage() {
	var pageId = "page" + pageIndex++;

	var tempContainer = document.createElement("div");
	tempContainer.innerHtml = 
'			<div class="wikibrowser-page-host">' +
'				<div class="wikibrowser-page ps-container ps-active-y" id="' + pageId + '">'+
'					<div class="pre-content">'+
'						<h1 id="section_0"></h1>'+
'					</div>'+
'					<div id="content" class="content">'+
'                        <p><strong>Search</strong><br />'+
'                        <input type="text" placeholder="Coming soon"></input></p>'+
'                        <p>Other upcoming features:<br />'+
'                            <ul>'+
'                                <li>Close and rearrange articles</li>'+
'                                <li>Set bookmarks and leave notes</li>'+
'                                <li>Save, restore and share your layout</li>'+
'                            </ul>'+
'                        </p>'+
'                        <p><strong>How do I use this?</strong><br />'+
'                        Click on links in Wikipedia articles on the left. They will open new articles side by side!</p>'+
'                   </div>'+
'				</div>'+
'			</div>';

	$(".wikibrowser-host").append(tempContainer.innerHtml);

	return pageId;	
}

function loadPageIntoElement(page, element) {
	console.log('load page ' + page);
	$.ajax({
	    url : "http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?&continue=&page=" + page,
	    data: {
	    	format: 'json'
	    },
	    dataType: 'jsonp',
	    cache: 'true' // defaults to false for jsonp.	    
	})
	.done(function(data) {
		$( "#" + element + " > .pre-content > h1" ).append( data.parse.displaytitle );
		$( "#" + element + " > .content" ).append( data.parse.text['*'] );
		$( "#" + element + " > .content a").each(fixHyperlink);
		$( "#" + element ).perfectScrollbar({
			wheelSpeed: 3
		});
	});  
}

function fixHyperlink(index, element)
{
	var jElement = $(element);
	var address = jElement.attr('href');
	if (address.substring(0, 6) === '/wiki/')
	{
		jElement.attr('href', "http://en.wikipedia.org" + address);
		jElement.on('click', function() {
			loadPageIntoElement(address.substring(6), addPage());
			return false; // prevent going to href (wikipedia)
		})
	}
	if (address.substring(0, 1) !== '#')
	{
		jElement.attr('target', "_blank");
	}
}

function setUpSearch() {
	console.log("setUpSearch");
	var searchBox = $(".wikibrowser-search-content input");
	searchBox.keyup(function(event) {
		if (event.keyCode == 13) {
			console.log("enter");
			goToArticle(searchBox[0].value);
		}
	});
	var goButton = $(".wikibrowser-go-button");
	goButton.on('click', function() {
		goToArticle(searchBox[0].value);
	});	
	var searchButton = $(".wikibrowser-search-button");
	searchButton.on('click', function() {
		searchArticle(searchBox[0].value);
	});
}

function goToArticle(query) {
	console.log("goToArticle " + query);
	results = getSearchResults(query, function(results) {
		if (typeof results.query.search === 'undefined' || results.query.searchinfo.totalhits === 0)
		{
			$('.wikibrowser-search-results-title').html('There are no search results for <em>' + query + '</em>.');
			if (typeof results.query.searchinfo.suggestion !== 'undefined') {
				$('.wikibrowser-search-results-title').append(' <br />Did you mean <em>' + results.query.searchinfo.suggestion + '</em>?');
			}
			
		}
		console.log("Go to: ");
		var bestMatch = results.query.search[0];
		console.log(bestMatch);
		loadPageIntoElement(bestMatch.title, addPage());
	});
}

function searchArticle(query) {
	console.log("searchArticle " + query);
	var results = getSearchResults(query, function(results) {
		if (typeof results.query.search === 'undefined' || results.query.searchinfo.totalhits === 0)
		{
			$('.wikibrowser-search-results-title').html('There are no search results for <em>' + query + '</em>.');
			if (typeof results.query.searchinfo.suggestion !== 'undefined') {
				$('.wikibrowser-search-results-title').append(' <br />Did you mean <em>' + results.query.searchinfo.suggestion + '</em>?');
			}			
		}
		else
		{
			$('.wikibrowser-search-results-title').html('Search results for <em>' + query + '</em>:');
		}
		/* Remove existing results */
		$('.wikibrowser-search-results').html("");
		console.log("Received search results:");
		console.log(results.query.search);
		for (var index in results.query.search) {
			var resultItem = document.createElement("li");
			var displayTitle = results.query.search[index].titlesnippet !== "" ? results.query.search[index].titlesnippet : results.query.search[index].title;
			console.log(displayTitle);
			$(resultItem).html(displayTitle);
			console.log(resultItem);
			$('.wikibrowser-search-results').append(resultItem);
		}
		/* If not visible, reveal the results */
		$('.wikibrowser-search-results-title').show();
		$('.wikibrowser-search-results').show();		
	}); 	
}

function getSearchResults(query, callback) {
	console.log("getSearchResults " + query);
	$.ajax({
	    url : "http://en.wikipedia.org/w/api.php?action=query&list=search&srprop=titlesnippet|redirecttitle&format=json&callback=?&continue=&srsearch=" + query,
	    data: {
	    	format: 'json'
	    },
	    dataType: 'jsonp',
	})
	.done(callback);
}