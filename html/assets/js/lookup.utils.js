// 
// Generic string/url munging utils and such.
// 
(function() {

    lookup.utils = {}

    // deprecated
    // lookup.utils.strip = function(s) {
    //    return s.replace(/^\s+/,'').replace(/\s+$/,'');
    // };

    // We're not happy with what encodeURIComponent does to typical URL paths
    // (as it encodes way too many symbols that aren't strictly necessary to 
    // encode).  All we really need is the space-to-plus substitution for now.
    lookup.utils.encode_nicely = function(path) {
        return lookup.utils.replaceAll(path,' ','+'); 
    };

    lookup.utils.replaceAll = function(s,u,v) {
        while(s.indexOf(u) > 0)  {
            s = s.replace(u,v);
        }
        return s
    };

    /* Where's lpad when you need it? */
    lookup.utils.lpad = function(s,c,n) {
        s = ''+s;
        while (s.length < n)  { s = c + s; }
        return s;
    };


    /* The following 3 functions convert a BBL to a query string (or fragement thereof)
       suitable for embedding into links for external services as noted.  If it can't convert
       properly, then an error string is returned which will at least bubble up into the
       application context so you can eventually find out what went wrong. */

    // For taxbills.nyc; e.g.  4000440023 => '4/00044/0023' 
    lookup.utils.bbl2slug = function(bbl) {
        if (bbl !== undefined)  {
            var _lpad = lookup.utils.lpad;
            var t = lookup.geoutils.splitBBL(bbl);
            return '' + t.boroID + '/' + _lpad(t.block,'0',5) + '/' + _lpad(t.lot,'0',4);
        } else { return 'invalid-bbl-string'; }
    };

    // for ACRIS:  4000440023 -> 'borough=4&block=44&lot=23'
    lookup.utils.bbl2acris = function(bbl) {
        if (bbl !== undefined)  {
        var t = lookup.geoutils.splitBBL(bbl);
        return 'borough=' + t.boroID + '&block=' + t.block + '&lot=' + t.lot;
        } else { return 'invalid-bbl-string'; }
    };

    // for DOB:  4000440023 -> 'boro=4&block=44&lot=23'
    lookup.utils.bbl2bisweb = function(bbl) {
        if (bbl !== undefined)  {
            var t = lookup.geoutils.splitBBL(bbl);
            return 'boro=' + t.boroID + '&block=' + t.block + '&lot=' + t.lot;
        } else { return 'invalid-bbl-string'; }
    };

    // Adapted from https://stackoverflow.com/questions/901115/ (under CC).
    //
    // Returns the requested query string parameter by name from the given URL, using 
    // the current window location as a default).  Doesn't work for multi-valued params 
    // (i.e. repeated instances ofa  given name), but that's OK.  But has advantage
    // of simplicity and a likely high degree of backward compatibility.
    //
    lookup.utils.getQueryStringParam = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    // Returns the local component of the window location, minus the origin.
    lookup.utils.getLocalPath = function() {
        var loc = window.location;
        var j = loc.origin.length;
        var n = loc.href.length;
        return loc.href.substr(j,n);
    };

    // If the local component of the window location is of the form
    // '/name/variable', we return the 'variable' part.
    lookup.utils.getPathVar = function(name,path) {
        if (!path) path = lookup.utils.getLocalPath();
        lookup.log(2,'path = ['+path+']');
        var regex = new RegExp('^/'+name+'/(.*)$');
        results = regex.exec(path);
        lookup.log(2,results);
        if (!results) return null;
        if (!results[1]) return '';
        return results[1];
    };

})();
