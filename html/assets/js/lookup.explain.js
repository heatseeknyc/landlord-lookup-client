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

    var sing = {_pl:'',it:'it',has:'has',was:'was',is:'is',isa:'is a',do:'does'};
    var plur = {_pl:'s',it:'they',has:'have',was:'were',is:'are',isa:'are',do:'do'};
    var en = sing;

    // Provides a description of the rent stabilization status for this property,
    // appropriately phrased cased for lots with multiple (or no) buildings. 
    _explain.describe_stable = function(taxlot) {
        var info = "--corrupted--"; 
        var meta = taxlot.meta;
        if (!meta)  { return false; }
        var code = meta.stabilized;
        if (code == 1)  {
            info = "The building"+en._pl+" on this lot "+en.has+" been confirmed to be rent-stabilized " + 
                "(or under some form of rent control) according to publicly available documents from 2 sources " +
                "(DHCR list; DOF taxbills), at least through the end of 2015.";
        } else if (code == 2)  {
            info = "The building"+en._pl+" on this lot "+en.was+" probably rent stabilized " +
                "(or under some form of rent control), at least up until very recently (through the end of 2015), " +
                "though there is some diagreement on this between the 2 publicly available data sources we have " +
                "(DHCR list; DOF taxbills).";
        } else if (code == 3)  {
            info = "There are no public records confirming that the "+en.bldg+" on this lot "+en.is+
                " under any form of rent-stabilizatin (or control).  However, the build year and physical " +
                "characteristics indicate that "+en.it+" may have stablized units (but the city isn't tracking them).";
        } else if (code == 7)  {
            info = "The building"+en._pl+" on this lot "+en.isa+" managed by the HPD's Section 7A "+ 
                "program, which protects them against rent increases.";
        } else if (code == 8)  {
            info = "The building"+en._pl+" on this lot "+en.isa+" Mitchell-Lama co-operative"+en._pl+", "+ 
                "and "+en.is+" therefore protected from rent increases.";
        } else if (code == 9)  {
            info = "The building"+en._pl+" on this lot "+en.is+" managed by NYCHA, "+ 
                "and "+en.is+" therefore protected from rent increases.";
        } else if (code == 10)  {
            info = "The building"+en._pl+" on this lot "+en.is+" recognized under the Loft Law, "+ 
                "which provides a form of rent stabilization.";
        } else if (code == 11)  {
            info = "The "+en.bldg+" on this lot "+en.is+" enrolled in an unspecified HPD management program, "
                "which probably provides some form of rent stabilization.";
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
