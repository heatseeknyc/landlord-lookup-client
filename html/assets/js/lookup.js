(function() {

    // Namespace for all globals specific to the Landlord Lookup application. 
    lookup = {};
    lookup.version = '006a';
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

    var _service = {
        // 'hybrid':'http://' + window.location.hostname
        // 'hybrid':'http://lookup.heatseek.org'
        'hybrid':'http://localhost:8081',
    };

    lookup.service = _service; 

})();


