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

    var sing = {bldg:'building',has:'has',was:'was',is:'is',do:'does'};
    var plur = {bldg:'buildings',has:'have',was:'were',is:'are',do:'do'};
    var en = sing;

    // Provides a description of the rent stabilization status for this property,
    // appropriately phrased cased for lots with multiple (or no) buildings. 
    _explain.describe_stable = function(taxlot) {
        var info = "--corrupted--"; 
        var meta = taxlot.meta;
        if (!meta)  { return false; }
        var noun = 'building';
        var have = 'has'; 
        var were = 'was'; 
        var is = 'is'; 
        var doth = 'do';  // 'do' is reserved!
        var code = meta.stabilized;
        if (code == 1)  {
            info = "The "+en.bldg+" on this lot "+en.has+" been confirmed to be rent stabilized, " + 
                "(at least through the end of 2015), according to publicly available documents " +
                "from 2 sources (DHCR list; DOF taxbills).";
        } else if (code == 2)  {
            info = "The "+en.bldg+" on this lot probably "+en.was+" rent stabilized " 
                "(at least through the end of 2015), though there is some diagreement on this" +
                "between publicly available source (DHCR list; DOF taxbills).";
        } else if (code == 3)  {
            info = "There are no public records confirming that the "+en.bldg+" on this lot "+en.is+
                " rent stabilized.  However, the build year and physical characteristics indicated "+
                "that they <strong>may</strong> have stablized units.";
        }
        if (!taxlot.explain) { taxlot.explain = {}; };
        taxlot.explain.stable = info;
        return true;
    };

    _explain.augment_details = function(taxlot) {
        _explain.describe_stable(taxlot);
    };


    lookup.explain = _explain; 
})();

