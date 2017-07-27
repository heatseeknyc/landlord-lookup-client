// A few shortucts for dustjs.
(function () {

    dusty = {};
    dusty.version = '001b';

    // Compiles + loads a template under the given key, in one op. 
    // Expects a template to exist under the id '#tmpl-key'.
    dusty.load = function(key) {
        var source   = $('#tmpl-'+key).html();
        var compiled = dust.compile(source, key);
        dust.loadSource(compiled);
    };

    dusty.render = function(divname,object) {
        // console.log('dusty.render '+divname+' ..');
        var tmplkey = divname;
        dust.render(tmplkey, object, function(err, out) {
              $('#'+divname).html(out);
        });
        // console.log('dusty.render '+divname+' done');
    };

})();
