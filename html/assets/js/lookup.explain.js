/*
 * A "thin" layer for any kind of reasonably tricky client-side content generation  
 * that would be a bit too complex for our templating system.  Because templating systems
 * just aren't "smart" (and at the end of the day, you don't want them to be).
 *
 * What's key here is that all of these functions usually take some kind of high-level 
 * response object (if not the response itself, then one of its primary members), and 
 * return strings that can be passed directly into the template.  In particular, they
 * do not attempt any rendering (or any view manipulation) themselves.
 *
 * They also should (ideally) be designed to handle corner cases which aren't supposed
 * to occur, but which might or could occur in the UI (for example, being asked to describe
 * the rent stabilization status of a vacant lot), rather then crashing or simply 
 * returning null.
 */
(function() {

    var _explain = {}

    var _mapnull = function(x) {
        if (x === null)  { return '-'; }
        else { return x; }
    };

    // Provides a simple, plain-English description of what kind of a 
    // property this is.  Should probably be no more than 60 chars.
    _explain.describe_property = function(taxlot) {
    };

    // Provides a description of the rent stabilization status for this property,
    // appropriately phrased cased for lots with multiple (or no) buildings. 
    _explain.describe_stable = function(taxlot) {
    };

    lookup.explain = _explain; 
})();

