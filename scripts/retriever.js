var pageIndex = 0;

$( document ).ready(function() {
  setUpSearch();
});

function addPage(previousPage) {
	var pageId = "page" + pageIndex++;

	var tempContainer = document.createElement("div");
	tempContainer.innerHtml = 
'			<div class="wikibrowser-page-host wikibrowser-page-shadow" id="' + pageId + '">' +
'				<div class="wikibrowser-page ps-container ps-active-y">'+
'					<div class="pre-content">'+
'						<h1 id="section_0"></h1>'+
'					</div>'+
'					<div id="content" class="content"></div>'+
'				</div>'+
'			</div>';

	// Add page to the end of wikibrowser-host's children, or after specified element
	if (typeof previousPage === 'undefined') {
		$(".wikibrowser-host").append(tempContainer.innerHtml);
	}
	else {
		previousPage.after(tempContainer.innerHtml);
	}

	// Move the search page to the very right. Do it before we calculate where to scroll.
	resetSearch();

	// Scroll to reveal the new pane
	var newPageOffset = $("#" + pageId).offset().left;
	var offsetDelta = $(".wikibrowser-host").scrollLeft();
	// Subtract 600 to also show page to the left, if the view area is large enough
	if ($(".wikibrowser-host").width() > 1200) {
		offsetDelta -= 600;
	}
	$(".wikibrowser-host").animate({scrollLeft: offsetDelta + newPageOffset}, 400);

	return pageId;
}

function setUpSearch() {
	var searchBox = $("#searchPage input");
	searchBox.keyup(function(event) {
		if (event.keyCode == 13) {
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
	$( "#searchPageHost" ).perfectScrollbar({
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
			$( "#" + element + " > .wikibrowser-page > .content" ).append( data.error.info );
		}
		else {
			$( "#" + element + " > .pre-content > h1" ).append( data.parse.displaytitle );
			$( "#" + element + " > .wikibrowser-page > .content" ).append( data.parse.text['*'] );
			$( "#" + element + " > .wikibrowser-page > .content a").each(fixHyperlink);
			$( "#" + element + " > .wikibrowser-page").perfectScrollbar({
				wheelSpeed: 3
			});
		}
	});  
}

function fixHyperlink(index, element)
{
	var jElement = $(element);
	var address = jElement.attr('href');
	if (address.substring(0, 6) === '/wiki/')
	{
		jElement.attr('href', "http://en.wikipedia.org" + address);
		if (address.substring(0, 11) !== '/wiki/File:')
		{
			jElement.on('click', function() {
				var parentPageHost = jElement.closest('.wikibrowser-page-host');
				loadPageIntoElement(address.substring(6), addPage(parentPageHost));
				return false; // prevent going to href (wikipedia)
			});
		}
	}
	if (address.substring(0, 19) === '/w/index.php?title=') {
		jElement.attr('href', "http://en.wikipedia.org" + address);
		jElement.on('click', function() {
			var parentPageHost = jElement.closest('.wikibrowser-page-host');
			loadPageIntoElement(address.substring(19), addPage(parentPageHost));
			return false; // prevent going to href (wikipedia)
		})
	}
	if (address.substring(0, 1) !== '#')
	{
		jElement.attr('target', "_blank");
	}
}

function goToArticle(query) {
	results = getSearchResults(query, function(results) {
		if (verifyResults(query, results)) {
			var bestMatch = results.query.search[0];
			loadArticle(bestMatch.title);
			loadPageIntoElement(bestMatch.title, addPage($('#searchPageHost')));
		}
	});
}

function searchArticle(query) {
	var results = getSearchResults(query, function(results) {
		if (verifyResults(query, results)) {
			$('.wikibrowser-search-results-title').html('Search results for <em>' + query + '</em>:');
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
		}
	}); 	
}

function verifyResults(query, results) {
	if (typeof results.query.search === 'undefined' || results.query.searchinfo.totalhits === 0)
	{
		$('.wikibrowser-search-results-title').html('There are no search results for <em>' + query + '</em>.');
		console.log("WTF1");
		if (typeof results.query.searchinfo.suggestion !== 'undefined') {
			console.log("WTF2");
			$('.wikibrowser-search-results-title').append(' <br />Did you mean <a class="wikibrowser-search-suggestion">' + results.query.searchinfo.suggestion + '</a>?');
			// When user clicks on the suggestion, we're automatically searching:
			console.log("Registering suggestion " + results.query.searchinfo.suggestion);
			$('.wikibrowser-search-results-title .wikibrowser-search-suggestion').on('click', function() {
				console.log("Clicked on suggestion " + results.query.searchinfo.suggestion);
				$('#searchPage input').val(results.query.searchinfo.suggestion);
				searchArticle(results.query.searchinfo.suggestion);
			})
		}
		$('.wikibrowser-search-results-title').show();
		$('.wikibrowser-search-results').hide();
		return false;
	}
	else {
		return true;
	}
}

function loadArticle(articleName) {
	// See https://stackoverflow.com/questions/9638361/how-can-i-pass-a-parameter-to-a-function-without-it-running-right-away
	return function() {
		loadPageIntoElement(articleName, addPage($('#searchPageHost')));
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

function resetSearch() {
	$('.wikibrowser-search-results-title').hide();
	$('.wikibrowser-search-results').hide();
	$('#searchPage input').val("");
	// Moves the #searchPageHost to the far right.
	$(".wikibrowser-host").append($("#searchPageHost"));
}