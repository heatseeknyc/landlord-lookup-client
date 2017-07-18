(function() {

    // Namespace for all globals specific to the Landlord Lookup application. 
    lookup = {};
    lookup.version = '007a';
    lookup.model = {}

    // Application specific configuration.
    lookup.config = {
        'debug': 2,
        'autocomplete': {
            'active': true,
            'bounds': false
        },
        'ajaxsetup': {
            'timeout': 20000
        }
    };

    // Sets the debug level from a raw string argument (from a query
    // string, say).  If it doesn't parse, no action is taken.
    lookup.set_debug_level = function(x) {
        debug = parseInt(x);
        if (debug > 0) {
            lookup.config.debug = debug
            lookup.log(0,":: debug => "+debug)
        }
    };

    lookup.log = function(level,msg) {
        if (lookup.config.debug >= level)  {
            console.log(msg)
        }
    };

})();

// 
// A tiny little "service" layer which detrmined service URLs (curently just one),
// based on environment and config parameters 
//
// Could perhaps be a separate file, but that would just make for longer load times. 
// Let's at least put it in an enclosing scope for now - we can always move it to a 
// separte file later.
(function() {

    lookup.service = {};

    // deprecated
    var _service = {
        // 'hybrid':'http://' + window.location.hostname
        // 'hybrid':'http://lookup.heatseek.org'
        'hybrid':'http://localhost:8081',
    };

    var makeurl = function (hostname,port)  {
        url = 'http://'+hostname;
        if (port && port != 80)  { url += ':'+port }
        return url
    };

    // Determine our service URL based on where were are.
    // Basically it's just whatever the URL we're hosted on, with a cheap hack to 
    // slot in a port number if we're hosted locally.
    var resolve_hybrid = function() {
        var port = null;
        var hostname = window.location.hostname;
        if (hostname === 'localhost')  { port = 8081 };
        return makeurl(hostname,port);
    };

    // Must be called before accessing services
    lookup.service.initConf = function() {
        lookup.service.hybrid = resolve_hybrid();
    };

    // Config struct w/ brain-deed default (so if we forget to init, we won't 
    // reach any services but at least we won't get crazy syntax errors).
    lookup.service.hybrid = 'http://notset.org';

})();


