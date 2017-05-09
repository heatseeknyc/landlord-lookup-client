// 
// Generic string utils and such.
// 
lookup.utils = {}

// Strips leading and trailing whitespace from a string. 
lookup.utils.strip = function(s) {
  return s.replace(/^\s+/,'').replace(/\s+$/,'');
};

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



