WikiDive
========

**[Launch](http://amadeusw.github.io/WikiDive/)**

Click through Wikipedia articles. Indulge in *wikidiving* and satisfy your couriosity.

Each Wikipedia article opened in WikiDive opens linked articles in the same page, right next to each other.

The content comes from English Wikipedia and is licensed under [Creative Commons Attribution-ShareAlike license](http://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License).

How is it built?
---

All processing happens on the client side. Your web browser uses cross domain ajax request using [JSONP](http://en.wikipedia.org/wiki/JSONP) to fetch the Wikipedia article. The article is then styled with Wikipedia's mobile stylesheet.

Links to other Wikipedia articles load them just to the right of the article that you're reading.
Links to external resources open in a new tab. jQuery is used to modify the links.

Requirements
---
The website is using [CSS Flex layout](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) and jQuery 2.x

It works with recent browsers. IE 9 and less are not supported.

To do *collaborations are welcome :)*
---
  * Bookmarks
  * Removing and reogranizing articles
  * Support for other languages than English
  * jsfiddle.net - like saving and restoring
  * Fix anchor tags which are the same on multiple articles
  * Refactoring - this is my *jQuery learning project* and there are many aspects to improve.
  * Mobile support

Inspiration
---

The project is inspired by [Code Connect](http://codeconnect.io/), a developer tool and extension to Microsoft Visual Studio.

Code Connect represents .NET code on a function-by-function basis, allowing the developer to see at a glance relationships between functions to understand the code better, faster and easier.

Similarly, WikiBrowser allows readers to explore articles side by side, since consecutive articles are often continuations, clarifications or elaborations.
