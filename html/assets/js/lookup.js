(function() {

    // Namespace for all globals specific to the Landlord Lookup application. 
    var lookup = {};
    lookup.version = '003a';
    lookup.model = {}; 

    // Application specific configuration.
    lookup.config = {
        'debug': 2, 
        'autocomplete': {
            'active': true,
            'bounds': false
        },
        'ajaxsetup': {
            'timeout': 5000
        }
    };

    lookup.service = {
        // 'hybrid':'http://' + window.location.hostname
        // 'hybrid':'http://lookup.heatseek.org'
        'hybrid':'http://localhost:8081',
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

