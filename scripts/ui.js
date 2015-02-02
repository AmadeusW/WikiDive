var $movingTooltip;
var $movingTooltipPointer;
var $movingTooltipFinalContent;
var $movingTooltipTempContent;
var $header;
var $articleIconsHost;
var $wikiBrowserHost;
var hoveredElements = 0;
var pageWidth = 700;

$( document ).ready(function() {
	$movingTooltip = $('#moving-tooltip');
	$movingTooltipFinalContent = $('#visible-tooltip span');
	$movingTooltipTempContent = $('#hidden-tooltip span');
	$movingTooltipPointer = $('#tooltip-pointer');
	$header = $('#wikibrowser-header');
	$articleIconsHost = $('#wikibrowser-article-icons');
	$wikiBrowserHost = $('#wikibrowser-host');
	setUpInitialMouseEvents();
});

function setUpInitialMouseEvents() {
	var $elements = $("#wikibrowser-header .header-element");
	$.each($elements, function(index, element) {
		setUpMouseEvents($(element));
	});
}

function setUpMouseEvents($element) {
	$element.hover(headerElementMouseEnter, headerElementMouseLeave);
	$element.click(headerElementClick);
}

function createHeaderElementForArticle(articleName, pageID, $previousPage) {

	// '_' -> ' ' for nice tooltip and simpler regex
	articleName = articleName.replace(/_/g, " ");	

	// Capture first letters of words
	var acronym = articleName.match(/\b([a-zA-Z])/g).join(''); 
	// Limit length of the acronym
	acronym = acronym.substring(0, 6);

	// Create the header element
	var $element = $("<a>", {
		target: "_blank",
		class: "header-element",
		id: "nav_" + pageID,
		alt: articleName
	})
	$element.html(acronym);
	$element.data("associated-page", pageID);
	setUpMouseEvents($element);

	// Place the header element either at the end of the list,
	// or after the specified element (if it's valid)
	if (typeof $previousPage === 'undefined' || $previousPage.attr('id') === 'searchPageHost') {
		$articleIconsHost.append($element);
	}
	else {
		var previousPageID = $previousPage.attr('id');
		$previousButton = $('#nav_' + previousPageID);
		$previousButton.after($element);
	}	
}

function headerElementMouseEnter() {
	hoveredElements++;

	var $element = $(this);
	var newTooltipContent = $element.attr('alt');

	// Before taking measurements, update tooltip's contents
	$movingTooltipTempContent.html(newTooltipContent);

	var elementPosition = $element.offset().left;
	var elementWidth = $element.outerWidth(false);
	var tooltipWidth = $movingTooltipTempContent.outerWidth(true);
	var screenWidth = $header.width();
	
	var targetPosition = elementPosition + elementWidth * 0.5 - 6;
	var tooltipOffset = targetPosition - tooltipWidth * 0.5 - 10;
	// Movement is bound on the right side
	if (targetPosition + tooltipWidth * 0.5 > screenWidth - 30)
	{
		tooltipOffset = screenWidth - tooltipWidth - 30;
	}
	// Movement is bound on the left side
	if (targetPosition - tooltipWidth * 0.5 < 30)
	{
		tooltipOffset = 30;
	}

	$movingTooltip.stop().animate(
		{
			opacity: 1,
			height: 27
		},
		{
			duration: 200,
			queue: false
		}
	);
	$movingTooltipPointer.stop().animate(
		{
			opacity: 1
		},
		{
			duration: 200,
			queue: false
		}
	);
	$movingTooltip.animate(
		{
			width: tooltipWidth,
			left: tooltipOffset
		},
		{
			duration: 400,
			queue: false
		}
	);
	$movingTooltipPointer.animate(
	{
			left: targetPosition,
		},
		{
			duration: 400,
			queue: false
		}
	);	
	$movingTooltipFinalContent.animate(
		{ 
			opacity: '0'
		},
		{
			duration: 200,
			queue: false,
		 	always: function() {
		 		$movingTooltipFinalContent.animate(
		 			{
		 				opacity: '1'
		 			},
		 			{
		 				duration: 200,
		 				queue: false
		 			}
		 		);
		 		$movingTooltipFinalContent.html(newTooltipContent);
		 	}
		}
	);
}

function headerElementMouseLeave() {
	hoveredElements--;
	if (hoveredElements == 0) {
		$movingTooltip.stop().animate(
			{
				opacity: 0,
				height: 0
			},
			{
 				duration: 200,
 				queue: false
			}
		);
		$movingTooltipPointer.stop().animate(
			{
				opacity: 0
			},
			{
 				duration: 200,
 				queue: false
			}
		);
 		$movingTooltipFinalContent.stop().animate(
 			{
 				opacity: '0'
 			},
 			{
 				duration: 200,
 				queue: false
 			}
 		);		
	}
}

function headerElementClick() {
	var $element = $(this);
	var pageId = $element.data("associated-page");
	if (typeof pageId !== 'undefined')
	{
		scrollToPageId(pageId);
	}
}

function scrollToPageId(pageId) {
	var targetPageOffset = $("#" + pageId).offset().left;
	var offsetDelta = $wikiBrowserHost.scrollLeft();
	// Center the target page
	var freeSpace = $wikiBrowserHost.width() - pageWidth;
	if (freeSpace > 0) {

		offsetDelta -= freeSpace * 0.5;
	}
	$wikiBrowserHost.animate({scrollLeft: offsetDelta + targetPageOffset}, 400);
}
