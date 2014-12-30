var pageIndex = 0;

$( document ).ready(function() {
  addSearchPage();
});

function addPage(previousPage) {
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

	// Add page to the end of wikibrowser-host's children, or after specified element
	if (typeof previousPage === 'undefined') {
		console.log("addPage 1");
		$(".wikibrowser-host").append(tempContainer.innerHtml);
	}
	else {
		console.log("addPage 2");
		console.log(previousPage);
		previousPage.after(tempContainer.innerHtml);
	}
	// Scroll to reveal the new pane
	var newPageOffset = $("#" + pageId).offset().left;
	var offsetDelta = $(".wikibrowser-host").scrollLeft();
	$(".wikibrowser-host").animate({scrollLeft: offsetDelta + newPageOffset}, 400);

	return pageId;
}

function addSearchPage() {
	var tempContainer = document.createElement("div");
	tempContainer.innerHtml = 
'			<div class="wikibrowser-page-host">' +
'				<div class="wikibrowser-page ps-container ps-active-y" id="searchPage">'+
'					<div class="wikibrowser-search-content">'+
'                        <p><input type="text" placeholder="Search"></input></p>'+
'                        <p>'+
'                        	<button class="wikibrowser-go-button">Go</button>'+
'                        	<button class="wikibrowser-search-button">Search...</button>'+
'                    	</p>'+
'                        <p class="wikibrowser-search-results-title"></p>'+
'                        <ul class="wikibrowser-search-results">'+
'                        </ul>'+
'                   </div>'+
'				</div>'+
'			</div>';

	$(".wikibrowser-host").append(tempContainer.innerHtml);

	// Scroll to reveal the new pane
	var newPageOffset = $("#searchPage").offset().left;
	$(".wikibrowser-host").animate({scrollLeft: newPageOffset}, 400);	

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
	$( ".wikibrowser-search-content" ).parent().perfectScrollbar({
		wheelSpeed: 3
	});	
}

function loadPageIntoElement(page, element) {
	$.ajax({
	    url : "http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?&continue=&page=" + page,
	    data: {
	    	format: 'json'
	    },
	    dataType: 'jsonp',
	    cache: 'true' // defaults to false for jsonp.	    
	})
	.done(function(data) {
		if (typeof data.error !== 'undefined') {
			// TODO: Make it user friendly.
			$( "#" + element + " > .pre-content > h1" ).append( data.error.code );
			$( "#" + element + " > .content" ).append( data.error.info );
		}
		else {
			$( "#" + element + " > .pre-content > h1" ).append( data.parse.displaytitle );
			$( "#" + element + " > .content" ).append( data.parse.text['*'] );
			$( "#" + element + " > .content a").each(fixHyperlink);
			$( "#" + element ).perfectScrollbar({
				wheelSpeed: 3
			});
		}
	});  
}

function fixHyperlink(index, element)
{
	var jElement = $(element);
	var address = jElement.attr('href');
	if (address.substring(0, 6) === '/wiki/' && address.substring(0, 11) !== '/wiki/File:')
	{
		jElement.attr('href', "http://en.wikipedia.org" + address);
		jElement.on('click', function() {
			var parentPageHost = jElement.closest('.wikibrowser-page-host');
			loadPageIntoElement(address.substring(6), addPage(parentPageHost));
			return false; // prevent going to href (wikipedia)
		})
	}
	if (address.substring(0, 1) !== '#')
	{
		jElement.attr('target', "_blank");
	}
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
		var bestMatch = results.query.search[0];
		loadArticle(bestMatch.title);
		loadPageIntoElement(bestMatch.title, addPage($('#searchPage').closest('.wikibrowser-page-host')));
	});
}

function searchArticle(query) {
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
		for (var index in results.query.search) {
			var resultItem = document.createElement("li");
			var displayTitle = results.query.search[index].titlesnippet !== "" ? results.query.search[index].titlesnippet : results.query.search[index].title;
			$(resultItem).html(displayTitle);
			$(resultItem).on('click', loadArticle(results.query.search[index].title));
			$('.wikibrowser-search-results').append(resultItem);
		}
		/* If not visible, reveal the results */
		$('.wikibrowser-search-results-title').show();
		$('.wikibrowser-search-results').show();		
	}); 	
}

function loadArticle(articleName) {
	// See https://stackoverflow.com/questions/9638361/how-can-i-pass-a-parameter-to-a-function-without-it-running-right-away
	return function() {
		loadPageIntoElement(articleName, addPage($('#searchPage').closest('.wikibrowser-page-host')));
	};
}

function getSearchResults(query, callback) {
	// See: http://www.mediawiki.org/wiki/API:Search
	$.ajax({
	    url : "http://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=7&srprop=titlesnippet|redirecttitle&format=json&callback=?&continue=&srsearch=" + query,
	    data: {
	    	format: 'json'
	    },
	    dataType: 'jsonp',
	})
	.done(callback);
}