(function() {

    lookup.geoutils = {}; 

    // Takes a string representing a (perhaps multi-part) city name,
    // and perhaps two-letter street abbreviation (or not), e.g.: 
    //
    //   "Brooklyn NY", "Port Richmond NY", "Long Island City" 
    //
    // and does its best to split into an dict of (city,state).
    // Our assumption is that the final "word" in this string will 
    // be a state abbreviation iff it's two letters in length.
    lookup.geoutils.splitCity = function(s) {
        var t = s.trim().split(/\s+/);
        var n = t.length;
        if (n < 1) { return null; }
        if (n === 1) { return {'city':t[0],'state':null}; }
        if (t[n-1].length === 2)  {
            var s = t.join(' ');
            var city = s.substr(0,s.length-3)
            return {'city':city,'state':t[n-1]};
        }  else  {
            var city = t.join(' ');
            return {'city':city,'state':null};
        }
    };

    // Anticipates an address in one of 5 basic formats, give or take
    // whitespace:
    //
    //   590 Bushwick Ave
    //   590 Bushwick Ave, Brooklyn
    //   590 Bushwick Ave, Brooklyn NY
    //   590 Bushwick Ave, Brooklyn, NY
    //   590 Bushwick Ave, Brooklyn NY, United States
    //
    // And returns a dict of canonicalized components.  Some notes:
    //
    //  - The latter is the format produced by Google Autocomplete.
    //    So while no user would type the "United States" part, it's going
    //    to be present in most submissions, so we need to accomodate it.
    //
    //  - In any case we don't care about the US part or the state part;
    //    just the house_number, street_name, and city. 
    //
    //  - Also, to be clear, we aren't interpreting the "city" part as any 
    //    particular borough designation at this point; that determination
    //    gets made at the backend.
    //
    // For the time being we're assuming entries won't contain zip codes; 
    // but if they do, out approach (not yet implemented) will be to simply 
    // strip them out.  But since Autocomplete doesn't provide them and users 
    // are unlikely to type them, we won't worry about them just yet.
    //
    // Finally:
    //
    // If we end up creating a degenerate response (with an insufficient set 
    // of fields), then an 'error' member is added to the response dict; the
    // presence of this field is a boolean indicator of parsing status.
    //
    // And the initial raw address (after being stripped of leading and
    // trailing whitspace) is returned also, for diagnostic purposes. 
    //
    lookup.geoutils.processAddress = function(rawaddr) {
        var r = {};
        r.rawaddr = rawaddr.trim();
        var terms = r.rawaddr.split(/\s*,\s*/);
        var re = new RegExp(/^(\S+)\s+(.*)$/);
        var m = re.exec(terms[0]);
        if (m) {
            r.house_number = m[1]; 
            r.street_name = m[2].replace(/\s+/,' ');
        }
        if (terms.length > 1)  {
            r.city = lookup.geoutils.splitCity(terms[1]).city;
        }
        // Do some basic error diagnostics on the way out.
        // Multiple error conditions are possible, but we prioritize on what's 
        // most likely to be left unset before submission. 
        if ((r.house_number === undefined) || (r.street_name === undefined))  {
            r.error = 'Invalid address (need at least a house number and street name)';
        }
        return r 
    };
   
    // DEPRECATED in favor of nycprop.bbl_info()
    lookup.geoutils.boroName = { 
        1:"Manhattan", 2:"Bronx", 3:"Brooklyn", 4:"Queens", 5:"Staten Island"
    };

    // Unpacks a BBL to a dict of named components. 
    // Note deprecated dependeny (on boroName)
    lookup.geoutils.splitBBL = function(bbl) {
        var blockandlot = bbl % 1000000000;
        var r = {};
        r.lot = blockandlot % 10000;
        r.block = (blockandlot - r.lot) / 10000;
        r.boroID = (bbl - blockandlot) / 1000000000
        r.boroName = lookup.geoutils.boroName[r.boroID]; 
        return r; 
    };

    lookup.geoutils.genMapBox = function(geolat,geolon,mapw,maph) {
        var r = {};
        r.sx = (geolon - mapw).toFixed(4);
        r.ex = (geolon + mapw).toFixed(4);
        r.sy = (geolat - maph).toFixed(4);
        r.ey = (geolat + maph).toFixed(4);
        return r; 
    };

    lookup.geoutils.genMapURL = function(geolat,geolon) {
        var mapw = 0.00125;
        var maph = 0.00075;
        var mapbox = lookup.geoutils.genMapBox(geolat,geolon,mapw,maph);
        lookup.log(2,':: mapbox = '+mapbox);
        var mx = geolat.toFixed(4);
        var my = geolon.toFixed(4);
        var boxtup = mapbox.sx+','+mapbox.sy+','+mapbox.ex+','+mapbox.ey;
        var marker = mx+','+my;
        var suburl = '/export/embed.html?bbox='+boxtup+'&layer=mapnik&marker='+marker;
        return 'http://www.openstreetmap.org' + suburl
    };


})();
