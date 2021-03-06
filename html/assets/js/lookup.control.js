(function() {

    lookup.control = {};
    lookup.control.initHandlers = function() {
        lookup.log(1,':: init handlers ..');
        lookup.control.initSearch();
        lookup.control.initExpandHandlers();
        lookup.log(1,':: init handlers done.');
    };

    lookup.control.initSearch = function() {
        $('#address-form').on('submit', function (e) {
            e.preventDefault();
            lookup.control.doSearch();
        });
        $('form').each(function() {
            $(this).find('input').keypress(function(e) {
                // e.preventDefault();
                if(e.which == 10 || e.which == 13) {
                    lookup.log(1,':: WOOP!');
                    lookup.control.doSearch();
                    // this.form.submit();
                }
            });
            $(this).find('input[type=submit]').hide();
        });
    };

    lookup.control.doSearch = function(query) {
        lookup.log(2,'do-search ..');
        var query = $('#address-input').val().trim();
        lookup.log(3,':: #address-form.submit at '+ new Date());
        lookup.control.doTaxlot(query);
        lookup.log(2,'do-search done');
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

    function keyarg(keytup,flag)  {
        if (!keytup.bbl)  {
            return 'BADKEYTUP';
        }
        var q = ''+keytup.bbl;
        if (flag)  { return q; } 
        if (keytup.bin)  {
            q = q + ','+keytup.bin;
        } 
        return q; 
    };

    function fetchBuildings(keytup,flag,callback) {
        lookup.log(2,':: fetch buildings .. ');
        lookup.log(2,keytup);
        var q = keyarg(keytup,flag);
        lookup.log(2,':: keyarg = '+q); 
        var base = lookup.service.hybrid; 
        var path = '/buildings/'+q;
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

    // Checks whether we have a viewable taxlot (of either pluto or
    // baselot type), and if we do, fetches and displays the buildings.
    lookup.control.doBuildings = function(flag) {
        lookup.log(2,'do-buildings ..');
        var r = lookup.model.summary;
        if (!r)  { return lookup.control.showModelError('no response in model'); }
        var keytup = r.keytup;
        var taxlot = r.taxlot;
        if (!taxlot)  { return lookup.control.showModelError('no taxlot'); }
        if (!keytup)  { return lookup.control.showModelError('no keytup'); }
        var pluto = taxlot.pluto;
        var condo = taxlot.condo;
        if (pluto && keytup)  {
            // Vanilla taxlot fetch
            lookup.log(2,'do-buildings taxlot ..');
            fetchBuildings(keytup,flag,handleBuildings);
        }  else if (condo)  {
            // We're a condo unit -- fetch buildings for the baselot 
            var bbl = condo.parent;
            var keytup = {'bbl':bbl,'bin':null};
            lookup.log(2,'do-buildings baselot ..');
            fetchBuildings(keytup,flag,handleBuildings);
        } else { 
            lookup.log(2,'do-buildings - abort - no lot struct');
        }
        lookup.log(2,'do-buildings done');
    };

    lookup.control.showModelError = function(message) {
        if (!message)  { message = '--unknown cause--'; }
        var longmsg = 'invalid model state: ' + message;
        var r = lookup.model.summary;
        if (r)  {
            lookup.log(1,longmsg);
            lookup.view.showDefaultError();
        }
        else  {
            lookup.log(1,'invalid state (model has no lookup)');
            lookup.view.showDefaultError();
        }
        return false;
    };

    lookup.control.doTaxlot = function(query) {
        lookup.log(2,'do-taxlot ..');
        lookup.model = {}; 
        lookup.log(2,'query =['+query+']');
        fetchLookup(query,handleLookup);
        lookup.log(2,'do-taxlot done');
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
            lookup.view.displayTaxlot();
            lookup.control.doBuildings(false);
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
                lookup.control.doTaxlot(bbl);
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

    // DEPRECATED
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


})();

