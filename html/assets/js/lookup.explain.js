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
    
    // Only intended where n > 0, but we failsafe anyway
    var _buildings = function(n)  {
        if (n > 1)  {  return ""+n+" buildings"; }
        else if (n == 1)  {  return "1 building";  }
        else { return "no buildings"; }
    };

    var _units = function(k)  {
        if (k == 1) { return "1 unit"; }
        else { return ""+k+" units"; }
    };

    // Emit "across n building(s)" only when n > 1
    var _across = function(n)  {
        if (n > 1)  { return " across "+_buildings(n); }
        else { return ""; }
    };

    // Shorthand for "with k units across n buildings"
    var _with = function(k,n)  { return "with "+_units(k)+_across(n); };


    // Provides a simple, plain-English description of what kind of a property this is.  
    // Should probably be no more than 60 chars.  Intended for the 'pluto-header' section only.
    _explain.describe_taxlot = function(taxlot) {
        var meta = taxlot.meta;
        var pluto = taxlot.pluto;
        if (!pluto || !meta)  {
            // A taxlot should always have a 'meta' struct, and if we've called this
            // function it should have a pluto struct as well (otherwise this would be 
            // an "acris-only" lot, handled by the other templates).  So if we call 
            // nonetheless, sans pluto or structs, we're doing something wrong.  
            // Let's just emit something nice-sounidng and move on.
            taxlot.explain.caption = "A mystery lot."; 
            return true;
        }
        var k = pluto.units_res;
        var n = pluto.bldg_count;
        var caption = "--corrupted--"; 
        if (pluto.bldg_class == 'Z8')  {
            caption = "A cemetery with "+_buildings(n);
        }  else if (meta.is_condo)  {
            caption = "A condominium "+_with(k,n);
        }  else if (meta.is_coop)  {
            caption = "A co-op "+_with(k,n);
        }  else if (pluto.land_use == '04' && n > 1)  {
            caption = "An apartment complex "+_with(k,n);
        }  else   {
            if (n > 0)  {
                caption = "A lot with "+_buildings(n); 
            }  else  {
                caption = "A vacant lot"; 
            }
        }
        taxlot.explain.caption = caption; 
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
        taxlot.explain.stable = info;
        return true;
    };

    // Augments the taxlot struct with various details
    _explain.augment = function(taxlot) {
        if (!taxlot.explain) { taxlot.explain = {}; };
        _explain.describe_taxlot(taxlot);
        _explain.describe_stable(taxlot);
    };


    lookup.explain = _explain; 
})();

