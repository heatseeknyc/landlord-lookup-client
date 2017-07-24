This is one of 3 project repos for the HeatSeek Landlord Lookup portal, currently up and running under:

    https://lookup.heatseek.org/

The repo represents the web client; the other two main repos of interest are for the data pipeline and REST gateway, respectively:

- https://github.com/heatseeknyc/landlord-lookup-pipeline
- https://github.com/heatseeknyc/landlord-lookup-gateway

Design
------

The design at present is, by intent, extremely simple.  

Basically it's just a very SPA (single-page application) that knows how to send simple GET requests to the REST gateway, at one of two endpoints::

  /lookup/<query>
  /buildings/<keyarg>
  /contats/<keyarg>

That's it.  There's no "model" per se, and hardly any view state to keep track of (other than a few objects represent what's on the map, in the ``lookup.view`` namespace).  The CSS "design" as such is also extremely simple -- just a basic responsive grid (which we haven't exhaustively tested, but seems to look OK on most common browsers / tablets).  Accordingly, it uses no frameworks beyond jQuery + Leaflet.js.


Mobile
------

Mobile design as such isn't really addressed.  Either it will look OK on your phone, or (most likely) it won't.  If the portal starts to attract wider interest, we might think about tuning it for mobile.  Until then we'll just leave well enough alone (and our codebase light and maintainable).


Installation
------------

Installation is also extremely simple; you just need to push the files out to the configured NGINX server root.  The following script will do that for you::

   bin/push-site.sh

The install for the REST gateway (on the same host) is a bit more involved, and described in the repo for that comonent.
