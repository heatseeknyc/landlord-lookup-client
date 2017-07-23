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

    lookup.utils.slugify = function(bbl) {
        var taxbill = lookup.utils.bbl2slug(bbl);
        var acris   = lookup.utils.bbl2acris(bbl);
        var bisweb  = lookup.utils.bbl2bisweb(bbl);
        return {taxbill:taxbill, acris:acris, bisweb:bisweb};
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
        // lookup.log(2,'path = ['+path+']');
        var regex = new RegExp('^/'+name+'/(.*)$');
        results = regex.exec(path);
        // lookup.log(2,results);
        if (!results) return null;
        if (!results[1]) return '';
        return results[1];
    };

    // Splits a datestring in the 'YYYY-MM-DD' format - the most common one 
    // emitted by databases, and the only format we'll likely have to contend 
    // with for a great while.
    lookup.utils.splitdate = function(s) {
        var re = new RegExp(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
        var m = re.exec(s);
        if (m) { 
            var year  = parseInt(m[1]);
            var month = parseInt(m[2]);
            var day   = parseInt(m[3]);
            return { 'year':year, 'month':month, 'day':day };
        }  else  {  
            return null 
        } 
    };

    // Expects a dict in the form emitted by 'splitdate', and returns a 
    // nice date string in the colloqual English format (with long month names).
    // If the date is invalid somehow, it returns null.  The validation is
    // not bulletproof by any means, but good enough for now.
    var _mon = [
        'BADMONTH','January','February','March','April','May','June',
        'July','August','September','October','November','December'];
    lookup.utils.nicedate = function(d) {
        if (!d || !d.year || !d.month || !d.day)  { return null; } 
        if (d.year < 1000 || d.year > 9999) { return null; }
        if (d.month < 1 || d.month > 12) { return null; }
        if (d.day < 1 || d.day > 31) { return null; }
        return _mon[d.month]+' '+d.day+', '+d.year;
    };

    var _intpat = new RegExp('^-?[0-9]+$');
    var _isInt = function(n)  {
        return _intpat.test(n);
    };

    // Given an integer, return its natural expansion into base 1000.
    // It it's not an integer, we return null.
    var _radix = function(n)  {
        if (!_isInt(n))  { return null; }
        if (n === 0) { return [0]; }
        if (n < 0)  {
            var r = _radix(-n);
            r[0] = -r[0];
            return r;
        }
        var r = [];
        while (n > 1000)  {
            k = n % 1000;
            n = (n - k) / 1000;
            r.push(k);
        }
        r.push(n);
        return r.reverse();
    };

    // where's lpad when you need it?
    // (yes it's brittle, but should work for us)
    var _lpad = function (s,c,k)  { 
        while (s.length < k)  { s = c+s; }
        return s;
    }

    // Given an integer, return a stringified version with commas added 
    // between powers of 1000.  If we aren't an integer, return null. 
    lookup.utils.provide_commas = function(n) {
        var r = _radix(n);
        if (!r)  { return null; }
        for (i=1; i<r.length; i++)  {
            r[i] = _lpad(''+r[i],'0',3);
        }
        return r.join(',');
    };

    // 
    // Interpreted to mean "find the highest zoom level such that an 
    // object of the given radius, expanded by scale factor alpha,
    // still fits in the screen width of that soom level." 
    //
    // Keep in mind that the zoomleels scale out at varying rates 
    // from one level to the next (2-3).  So if you pick alpha = 3.0, 
    // you might see your object covering 11%-33% of the screen at  
    // that zoom level (which is actually probably an ideal range).
    //
    // From: http://wiki.openstreetmap.org/wiki/Zoom_levels
    // The values represent the screen width (in degrees) for the zoom level
    // corresponding to index position (0-19).
    var _z = [ 
        360, 180, 90, 45, 22.5, 11.25, 5.625, 2.813, 1.406, 0.703, 0.352, 
        0.176, 0.088, 0.044, 0.022, 0.011, 0.005, 0.003, 0.001, 0.0005];  
    lookup.utils.zoomlevel = function(radius,alpha) {
        var n = _z.length; // should be 20
        // Do something to protect against garbage inputs. 
        if (!alpha || !radius || alpha >= 1000000.0 || alpha <= 0.0000001 || 
            radius > 360 || radius < 0)  { return null; }
        for (j=n; j>=0; j--)  {
            if (radius * alpha <= _z[j])  { return j; }
        }
        return j; // if we get down here, it'll be 0 
    };

})();


