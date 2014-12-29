WikiBrowser
===========

Read Wikipedia articles side by side
This is a proof of concept prototype.

Roadmap
---
  * Search
  * Bookmarks
  * jsfiddle.net - like saving and restoring
  * Fix anchor tags which are the same on multiple articles

How it's built?
---

Everything happens on client side. Your web browser uses cross domain ajax request using [JSONP](http://en.wikipedia.org/wiki/JSONP) to fetch the Wikipedia article. The article is then styled with Wikipedia's mobile stylesheet.

Links to other Wikipedia articles load a new article to the right ~~of the one you're reading~~ of other articles (TODO).
Links to external resources open in a new tab.

Inspiration
---

The project is inspired by [Code Connect](http://codeconnect.io/), a developer tool and extension to Microsoft Visual Studio. Code Connect represents .NET code on a function-by-function basis, allowing the developer to see at a glance relationships between functions to understand the code better, faster and easier.
Similarly, WikiBrowser allows readers to explore articles side by side.
