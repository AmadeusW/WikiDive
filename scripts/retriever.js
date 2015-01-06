var pageIndex = 0;
var articleTable = [];

$( document ).ready(function() {
  setUpSearch();
});

function createColumnAfter($previousPage, pageId) {
	var tempContainer = document.createElement("div");
	tempContainer.innerHtml = 
'			<div class="wikibrowser-page-host wikibrowser-page-shadow" id="' + pageId + '">' +
'				<div class="wikibrowser-page-header">' +
'					<h2></h2>' +
'				</div>'+
'				<div class="wikibrowser-page ps-container ps-active-y">'+
'					<div id="content" class="content"></div>'+
'				</div>'+
'			</div>';

	// Add page to the end of wikibrowser-host's children, or after specified element
	if (typeof previousPage === 'undefined') {
		$("#wikibrowser-host").append(tempContainer.innerHtml);
	}
	else {
		$previousPage.after(tempContainer.innerHtml);
	}

	// Move the search page to the very right. Do it before we calculate where to scroll.
	resetSearch();

	scrollToPageId(pageId);

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
	$( "#searchPage" ).perfectScrollbar({
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
			$( "#" + element + " > .wikibrowser-page-header > h2" ).append( data.error.code );
			$( "#" + element + " .wikibrowser-page > .content" ).append( data.error.info );
		}
		else {
			$( "#" + element + " > .wikibrowser-page-header > h2" ).append( data.parse.displaytitle );
			$( "#" + element + " .wikibrowser-page > .content" ).append( data.parse.text['*'] );
			$( "#" + element + " .wikibrowser-page > .content a").each(fixHyperlink);
			$( "#" + element + " .wikibrowser-page").perfectScrollbar({
				wheelSpeed: 3
			});
		}
	});  
}

function fixHyperlink(index, element)
{
	var $element = $(element);
	var address = $element.attr('href');
	if (address.substring(0, 6) === '/wiki/')
	{
		$element.attr('href', "http://en.wikipedia.org" + address);
		if (address.substring(0, 11) !== '/wiki/File:')
		{
			$element.on('click', function() {
				var $parentPageHost = $element.closest('.wikibrowser-page-host');
				loadArticle(address.substring(6), $parentPageHost);
				return false; // prevent going to href (wikipedia)
			});
		}
	}
	if (address.substring(0, 19) === '/w/index.php?title=') {
		$element.attr('href', "http://en.wikipedia.org" + address);
		$element.on('click', function() {
			var $parentPageHost = $element.closest('.wikibrowser-page-host');
			loadArticle(address.substring(19), $parentPageHost);
			return false; // prevent going to href (wikipedia)
		})
	}
	if (address.substring(0, 1) !== '#')
	{
		$element.attr('target', "_blank");
	}
}

function goToArticle(query) {
	results = getSearchResults(query, function(results) {
		if (verifyResults(query, results)) {
			var bestMatch = results.query.search[0];
			loadArticle(bestMatch.title, $('#searchPageHost'));
		}
	});
}

function searchArticle(query) {
	var results = getSearchResults(query, function(results) {
		if (verifyResults(query, results)) {
			$('.wikibrowser-search-results-title').html('Search results for <em>' + query + '</em>:');
			$('.wikibrowser-search-results').html(""); // Remove existing results

			for (var index in results.query.search) {
				var resultItem = document.createElement("li");
				var displayTitle = results.query.search[index].titlesnippet !== "" ? results.query.search[index].titlesnippet : results.query.search[index].title;
				$(resultItem).html(displayTitle);
				$(resultItem).on('click', loadArticleHandler(results.query.search[index].title));
				$('.wikibrowser-search-results').append(resultItem);
			}
			/* If not visible, reveal the results */
			$('.wikibrowser-search-results-title').show();
			$('.wikibrowser-search-results').show();
		}
	}); 	
}

function verifyResults(query, results) {
	if (typeof results.query.search === 'undefined' || results.query.searchinfo.totalhits === 0) {
		$('.wikibrowser-search-results-title').html('There are no search results for <em>' + query + '</em>.');
		if (typeof results.query.searchinfo.suggestion !== 'undefined') {
			$('.wikibrowser-search-results-title').append(' <br />Did you mean <a class="wikibrowser-search-suggestion">' + results.query.searchinfo.suggestion + '</a>?');
			// When user clicks on the suggestion, we're automatically searching:
			$('.wikibrowser-search-results-title .wikibrowser-search-suggestion').on('click', function() {
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

/**
 * Handler that calls loadArticle and places the new function after the search results.
 * @param {string} articleName - title of the Wikipedia article to load
 */
function loadArticleHandler(articleName) {
	// See https://stackoverflow.com/questions/9638361/how-can-i-pass-a-parameter-to-a-function-without-it-running-right-away
	return function() {
		loadArticle(articleName, $('#searchPageHost'));
	};
}

/**
 * Check if article has been loaded. If not, loads the article and places it after specified article
 * @param {string} articleName - title of the Wikipedia article to load
 * @param {string} loadLocation - ID of element after which the article will be rendered.
 */
function loadArticle(articleName, $previousElement) {
	if (!isArticleLoaded(articleName)) {
		var pageId = "page" + pageIndex++;
		articleTable[articleName] = pageId;
		createHeaderElementForArticle(articleName, pageId);
		loadPageIntoElement(articleName, createColumnAfter($previousElement, pageId));
	}
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
	$("#wikibrowser-host").append($("#searchPageHost"));
}

function isArticleLoaded(articleName) {
	return articleTable.indexOf(articleName) > -1;
}