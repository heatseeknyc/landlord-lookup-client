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
// dependencies: 
//  - nycprop.js
//  - lookup.acris.js
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

    var _resiblurb = function(x)  {
        if (x) { return "(residential)"; }
        else { return "(non-residential)"; }
    }


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
        var k = pluto.units_total;
        var n = pluto.bldg_count;
        var caption = "--unknown--"; 
        if (meta.is_bank)  {
            if (meta.is_resi)  {
                caption = "A residential condominium "+_with(k,n);
            }  else  {
                caption = "A commercial condominium "+_with(k,n);
            }
        }  else if (meta.is_coop)  {
            if (meta.is_resi)  {
                caption = "A residential co-op "+_with(k,n);
            }  else  {
                caption = "A commercial co-op "+_with(k,n);
            }
        }  else if (n > 1 && (
               pluto.land_use == '03' ||
               pluto.land_use == '04' ))  {
            caption = "An apartment complex with "+_buildings(n);
        }  else if (pluto.bldg_class == 'O4' && n == 1)  {
            caption = "An office building"; 
        }  else if (pluto.bldg_class == 'Y3')  {
            caption = "A correctional facility with "+_buildings(n); 
        }  else if (pluto.bldg_class == 'Z8')  {
            caption = "A cemetery with "+_buildings(n);
        }  else   {
            if (n > 0)  {
                caption = "A lot with "+_buildings(n); 
                caption += " "+_resiblurb(meta.is_resi);
            }  else  {
                caption = "A vacant lot"; 
            }
        }
        taxlot.explain.caption = caption; 
    };

    // Quick-and-dirty conjugation of certain words. 
    var sing = {_pl:'',it:'it',has:'has',was:'was',is:'is',isa:'is a',do:'does'};
    var plur = {_pl:'s',it:'they',has:'have',was:'were',is:'are',isa:'are',do:'do'};
    var conj = function (n)  {
        if (n > 1) { return plur; } else { return sing; }
    }

    // Determine the indefinite article that precedes the given word, in the usual way.
    // We're definitely not happy with this hack, but we'd rather not go searchint for
    // some general-purpose library to do stuff like this.
    var _vowpat = new RegExp('^[aeiouAEIOU]');
    var _youpat = new RegExp('^(ubi|uke|ulurp|uni|uro|use|uto)'); 
    var indef_article = function (w)  {
        if (_vowpat.exec(w) && !_youpat.exec(w.toLowerCase())) { 
            return 'an'; 
        } else { 
            return 'a'; 
        }
    }

    // Provides a description of the rent stabilization status for this property,
    // appropriately phrased cased for lots with multiple (or no) buildings. 
    _explain.describe_stable = function(taxlot) {
        var info = "--unknown--"; 
        var pluto = taxlot.pluto;
        var stable = taxlot.stable;
        // If we call this function, both of these structs should definitely be 
        // present.  If they're not we've definitely done something wrong. 
        if (!stable || !pluto)  { 
            taxlot.explain.stable = info;
            return false; 
        }
        var code = stable.code; 
        var en = conj(pluto.bldg_count);
        lookup.log(2,'conj = ..');
        lookup.log(2,en);
        if (code == 1)  {
            // deprecated in favor of wording in template
            info = "The building"+en._pl+" on this lot "+en.has+" been confirmed to be rent-stabilized " + 
                "(or under some form of rent control) according to publicly available documents from 2 sources " +
                "(DHCR list; DOF taxbills), at least through the end of 2015.";
        } else if (code == 2)  {
            // deprecated in favor of wording in template
            info = "The building"+en._pl+" on this lot "+en.was+" probably rent stabilized " +
                "(or under some form of rent control), at least up until very recently (through the end of 2015), " +
                "though there is some diagreement on this between the 2 publicly available data sources we have " +
                "(DHCR list; DOF taxbills).";
        } else if (code == 3)  {
            info = "There are no public records confirming that the "+en.bldg+" on this lot "+en.is+
                " under any form of rent-stabilizatin (or control).  However, the build year and physical " +
                "characteristics indicate that "+en.it+" may have stablized units (but the city isn't tracking them).";
        } else if (code == 7)  {
            info = "The building"+en._pl+" on this lot "+en.is+" managed by the HPD's Section 7A "+ 
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
        
        // A simple blurb to describe the number of units
        var unit_info = "unitcount unknown"; 
        var j = stable.taxbill_unitcount;
        if (j)  {
            var en = conj(j);
            unit_info = ""+j+" stabilized unit"+en._pl;
        }
        taxlot.explain.taxbill_unitcount = unit_info;
        
        return true;
    };

    // If we came in via a condo unit BBL, we need to say a few things about the baselot.
    _explain.describe_baselot = function(taxlot) {
        var boro = "--unknown--";
        var info = "--unknown--";
        var baselot = null;
        var condo = taxlot.condo;
        if (condo)  {  baselot = condo.baselot;  }
        if (baselot)  {
            var t = nycprop.bbl_info(condo.parent);
            if (t) { boro = t.borough; } 
            if (baselot.bldg_count === 1)  {
                info = "building";
            }  else  {
                info = "project";
            }
        }
        taxlot.explain.condo_what = info;
        taxlot.explain.boroname   = boro;
    };

    _explain.describe_acris = function(taxlot) {
        var nice = {};
        nice.doctype = "[unknown doctype]";
        nice.effdate = "[unknown date]";
        nice.amount  = "an unknown amount";
        var acris = taxlot.acris;
        if (acris)  {
            nice.doctype = lookup.acris.doctype2eng(acris.doctype);
            var d = lookup.utils.splitdate(acris.effdate);
            nice.effdate = lookup.utils.nicedate(d);
            var nicenum = lookup.utils.provide_commas(acris.amount);
            if (nicenum !== "0")   { nice.amount = '$'+nicenum; }
        }
        taxlot.explain.doctype = nice.doctype; 
        taxlot.explain.doctype_art = indef_article(nice.doctype); 
        taxlot.explain.effdate = nice.effdate; 
        taxlot.explain.amount  = nice.amount;
    };

    // Augments the taxlot struct with various details
    _explain.augment = function(taxlot) {
        if (!taxlot.explain) { taxlot.explain = {}; };
        _explain.describe_taxlot(taxlot);
        _explain.describe_stable(taxlot);
        _explain.describe_baselot(taxlot);
        _explain.describe_acris(taxlot);
    };


    lookup.explain = _explain; 
})();

