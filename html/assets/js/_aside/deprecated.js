//
// Various deprecated functions; currently not imported.
// //

// Takes a URL, returns a key-val array.
// 
// If multiple occurrences of a given key are encountered, it does 
// the right thing (and silently overrides previously assignment). 
lookup.utils.getArgs = function(url) {
  var q = url.split('?')[1];
  return lookup.utils.query2args(q);
};

lookup.utils.query2args = function(q) {
  var args = [], kv;
  if (q !== undefined) {
    q = q.split('&');
    for (var i = 0; i < q.length; i++) {
      kv = q[i].split('=');
      args[kv[0]] = kv[1];
    }
  }
  return args;
};


lookup.utils.args2query = function (args) {
  var i = 0;
  var t = [];
  for (var k in args)  {
    v = args[k] 
    if (v === undefined) {
        v = '';
    } 
    k = k.replace(/\s+/,'+');
    v = v.replace(/\s+/,'+');
    v = v.replace(/\s+/,'+');
    v = v.replace(/\s+/,'+');
    v = v.replace(/\s+/,'+');
    v = v.replace(/\s+/,'+');
    t[i++] = k+'='+v;
  };
  return t.join('&');
};

