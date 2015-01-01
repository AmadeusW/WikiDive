var movingTooltip;

$( document ).ready(function() {
	movingTooltip = $('#moving-tooltip');
	setUpTooltips();
});

function setUpTooltips() {
	console.log("SetUpTooltips");
	var elements = $(".wikibrowser-header .header-element");
	$.each(elements, hookUpTooltip);
}

function hookUpTooltip(index, element) {
	var jElement = $(element);
	console.log(jElement);
	console.log(jElement.attr('alt'));
	var xPosition = jElement.offset().left;
	movingTooltip.html(jElement.attr('alt'));
	moveTooltip(xPosition);
}

function moveTooltip(destination) {
	console.log("Moving tooltip to " + destination);
	movingTooltip.animate({left: destination}, 100);
	//$('#moving-tooltip').animate({scrollLeft: destination, opacity: '1'}, 100);
}