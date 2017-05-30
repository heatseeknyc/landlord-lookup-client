lookup.control = {};

lookup.control.initHandlers = function() {
    lookup.log(1,':: init handlers ..');
    lookup.control.initSearch();
    lookup.control.initViewMore();
    lookup.log(1,':: init handlers done.');
};


lookup.control.initSearch = function() {
    $('#address-form').on('submit', function (evt) {
        evt.preventDefault();
        var rawaddr = $('#address-input').val();
        lookup.log(3,':: #address-form.submit at '+ new Date());
        // hideResults();
        lookup.control.doSearch(rawaddr);
    });
};

lookup.control.initViewMore = function() {
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

(function() {
    

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
        if (r && r.nycgeo)  {
            var keytup = r.nycgeo.bbl + ',' + r.nycgeo.bin
            fetchContacts(keytup,handleContacts);
        } else { lookup.control.showModelError(); }
    };

    lookup.control.doBuildings = function() {
        lookup.log(2,'do buildings..');
        var r = lookup.model.summary;
        if (r && r.nycgeo)  {
            fetchBuildings(r.nycgeo.bbl,handleBuildings);
        } else { lookup.control.showModelError(); }
    };

    lookup.control.showModelError = function() {
        var r = lookup.model.summary;
        if (r)  {
            lookup.log(1,'invalid state (model has summary, but no nycgeo struct)');
            lookup.view.showDefaultError();
        }
        else  {
            lookup.log(1,'invalid state (model has no summary)');
            lookup.view.showDefaultError();
        }
    };

    lookup.control.doSearch = function(rawaddr) {
        lookup.log(2,'do search ..');
        lookup.model = {}; 
        lookup.log(2,'rawaddr ='+rawaddr);
        /* var r = lookup.geoutils.processAddress(rawaddr); 
        lookup.log(2,'procform, processed');
        lookup.log(2,r); */
        fetchSummary(rawaddr,handleSummary);
        /* if (r.error) {
            lookup.log(2,'procform error');
            lookup.view.showError(r.error); 
        } else {
            lookup.log(2,'procform fetch');
            fetchSummary(r,handleSummary);
            // pushWait();
        } */
        lookup.log(2,'procform done.');
    };

    function fetchSummary(rawaddr,callback) {
        lookup.log(3,':: fetch summary .. ');
        var base = lookup.service.hybrid; 
        var path = '/lookup/' + rawaddr;
        lookup.log(3,':: summary base  = '+base);
        lookup.log(3,':: summary path  = '+path);
        return lookup.control.doAjax(base,path,callback);
    };

    function handleSummary(r)  {
        lookup.log(2,':: handle summary r ='+r);
        lookup.log(2,r);
        if (r.error)  {
            lookup.view.showError(r.error);
        } 
        else {
            lookup.model.summary = r;
            lookup.view.showSummary();
        }
        lookup.log(2,':: handle summary done.');
    };

})();


