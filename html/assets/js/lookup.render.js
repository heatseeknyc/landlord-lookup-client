lookup.render = {}
// Simple display wrapper for null record values.
lookup.render._shownull = function(x) {
  if (x === null)  { 
    return '-';
  }
  else {
    return x;
  }
};

// A bare-metal generator for the interior of a <tbody> element, given 
// a rowset and an ordered list of keys.  Looks ugly but is much faster 
// than when done in jQuery. 
lookup.render.rowset2html = function(rowset,keys) {
  lookup.log(3,":: render, length = "+rowset.length);
  var _show = lookup.render._shownull;
  var html = [], z = -1;
  for (var i = 0; i < rowset.length; i++) {
    var row = rowset[i];
    html[++z] = '<tr>'
    for (j in keys)  {
      html[++z] = '<td>'+_show(row[keys[j]])+'</td>'
    }
    html[++z] = '</tr>'
  };
  return html;
};


