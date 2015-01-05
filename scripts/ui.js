var movingTooltip;
var movingTooltipPointer;
var movingTooltipFinalContent;
var movingTooltipTempContent;
var header;
var articleIconsHost;
var hoveredElements = 0;

$( document ).ready(function() {
	movingTooltip = $('#moving-tooltip');
	movingTooltipFinalContent = $('#visible-tooltip span');
	movingTooltipTempContent = $('#hidden-tooltip span');
	movingTooltipPointer = $('#tooltip-pointer');
	header = $('.wikibrowser-header'); // TODO: make it an ID
	articleIconsHost = $('#wikibrowser-article-icons');
	setUpTooltips();
});

function setUpTooltips() {
	var elements = $(".wikibrowser-header .header-element");
	$.each(elements, function(index, element) {
		setUpTooltip($(element));
	});
}

function setUpTooltip(jElement) {
	jElement.hover(headerElementMouseEnter, headerElementMouseLeave);
}

function createHeaderElementForArticle(articleName) {
	// '_' -> ' ' for nice tooltip and simpler regex
	articleName = articleName.replace(/_/g, " ");
	// Remove &redirect=no
	if (articleName.indexOf('&') > -1) {
		articleName = articleName.substring(0, articleName.indexOf('&'));
	}
	// Remove #anchor
	if (articleName.indexOf('#') > -1) {
		articleName = articleName.substring(0, articleName.indexOf('#'));
	}	
	console.log("Hello and welcome: " + articleName);
	var $element = $("<a>", {
		target: "_blank",
		class: "header-element",
		alt: articleName
	})
	// Capture first letters of words
	var acronym = articleName.match(/\b([a-zA-Z])/g).join(''); 
	// Limit length of the acronym
	acronym = acronym.substring(0, 6);
	console.log("You shall be named: " + acronym);
	$element.html(acronym);
	setUpTooltip($element);
	articleIconsHost.append($element);
}

function headerElementMouseEnter() {
	hoveredElements++;

	var jElement = $(this);
	var newTooltipContent = jElement.attr('alt');

	// Before taking measurements, update tooltip's contents
	movingTooltipTempContent.html(newTooltipContent);

	var elementPosition = jElement.offset().left;
	var elementWidth = jElement.outerWidth(false);
	var tooltipWidth = movingTooltipTempContent.outerWidth(true);
	var screenWidth = header.width();
	//console.log(elementPosition +", "+ elementWidth +", "+ tooltipWidth+", "+ screenWidth);
	
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

	movingTooltip.stop().animate(
		{
			opacity: 1
		},
		{
			duration: 200,
			queue: false
		}
	);
	movingTooltipPointer.stop().animate(
		{
			opacity: 1
		},
		{
			duration: 200,
			queue: false
		}
	);
	movingTooltip.animate(
		{
			width: tooltipWidth,
			left: tooltipOffset
		},
		{
			duration: 400,
			queue: false
		}
	);
	movingTooltipPointer.animate(
	{
			left: targetPosition,
		},
		{
			duration: 400,
			queue: false
		}
	);	
	movingTooltipFinalContent.animate(
		{ 
			opacity: '0'
		},
		{
			duration: 200,
			queue: false,
		 	always: function() {
		 		movingTooltipFinalContent.animate(
		 			{
		 				opacity: '1'
		 			},
		 			{
		 				duration: 200,
		 				queue: false
		 			}
		 		);
		 		movingTooltipFinalContent.html(newTooltipContent);
		 	}
		}
	);
}

function headerElementMouseLeave() {
	hoveredElements--;
	if (hoveredElements == 0) {
		movingTooltip.stop().animate(
			{
				opacity: 0
			},
			{
 				duration: 200,
 				queue: false
			}
		);
		movingTooltipPointer.stop().animate(
			{
				opacity: 0
			},
			{
 				duration: 200,
 				queue: false
			}
		);
 		movingTooltipFinalContent.stop().animate(
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