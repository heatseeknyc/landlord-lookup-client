// Namespace for all globals specific to the Landlord Lookup application. 
var lookup = {};
lookup.version = '002b';
lookup.model = {}; 

// Application specific configuration.
lookup.config = {
    'debug': 2, 
    'google_autocomplete_active': true,
    'ajaxsetup': {
        'timeout': 3000
    }
};

lookup.service = {
  'hybrid':'http://' + window.location.hostname
  // 'hybrid':'http://lookup.heatseek.org'
  // 'hybrid':'http://localhost',
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

