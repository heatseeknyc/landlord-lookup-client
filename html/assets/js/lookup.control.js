(function() {

    lookup.control = {};
    lookup.control.initHandlers = function() {
        lookup.log(1,':: init handlers ..');
        lookup.control.initSearch();
        lookup.control.initExpandHandlers();
        lookup.log(1,':: init handlers done.');
    };

    lookup.control.initSearch = function() {
        $('#address-form').on('submit', function (evt) {
            evt.preventDefault();
            var query = $('#address-input').val().trim();
            lookup.log(3,':: #address-form.submit at '+ new Date());
            lookup.control.doSearch(query);
        });
    };

    lookup.control.initExpandHandlers = function() {
        $('#form-nychpd').on('submit', function (evt) {
            evt.preventDefault();
            lookup.log(3,':: #form-nychpd.submit at '+ new Date());
            lookup.control.doContacts();
        });
        $('#switch-view-multi-bldg').click(function(){
            lookup.log(2,"click!");
            lookup.log(2,"this.id = "+this.id);
            lookup.control.doBuildings();
        }); 
    };

    // A simple wrapper around the standard json ajax call, 
    // with default error handling + paranoid logging.
    lookup.control.doAjax = function(base,path,callback) {
        lookup.log(2,':: ajax base = ['+base+']');
        lookup.log(2,':: ajax path = ['+path+']');
        var encpath = lookup.utils.encode_nicely(path);
        var url = base + encpath;
        lookup.log(2,':: ajax url =['+url+']');
        return $.getJSON(url,callback)
            .success(function(r){
                lookup.log(2,':: ajax success!'+r);
                lookup.log(2,r);
            })
            .fail(function(error){
                lookup.log(2,':: ajax fail!');
                lookup.log(2,error);
                if (error.statusText === "timeout")  {
                    var msg = "Unable to reach lookup service.  Try again in a little while.";
                    lookup.view.showError(msg);
                }
                else {
                    var msg = "Unable to reach lookup service, reason: '"+error.statusText+"'";
                    lookup.view.showError(msg);
                }
            });
    };

    function fetchContacts(keytup,callback) {
        lookup.log(2,':: fetch contacts .. ');
        lookup.log(2,':: keytup = ' + keytup);
        var base = lookup.service.hybrid; 
        var path = '/contacts/'+keytup;
        lookup.log(3,':: contacts base  = '+base);
        lookup.log(3,':: contacts path  = '+path);
        return lookup.control.doAjax(base,path,callback);
    };

    function handleContacts(r)  {
        lookup.log(2,':: handle contacts ..');
        lookup.log(2,r);
        if (r.error)  {
            lookup.view.showError(r.error);
        } 
        else {
            lookup.model.contacts = r.contacts;
            lookup.view.showContacts();
        }
        lookup.log(2,':: handle contacts done.');
    };

    function fetchBuildings(bbl,callback) {
        lookup.log(2,':: fetch buildings .. ');
        lookup.log(2,':: bbl = ' + bbl);
        var base = lookup.service.hybrid; 
        var path = '/building/'+bbl;
        return lookup.control.doAjax(base,path,callback);
    };

    function handleBuildings(r)  {
        lookup.log(2,':: handle buildings ..');
        lookup.log(2,r);
        if (r.error)  {
            lookup.view.showError(r.error);
        } 
        else {
            lookup.model.buildings = r.buildings
            lookup.view.showBuildings();
        }
        lookup.log(2,':: handle buildings done.');
    };

    lookup.control.doContacts = function() {
        lookup.log(2,'do contacts ..');
        var r = lookup.model.summary;
        if (r && r.keytup)  {
            var keytup = r.keytup.bbl + ',' + r.keytup.bin
            fetchContacts(keytup,handleContacts);
        } else { lookup.control.showModelError(); }
    };

    lookup.control.doBuildings = function() {
        lookup.log(2,'do buildings..');
        var r = lookup.model.summary;
        if (r && r.keytup)  {
            fetchBuildings(r.keytup.bbl,handleBuildings);
        } else { lookup.control.showModelError(); }
    };

    lookup.control.showModelError = function() {
        var r = lookup.model.summary;
        if (r)  {
            lookup.log(1,'invalid state (model has lookup , but no keytup struct)');
            lookup.view.showDefaultError();
        }
        else  {
            lookup.log(1,'invalid state (model has no lookup)');
            lookup.view.showDefaultError();
        }
    };

    lookup.control.doSearch = function(query) {
        lookup.log(2,'do search ..');
        lookup.model = {}; 
        lookup.log(2,'query =['+query+']');
        fetchLookup(query,handleLookup);
        lookup.log(2,'procform done.');
    };

    function fetchLookup(query,callback) {
        lookup.log(2,':: fetch lookup.. ');
        var base = lookup.service.hybrid; 
        var path = '/lookup/' + query;
        lookup.log(3,':: lookup base  = '+base);
        lookup.log(3,':: lookup path  = '+path);
        return lookup.control.doAjax(base,path,callback);
        lookup.log(2,':: fetch lookup done.');
    };

    function handleLookup(r)  {
        lookup.log(2,':: handle Lookup r ='+r);
        lookup.log(2,r);
        if (r.error)  {
            lookup.view.showError(r.error);
        } 
        else {
            lookup.model.summary = r;
            lookup.view.showLookup();
        }
        lookup.log(2,':: handle lookup done.');
    };

    lookup.control.processLocalPath = function() {
        lookup.log(2,':: localpath ...');
        var bbl = lookup.utils.getPathVar('taxlot')
        lookup.log(2,':: localpath - taxlot = ' + bbl);
        if (bbl)  {
            if (bbl.match(/^\d{10}$/))  {
                lookup.log(2,':: localpath - lets do it ..');
                lookup.control.doSearch(bbl);
            }
            else  {
                lookup.log(2,':: localpath - no good!');
                lookup.view.showError("invalid bbl!");
            }
        }  else  {
            lookup.log(2,':: localpath - no match');
        }
        lookup.log(2,':: localpath - done.');
    };

})();

